import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SavePostDocument = SavePost & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class SavePost {
  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ required: true })
  uid: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const SavePostSchema = SchemaFactory.createForClass(SavePost).index(
  { uid: 1, postId: 1 },
  { unique: true },
);
