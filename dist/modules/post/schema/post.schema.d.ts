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
import { Document } from 'mongoose';
import { Media, ReplyAuth, TextEntity } from '../dto/create-post.dot';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { CreatePostDto } from '../dto/create-post.dot';
import { CreatePollDto } from 'src/modules/poll/dto/create-poll.dto';
export type PostDocument = Post & Document;
type RepostedBy = {
    user?: CreateUserDto;
    createdAt?: number;
};
export declare class Post {
    caption: string;
    id: string;
    textEntities: TextEntity[];
    repostedBy?: RepostedBy;
    replyToPostId?: string;
    replyToUid?: string;
    captionIsEdited?: boolean;
    user?: CreateUserDto;
    replyToUser?: CreateUserDto;
    poll?: CreatePollDto;
    pollId?: string;
    likeCount: number;
    commentCount: number;
    repostCount: number;
    medias?: Media[];
    isLikedByViewer?: boolean;
    isFirst?: boolean;
    isSavedByViewer?: boolean;
    quotedPostId?: string;
    isRepostedByViewer: boolean;
    lineType?: 'line' | 'squiggle' | 'none';
    replyAuth?: ReplyAuth;
    canReply?: boolean;
    isPinnedToProfile?: boolean;
    isUnavailable?: boolean;
    isHiddenByViewer?: boolean;
    likeAndViewCountDisabled?: boolean;
    code?: string;
    uid?: string;
    createdAt: number;
    updatedAt: number;
    viewCount: number;
    replyUsersProfilePicUrl: string[];
    quotedPost: CreatePostDto;
    isPinnedToComment?: boolean;
    isViewedByViewer?: boolean;
}
export declare const PostSchema: import("mongoose").Schema<Post, import("mongoose").Model<Post, any, any, any, Document<unknown, any, Post> & Post & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Post, Document<unknown, {}, import("mongoose").FlatRecord<Post>> & import("mongoose").FlatRecord<Post> & {
    _id: import("mongoose").Types.ObjectId;
}>;
export {};
