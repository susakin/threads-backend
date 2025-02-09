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
import { Model } from 'mongoose';
import { UserRelationDocument } from './schema/user-relation.schema';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/schema/user.schema';
import { ActivityService } from 'src/modules/activity/activity.service';
export declare class UserRelationService {
    private userRelationModel;
    private userService;
    private activityService;
    constructor(userRelationModel: Model<UserRelationDocument>, userService: UserService, activityService: ActivityService);
    followRequest(uid: string, targetUid: string): Promise<void>;
    unFollowPrivateUser(uid: string, targetUid: string): Promise<void>;
    followPrivateUser(uid: string, targetUid: string): Promise<void>;
    followUser(uid: string, targetUid: string): Promise<void>;
    private followSuccess;
    unfollowUser(uid: string, targetUid: string): Promise<void>;
    buildRelation(uid: string, targetUid: string, type: 'blocking' | 'restricting' | 'muting'): Promise<void>;
    dissolveRelation(uid: string, targetUid: string, type: 'blocking' | 'restricting' | 'muting'): Promise<void>;
    getFollowingList(uid: string, currentUid: string, page: number, pageSize: number): Promise<{
        users: User[];
        total: number;
    }>;
    getFollowerList(uid: string, currentUid: string, page: number, pageSize: number): Promise<{
        users: User[];
        total: number;
    }>;
    getFollowingUids(uid: string, options: {
        skip: number;
        limit: number;
    }): Promise<string[]>;
    getFollowerUids(uid: string, options: {
        skip: number;
        limit: number;
    }): Promise<string[]>;
    getUserRelation(uid: string, targetUid: string): Promise<UserRelationDocument>;
    getCommonFollowers(uid: string, otherUid: string, page: number, pageSize: number): Promise<{
        commonFollowers: User[];
        total: number;
    }>;
    getUserFriendshipStatus(uid: any, currentUid: string): Promise<any>;
    deleteByUid(uid: string): Promise<any>;
}
