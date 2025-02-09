import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserRelation,
  UserRelationDocument,
} from './schema/user-relation.schema';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/schema/user.schema';
import { ActivityService } from 'src/modules/activity/activity.service';

@Injectable()
export class UserRelationService {
  constructor(
    @InjectModel(UserRelation.name)
    private userRelationModel: Model<UserRelationDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService, // 假设存在 UserService 来处理用户相关操作
    private activityService: ActivityService, // 添加 ActivityService 依赖
  ) {}

  async followRequest(uid: string, targetUid: string): Promise<void> {
    const existingRelation = await this.userRelationModel
      .findOne({ uid, targetUid })
      .exec();

    if (existingRelation?.outgoingRequest) return;
    if (existingRelation) {
      if (!existingRelation.outgoingRequest) {
        existingRelation.outgoingRequest = true;
        await existingRelation.save();
      }
    } else {
      await this.userRelationModel.create({
        uid,
        targetUid,
        outgoingRequest: true,
      });
    }

    // 新增关注动态
    await this.activityService.create({
      from: uid, // 关注者的ID
      to: targetUid, // 被关注者的ID
      type: 'followRequest', // 类型为关注
    });
  }

  async unFollowPrivateUser(uid: string, targetUid: string): Promise<void> {
    const existingRelation = await this.userRelationModel
      .findOne({ uid, targetUid })
      .exec();

    if (existingRelation) {
      existingRelation.outgoingRequest = false;
      await this.activityService.deleteActivity(
        'followRequest',
        uid,
        targetUid,
      );
      await existingRelation.save();
    }
  }

  async followPrivateUser(uid: string, targetUid: string): Promise<void> {
    if (uid === targetUid) {
      throw new Error('not allowed');
    }
    const targetUser = await this.userService.findUserById(targetUid);
    if (!targetUser.isPrivate) return;

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

  async followUser(uid: string, targetUid: string): Promise<void> {
    if (uid === targetUid) {
      throw new Error('not allowed');
    }
    const targetUser = await this.userService.findUserById(targetUid, uid);
    if (targetUser?.friendshipStatus.blockedBy) {
      throw new Error('not allowed');
    }
    if (targetUser.isPrivate) return await this.followRequest(uid, targetUid);
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
    } else {
      await this.userRelationModel.create({
        uid,
        targetUid,
        following: true,
      });
    }
    await this.followSuccess(uid, targetUid);
  }

  private async followSuccess(uid: string, targetUid: string) {
    // 更新被关注用户的 followerCount
    await this.userService.increaseFollowerCount(targetUid);
    await this.userService.increaseFollowingCount(uid);
    // 新增关注动态
    await this.activityService.create({
      from: uid, // 关注者的ID
      to: targetUid, // 被关注者的ID
      type: 'follow', // 类型为关注
    });
  }

  async unfollowUser(uid: string, targetUid: string): Promise<void> {
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

  async buildRelation(
    uid: string,
    targetUid: string,
    type: 'blocking' | 'restricting' | 'muting',
  ) {
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
    } else {
      const newRelation = await this.userRelationModel.create({
        uid,
        targetUid,
        [type]: true,
      });
      await newRelation.save();
    }
  }

  async dissolveRelation(
    uid: string,
    targetUid: string,
    type: 'blocking' | 'restricting' | 'muting',
  ) {
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

  async getFollowingList(
    uid: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ users: User[]; total: number }> {
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
    const users = await this.userService.getUsersByIds(
      followingUserIds,
      currentUid,
    );
    return { users, total };
  }

  async getFollowerList(
    uid: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ users: User[]; total: number }> {
    const user = await this.userService.findUserById(uid, currentUid);
    if (
      user.isPrivate &&
      !user.friendshipStatus.following &&
      !user.friendshipStatus.isOwn
    ) {
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
    const users = await this.userService.getUsersByIds(
      followerUserIds,
      currentUid,
    );
    return { users, total };
  }

  async getFollowingUids(
    uid: string,
    options: { skip: number; limit: number },
  ): Promise<string[]> {
    const followingRelations = await this.userRelationModel
      .find({ uid, following: true })
      .skip(options.skip)
      .limit(options.limit)
      .exec();
    return followingRelations.map((relation) => relation.targetUid);
  }

  async getFollowerUids(
    uid: string,
    options: { skip: number; limit: number },
  ): Promise<string[]> {
    const followerRelations = await this.userRelationModel
      .find({ targetUid: uid, following: true })
      .skip(options.skip)
      .limit(options.limit)
      .exec();
    return followerRelations.map((relation) => relation.uid);
  }

  async getUserRelation(
    uid: string,
    targetUid: string,
  ): Promise<UserRelationDocument> {
    return this.userRelationModel.findOne({ uid, targetUid }).exec();
  }

  async getCommonFollowers(
    uid: string,
    otherUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ commonFollowers: User[]; total: number }> {
    const userFollowingIds = await this.getFollowerUids(uid, {
      skip: 0,
      limit: 10000,
    });
    const otherUserFollowingIds = await this.getFollowerUids(otherUid, {
      skip: 0,
      limit: 10000,
    });

    const commonFollowingIds = userFollowingIds.filter((id) =>
      otherUserFollowingIds.includes(id),
    );

    const total = commonFollowingIds.length;

    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;

    const paginatedCommonFollowingIds = commonFollowingIds.slice(
      startIdx,
      endIdx,
    );

    const commonFollowers = await this.userService.getUsersByIds(
      paginatedCommonFollowingIds,
    );
    return { commonFollowers, total };
  }

  async getUserFriendshipStatus(uid, currentUid: string): Promise<any> {
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

  async deleteByUid(uid: string): Promise<any> {
    const relatetions: any[] = await this.userRelationModel.find({ uid });
    for (let relation of relatetions) {
      if (relation.following) {
        this.userService.decreaseFollowerCount(relation.targetUid);
      }
    }

    const _relatetions: any[] = await this.userRelationModel.find({
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
}
