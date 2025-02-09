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
import { Tally } from '../dto/create-poll.dto';
export type PollDocument = Poll & Document;
export declare class Poll {
    id: string;
    uid: string;
    postId: string;
    tallies: Tally[];
    finished: boolean;
    viewerIsOwner?: boolean;
    viewerCanVote?: boolean;
    viewerVote?: boolean;
    createdAt: number;
    expiresAt: number;
    updatedAt: number;
}
export declare const PollSchema: import("mongoose").Schema<Poll, import("mongoose").Model<Poll, any, any, any, Document<unknown, any, Poll> & Poll & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Poll, Document<unknown, {}, import("mongoose").FlatRecord<Poll>> & import("mongoose").FlatRecord<Poll> & {
    _id: import("mongoose").Types.ObjectId;
}>;
