import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Media, ReplyAuth, TextEntity } from '../dto/create-post.dot';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { CreatePostDto } from '../dto/create-post.dot';
import { CreatePollDto } from 'src/modules/poll/dto/create-poll.dto';

export type PostDocument = Post & Document;

type RepostedBy = {
  user?: CreateUserDto;
  createdAt?: number;
};

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Post {
  @Prop({ maxlength: 500 })
  caption: string;

  @Prop({ required: true, index: true })
  id: string;

  @Prop({ type: [{ type: Object }] })
  textEntities: TextEntity[];

  @Prop({ type: Object })
  repostedBy?: RepostedBy;

  @Prop()
  replyToPostId?: string;

  @Prop()
  replyToUid?: string;

  @Prop({ default: false })
  captionIsEdited?: boolean;

  @Prop()
  user?: CreateUserDto;

  @Prop()
  replyToUser?: CreateUserDto;

  @Prop()
  poll?: CreatePollDto;

  @Prop()
  pollId?: string;

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: 0 })
  repostCount: number;

  @Prop()
  medias?: Media[];

  @Prop({ default: false })
  isLikedByViewer?: boolean;

  @Prop({ default: false })
  isFirst?: boolean;

  @Prop({ default: false })
  isSavedByViewer?: boolean;

  @Prop()
  quotedPostId?: string;

  @Prop({ default: false })
  isRepostedByViewer: boolean;

  @Prop()
  lineType?: 'line' | 'squiggle' | 'none';

  @Prop({ default: 'everyone', type: String, enum: Object.values(ReplyAuth) })
  replyAuth?: ReplyAuth;

  @Prop({ default: true })
  canReply?: boolean;

  @Prop({ default: false })
  isPinnedToProfile?: boolean;

  @Prop({ default: false })
  isUnavailable?: boolean;

  @Prop({ default: false })
  isHiddenByViewer?: boolean;

  @Prop()
  likeAndViewCountDisabled?: boolean;

  @Prop()
  code?: string;

  @Prop({ required: true })
  uid?: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  replyUsersProfilePicUrl: string[];

  @Prop()
  quotedPost: CreatePostDto;

  @Prop({ default: false })
  isPinnedToComment?: boolean;

  @Prop({ default: false })
  isViewedByViewer?: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
