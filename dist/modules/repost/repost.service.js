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
exports.RepostService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const repost_schema_1 = require("./schema/repost.schema");
const user_service_1 = require("../user/user.service");
const post_service_1 = require("../post/post.service");
const activity_service_1 = require("../activity/activity.service");
const save_post_service_1 = require("../save-post/save-post.service");
let RepostService = class RepostService {
    constructor(repostModel, userService, postService, activityService) {
        this.repostModel = repostModel;
        this.userService = userService;
        this.postService = postService;
        this.activityService = activityService;
    }
    async createRepost({ postId, uid }) {
        const post = await this.postService.findPostById(postId, uid);
        if (post?.user?.friendshipStatus?.isBanned) {
            throw new Error('not allowed');
        }
        if (post) {
            const repost = await this.repostModel.create({ postId, uid });
            await this.postService.incrementRepostCount(postId);
            const activityDto = {
                type: 'repost',
                from: uid,
                to: post.user?.id,
                postCode: post.code,
                relatePostId: post.id,
            };
            await this.activityService.create(activityDto);
            return repost;
        }
        else {
            throw new Error('post  not found');
        }
    }
    async unRepostPost(postId, uid) {
        await this.repostModel.deleteOne({ postId, uid }).exec();
        const post = await this.postService.findPostById(postId, uid);
        if (post) {
            await this.postService.decrementRepostCount(postId);
            await this.activityService.deleteActivity('repost', uid, post.user?.id, post.code);
        }
    }
    async deletePostReposts(postId) {
        await this.repostModel.deleteMany({ postId }).exec();
    }
    async getPostReposts(postId, currentUid, page, pageSize) {
        const skip = pageSize * (page - 1);
        const filter = (0, save_post_service_1.getBannedFilter)(currentUid, { postId });
        const [reposts, total] = await Promise.all([
            await this.repostModel.aggregate([
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
            await this.repostModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        const _reposts = await Promise.all(reposts.map(async (repost) => {
            const user = await this.userService.findUserById(repost.uid, currentUid);
            return { repost, user };
        }));
        return { reposts: _reposts, total: total?.[0]?.total };
    }
    async getRepostsByUid(uid, currentUid, page, pageSize) {
        const skip = pageSize * (page - 1);
        const filter = (0, save_post_service_1.getBannedFilter)(currentUid, { uid });
        const [reposts, total] = await Promise.all([
            await this.repostModel.aggregate([
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
            await this.repostModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        const posts = await Promise.all(reposts.map(async (repost) => {
            const post = await this.postService.findPostById(repost.postId, currentUid);
            const user = await this.userService.findUserById(uid, currentUid);
            post.repostedBy = {
                createdAt: post.createdAt,
                user,
            };
            return post;
        }));
        return { posts, total: total?.[0]?.total };
    }
    async isRepostedByUser(postId, uid) {
        const respost = await this.repostModel.findOne({ postId, uid }).exec();
        return !!respost;
    }
    async getFollowingRepost(followingUid, currentUid) {
        const repost = await this.repostModel.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: 'postId',
                    foreignField: 'id',
                    as: 'post',
                },
            },
            {
                $match: {
                    uid: { $in: followingUid },
                    'post.uid': { $nin: [...followingUid, currentUid] },
                },
            },
        ]);
        return repost;
    }
};
exports.RepostService = RepostService;
exports.RepostService = RepostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(repost_schema_1.Repost.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => activity_service_1.ActivityService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        post_service_1.PostService,
        activity_service_1.ActivityService])
], RepostService);
//# sourceMappingURL=repost.service.js.map