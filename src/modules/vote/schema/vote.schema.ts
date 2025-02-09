import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Vote {
  @Prop({ required: true })
  pollId: string;

  @Prop({ required: true })
  pollItemId: string;

  @Prop()
  id: string;

  @Prop({ required: true })
  uid: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
