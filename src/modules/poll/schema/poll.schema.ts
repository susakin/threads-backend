import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Tally } from '../dto/create-poll.dto';

export type PollDocument = Poll & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Poll {
  @Prop({ required: true, index: true })
  id: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  postId: string;

  @Prop({
    type: [
      { id: String, text: String, count: Number, voteUserAvatar: [String] },
    ],
    required: true,
  }) // 定义为 Tally 类型的对象数组
  tallies: Tally[];

  @Prop({ default: false })
  finished: boolean;

  @Prop()
  viewerIsOwner?: boolean;

  @Prop()
  viewerCanVote?: boolean;

  @Prop()
  viewerVote?: boolean;

  @Prop()
  createdAt: number;

  @Prop()
  expiresAt: number;

  @Prop()
  updatedAt: number;
}

export const PollSchema = SchemaFactory.createForClass(Poll);
