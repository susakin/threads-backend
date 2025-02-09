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
import { CreateVoteDto } from './dto/create-vote.dto';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from './schema/vote.schema';
import { PollService } from '../poll/poll.service';
import { PostService } from '../post/post.service';
export declare class VoteService {
    private voteModel;
    private readonly pollService;
    private readonly postService;
    constructor(voteModel: Model<VoteDocument>, pollService: PollService, postService: PostService);
    create(createVoteDto: CreateVoteDto): Promise<import("mongoose").Document<unknown, {}, VoteDocument> & Vote & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getTallyCount(pollItemId: string): Promise<number>;
    delteByPollId(pollId: string): Promise<void>;
    findOne(pollId: string, uid: string): Promise<Vote>;
    findByPollId(pollId: string): Promise<Vote[]>;
}
