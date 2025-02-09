import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { Request as _Request } from 'express';
export declare class QuoteController {
    private readonly quoteService;
    constructor(quoteService: QuoteService);
    createQuote(createQuoteDto: CreateQuoteDto, request: any): Promise<import("./schema/quote.schema").Quote>;
    getPostQuotes(postId: string, page: number, pageSize: number, req: _Request): Promise<{
        quotes: any[];
        total: number;
    }>;
}
