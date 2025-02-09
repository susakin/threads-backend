/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import mongoose, { Document } from 'mongoose';
import { ActivityType } from '../dto/create-activity.dto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
export type ActivityDocument = Activity & Document;
export declare class Activity {
    from: string;
    id: string;
    to?: string;
    isReaded: boolean;
    type: ActivityType;
    context?: string;
    content?: string;
    relatePostId?: string;
    relatePostCode?: string;
    postCode?: string;
    createdAt: number;
    updatedAt: number;
    fromUser: CreateUserDto;
}
export declare const ActivitySchema: mongoose.Schema<Activity, mongoose.Model<Activity, any, any, any, mongoose.Document<unknown, any, Activity> & Activity & {
    _id: mongoose.Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Activity, mongoose.Document<unknown, {}, mongoose.FlatRecord<Activity>> & mongoose.FlatRecord<Activity> & {
    _id: mongoose.Types.ObjectId;
}>;
