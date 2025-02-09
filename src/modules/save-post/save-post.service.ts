import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateSavePostDto } from './dto/create-save-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SavePost, SavePostDocument } from './schema/like.schema';
import { Model } from 'mongoose';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';

export function getBannedFilter(currentUid, extra = {}) {
  return [
    {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: 'id',
        as: '_user',
      },
    },
    {
      $lookup: {
        from: 'posts',
        localField: 'postId',
        foreignField: 'id',
        as: 'post',
      },
    },
    {
      $unwind: '$post', // Unwind the post array to access its fields
    },
    {
      $lookup: {
        from: 'userrelations',
        let: { uid: '$post.uid', currentUid },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$targetUid', '$$currentUid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
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
        let: { uid: '$post.uid', currentUid },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$targetUid', '$$uid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                  { $eq: ['$uid', '$$currentUid'] }, // 匹配当前用户ID
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
            '_userRelation.blocking': { $ne: true },
            ...extra,
          },
          {
            $or: [
              {
                '_user.isPrivate': false,
              },
              {
                $and: [
                  { uid: { $ne: '$currentUid' } },
                  { '_user.isPrivate': true },
                  { '_userRelation.following': true },
                ],
              },
              {
                uid: currentUid,
              },
            ],
          },
        ],
      },
    },
  ];
}

@Injectable()
export class SavePostService {
  constructor(
    @InjectModel(SavePost.name)
    private savePostModel: Model<SavePostDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService, // 注入用户服务
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async create({ postId, uid }: CreateSavePostDto) {
    const post = await this.postService.findPostById(postId, uid);
    // 生成对应的活动记录
    if (post?.user?.friendshipStatus?.isBanned) {
      throw new Error('Not allow');
    }
    if (post) {
      const savePost = await this.savePostModel.create({ postId, uid });
      return savePost;
    } else {
      throw new Error('post  not found');
    }
  }

  async unsavePost(postId: string, uid: string) {
    await this.savePostModel.deleteOne({ postId, uid }).exec();
  }

  async getUserSavedPosts(
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ posts: any[]; total: number }> {
    const skip = pageSize * (page - 1);
    const filter = getBannedFilter(currentUid, { uid: currentUid });

    const [save, total] = await Promise.all([
      await this.savePostModel.aggregate([
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
      await this.savePostModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    console.log(save, 'save');

    // 获取帖子信息
    const posts = await Promise.all(
      save.map(async (like) => {
        const post = await this.postService.findPostById(
          like.postId,
          currentUid,
        );
        return post;
      }),
    );

    return { posts, total: total?.[0]?.total };
  }

  async postIsSavedByUser(postId: string, uid: string): Promise<boolean> {
    const like = await this.savePostModel.findOne({ postId, uid }).exec();
    return !!like;
  }
}
