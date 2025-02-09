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
exports.PollService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const poll_schema_1 = require("./schema/poll.schema");
const uuid_1 = require("uuid");
const vote_service_1 = require("../vote/vote.service");
const user_service_1 = require("../user/user.service");
const schedule_1 = require("@nestjs/schedule");
const post_service_1 = require("../post/post.service");
const activity_service_1 = require("../activity/activity.service");
let PollService = class PollService {
    constructor(pollModel, voteService, userService, postService, activityService) {
        this.pollModel = pollModel;
        this.voteService = voteService;
        this.userService = userService;
        this.postService = postService;
        this.activityService = activityService;
    }
    async create(createPollDto) {
        createPollDto.id = (0, uuid_1.v4)();
        createPollDto?.tallies?.forEach((item) => {
            item.id = (0, uuid_1.v4)();
            item.count = 0;
        });
        createPollDto.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        const poll = await this.pollModel.create(createPollDto);
        return poll;
    }
    async findOne(id, currentUid = '', isBanned = true) {
        const poll = await this.pollModel.findOne({ id });
        if (!poll)
            return null;
        const { uid, tallies, expiresAt } = poll;
        const vote = await this.voteService.findOne(id, currentUid);
        await Promise.all(tallies.map(async (item) => {
            item.count = await this.voteService.getTallyCount(item?.id);
            if (item?.id === vote?.pollItemId) {
                const user = await this.userService.findUserById(vote?.uid, currentUid);
                item.voteUserAvatar = [user?.profilePicUrl];
            }
        }));
        poll.finished = Date.now() >= expiresAt;
        poll.viewerIsOwner = uid === currentUid;
        poll.viewerCanVote = uid !== currentUid && !isBanned;
        poll.viewerVote = !!vote;
        return poll;
    }
    async deleteById(id) {
        await this.pollModel.deleteOne({ id });
        await this.voteService.delteByPollId(id);
    }
    async checkExpiredPolls() {
        const expiredPolls = await this.pollModel.find({
            expiresAt: { $lte: Date.now() },
            finished: false,
        });
        for (const poll of expiredPolls) {
            poll.finished = true;
            await poll.save();
            const post = await this.postService.findPostById(poll.postId);
            const votes = await this.voteService.findByPollId(poll.id);
            for (const vote of votes) {
                const activityDto = {
                    type: 'vote',
                    from: post?.uid,
                    to: vote?.uid,
                    postCode: post.code,
                };
                await this.activityService.create(activityDto);
            }
        }
    }
};
exports.PollService = PollService;
__decorate([
    (0, schedule_1.Interval)(60000 * 10),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PollService.prototype, "checkExpiredPolls", null);
exports.PollService = PollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(poll_schema_1.Poll.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => vote_service_1.VoteService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => activity_service_1.ActivityService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        vote_service_1.VoteService,
        user_service_1.UserService,
        post_service_1.PostService,
        activity_service_1.ActivityService])
], PollService);
//# sourceMappingURL=poll.service.js.map