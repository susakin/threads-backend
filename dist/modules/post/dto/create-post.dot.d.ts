import { User } from 'src/modules/user/schema/user.schema';
export type MediaDimensions = {
    mediaHeight: number;
    mediaWidth: number;
};
export type Media = {
    url: string;
    type: 'image' | 'video';
    accessibilityCaption?: string;
} & MediaDimensions;
export declare enum ReplyAuth {
    Everyone = "everyone",
    FollowedBy = "followedBy",
    Mention = "mention"
}
export type TextEntity = {
    type: 'tag' | 'mention';
    id?: string;
    displayText: string;
    offset: number;
    blockIndex: number;
};
export declare class CreatePostDto {
    id: string;
    caption?: string;
    replyToUser?: User;
    captionIsEdited?: boolean;
    user?: User;
    uid?: string;
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
    textEntities?: TextEntity[];
    medias?: Media[];
    isLikedByViewer?: boolean;
    isSavedByViewer?: boolean;
    isViewedByViewer?: boolean;
    replyUsersProfilePicUrl?: string[];
    quotedPostId?: string;
    isRepostedByViewer?: boolean;
    lineType?: 'line' | 'squiggle' | 'none';
    canReply?: boolean;
    isPinnedToProfile?: boolean;
    likeAndViewCountDisabled?: boolean;
    code?: string;
    createdAt?: number;
    replyToPostId?: string;
    replyToUid?: string;
    replyAuth?: ReplyAuth;
    isPinnedToComment?: boolean;
    pollId?: string;
    isFirst?: boolean;
    viewCount?: number;
    repostedBy?: {
        user?: User;
        createdAt?: number;
    };
}
