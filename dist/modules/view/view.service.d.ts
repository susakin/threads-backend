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
import { CreateViewDto } from './dto/create-view.dto';
import { view, viewtDocument } from './schema/view.schema';
import { Model } from 'mongoose';
import { PostService } from '../post/post.service';
export declare class ViewService {
    private viewModel;
    private readonly postService;
    constructor(viewModel: Model<viewtDocument>, postService: PostService);
    create({ postId, uid }: CreateViewDto): Promise<import("mongoose").Document<unknown, {}, viewtDocument> & view & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getViewCount(postId: string): Promise<number>;
    deleteByPostId(postId: string): Promise<void>;
    getByPostIdAndUid(postId: string, uid: string): Promise<boolean>;
}
