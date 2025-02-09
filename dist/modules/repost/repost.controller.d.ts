import { RepostService } from './repost.service';
import { Request as _Request } from 'express';
export declare class RepostController {
    private readonly repostService;
    constructor(repostService: RepostService);
    createRepost(postId: string, request: any): Promise<import("./schema/repost.schema").Repost>;
    unrepostPost(postId: string, request: any): Promise<void>;
    getPostReposts(postId: string, page: number, pageSize: number, req: _Request): Promise<{
        reposts: any[];
        total: number;
    }>;
    getRepostsByUserId(uid: string, page: number, pageSize: number, req: _Request): Promise<{
        posts: any[];
        total: number;
    }>;
}
