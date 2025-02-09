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
exports.VoteService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const vote_schema_1 = require("./schema/vote.schema");
const mongoose_2 = require("@nestjs/mongoose");
const poll_service_1 = require("../poll/poll.service");
const post_service_1 = require("../post/post.service");
let VoteService = class VoteService {
    constructor(voteModel, pollService, postService) {
        this.voteModel = voteModel;
        this.pollService = pollService;
        this.postService = postService;
    }
    async create(createVoteDto) {
        const poll = await this.pollService.findOne(createVoteDto.pollId);
        const post = await this.postService.findPostById(poll.postId, createVoteDto.uid);
        const { allowedMentionUsers } = await this.postService.getMentionUserAndCaption(post?.caption, createVoteDto.uid);
        const isBanned = await this.postService.isPostBanned(post, createVoteDto.uid, allowedMentionUsers);
        const _vote = await this.voteModel.findOne({
            uid: createVoteDto.uid,
            pollId: createVoteDto.pollId,
        });
        if (!poll ||
            !poll.tallies?.find((item) => item.id === createVoteDto.pollItemId) ||
            _vote ||
            isBanned) {
            throw new Error('not allowed');
        }
        const vote = this.voteModel.create(createVoteDto);
        return vote;
    }
    async getTallyCount(pollItemId) {
        const tallyCount = await this.voteModel.countDocuments({ pollItemId });
        return tallyCount;
    }
    async delteByPollId(pollId) {
        this.voteModel.deleteMany({ pollId });
    }
    async findOne(pollId, uid) {
        const vote = await this.voteModel.findOne({ pollId, uid }).exec();
        return vote;
    }
    async findByPollId(pollId) {
        const votes = await this.voteModel.find({ pollId });
        return votes;
    }
};
exports.VoteService = VoteService;
exports.VoteService = VoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(vote_schema_1.Vote.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => poll_service_1.PollService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __metadata("design:paramtypes", [mongoose_1.Model,
        poll_service_1.PollService,
        post_service_1.PostService])
], VoteService);
//# sourceMappingURL=vote.service.js.map