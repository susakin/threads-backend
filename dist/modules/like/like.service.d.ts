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
import { Like, LikeDocument } from './schema/like.schema';
import { CreateLikeDto } from './dto/create-like.dto';
import { UserService } from 'src/modules/user/user.service';
import { PostService } from 'src/modules/post/post.service';
import { ActivityService } from 'src/modules/activity/activity.service';
export declare class LikeService {
    private likeModel;
    private readonly userService;
    private readonly postService;
    private readonly activityService;
    constructor(likeModel: Model<LikeDocument>, userService: UserService, postService: PostService, activityService: ActivityService);
    createLike({ postId, uid }: CreateLikeDto): Promise<Like>;
    unlikePost(postId: string, uid: string): Promise<void>;
    deletePostLikes(postId: string): Promise<void>;
    getPostLikes(postId: string, currentUid: any, page: number, pageSize: number): Promise<{
        likes: any[];
        total: number;
    }>;
    getUserLikePosts(currentUid: string, page: number, pageSize: number): Promise<{
        posts: any[];
        total: number;
    }>;
    postIsLikedByUser(postId: string, uid: string): Promise<boolean>;
}
