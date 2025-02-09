import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Activity, ActivityDocument } from './schema/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/user.service';
import { Media } from '../post/dto/create-post.dot';
import { PostService } from '../post/post.service';
import { Post } from '../post/schema/post.schema';

type SummaryParams = {
  type: 'reply' | 'quote' | 'repost' | 'like' | 'vote' | 'firstPost';
  post?: Post;
  relatePost?: Post;
  isOwn?: boolean;
};

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = await this.activityModel.findOne(createActivityDto);
    if (activity) return;
    createActivityDto.id = uuidv4();
    const createdActivity = await this.activityModel.create(createActivityDto);
    return createdActivity;
  }

  async getNewActivitiesAfterId(
    to: string,
    id: string,
    type: string | null,
    pageSize: number,
  ): Promise<{ activities: Activity[] }> {
    const activity = await this.activityModel.findOne({ id }); // 查找指定 ID 对应的活动记录
    if (!activity && id) {
      throw new Error('activity is not found');
    }

    const filter = this.getBannedFilter(to, {
      to,
      ...(activity?.createdAt
        ? { createdAt: { $gt: activity?.createdAt } }
        : {}),
      ...(type
        ? type === 'verified'
          ? { '_user.isVerified': true }
          : { type }
        : {}),
      from: { $ne: to },
    });

    const activities = await this.activityModel.aggregate([
      ...filter,
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: +pageSize,
      },
    ]);

    const _activities = await this.mergeActivitiesInfo(activities, to, true);

    return { activities: _activities };
  }

  async mergeActivitiesInfo(
    activities: Activity[],
    currentUid: string,
    isOwn: boolean = true,
  ): Promise<Activity[]> {
    for (let activity of activities) {
      const fromUser = await this.userService.findUserById(
        activity.from,
        currentUid,
      );
      const post = await this.postService.findPostByCode(
        activity.postCode,
        currentUid,
      );
      const relatePost = await this.postService.findPostById(
        activity.relatePostId,
        currentUid,
      );
      const type = activity.type;
      let summary = { content: '', context: '' };
      switch (type) {
        case 'mention':
          summary = {
            content: '提及了你',
            context: relatePost?.caption,
          };
          break;
        case 'reply':
          summary = this.getActivityContentAndContext({
            type: type as any,
            isOwn,
            post,
            relatePost,
          });
          break;
        case 'firstPost':
          summary = {
            context: '发布了首条串文',
            content: post?.caption,
          };
          break;
        case 'vote':
          summary = {
            context: '投票有结果啦',
            content: post?.caption,
          };
          break;
        case 'repost':
          {
            if (isOwn) {
              summary = this.getActivityContentAndContext({
                type: 'repost',
                relatePost,
                isOwn,
              });
            }
          }

          break;
        case 'quote':
          summary = this.getActivityContentAndContext({
            type: 'quote',
            post,
            relatePost,
            isOwn,
          });
          break;
        case 'follow':
          summary = {
            context: '关注了你',
            content: '',
          };
          break;
        case 'like':
          {
            if (isOwn) {
              summary = this.getActivityContentAndContext({
                type: 'like',
                relatePost,
                isOwn,
              });
            }
          }
          break;
        case 'followRequest':
          summary = {
            context: '关注请求',
            content: '',
          };
      }
      activity.content = summary.content;
      activity.context = summary.context;

      activity.fromUser = fromUser as any; // Replace 'from' with user data
    }
    return activities;
  }

  async findByTo(
    to: string,
    type: string | null,
    page: number,
    pageSize: number,
  ): Promise<{ activities: Activity[]; total: number }> {
    const skip = pageSize * (page - 1);
    const query = {
      to,
      from: { $ne: to },
      ...(type
        ? type === 'verified'
          ? { '_user.isVerified': true }
          : { type }
        : {}),
    };
    const filter = this.getBannedFilter(to, query);
    const activities = await this.activityModel.aggregate([
      ...filter,
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: +pageSize,
      },
    ]);

    const _activities = await this.mergeActivitiesInfo(activities, to, true);

    const total = await this.activityModel.aggregate([
      ...filter,
      {
        $count: 'total',
      },
    ]);
    return { activities: _activities, total: total?.[0]?.total || 0 };
  }

  private getBannedFilter(currentUid, extra) {
    const filter = [
      {
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: 'id',
          as: '_user',
        },
      },
      {
        $lookup: {
          from: 'userrelations',
          let: { uid: currentUid, targetUid: '$from' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetUid', '$$targetUid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                    { $eq: ['$uid', '$$uid'] }, // 匹配当前用户ID
                  ],
                },
              },
            },
          ],
          as: 'userRelation',
        },
      },
      {
        $lookup: {
          from: 'userrelations',
          let: { uid: currentUid, targetUid: '$from' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetUid', '$$uid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                    { $eq: ['$uid', '$$targetUid'] }, // 匹配当前用户ID
                  ],
                },
              },
            },
          ],
          as: '_userRelation',
        },
      },
      {
        $match: {
          $and: [
            {
              'userRelation.blocking': { $ne: true },
              'userRelation.restricting': { $ne: true },
              '_userRelation.blocking': { $ne: true },
              ...extra,
            },
            {
              $or: [
                {
                  '_user.isPrivate': false,
                },
                {
                  '_user.isPrivate': true,
                  '_userRelation.following': true,
                },
                {
                  from: currentUid,
                },
              ],
            },
          ],
        },
      },
    ];
    return filter;
  }

  private getMediaType(medias: Media[]) {
    const mediaTypeMap = {
      video: '视频',
      image: '图片',
    };
    const mediaType =
      medias?.length > 1 ? '轮播' : mediaTypeMap[medias?.[0]?.type];
    return mediaType;
  }

  private getContent(type: string, mediaType: string, isOwn: boolean): string {
    const own = isOwn ? '你的' : '';
    if (!mediaType) return '';
    switch (type) {
      case 'reply':
        return `用 ${mediaType} 回复了`;
      case 'quote':
        return `引用了${own} ${mediaType}`;
      case 'repost':
        return `转发了${own} ${mediaType}`;
      case 'like':
        return `赞了${own} ${mediaType}`;
      default:
        return '';
    }
  }

  private getActivityContentAndContext({
    type,
    post,
    relatePost,
    isOwn,
  }: SummaryParams) {
    const { medias, caption } = post || {};
    const { medias: relateMedias, caption: relateCaption } = relatePost || {};

    const primaryMediaType = this.getMediaType(medias);
    const secondaryMediaType = this.getMediaType(relateMedias);

    if (caption && relateCaption) {
      return {
        context: caption,
        content: relateCaption,
      };
    }

    const firstContent = this.getContent(
      type,
      primaryMediaType || '帖子',
      isOwn,
    );
    const secondaryContent = this.getContent(
      type,
      secondaryMediaType || '帖子',
      isOwn,
    );
    let context, content;
    switch (type) {
      case 'reply':
        content = caption || firstContent;
        context = relateCaption || secondaryContent;
        break;
      case 'quote':
        content = relateCaption || secondaryContent;
        context = caption || firstContent;
        break;
      case 'repost':
        context = relateCaption || secondaryContent;
        break;
      case 'like':
        context = caption || secondaryContent;
    }

    return { content, context };
  }

  async findByPostCode(
    postCode: string,
    currentUid: string,
    type: string | null,
    page: number,
    pageSize: number,
  ): Promise<{ activities: Activity[]; total: number }> {
    const post = await this.postService.findPostByCode(postCode, currentUid);
    if (
      (post.likeAndViewCountDisabled && !post.user?.friendshipStatus?.isOwn) ||
      post?.user?.friendshipStatus?.isBanned
    ) {
      throw new Error('not allowed');
    }
    const skips = pageSize * (page - 1);
    const query = { postCode };
    if (type) {
      query['type'] = type;
    }

    const activities = await this.activityModel
      .find(query)
      .skip(skips)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .exec();

    const _activities = await this.mergeActivitiesInfo(
      activities,
      currentUid,
      false,
    );

    const total = await this.activityModel.countDocuments(query);
    return { activities: _activities, total };
  }

  async delete(id: string): Promise<void> {
    this.activityModel.findByIdAndDelete(id).exec();
  }

  async deleteActivity(
    type: string,
    from: string,
    to: string,
    postCode?: string,
  ): Promise<void> {
    // 根据类型、from和to来查找并删除对应的活动记录
    await this.activityModel.deleteOne({ type, from, to, postCode }).exec();
  }

  async findById(id: string): Promise<Activity | null> {
    return this.activityModel.findOne({ id }).exec();
  }

  async deleteActivitiesByPostCode(postCode: string): Promise<void> {
    // 根据postId来查找并删除所有关联的活动记录
    await this.activityModel.deleteMany({ postCode }).exec();
  }

  async deleteActivitiesByUid(uid: string): Promise<void> {
    // 根据postId来查找并删除所有关联的活动记录
    await this.activityModel
      .deleteMany({ $or: [{ from: uid }, { to: uid }] })
      .exec();
  }

  async getPostSummary(
    currentUid,
    postCode: string,
    activityCount: number,
  ): Promise<any> {
    const post = await this.postService.findPostByCode(postCode, currentUid);
    const defaultFilter = {
      postCode,
      type: { $in: ['like', 'repost', 'quote'] },
    };
    const filter = this.getBannedFilter(currentUid, defaultFilter);
    const recentActivities = await this.activityModel.aggregate([
      ...filter,
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: activityCount,
      },
    ]);

    const _recentActivities = await this.mergeActivitiesInfo(
      recentActivities,
      currentUid,
      false,
    );

    if (
      !post.likeAndViewCountDisabled &&
      !post?.user.friendshipStatus?.isBanned &&
      currentUid
    ) {
      const likeCount = await this.activityModel.aggregate([
        ...this.getBannedFilter(currentUid, { postCode, type: 'like' }),
        {
          $count: 'total',
        },
      ]);
      const repostCount = await this.activityModel.aggregate([
        ...this.getBannedFilter(currentUid, { postCode, type: 'repost' }),
        {
          $count: 'total',
        },
      ]);

      const quoteCount = await this.activityModel.aggregate([
        ...this.getBannedFilter(currentUid, { postCode, type: 'quote' }),
        {
          $count: 'total',
        },
      ]);
      return {
        likeCount: likeCount?.[0]?.total,
        repostCount: repostCount?.[0]?.total,
        quoteCount: quoteCount?.[0]?.total,
        viewCount: post?.viewCount,
        recentActivities: _recentActivities,
      };
    }
    return {
      recentActivities: _recentActivities,
    };
  }

  async markActivitiesAsRead(to: string, ids: string[]): Promise<number> {
    const result = await this.activityModel
      .updateMany({ to, id: { $in: ids } }, { $set: { isReaded: true } })
      .exec();
    return result.modifiedCount; // 返回成功修改的记录数
  }

  async getUnreadActivityNum(to: string): Promise<boolean> {
    const filter = this.getBannedFilter(to, {
      to,
      isReaded: false,
      from: { $ne: to },
    });
    const total = await this.activityModel.aggregate([
      ...filter,
      {
        $count: 'total',
      },
    ]);
    return total?.[0]?.total;
  }
}
