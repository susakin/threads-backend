import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRelationDocument = UserRelation & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class UserRelation {
  @Prop({ required: true, index: true })
  uid: string; // 关注者的用户 ID

  @Prop({ required: true, index: true })
  targetUid: string; // 被操作的用户 ID，例如被关注者的用户 ID 或者被拉黑者的用户 ID

  @Prop({ default: false })
  blocking: boolean; // 当前用户是否被另一个用户拉黑

  @Prop({ default: false })
  following: boolean; // 当前用户是否关注另一个用户

  @Prop({ default: false })
  outgoingRequest: boolean; // 当前用户是否关注另一个用户

  @Prop({ default: false })
  restricting: boolean;

  @Prop({ default: false })
  muting: boolean;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const UserRelationSchema = SchemaFactory.createForClass(UserRelation);
