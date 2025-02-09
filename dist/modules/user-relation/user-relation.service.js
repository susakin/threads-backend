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
exports.UserRelationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_relation_schema_1 = require("./schema/user-relation.schema");
const user_service_1 = require("../user/user.service");
const activity_service_1 = require("../activity/activity.service");
let UserRelationService = class UserRelationService {
    constructor(userRelationModel, userService, activityService) {
        this.userRelationModel = userRelationModel;
        this.userService = userService;
        this.activityService = activityService;
    }
    async followRequest(uid, targetUid) {
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (existingRelation?.outgoingRequest)
            return;
        if (existingRelation) {
            if (!existingRelation.outgoingRequest) {
                existingRelation.outgoingRequest = true;
                await existingRelation.save();
            }
        }
        else {
            await this.userRelationModel.create({
                uid,
                targetUid,
                outgoingRequest: true,
            });
        }
        await this.activityService.create({
            from: uid,
            to: targetUid,
            type: 'followRequest',
        });
    }
    async unFollowPrivateUser(uid, targetUid) {
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (existingRelation) {
            existingRelation.outgoingRequest = false;
            await this.activityService.deleteActivity('followRequest', uid, targetUid);
            await existingRelation.save();
        }
    }
    async followPrivateUser(uid, targetUid) {
        if (uid === targetUid) {
            throw new Error('not allowed');
        }
        const targetUser = await this.userService.findUserById(targetUid);
        if (!targetUser.isPrivate)
            return;
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (!existingRelation?.outgoingRequest) {
            throw new Error('is not outgoingRequest');
        }
        existingRelation.outgoingRequest = false;
        existingRelation.following = true;
        await existingRelation.save();
        await this.activityService.deleteActivity('followRequest', uid, targetUid);
        await this.followSuccess(uid, targetUid);
    }
    async followUser(uid, targetUid) {
        if (uid === targetUid) {
            throw new Error('not allowed');
        }
        const targetUser = await this.userService.findUserById(targetUid, uid);
        if (targetUser?.friendshipStatus.blockedBy) {
            throw new Error('not allowed');
        }
        if (targetUser.isPrivate)
            return await this.followRequest(uid, targetUid);
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (existingRelation?.following) {
            throw new Error('is following');
        }
        if (existingRelation) {
            if (!existingRelation.following) {
                existingRelation.following = true;
                await existingRelation.save();
            }
        }
        else {
            await this.userRelationModel.create({
                uid,
                targetUid,
                following: true,
            });
        }
        await this.followSuccess(uid, targetUid);
    }
    async followSuccess(uid, targetUid) {
        await this.userService.increaseFollowerCount(targetUid);
        await this.userService.increaseFollowingCount(uid);
        await this.activityService.create({
            from: uid,
            to: targetUid,
            type: 'follow',
        });
    }
    async unfollowUser(uid, targetUid) {
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (existingRelation?.outgoingRequest)
            return await this.unFollowPrivateUser(uid, targetUid);
        if (existingRelation) {
            existingRelation.following = false;
            await this.activityService.deleteActivity('follow', uid, targetUid);
            await this.userService.decreaseFollowerCount(targetUid);
            await this.userService.decreaseFollowingCount(uid);
            await existingRelation.save();
        }
    }
    async buildRelation(uid, targetUid, type) {
        const types = ['blocking', 'restricting', 'muting'];
        if (!types.includes(type) || uid === targetUid) {
            throw new Error('not allowed');
        }
        if (type === 'blocking') {
            this.unFollowPrivateUser(uid, targetUid);
            this.unFollowPrivateUser(targetUid, uid);
            this.unfollowUser(uid, targetUid);
            this.unfollowUser(targetUid, uid);
        }
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (existingRelation) {
            existingRelation[type] = true;
            await existingRelation.save();
        }
        else {
            const newRelation = await this.userRelationModel.create({
                uid,
                targetUid,
                [type]: true,
            });
            await newRelation.save();
        }
    }
    async dissolveRelation(uid, targetUid, type) {
        const types = ['blocking', 'restricting', 'muting'];
        if (!types.includes(type) || uid === targetUid) {
            throw new Error('not allowed');
        }
        const existingRelation = await this.userRelationModel
            .findOne({ uid, targetUid })
            .exec();
        if (existingRelation) {
            existingRelation[type] = false;
            await existingRelation.save();
        }
    }
    async getFollowingList(uid, currentUid, page, pageSize) {
        const user = await this.userService.findUserById(uid, currentUid);
        if (user?.friendshipStatus?.isBanned) {
            throw new Error('Not allow');
        }
        const options = {
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort: { followAt: -1 },
        };
        const [followingUserIds, total] = await Promise.all([
            this.getFollowingUids(uid, options),
            this.userRelationModel.countDocuments({ uid, following: true }),
        ]);
        const users = await this.userService.getUsersByIds(followingUserIds, currentUid);
        return { users, total };
    }
    async getFollowerList(uid, currentUid, page, pageSize) {
        const user = await this.userService.findUserById(uid, currentUid);
        if (user.isPrivate &&
            !user.friendshipStatus.following &&
            !user.friendshipStatus.isOwn) {
            throw new Error('Not allow');
        }
        const options = {
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort: { followAt: -1 },
        };
        const [followerUserIds, total] = await Promise.all([
            this.getFollowerUids(uid, options),
            this.userRelationModel.countDocuments({
                targetUid: uid,
                following: true,
            }),
        ]);
        const users = await this.userService.getUsersByIds(followerUserIds, currentUid);
        return { users, total };
    }
    async getFollowingUids(uid, options) {
        const followingRelations = await this.userRelationModel
            .find({ uid, following: true })
            .skip(options.skip)
            .limit(options.limit)
            .exec();
        return followingRelations.map((relation) => relation.targetUid);
    }
    async getFollowerUids(uid, options) {
        const followerRelations = await this.userRelationModel
            .find({ targetUid: uid, following: true })
            .skip(options.skip)
            .limit(options.limit)
            .exec();
        return followerRelations.map((relation) => relation.uid);
    }
    async getUserRelation(uid, targetUid) {
        return this.userRelationModel.findOne({ uid, targetUid }).exec();
    }
    async getCommonFollowers(uid, otherUid, page, pageSize) {
        const userFollowingIds = await this.getFollowerUids(uid, {
            skip: 0,
            limit: 10000,
        });
        const otherUserFollowingIds = await this.getFollowerUids(otherUid, {
            skip: 0,
            limit: 10000,
        });
        const commonFollowingIds = userFollowingIds.filter((id) => otherUserFollowingIds.includes(id));
        const total = commonFollowingIds.length;
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginatedCommonFollowingIds = commonFollowingIds.slice(startIdx, endIdx);
        const commonFollowers = await this.userService.getUsersByIds(paginatedCommonFollowingIds);
        return { commonFollowers, total };
    }
    async getUserFriendshipStatus(uid, currentUid) {
        const userRelation = await this.getUserRelation(currentUid, uid);
        const _userRelation = await this.getUserRelation(uid, currentUid);
        return {
            following: !!userRelation?.following,
            followedBy: !!_userRelation?.following,
            blocking: !!userRelation?.blocking,
            blockedBy: !!_userRelation?.blocking,
            muting: !!userRelation?.muting,
            mutedBy: !!_userRelation?.muting,
            restricting: !!userRelation?.restricting,
            restrictedBy: !!_userRelation?.restricting,
            outgoingRequest: !!userRelation?.outgoingRequest,
            isOwn: uid === currentUid && !!uid,
            outgoingRequestedBy: !!_userRelation?.outgoingRequest,
        };
    }
    async deleteByUid(uid) {
        const relatetions = await this.userRelationModel.find({ uid });
        for (let relation of relatetions) {
            if (relation.following) {
                this.userService.decreaseFollowerCount(relation.targetUid);
            }
        }
        const _relatetions = await this.userRelationModel.find({
            targetUid: uid,
        });
        for (let relation of _relatetions) {
            if (relation.following) {
                this.userService.decreaseFollowingCount(relation.uid);
            }
        }
        await this.userRelationModel.deleteMany({ uid });
        await this.userRelationModel.deleteMany({ targetUid: uid });
    }
};
exports.UserRelationService = UserRelationService;
exports.UserRelationService = UserRelationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_relation_schema_1.UserRelation.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        activity_service_1.ActivityService])
], UserRelationService);
//# sourceMappingURL=user-relation.service.js.map