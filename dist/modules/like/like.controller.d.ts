import { LikeService } from './like.service';
import { Request as _Request } from 'express';
export declare class LikeController {
    private readonly likeService;
    constructor(likeService: LikeService);
    getUserLikePosts(page: number, pageSize: number, request: any): Promise<{
        posts: any[];
        total: number;
    }>;
    getPostLikesWithUsers(postId: string, page: number, pageSize: number, req: _Request): Promise<{
        likes: any[];
        total: number;
    }>;
    likePost(postId: string, request: any): Promise<void>;
    unlikePost(postId: string, request: any): Promise<void>;
}
