"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const quote_schema_1 = require("./schema/quote.schema");
const post_service_1 = require("../post/post.service");
const activity_service_1 = require("../activity/activity.service");
const save_post_service_1 = require("../save-post/save-post.service");
let QuoteService = class QuoteService {
    constructor(quoteModel, postService, activityService) {
        this.quoteModel = quoteModel;
        this.postService = postService;
        this.activityService = activityService;
    }
    async createQuote(createQuoteDto) {
        const newQuote = await this.quoteModel.create(createQuoteDto);
        const post = await this.postService.findPostById(createQuoteDto.postId, createQuoteDto.uid);
        if (post?.user?.friendshipStatus.isBanned) {
            throw new Error('not allowed');
        }
        const quoteToPost = await this.postService.findPostById(createQuoteDto.quoteToPostId, createQuoteDto.uid);
        if (post) {
            const activityDto = {
                type: 'quote',
                from: createQuoteDto.uid,
                to: post.user?.id,
                postCode: post.code,
                relatePostId: quoteToPost.id,
                relatePostCode: quoteToPost.code,
            };
            await this.activityService.create(activityDto);
        }
        return newQuote;
    }
    async deleteQuotes(postId) {
        await this.quoteModel.deleteMany({ postId }).exec();
    }
    async getPostQuotes(postId, currentUid, page, pageSize) {
        const skip = pageSize * (page - 1);
        const filter = (0, save_post_service_1.getBannedFilter)(currentUid, { postId });
        const [quotes, total] = await Promise.all([
            await this.quoteModel.aggregate([
                ...filter,
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: +pageSize,
                },
            ]),
            await this.quoteModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        const _quotes = await Promise.all(quotes.map(async (quote) => {
            const post = await this.postService.findPostById(quote.quoteToPostId, currentUid);
            return { quote, user: post.user, post };
        }));
        return { quotes, total: total?.[0]?.total };
    }
};
exports.QuoteService = QuoteService;
exports.QuoteService = QuoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(quote_schema_1.Quote.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => activity_service_1.ActivityService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        post_service_1.PostService,
        activity_service_1.ActivityService])
], QuoteService);
//# sourceMappingURL=quote.service.js.map