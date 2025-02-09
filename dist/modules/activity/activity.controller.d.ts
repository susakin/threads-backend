import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Request as _Request } from 'express';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    create(createActivityDto: CreateActivityDto): Promise<import("./schema/activity.schema").Activity>;
    findByTo(request: any, page: number, pageSize: number, type: string): Promise<{
        activities: import("./schema/activity.schema").Activity[];
        total: number;
    }>;
    newActivitiesAfterId(request: any, id: string, pageSize: number, type: string): Promise<{
        activities: import("./schema/activity.schema").Activity[];
    }>;
    delete(request: any, id: string): Promise<void>;
    getPostSummary(postId: string, req: _Request): Promise<any>;
    getPostActivity(postCode: string, type: string, pageSize: number, page: number, req: _Request): Promise<{
        activities: import("./schema/activity.schema").Activity[];
        total: number;
    }>;
    markActivitiesAsRead(request: any, ids: string[]): Promise<{
        modifiedCount: number;
    }>;
    hasUnreadActivity(request: any): Promise<boolean>;
}
