/* user.schema.ts */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({
  timestamps: {
    currentTime: () => Date.now(),
  },
})
export class Auth {
  @Prop({ required: true, index: true })
  id: string;

  @Prop({ required: true })
  uid?: string;

  @Prop({ required: true })
  salt: string;

  @Prop()
  password: string;

  @Prop()
  account: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}
export const AuthSchema = SchemaFactory.createForClass(Auth);
