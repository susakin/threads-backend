import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RepostDocument = Repost & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Repost {
  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ required: true })
  uid: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const RepostSchema = SchemaFactory.createForClass(Repost).index(
  { uid: 1, postId: 1 },
  { unique: true },
);
