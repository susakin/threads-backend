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
exports.SavePostService = exports.getBannedFilter = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const like_schema_1 = require("./schema/like.schema");
const mongoose_2 = require("mongoose");
const post_service_1 = require("../post/post.service");
const user_service_1 = require("../user/user.service");
function getBannedFilter(currentUid, extra = {}) {
    return [
        {
            $lookup: {
                from: 'users',
                localField: 'uid',
                foreignField: 'id',
                as: '_user',
            },
        },
        {
            $lookup: {
                from: 'posts',
                localField: 'postId',
                foreignField: 'id',
                as: 'post',
            },
        },
        {
            $unwind: '$post',
        },
        {
            $lookup: {
                from: 'userrelations',
                let: { uid: '$post.uid', currentUid },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$targetUid', '$$currentUid'] },
                                    { $eq: ['$uid', '$$uid'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'userRelation',
            },
        },
        {
            $lookup: {
                from: 'userrelations',
                let: { uid: '$post.uid', currentUid },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$targetUid', '$$uid'] },
                                    { $eq: ['$uid', '$$currentUid'] },
                                ],
                            },
                        },
                    },
                ],
                as: '_userRelation',
            },
        },
        {
            $match: {
                $and: [
                    {
                        'userRelation.blocking': { $ne: true },
                        '_userRelation.blocking': { $ne: true },
                        ...extra,
                    },
                    {
                        $or: [
                            {
                                '_user.isPrivate': false,
                            },
                            {
                                $and: [
                                    { uid: { $ne: '$currentUid' } },
                                    { '_user.isPrivate': true },
                                    { '_userRelation.following': true },
                                ],
                            },
                            {
                                uid: currentUid,
                            },
                        ],
                    },
                ],
            },
        },
    ];
}
exports.getBannedFilter = getBannedFilter;
let SavePostService = class SavePostService {
    constructor(savePostModel, userService, postService) {
        this.savePostModel = savePostModel;
        this.userService = userService;
        this.postService = postService;
    }
    async create({ postId, uid }) {
        const post = await this.postService.findPostById(postId, uid);
        if (post?.user?.friendshipStatus?.isBanned) {
            throw new Error('Not allow');
        }
        if (post) {
            const savePost = await this.savePostModel.create({ postId, uid });
            return savePost;
        }
        else {
            throw new Error('post  not found');
        }
    }
    async unsavePost(postId, uid) {
        await this.savePostModel.deleteOne({ postId, uid }).exec();
    }
    async getUserSavedPosts(currentUid, page, pageSize) {
        const skip = pageSize * (page - 1);
        const filter = getBannedFilter(currentUid, { uid: currentUid });
        const [save, total] = await Promise.all([
            await this.savePostModel.aggregate([
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
            await this.savePostModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        console.log(save, 'save');
        const posts = await Promise.all(save.map(async (like) => {
            const post = await this.postService.findPostById(like.postId, currentUid);
            return post;
        }));
        return { posts, total: total?.[0]?.total };
    }
    async postIsSavedByUser(postId, uid) {
        const like = await this.savePostModel.findOne({ postId, uid }).exec();
        return !!like;
    }
};
exports.SavePostService = SavePostService;
exports.SavePostService = SavePostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(like_schema_1.SavePost.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        post_service_1.PostService])
], SavePostService);
//# sourceMappingURL=save-post.service.js.map