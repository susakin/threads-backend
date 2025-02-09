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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { PostService } from './post.service';
import { CreatePostDto, ReplyAuth } from './dto/create-post.dot';
import { Post as PostItem } from './schema/post.schema';
import { Request as _Request } from 'express';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    createPost(createPostDto: CreatePostDto, request: any): Promise<PostItem>;
    updatePost(id: string, updatePostDto: PostItem, request: any): Promise<PostItem>;
    updatePostReplyAuth(id: string, replyAuth: ReplyAuth, request: any): Promise<import("mongoose").Document<unknown, {}, import("./schema/post.schema").PostDocument> & PostItem & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deletePost(id: string, request: any): Promise<void>;
    findPostsByUid(uid: string, page: number, pageSize: number, req: _Request): Promise<{
        total: number;
        posts: any;
    }>;
    getTimelinePosts(page: number, pageSize: number, req: _Request): Promise<{
        total: number;
        posts: any;
    }>;
    findPostByCode(code: string, req: _Request): Promise<PostItem>;
    pinPost(id: string, request: any): Promise<PostItem>;
    pinToComment(id: string, request: any): Promise<import("mongoose").Document<unknown, {}, import("./schema/post.schema").PostDocument> & PostItem & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    unpinToComment(id: string, request: any): Promise<import("mongoose").Document<unknown, {}, import("./schema/post.schema").PostDocument> & PostItem & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateLikeAndviewtsDisabled(id: string, request: any, likeAndViewCountDisabled: boolean): Promise<PostItem>;
    unpinPost(id: string, request: any): Promise<PostItem>;
    getPostDetail(code: string, req: _Request): Promise<PostItem[]>;
    getUserReplies(uid: string, pageSize: number, page: number, req: _Request): Promise<{
        total: number;
        posts: any[];
    }>;
    getUserPinned(req: _Request): Promise<boolean>;
    getPostCommentPinned(id: string): Promise<boolean>;
    getUserRepost(id: string, pageSize: number, page: number, excludePostCode: string, req: _Request): Promise<any>;
    getTimelineAfterId(id: string, pageSize: number, req: _Request): Promise<{
        posts: any;
    }>;
    getCommentAfterId(id: string, replyId: string, pageSize: number, req: _Request): Promise<{
        posts: any;
    }>;
    getFollowingPosts(page: number, pageSize: number, req: _Request): Promise<{
        total: number;
        posts: any;
    }>;
    getFollowingPostsAfterId(id: string, pageSize: number, req: _Request): Promise<{
        posts: any;
    }>;
    findPostsByQuery(caption: string, tag: string, filter: 'recent', page: number, pageSize: number, req: _Request): Promise<{
        total: number;
        posts: any;
    }>;
    findPostById(id: string, req: _Request): Promise<PostItem>;
}
