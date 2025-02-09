import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repost, RepostDocument } from './schema/repost.schema';
import { UserService } from 'src/modules/user/user.service';
import { PostService } from 'src/modules/post/post.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { getBannedFilter } from '../save-post/save-post.service';

@Injectable()
export class RepostService {
  constructor(
    @InjectModel(Repost.name)
    private repostModel: Model<RepostDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
  ) {}

  async createRepost({ postId, uid }: CreateRepostDto): Promise<Repost> {
    // 生成对应的活动记录
    const post = await this.postService.findPostById(postId, uid);
    if (post?.user?.friendshipStatus?.isBanned) {
      throw new Error('not allowed');
    }
    if (post) {
      const repost = await this.repostModel.create({ postId, uid });
      await this.postService.incrementRepostCount(postId);
      const activityDto = {
        type: 'repost' as any,
        from: uid, // 使用转发用户的uid作为活动记录的from字段
        to: post.user?.id, // 使用帖子发布者的uid作为活动记录的to字段
        postCode: post.code,
        relatePostId: post.id,
        // 其他字段...
      };
      await this.activityService.create(activityDto);

      return repost;
    } else {
      throw new Error('post  not found');
    }
  }

  async unRepostPost(postId: string, uid: string): Promise<void> {
    // 取消转发逻辑...
    await this.repostModel.deleteOne({ postId, uid }).exec();

    // 删除对应的活动记录
    const post = await this.postService.findPostById(postId, uid);
    if (post) {
      await this.postService.decrementRepostCount(postId);
      await this.activityService.deleteActivity(
        'repost',
        uid,
        post.user?.id,
        post.code,
      );
    }
  }

  async deletePostReposts(postId: string): Promise<void> {
    // 查找该帖子的所有转发信息
    await this.repostModel.deleteMany({ postId }).exec();
  }

  async getPostReposts(
    postId: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ reposts: any[]; total: number }> {
    const skip = pageSize * (page - 1);
    const filter = getBannedFilter(currentUid, { postId });
    const [reposts, total] = await Promise.all([
      await this.repostModel.aggregate([
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
      ]),
      await this.repostModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    // 获取转发用户的实体信息
    const _reposts = await Promise.all(
      reposts.map(async (repost) => {
        const user = await this.userService.findUserById(
          repost.uid,
          currentUid,
        );
        return { repost, user };
      }),
    );

    return { reposts: _reposts, total: total?.[0]?.total };
  }

  async getRepostsByUid(
    uid: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ posts: any[]; total: number }> {
    const skip = pageSize * (page - 1);
    const filter = getBannedFilter(currentUid, { uid });
    const [reposts, total] = await Promise.all([
      await this.repostModel.aggregate([
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
      ]),
      await this.repostModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    // 获取转发帖子的实体信息
    const posts = await Promise.all(
      reposts.map(async (repost) => {
        const post = await this.postService.findPostById(
          repost.postId,
          currentUid,
        );
        const user: any = await this.userService.findUserById(uid, currentUid);
        post.repostedBy = {
          createdAt: post.createdAt,
          user,
        };
        return post;
      }),
    );

    return { posts, total: total?.[0]?.total };
  }

  async isRepostedByUser(postId: string, uid: string): Promise<boolean> {
    const respost = await this.repostModel.findOne({ postId, uid }).exec();
    return !!respost;
  }
  async getFollowingRepost(
    followingUid: string[],
    currentUid: string,
  ): Promise<any> {
    const repost = await this.repostModel.aggregate([
      {
        $lookup: {
          from: 'posts', // Assuming 'posts' is the name of the collection for posts
          localField: 'postId',
          foreignField: 'id',
          as: 'post',
        },
      },
      {
        $match: {
          uid: { $in: followingUid }, // Reposted by users in followingUid
          'post.uid': { $nin: [...followingUid, currentUid] }, // Associated post not reposted by users in followingUid
        },
      },
    ]);

    return repost;
  }
}
