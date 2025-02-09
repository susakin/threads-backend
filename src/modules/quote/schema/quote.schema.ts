import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuoteDocument = Quote & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Quote {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  quoteToPostId: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const quoteSchema = SchemaFactory.createForClass(Quote);
