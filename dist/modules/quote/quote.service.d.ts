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
import { Quote, QuoteDocument } from './schema/quote.schema';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { PostService } from 'src/modules/post/post.service';
import { ActivityService } from 'src/modules/activity/activity.service';
export declare class QuoteService {
    private quoteModel;
    private readonly postService;
    private readonly activityService;
    constructor(quoteModel: Model<QuoteDocument>, postService: PostService, activityService: ActivityService);
    createQuote(createQuoteDto: CreateQuoteDto): Promise<Quote>;
    deleteQuotes(postId: string): Promise<void>;
    getPostQuotes(postId: string, currentUid: string, page: number, pageSize: number): Promise<{
        quotes: any[];
        total: number;
    }>;
}
