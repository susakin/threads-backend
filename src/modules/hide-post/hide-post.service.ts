import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateHidePostDto } from './dto/create-hide-post.dto';
import { Model } from 'mongoose';
import { HidePost, HidePostDocument } from './schema/hide-post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PostService } from '../post/post.service';

@Injectable()
export class HidePostService {
  constructor(
    @InjectModel(HidePost.name)
    private hidePostModel: Model<HidePostDocument>,

    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async create(createHidePostDto: CreateHidePostDto) {
    const uid = createHidePostDto.uid;
    const postId = createHidePostDto.postId;
    const post = await this.postService.findPostById(postId, uid);
    if (post.uid === uid) {
      throw new Error('cannot hide own post');
    }

    const hidePost = await this.hidePostModel.create(createHidePostDto);
    return hidePost;
  }

  async deleteByPostId(postId: string, uid: string) {
    const hidePost = await this.hidePostModel.deleteOne({ postId, uid });
    return hidePost;
  }

  async isHiddenPost(postId: string, uid: string) {
    const hidePost = await this.hidePostModel.findOne({ postId, uid });
    return !!hidePost;
  }
}
