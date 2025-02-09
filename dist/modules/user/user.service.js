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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const user_schema_1 = require("./schema/user.schema");
const auth_service_1 = require("../auth/auth.service");
const user_relation_service_1 = require("../user-relation/user-relation.service");
const activity_service_1 = require("../activity/activity.service");
const post_service_1 = require("../post/post.service");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
const geoip = require('geoip-lite');
let UserService = class UserService {
    constructor(userModel, authService, userRelationService, activityService, postService) {
        this.userModel = userModel;
        this.authService = authService;
        this.userRelationService = userRelationService;
        this.activityService = activityService;
        this.postService = postService;
    }
    async create(user, ip) {
        const existingAccount = await this.authService.isAccountExists(user.account);
        if (existingAccount) {
            throw new common_1.HttpException('Auth already exists', 500);
        }
        user.id = (0, uuid_1.v4)();
        const { password, account, ...userDataWithoutPassword } = user;
        const saveUser = await this.userModel.create(userDataWithoutPassword);
        saveUser.rank = await this.getMaxRank();
        saveUser.location = this.getLocationByIp(ip);
        await saveUser.save();
        await this.authService.generateAuthInfo(saveUser.id, account, password);
        return saveUser;
    }
    async mergeUserInfo(user, currentUid) {
        const { friendshipStatus, commonFollowers: profileContextFacepileUsers } = await this.getFriendShipAndCommonFollowers(user?.id, currentUid);
        return Object.assign(user, {
            friendshipStatus: {
                ...friendshipStatus,
                isBanned: ((user?.isPrivate && !friendshipStatus?.following) ||
                    friendshipStatus.blocking ||
                    friendshipStatus?.blockedBy) &&
                    !friendshipStatus.isOwn,
            },
            profileContextFacepileUsers,
        });
    }
    async findUserById(id, currentUid) {
        const user = await this.userModel.findOne({ id });
        if (!user) {
            return null;
        }
        const _user = await this.mergeUserInfo(user, currentUid);
        return _user;
    }
    async findOneByUsername(username, currentUid) {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            return null;
        }
        if (currentUid && user) {
            const _user = await this.mergeUserInfo(user, currentUid);
            if (_user.friendshipStatus.blockedBy) {
                throw new common_1.NotFoundException('User Error');
            }
            return _user;
        }
        return user;
    }
    async findOneAndUpdate(id, updatedFields) {
        const allowedFields = [
            'bioLink',
            'profilePicUrl',
            'biography',
            'isPrivate',
            'mentionAuth',
        ];
        const update = (0, lodash_1.pick)(updatedFields, allowedFields);
        const updateQuery = { $set: update };
        await this.userModel.findOneAndUpdate({ id }, updateQuery);
    }
    getLocationByIp(ip) {
        try {
            const geo = geoip.lookup(ip);
            const location = `${geo.city ? `${geo.city},` : ''}${geo.country ?? ''}`;
            return location;
        }
        catch (e) {
            return '';
        }
    }
    async updateUserLocationByIp(id, ip) {
        const filterQuery = { id };
        const location = this.getLocationByIp(ip);
        const updateQuery = { $set: { location } };
        await this.userModel.updateOne(filterQuery, updateQuery);
    }
    async getMaxRank() {
        const maxRank = await this.userModel
            .findOne({}, { rank: 1 })
            .sort({ rank: -1 });
        return (maxRank && maxRank.rank + 1) || 1;
    }
    async deleteUserById(id) {
        await this.authService.deleteAuthInfoByUid(id);
        await this.userRelationService.deleteByUid(id);
        await this.activityService.deleteActivitiesByUid(id);
        await this.postService.deletePostsByUid(id);
        await this.userModel.deleteOne({ id });
    }
    async deleteUserByPassword(id, password) {
        const validate = await this.authService.validatePasswordByUid(id, password);
        if (validate) {
            await this.deleteUserById(id);
        }
        else {
            throw new Error('Invalid password');
        }
    }
    getBannedFilter(currentUid, extra, $or = {}) {
        const filter = [
            {
                $lookup: {
                    from: 'userrelations',
                    let: { uid: '$id', currentUid },
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
                    let: { uid: '$id', currentUid },
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
                            ...extra,
                            'userRelation.blocking': { $ne: true },
                            '_userRelation.muting': { $ne: true },
                            '_userRelation.restricting': { $ne: true },
                            '_userRelation.blocking': { $ne: true },
                        },
                        {
                            $or: [
                                {
                                    isPrivate: false,
                                },
                                {
                                    $and: [
                                        { id: { $ne: '$currentUid' } },
                                        { isPrivate: true },
                                        { '_userRelation.following': true },
                                    ],
                                },
                                {
                                    id: currentUid,
                                },
                            ],
                        },
                        {
                            ...$or,
                        },
                    ],
                },
            },
        ];
        return filter;
    }
    async findUsersByQuery(query, page, pageSize, currentUid) {
        if (!query?.trim()?.length) {
            return { total: 0, users: [] };
        }
        const skip = (page - 1) * pageSize;
        const regexQuery = new RegExp(query, 'i');
        const filter = this.getBannedFilter(currentUid, {}, {
            $or: [
                { fullName: { $regex: regexQuery } },
                { username: { $regex: regexQuery } },
            ],
        });
        const total = await this.userModel.aggregate([
            ...filter,
            {
                $count: 'total',
            },
        ]);
        const users = await this.userModel.aggregate([
            ...filter,
            {
                $skip: skip,
            },
            {
                $limit: +pageSize,
            },
        ]);
        const _users = await Promise.all(users.map((user) => this.mergeUserInfo(user, currentUid)));
        return { total: total?.[0]?.total || 0, users: _users };
    }
    async getFriendShipAndCommonFollowers(uid, currentUid) {
        const friendshipStatus = await this.userRelationService.getUserFriendshipStatus(uid, currentUid);
        const { commonFollowers } = await this.userRelationService.getCommonFollowers(uid, currentUid, 1, 2);
        return { friendshipStatus, commonFollowers };
    }
    async getUsersByIds(userIds, currentUid) {
        const users = await this.userModel.find({ id: { $in: userIds } }).exec();
        if (currentUid && users?.length) {
            return await Promise.all(users.map((user) => this.mergeUserInfo(user, currentUid)));
        }
        return users;
    }
    async increaseFollowerCount(id) {
        await this.userModel
            .updateOne({ id }, { $inc: { followerCount: 1 } })
            .exec();
    }
    async decreaseFollowerCount(id) {
        const user = await this.userModel.findOne({ id }).exec();
        if (user && user.followerCount > 0) {
            await this.userModel
                .updateOne({ id }, { $inc: { followerCount: -1 } })
                .exec();
        }
    }
    async increaseFollowingCount(id) {
        await this.userModel
            .updateOne({ id }, { $inc: { followingCount: 1 } })
            .exec();
    }
    async decreaseFollowingCount(id) {
        const user = await this.userModel.findOne({ id }).exec();
        if (user && user.followingCount > 0) {
            await this.userModel
                .updateOne({ id }, { $inc: { followingCount: -1 } })
                .exec();
        }
    }
    async getRecommendedUsers(page, pageSize, currentUid) {
        const skip = (page - 1) * pageSize;
        const filter = this.getBannedFilter(currentUid, {
            isPrivate: false,
            '_userRelation.following': { $ne: true },
            id: { $ne: currentUid },
        });
        const [recommendedUsers, total] = await Promise.all([
            await this.userModel.aggregate([
                ...filter,
                {
                    $skip: skip,
                },
                {
                    $limit: +pageSize,
                },
            ]),
            await this.userModel.aggregate([
                ...filter,
                {
                    $count: 'total',
                },
            ]),
        ]);
        const _users = await Promise.all(recommendedUsers.map((user) => this.mergeUserInfo(user, currentUid)));
        return { total: total?.[0]?.total, users: _users };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_relation_service_1.UserRelationService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => activity_service_1.ActivityService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __metadata("design:paramtypes", [mongoose_1.Model,
        auth_service_1.AuthService,
        user_relation_service_1.UserRelationService,
        activity_service_1.ActivityService,
        post_service_1.PostService])
], UserService);
//# sourceMappingURL=user.service.js.map