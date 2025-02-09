import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type viewtDocument = view & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class view {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  uid: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const viewtchema = SchemaFactory.createForClass(view).index(
  { uid: 1, postId: 1 },
  { unique: true },
);
