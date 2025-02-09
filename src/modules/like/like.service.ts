import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from './schema/like.schema';
import { CreateLikeDto } from './dto/create-like.dto';
import { UserService } from 'src/modules/user/user.service';
import { PostService } from 'src/modules/post/post.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { Request as _Request } from 'express';
import { getBannedFilter } from '../save-post/save-post.service';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: Model<LikeDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService, // 注入用户服务
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
  ) {}

  async createLike({ postId, uid }: CreateLikeDto): Promise<Like> {
    const post = await this.postService.findPostById(postId, uid);
    // 生成对应的活动记录
    if (post?.user?.friendshipStatus?.isBanned) {
      throw new Error('Not allow');
    }

    if (post) {
      const like = await this.likeModel.create({ postId, uid });
      await this.postService.incrementLikeCount(postId);
      const activityDto = {
        type: 'like' as any,
        from: uid, // 使用点赞用户的uid作为活动记录的from字段
        to: post.user.id, // 使用帖子发布者的uid作为活动记录的to字段
        postCode: post.code,
        // 其他字段...
      };
      await this.activityService.create(activityDto);
      return like;
    } else {
      throw new Error('post  not found');
    }
  }

  async unlikePost(postId: string, uid: string): Promise<void> {
    // 取消点赞逻辑...
    await this.likeModel.deleteOne({ postId, uid }).exec();

    // 删除对应的活动记录
    const post = await this.postService.findPostById(postId, uid);
    if (post) {
      await this.activityService.deleteActivity(
        'like',
        uid,
        post.user.id,
        post.code,
      );
      await this.postService.decrementLikeCount(postId);
    }
  }

  async deletePostLikes(postId: string): Promise<void> {
    // 查找该帖子的所有点赞信息
    await this.likeModel.deleteMany({ postId }).exec();
  }

  async getPostLikes(
    postId: string,
    currentUid,
    page: number,
    pageSize: number,
  ): Promise<{ likes: any[]; total: number }> {
    const skip = pageSize * (page - 1);
    const filter = getBannedFilter(currentUid, { postId });

    const [likes, total] = await Promise.all([
      await this.likeModel.aggregate([
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
      await this.likeModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    // 获取点赞用户的实体信息
    const likesWithUsers = await Promise.all(
      likes.map(async (like) => {
        const user = await this.userService.findUserById(like.uid, currentUid);
        return { like, user };
      }),
    );

    return { likes: likesWithUsers, total: total?.[0]?.total };
  }

  async getUserLikePosts(
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ posts: any[]; total: number }> {
    const skip = pageSize * (page - 1);
    const filter = getBannedFilter(currentUid, { uid: currentUid });

    const [likes, total] = await Promise.all([
      await this.likeModel.aggregate([
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
      await this.likeModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    // 获取帖子信息
    const posts = await Promise.all(
      likes.map(async (like) => {
        const post = await this.postService.findPostById(
          like.postId,
          currentUid,
        );
        return post;
      }),
    );

    return { posts, total: total?.[0]?.total };
  }

  async postIsLikedByUser(postId: string, uid: string): Promise<boolean> {
    const like = await this.likeModel.findOne({ postId, uid }).exec();
    return !!like;
  }
}
