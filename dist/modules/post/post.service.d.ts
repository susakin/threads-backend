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
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto, ReplyAuth, TextEntity } from './dto/create-post.dot';
import { UserService } from 'src/modules/user/user.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { LikeService } from '../like/like.service';
import { RepostService } from '../repost/repost.service';
import { UserRelationService } from '../user-relation/user-relation.service';
import { QuoteService } from '../quote/quote.service';
import { HidePostService } from '../hide-post/hide-post.service';
import { PollService } from '../poll/poll.service';
import { SavePostService } from '../save-post/save-post.service';
import { TagService } from '../tag/tag.service';
import { ViewService } from '../view/view.service';
export declare class PostService {
    private postModel;
    private readonly userService;
    private readonly userRelationService;
    private readonly likeService;
    private readonly repostService;
    private readonly quoteService;
    private readonly activityService;
    private readonly hidePostService;
    private readonly pollService;
    private readonly savePostService;
    private readonly tagService;
    private readonly viewService;
    constructor(postModel: Model<PostDocument>, userService: UserService, userRelationService: UserRelationService, likeService: LikeService, repostService: RepostService, quoteService: QuoteService, activityService: ActivityService, hidePostService: HidePostService, pollService: PollService, savePostService: SavePostService, tagService: TagService, viewService: ViewService);
    isPostBanned(post: Post, currentUid: string, allowedMentionUsers: any[]): Promise<boolean>;
    private getMentionUser;
    createTag(textEntities: TextEntity[], currentUid: string): void;
    getMentionUserAndCaption(caption?: string, currentUid?: string): Promise<{
        caption: string;
        allowedMentionUsers: any[];
    }>;
    private createMentionActivity;
    private createFirstPostActivity;
    createPost(post: CreatePostDto): Promise<Post>;
    getUserPinned(uid: string): Promise<boolean>;
    getPostCommentPinned(id: string): Promise<boolean>;
    updatePostReplyAuth(id: string, replyAuth: ReplyAuth): Promise<import("mongoose").Document<unknown, {}, PostDocument> & Post & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findPostById(id: string, currentUid?: string): Promise<Post>;
    findPostByCode(code: string, currentUid: string): Promise<Post>;
    findReplyUsersProfilePicUrl(id: string): Promise<any>;
    checkIsPostOwner(id: string, uid: string): Promise<boolean>;
    updatePost(id: string, updatedFields: Partial<Post>): Promise<Post>;
    deletePost(id: string): Promise<void>;
    deleteRepliesById(replyToPostId: string): Promise<void>;
    deletePostsByUid(uid: string): Promise<void>;
    findPostWithQuotedPostById(id: string, currentUid: string): Promise<any>;
    private getPostDetail;
    mergePostInfo(post: Post, currentUid: string): Promise<any>;
    findPostsByUid(uid: string, currentUid: string, page: number, pageSize: number): Promise<{
        total: number;
        posts: any;
    }>;
    incrementLikeCount(id: string): Promise<Post>;
    incrementCommentCount(id: string): Promise<Post>;
    incrementRepostCount(id: string): Promise<Post>;
    decrementLikeCount(id: string): Promise<Post>;
    decrementRepostCount(id: string): Promise<Post>;
    decrementCommentCount(id: string): Promise<Post>;
    findPostChildChainById(id: string, currentUid: string): Promise<any[]>;
    findPostParentChainByCode(code: string, currentUid: string): Promise<Post[]>;
    findReplyPostsById(postId: string, currentUid: any, page: number, pageSize: number, excludePostCode?: string): Promise<any>;
    pinToProfile(id: string): Promise<Post>;
    unpinToComment(postId: string, currentUid: any): Promise<import("mongoose").Document<unknown, {}, PostDocument> & Post & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    pinToComment(postId: string, currentUid: any): Promise<import("mongoose").Document<unknown, {}, PostDocument> & Post & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    unpinToProfile(id: string): Promise<Post>;
    updateLikeAndviewtsDisabled(id: string, likeAndViewCountDisabled: boolean): Promise<Post>;
    findRepliesByUid(uid: string, currentUid: string, page: number, pageSize: number): Promise<{
        total: number;
        posts: any[];
    }>;
    findFollowingPosts(currentUid: any, page: number, pageSize: number): Promise<{
        total: number;
        posts: any;
    }>;
    findFollowingPostsAfterId(currentUid: string, id: string, pageSize: number): Promise<{
        posts: any;
    }>;
    private getBannedFilter;
    findTimelinePosts(currentUid: any, page: number, pageSize: number): Promise<{
        total: number;
        posts: any;
    }>;
    getReplyAfterId(currentUid: string, id: string, replyId: string, pageSize: number): Promise<{
        posts: any;
    }>;
    findTimeLinePostsAfterId(currentUid: string, id: string, pageSize: number): Promise<{
        posts: any;
    }>;
    findPostsByQuery(query: Record<string, string>, currentUid: string, page: number, pageSize: number): Promise<{
        total: number;
        posts: any;
    }>;
}
