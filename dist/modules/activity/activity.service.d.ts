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
import { Activity, ActivityDocument } from './schema/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';
export declare class ActivityService {
    private activityModel;
    private readonly userService;
    private readonly postService;
    constructor(activityModel: Model<ActivityDocument>, userService: UserService, postService: PostService);
    create(createActivityDto: CreateActivityDto): Promise<Activity>;
    getNewActivitiesAfterId(to: string, id: string, type: string | null, pageSize: number): Promise<{
        activities: Activity[];
    }>;
    mergeActivitiesInfo(activities: Activity[], currentUid: string, isOwn?: boolean): Promise<Activity[]>;
    findByTo(to: string, type: string | null, page: number, pageSize: number): Promise<{
        activities: Activity[];
        total: number;
    }>;
    private getBannedFilter;
    private getMediaType;
    private getContent;
    private getActivityContentAndContext;
    findByPostCode(postCode: string, currentUid: string, type: string | null, page: number, pageSize: number): Promise<{
        activities: Activity[];
        total: number;
    }>;
    delete(id: string): Promise<void>;
    deleteActivity(type: string, from: string, to: string, postCode?: string): Promise<void>;
    findById(id: string): Promise<Activity | null>;
    deleteActivitiesByPostCode(postCode: string): Promise<void>;
    deleteActivitiesByUid(uid: string): Promise<void>;
    getPostSummary(currentUid: any, postCode: string, activityCount: number): Promise<any>;
    markActivitiesAsRead(to: string, ids: string[]): Promise<number>;
    getUnreadActivityNum(to: string): Promise<boolean>;
}
