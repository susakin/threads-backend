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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const activity_schema_1 = require("./schema/activity.schema");
const uuid_1 = require("uuid");
const user_service_1 = require("../user/user.service");
const post_service_1 = require("../post/post.service");
let ActivityService = class ActivityService {
    constructor(activityModel, userService, postService) {
        this.activityModel = activityModel;
        this.userService = userService;
        this.postService = postService;
    }
    async create(createActivityDto) {
        const activity = await this.activityModel.findOne(createActivityDto);
        if (activity)
            return;
        createActivityDto.id = (0, uuid_1.v4)();
        const createdActivity = await this.activityModel.create(createActivityDto);
        return createdActivity;
    }
    async getNewActivitiesAfterId(to, id, type, pageSize) {
        const activity = await this.activityModel.findOne({ id });
        if (!activity && id) {
            throw new Error('activity is not found');
        }
        const filter = this.getBannedFilter(to, {
            to,
            ...(activity?.createdAt
                ? { createdAt: { $gt: activity?.createdAt } }
                : {}),
            ...(type
                ? type === 'verified'
                    ? { '_user.isVerified': true }
                    : { type }
                : {}),
            from: { $ne: to },
        });
        const activities = await this.activityModel.aggregate([
            ...filter,
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: +pageSize,
            },
        ]);
        const _activities = await this.mergeActivitiesInfo(activities, to, true);
        return { activities: _activities };
    }
    async mergeActivitiesInfo(activities, currentUid, isOwn = true) {
        for (let activity of activities) {
            const fromUser = await this.userService.findUserById(activity.from, currentUid);
            const post = await this.postService.findPostByCode(activity.postCode, currentUid);
            const relatePost = await this.postService.findPostById(activity.relatePostId, currentUid);
            const type = activity.type;
            let summary = { content: '', context: '' };
            switch (type) {
                case 'mention':
                    summary = {
                        content: '提及了你',
                        context: relatePost?.caption,
                    };
                    break;
                case 'reply':
                    summary = this.getActivityContentAndContext({
                        type: type,
                        isOwn,
                        post,
                        relatePost,
                    });
                    break;
                case 'firstPost':
                    summary = {
                        context: '发布了首条串文',
                        content: post?.caption,
                    };
                    break;
                case 'vote':
                    summary = {
                        context: '投票有结果啦',
                        content: post?.caption,
                    };
                    break;
                case 'repost':
                    {
                        if (isOwn) {
                            summary = this.getActivityContentAndContext({
                                type: 'repost',
                                relatePost,
                                isOwn,
                            });
                        }
                    }
                    break;
                case 'quote':
                    summary = this.getActivityContentAndContext({
                        type: 'quote',
                        post,
                        relatePost,
                        isOwn,
                    });
                    break;
                case 'follow':
                    summary = {
                        context: '关注了你',
                        content: '',
                    };
                    break;
                case 'like':
                    {
                        if (isOwn) {
                            summary = this.getActivityContentAndContext({
                                type: 'like',
                                relatePost,
                                isOwn,
                            });
                        }
                    }
                    break;
                case 'followRequest':
                    summary = {
                        context: '关注请求',
                        content: '',
                    };
            }
            activity.content = summary.content;
            activity.context = summary.context;
            activity.fromUser = fromUser;
        }
        return activities;
    }
    async findByTo(to, type, page, pageSize) {
        const skip = pageSize * (page - 1);
        const query = {
            to,
            from: { $ne: to },
            ...(type
                ? type === 'verified'
                    ? { '_user.isVerified': true }
                    : { type }
                : {}),
        };
        const filter = this.getBannedFilter(to, query);
        const activities = await this.activityModel.aggregate([
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
        ]);
        const _activities = await this.mergeActivitiesInfo(activities, to, true);
        const total = await this.activityModel.aggregate([
            ...filter,
            {
                $count: 'total',
            },
        ]);
        return { activities: _activities, total: total?.[0]?.total || 0 };
    }
    getBannedFilter(currentUid, extra) {
        const filter = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'from',
                    foreignField: 'id',
                    as: '_user',
                },
            },
            {
                $lookup: {
                    from: 'userrelations',
                    let: { uid: currentUid, targetUid: '$from' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$targetUid', '$$targetUid'] },
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
                    let: { uid: currentUid, targetUid: '$from' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$targetUid', '$$uid'] },
                                        { $eq: ['$uid', '$$targetUid'] },
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
                            'userRelation.restricting': { $ne: true },
                            '_userRelation.blocking': { $ne: true },
                            ...extra,
                        },
                        {
                            $or: [
                                {
                                    '_user.isPrivate': false,
                                },
                                {
                                    '_user.isPrivate': true,
                                    '_userRelation.following': true,
                                },
                                {
                                    from: currentUid,
                                },
                            ],
                        },
                    ],
                },
            },
        ];
        return filter;
    }
    getMediaType(medias) {
        const mediaTypeMap = {
            video: '视频',
            image: '图片',
        };
        const mediaType = medias?.length > 1 ? '轮播' : mediaTypeMap[medias?.[0]?.type];
        return mediaType;
    }
    getContent(type, mediaType, isOwn) {
        const own = isOwn ? '你的' : '';
        if (!mediaType)
            return '';
        switch (type) {
            case 'reply':
                return `用 ${mediaType} 回复了`;
            case 'quote':
                return `引用了${own} ${mediaType}`;
            case 'repost':
                return `转发了${own} ${mediaType}`;
            case 'like':
                return `赞了${own} ${mediaType}`;
            default:
                return '';
        }
    }
    getActivityContentAndContext({ type, post, relatePost, isOwn, }) {
        const { medias, caption } = post || {};
        const { medias: relateMedias, caption: relateCaption } = relatePost || {};
        const primaryMediaType = this.getMediaType(medias);
        const secondaryMediaType = this.getMediaType(relateMedias);
        if (caption && relateCaption) {
            return {
                context: caption,
                content: relateCaption,
            };
        }
        const firstContent = this.getContent(type, primaryMediaType || '帖子', isOwn);
        const secondaryContent = this.getContent(type, secondaryMediaType || '帖子', isOwn);
        let context, content;
        switch (type) {
            case 'reply':
                content = caption || firstContent;
                context = relateCaption || secondaryContent;
                break;
            case 'quote':
                content = relateCaption || secondaryContent;
                context = caption || firstContent;
                break;
            case 'repost':
                context = relateCaption || secondaryContent;
                break;
            case 'like':
                context = caption || secondaryContent;
        }
        return { content, context };
    }
    async findByPostCode(postCode, currentUid, type, page, pageSize) {
        const post = await this.postService.findPostByCode(postCode, currentUid);
        if ((post.likeAndViewCountDisabled && !post.user?.friendshipStatus?.isOwn) ||
            post?.user?.friendshipStatus?.isBanned) {
            throw new Error('not allowed');
        }
        const skips = pageSize * (page - 1);
        const query = { postCode };
        if (type) {
            query['type'] = type;
        }
        const activities = await this.activityModel
            .find(query)
            .skip(skips)
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .exec();
        const _activities = await this.mergeActivitiesInfo(activities, currentUid, false);
        const total = await this.activityModel.countDocuments(query);
        return { activities: _activities, total };
    }
    async delete(id) {
        this.activityModel.findByIdAndDelete(id).exec();
    }
    async deleteActivity(type, from, to, postCode) {
        await this.activityModel.deleteOne({ type, from, to, postCode }).exec();
    }
    async findById(id) {
        return this.activityModel.findOne({ id }).exec();
    }
    async deleteActivitiesByPostCode(postCode) {
        await this.activityModel.deleteMany({ postCode }).exec();
    }
    async deleteActivitiesByUid(uid) {
        await this.activityModel
            .deleteMany({ $or: [{ from: uid }, { to: uid }] })
            .exec();
    }
    async getPostSummary(currentUid, postCode, activityCount) {
        const post = await this.postService.findPostByCode(postCode, currentUid);
        const defaultFilter = {
            postCode,
            type: { $in: ['like', 'repost', 'quote'] },
        };
        const filter = this.getBannedFilter(currentUid, defaultFilter);
        const recentActivities = await this.activityModel.aggregate([
            ...filter,
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: activityCount,
            },
        ]);
        const _recentActivities = await this.mergeActivitiesInfo(recentActivities, currentUid, false);
        if (!post.likeAndViewCountDisabled &&
            !post?.user.friendshipStatus?.isBanned &&
            currentUid) {
            const likeCount = await this.activityModel.aggregate([
                ...this.getBannedFilter(currentUid, { postCode, type: 'like' }),
                {
                    $count: 'total',
                },
            ]);
            const repostCount = await this.activityModel.aggregate([
                ...this.getBannedFilter(currentUid, { postCode, type: 'repost' }),
                {
                    $count: 'total',
                },
            ]);
            const quoteCount = await this.activityModel.aggregate([
                ...this.getBannedFilter(currentUid, { postCode, type: 'quote' }),
                {
                    $count: 'total',
                },
            ]);
            return {
                likeCount: likeCount?.[0]?.total,
                repostCount: repostCount?.[0]?.total,
                quoteCount: quoteCount?.[0]?.total,
                viewCount: post?.viewCount,
                recentActivities: _recentActivities,
            };
        }
        return {
            recentActivities: _recentActivities,
        };
    }
    async markActivitiesAsRead(to, ids) {
        const result = await this.activityModel
            .updateMany({ to, id: { $in: ids } }, { $set: { isReaded: true } })
            .exec();
        return result.modifiedCount;
    }
    async getUnreadActivityNum(to) {
        const filter = this.getBannedFilter(to, {
            to,
            isReaded: false,
            from: { $ne: to },
        });
        const total = await this.activityModel.aggregate([
            ...filter,
            {
                $count: 'total',
            },
        ]);
        return total?.[0]?.total;
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(activity_schema_1.Activity.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __metadata("design:paramtypes", [mongoose_1.Model,
        user_service_1.UserService,
        post_service_1.PostService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map