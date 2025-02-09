import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Tag {
  @Prop({ required: true })
  @Prop()
  id: string;

  @Prop()
  displayText: string;

  @Prop()
  uid: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;

  @Prop({ default: 0 })
  quotedCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
