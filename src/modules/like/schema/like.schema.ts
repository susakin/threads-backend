import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Like {
  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ required: true })
  uid: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const LikeSchema = SchemaFactory.createForClass(Like).index(
  { uid: 1, postId: 1 },
  { unique: true },
);
