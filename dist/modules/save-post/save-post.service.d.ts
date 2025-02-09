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
import { CreateSavePostDto } from './dto/create-save-post.dto';
import { SavePost, SavePostDocument } from './schema/like.schema';
import { Model } from 'mongoose';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';
export declare function getBannedFilter(currentUid: any, extra?: {}): ({
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        let?: undefined;
        pipeline?: undefined;
    };
    $unwind?: undefined;
    $match?: undefined;
} | {
    $unwind: string;
    $lookup?: undefined;
    $match?: undefined;
} | {
    $lookup: {
        from: string;
        let: {
            uid: string;
            currentUid: any;
        };
        pipeline: {
            $match: {
                $expr: {
                    $and: {
                        $eq: string[];
                    }[];
                };
            };
        }[];
        as: string;
        localField?: undefined;
        foreignField?: undefined;
    };
    $unwind?: undefined;
    $match?: undefined;
} | {
    $match: {
        $and: ({
            'userRelation.blocking': {
                $ne: boolean;
            };
            '_userRelation.blocking': {
                $ne: boolean;
            };
            $or?: undefined;
        } | {
            $or: ({
                '_user.isPrivate': boolean;
                $and?: undefined;
                uid?: undefined;
            } | {
                $and: ({
                    uid: {
                        $ne: string;
                    };
                    '_user.isPrivate'?: undefined;
                    '_userRelation.following'?: undefined;
                } | {
                    '_user.isPrivate': boolean;
                    uid?: undefined;
                    '_userRelation.following'?: undefined;
                } | {
                    '_userRelation.following': boolean;
                    uid?: undefined;
                    '_user.isPrivate'?: undefined;
                })[];
                '_user.isPrivate'?: undefined;
                uid?: undefined;
            } | {
                uid: any;
                '_user.isPrivate'?: undefined;
                $and?: undefined;
            })[];
        })[];
    };
    $lookup?: undefined;
    $unwind?: undefined;
})[];
export declare class SavePostService {
    private savePostModel;
    private readonly userService;
    private readonly postService;
    constructor(savePostModel: Model<SavePostDocument>, userService: UserService, postService: PostService);
    create({ postId, uid }: CreateSavePostDto): Promise<import("mongoose").Document<unknown, {}, SavePostDocument> & SavePost & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    unsavePost(postId: string, uid: string): Promise<void>;
    getUserSavedPosts(currentUid: string, page: number, pageSize: number): Promise<{
        posts: any[];
        total: number;
    }>;
    postIsSavedByUser(postId: string, uid: string): Promise<boolean>;
}
