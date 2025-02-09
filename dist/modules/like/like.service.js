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
exports.LikeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const like_schema_1 = require("./schema/like.schema");
const user_service_1 = require("../user/user.service");
const post_service_1 = require("../post/post.service");
const activity_service_1 = require("../activity/activity.service");
const save_post_service_1 = require("../save-post/save-post.service");
let LikeService = class LikeService {
    constructor(likeModel, userService, postService, activityService) {
        this.likeModel = likeModel;
        this.userService = userService;
        this.postService = postService;
        this.activityService = activityService;
    }
    async createLike({ postId, uid }) {
        const post = await this.postService.findPostById(postId, uid);
        if (post?.user?.friendshipStatus?.isBanned) {
            throw new Error('Not allow');
        }
        if (post) {
            const like = await this.likeModel.create({ postId, uid });
            await this.postService.incrementLikeCount(postId);
            const activityDto = {
                type: 'like',
                from: uid,
                to: post.user.id,
                postCode: post.code,
            };
            await this.activityService.create(activityDto);
            return like;
        }
        else {
            throw new Error('post  not found');
        }
    }
    async unlikePost(postId, uid) {
        await this.likeModel.deleteOne({ postId, uid }).exec();
        const post = await this.postService.findPostById(postId, uid);
        if (post) {
            await this.activityService.deleteActivity('like', uid, post.user.id, post.code);
            await this.postService.decrementLikeCount(postId);
        }
    }
    async deletePostLikes(postId) {
        await this.likeModel.deleteMany({ postId }).exec();
    }
    async getPostLikes(postId, currentUid, page, pageSize) {
        const skip = pageSize * (page - 1);
        const filter = (0, save_post_service_1.getBannedFilter)(currentUid, { postId });
        const [likes, total] = await Promise.all([
            await this.likeModel.aggregate([
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
            await this.likeModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        const likesWithUsers = await Promise.all(likes.map(async (like) => {
            const user = await this.userService.findUserById(like.uid, currentUid);
            return { like, user };
        }));
        return { likes: likesWithUsers, total: total?.[0]?.total };
    }
    async getUserLikePosts(currentUid, page, pageSize) {
        const skip = pageSize * (page - 1);
        const filter = (0, save_post_service_1.getBannedFilter)(currentUid, { uid: currentUid });
        const [likes, total] = await Promise.all([
            await this.likeModel.aggregate([
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
            await this.likeModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        const posts = await Promise.all(likes.map(async (like) => {
            const post = await this.postService.findPostById(like.postId, currentUid);
            return post;
        }));
        return { posts, total: total?.[0]?.total };
    }
    async postIsLikedByUser(postId, uid) {
        const like = await this.likeModel.findOne({ postId, uid }).exec();
        return !!like;
    }
};
exports.LikeService = LikeService;
exports.LikeService = LikeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(like_schema_1.Like.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => activity_service_1.ActivityService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        post_service_1.PostService,
        activity_service_1.ActivityService])
], LikeService);
//# sourceMappingURL=like.service.js.map