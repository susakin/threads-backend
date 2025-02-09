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
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserRelationService } from 'src/modules/user-relation/user-relation.service';
import { ActivityService } from '../activity/activity.service';
import { PostService } from '../post/post.service';
export declare class UserService {
    private userModel;
    private readonly authService;
    private userRelationService;
    private activityService;
    private postService;
    constructor(userModel: Model<UserDocument>, authService: AuthService, userRelationService: UserRelationService, activityService: ActivityService, postService: PostService);
    create(user: CreateUserDto, ip: any): Promise<UserDocument>;
    private mergeUserInfo;
    findUserById(id: string, currentUid?: string): Promise<User>;
    findOneByUsername(username: string, currentUid?: string): Promise<User>;
    findOneAndUpdate(id: string, updatedFields: Partial<User>): Promise<void>;
    private getLocationByIp;
    updateUserLocationByIp(id: string, ip: string): Promise<void>;
    private getMaxRank;
    deleteUserById(id: string): Promise<void>;
    deleteUserByPassword(id: string, password: string): Promise<void>;
    private getBannedFilter;
    findUsersByQuery(query: string, page: number, pageSize: number, currentUid?: string): Promise<{
        total: number;
        users: User[];
    }>;
    private getFriendShipAndCommonFollowers;
    getUsersByIds(userIds: string[], currentUid?: string): Promise<User[]>;
    increaseFollowerCount(id: string): Promise<void>;
    decreaseFollowerCount(id: string): Promise<void>;
    increaseFollowingCount(id: string): Promise<void>;
    decreaseFollowingCount(id: string): Promise<void>;
    getRecommendedUsers(page: number, pageSize: number, currentUid: string): Promise<{
        total: number;
        users: User[];
    }>;
}
