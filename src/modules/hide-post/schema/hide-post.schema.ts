import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HidePostDocument = HidePost & Document;

@Schema()
export class HidePost {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  postId: string;
}

export const HidePostSchema = SchemaFactory.createForClass(HidePost).index(
  { uid: 1, postId: 1 },
  { unique: true },
);
