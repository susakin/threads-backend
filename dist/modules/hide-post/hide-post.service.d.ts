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
import { CreateHidePostDto } from './dto/create-hide-post.dto';
import { Model } from 'mongoose';
import { HidePost, HidePostDocument } from './schema/hide-post.schema';
import { PostService } from '../post/post.service';
export declare class HidePostService {
    private hidePostModel;
    private readonly postService;
    constructor(hidePostModel: Model<HidePostDocument>, postService: PostService);
    create(createHidePostDto: CreateHidePostDto): Promise<import("mongoose").Document<unknown, {}, HidePostDocument> & HidePost & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteByPostId(postId: string, uid: string): Promise<import("mongodb").DeleteResult>;
    isHiddenPost(postId: string, uid: string): Promise<boolean>;
}
