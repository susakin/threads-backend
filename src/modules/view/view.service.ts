import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateViewDto } from './dto/create-view.dto';
import { view, viewtDocument } from './schema/view.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostService } from '../post/post.service';

@Injectable()
export class ViewService {
  constructor(
    @InjectModel(view.name)
    private viewModel: Model<viewtDocument>,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async create({ postId, uid }: CreateViewDto) {
    const post = await this.postService.findPostById(postId, uid);

    if (post?.user?.id === uid) {
      return;
    }

    if (post?.user?.friendshipStatus?.isBanned) {
      throw new Error('Not allow');
    }

    const view = await this.viewModel.findOne({ postId, uid });
    if (!view) {
      const view = await this.viewModel.create({ postId, uid });
      return view;
    }
  }

  async getViewCount(postId: string): Promise<number> {
    const count = await this.viewModel
      .aggregate([
        {
          $match: { postId },
        },
        {
          $count: 'count',
        },
      ])
      .exec();

    return count.length > 0 ? count[0].count : 0;
  }

  async deleteByPostId(postId: string) {
    await this.viewModel.deleteMany({ postId });
  }

  async getByPostIdAndUid(postId: string, uid: string): Promise<boolean> {
    const view = await this.viewModel.findOne({ postId, uid });
    return !!view;
  }
}
