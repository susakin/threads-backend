export type ActivityType = 'like' | 'reply' | 'follow' | 'followRequest' | 'mention' | 'quote' | 'vote' | 'firstPost' | 'repost';
export declare class CreateActivityDto {
    id?: string;
    from: string;
    to?: string;
    isReaded?: boolean;
    type: ActivityType;
    context?: string;
    content?: string;
    createdAt?: Date;
    postCode?: string;
    relatePostCode?: string;
}
