/* user.schema.ts */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MentionAuth } from '../dto/create-user.dto';

export type UserDocument = User & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class User {
  @Prop({ required: true, index: true })
  id: string;

  @Prop({ required: true, max: 100 })
  username: string;

  @Prop({ required: true, max: 100 })
  fullName: string;

  @Prop({ default: false })
  isVerified: boolean = false;

  @Prop()
  profilePicUrl: string;

  @Prop({ max: 240 })
  bioLink: string;

  @Prop()
  location: string;

  @Prop()
  rank?: number;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;

  @Prop({ default: false })
  isPrivate?: boolean;

  @Prop({ max: 150 })
  biography?: string;

  @Prop()
  password: string;

  @Prop({ default: 0 })
  followerCount?: number;

  @Prop({ default: 0 })
  followingCount?: number;

  @Prop()
  account: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  friendshipStatus?: {
    following?: boolean;
    followedBy?: boolean;
    blocking?: boolean;
    blockedBy?: boolean;
    isOwn?: boolean;
    outgoingRequest?: boolean;
    isBanned?: boolean;
  };

  @Prop({ type: String, enum: Object.values(MentionAuth), default: 'everyone' })
  mentionAuth?: MentionAuth;

  @Prop({
    type: mongoose.Schema.Types.Array,
  })
  profileContextFacepileUsers?: object[];
}
export const UserSchema = SchemaFactory.createForClass(User)
  .index({ username: 1 }, { unique: true })
  .index({ fullName: 1 }, { unique: true });
