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
import { MentionAuth } from '../dto/create-user.dto';
export type UserDocument = User & Document;
export declare class User {
    id: string;
    username: string;
    fullName: string;
    isVerified: boolean;
    profilePicUrl: string;
    bioLink: string;
    location: string;
    rank?: number;
    createdAt: number;
    updatedAt: number;
    isPrivate?: boolean;
    biography?: string;
    password: string;
    followerCount?: number;
    followingCount?: number;
    account: string;
    friendshipStatus?: {
        following?: boolean;
        followedBy?: boolean;
        blocking?: boolean;
        blockedBy?: boolean;
        isOwn?: boolean;
        outgoingRequest?: boolean;
        isBanned?: boolean;
    };
    mentionAuth?: MentionAuth;
    profileContextFacepileUsers?: object[];
}
export declare const UserSchema: mongoose.Schema<User, mongoose.Model<User, any, any, any, mongoose.Document<unknown, any, User> & User & {
    _id: mongoose.Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, User, mongoose.Document<unknown, {}, mongoose.FlatRecord<User>> & mongoose.FlatRecord<User> & {
    _id: mongoose.Types.ObjectId;
}>;
