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
import { CreatePollDto } from './dto/create-poll.dto';
import { Model } from 'mongoose';
import { Poll, PollDocument } from './schema/poll.schema';
import { VoteService } from '../vote/vote.service';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';
import { ActivityService } from '../activity/activity.service';
export declare class PollService {
    private pollModel;
    private readonly voteService;
    private readonly userService;
    private readonly postService;
    private readonly activityService;
    constructor(pollModel: Model<PollDocument>, voteService: VoteService, userService: UserService, postService: PostService, activityService: ActivityService);
    create(createPollDto: CreatePollDto): Promise<Poll>;
    findOne(id: string, currentUid?: string, isBanned?: boolean): Promise<import("mongoose").Document<unknown, {}, PollDocument> & Poll & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteById(id: string): Promise<void>;
    checkExpiredPolls(): Promise<void>;
}
