import { UserRelationService } from './user-relation.service';
import { Request as _Request } from 'express';
export declare class UserRelationController {
    private readonly userRelationService;
    constructor(userRelationService: UserRelationService);
    followUser(uid: string, request: any): Promise<void>;
    unfollowUser(uid: string, request: any): Promise<void>;
    deleteFollowUser(uid: string, request: any): Promise<void>;
    blockUser(uid: string, request: any): Promise<void>;
    unblockUser(uid: string, request: any): Promise<void>;
    restricteUser(uid: string, request: any): Promise<void>;
    unrestricteUser(uid: string, request: any): Promise<void>;
    muteUser(uid: string, request: any): Promise<void>;
    unmuteUser(uid: string, request: any): Promise<void>;
    deleteFollowRequest(uid: string, request: any): Promise<void>;
    followRequest(uid: string, request: any): Promise<void>;
    getFollowingList(page: number, pageSize: number, uid: string, req: _Request): Promise<{
        users: import("../user/schema/user.schema").User[];
        total: number;
    }>;
    getFollowerList(page: number, pageSize: number, uid: string, req: _Request): Promise<{
        users: import("../user/schema/user.schema").User[];
        total: number;
    }>;
}
