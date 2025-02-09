import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ActivityType } from '../dto/create-activity.dto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';

export type ActivityDocument = Activity & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Activity {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true, index: true })
  id: string;

  @Prop()
  to?: string;

  @Prop({ default: false })
  isReaded: boolean; //

  @Prop({ required: true })
  type: ActivityType;

  @Prop()
  context?: string; //上下文

  @Prop()
  content?: string; //推送内容

  @Prop()
  relatePostId?: string;

  @Prop()
  relatePostCode?: string;

  @Prop()
  postCode?: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  fromUser: CreateUserDto;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
