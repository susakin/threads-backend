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
import { Repost, RepostDocument } from './schema/repost.schema';
import { UserService } from 'src/modules/user/user.service';
import { PostService } from 'src/modules/post/post.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { CreateRepostDto } from './dto/create-repost.dto';
export declare class RepostService {
    private repostModel;
    private readonly userService;
    private readonly postService;
    private readonly activityService;
    constructor(repostModel: Model<RepostDocument>, userService: UserService, postService: PostService, activityService: ActivityService);
    createRepost({ postId, uid }: CreateRepostDto): Promise<Repost>;
    unRepostPost(postId: string, uid: string): Promise<void>;
    deletePostReposts(postId: string): Promise<void>;
    getPostReposts(postId: string, currentUid: string, page: number, pageSize: number): Promise<{
        reposts: any[];
        total: number;
    }>;
    getRepostsByUid(uid: string, currentUid: string, page: number, pageSize: number): Promise<{
        posts: any[];
        total: number;
    }>;
    isRepostedByUser(postId: string, uid: string): Promise<boolean>;
    getFollowingRepost(followingUid: string[], currentUid: string): Promise<any>;
}
