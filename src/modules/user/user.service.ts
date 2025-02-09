import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserRelationService } from 'src/modules/user-relation/user-relation.service';
import { ActivityService } from '../activity/activity.service';
import { PostService } from '../post/post.service';
import { v4 as uuidv4 } from 'uuid';
import { pick } from 'lodash';
const geoip = require('geoip-lite');

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserRelationService))
    private userRelationService: UserRelationService,
    @Inject(forwardRef(() => ActivityService))
    private activityService: ActivityService,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
  ) {}

  async create(user: CreateUserDto, ip): Promise<UserDocument> {
    const existingAccount = await this.authService.isAccountExists(
      user.account,
    );

    if (existingAccount) {
      throw new HttpException('Auth already exists', 500);
    }

    user.id = uuidv4();
    const { password, account, ...userDataWithoutPassword } = user;
    const saveUser = await this.userModel.create(userDataWithoutPassword);
    saveUser.rank = await this.getMaxRank();
    saveUser.location = this.getLocationByIp(ip);
    await saveUser.save();
    await this.authService.generateAuthInfo(saveUser.id, account, password);
    return saveUser;
  }
  private async mergeUserInfo(user: User, currentUid: string) {
    const { friendshipStatus, commonFollowers: profileContextFacepileUsers } =
      await this.getFriendShipAndCommonFollowers(user?.id, currentUid);

    return Object.assign(user, {
      friendshipStatus: {
        ...friendshipStatus,
        isBanned:
          ((user?.isPrivate && !friendshipStatus?.following) ||
            friendshipStatus.blocking ||
            friendshipStatus?.blockedBy) &&
          !friendshipStatus.isOwn,
      },
      profileContextFacepileUsers,
    });
  }
  async findUserById(id: string, currentUid?: string): Promise<User> {
    const user = await this.userModel.findOne({ id });
    if (!user) {
      return null;
    }
    const _user = await this.mergeUserInfo(user, currentUid);
    return _user;
  }

  async findOneByUsername(
    username: string,
    currentUid?: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      return null;
    }
    if (currentUid && user) {
      const _user = await this.mergeUserInfo(user, currentUid);
      if (_user.friendshipStatus.blockedBy) {
        throw new NotFoundException('User Error');
      }
      return _user;
    }
    return user;
  }

  async findOneAndUpdate(
    id: string,
    updatedFields: Partial<User>,
  ): Promise<void> {
    const allowedFields = [
      'bioLink',
      'profilePicUrl',
      'biography',
      'isPrivate',
      'mentionAuth',
    ];
    const update = pick(updatedFields, allowedFields) as Partial<User>;
    const updateQuery: UpdateQuery<User> = { $set: update };
    await this.userModel.findOneAndUpdate({ id }, updateQuery);
  }

  private getLocationByIp(ip) {
    try {
      const geo = geoip.lookup(ip);
      const location = `${geo.city ? `${geo.city},` : ''}${geo.country ?? ''}`;
      return location;
    } catch (e) {
      return '';
    }
  }

  async updateUserLocationByIp(id: string, ip: string): Promise<void> {
    const filterQuery: FilterQuery<User> = { id };
    const location = this.getLocationByIp(ip);
    const updateQuery: UpdateQuery<User> = { $set: { location } };

    await this.userModel.updateOne(filterQuery, updateQuery);
  }

  private async getMaxRank(): Promise<number> {
    const maxRank = await this.userModel
      .findOne({}, { rank: 1 })
      .sort({ rank: -1 });
    return (maxRank && maxRank.rank + 1) || 1;
  }

  async deleteUserById(id: string): Promise<void> {
    await this.authService.deleteAuthInfoByUid(id);
    await this.userRelationService.deleteByUid(id);
    await this.activityService.deleteActivitiesByUid(id);
    await this.postService.deletePostsByUid(id);
    await this.userModel.deleteOne({ id });
  }

  async deleteUserByPassword(id: string, password: string): Promise<void> {
    const validate = await this.authService.validatePasswordByUid(id, password);
    if (validate) {
      await this.deleteUserById(id);
    } else {
      throw new Error('Invalid password');
    }
  }

  private getBannedFilter(currentUid, extra, $or = {}) {
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
                    { $eq: ['$targetUid', '$$currentUid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                    { $eq: ['$uid', '$$uid'] }, // 匹配当前用户ID
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
                    { $eq: ['$targetUid', '$$uid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                    { $eq: ['$uid', '$$currentUid'] }, // 匹配当前用户ID
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

  async findUsersByQuery(
    query: string,
    page: number,
    pageSize: number,
    currentUid?: string,
  ): Promise<{ total: number; users: User[] }> {
    if (!query?.trim()?.length) {
      return { total: 0, users: [] }; // 如果query为空，则直接返回空
    }
    const skip = (page - 1) * pageSize;
    const regexQuery = new RegExp(query, 'i');
    const filter = this.getBannedFilter(
      currentUid,
      {},
      {
        $or: [
          { fullName: { $regex: regexQuery } },
          { username: { $regex: regexQuery } },
        ],
      },
    );

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
    const _users = await Promise.all(
      users.map((user) => this.mergeUserInfo(user, currentUid)),
    );
    return { total: total?.[0]?.total || 0, users: _users };
  }

  private async getFriendShipAndCommonFollowers(uid, currentUid) {
    const friendshipStatus =
      await this.userRelationService.getUserFriendshipStatus(uid, currentUid);

    const { commonFollowers } =
      await this.userRelationService.getCommonFollowers(uid, currentUid, 1, 2);

    return { friendshipStatus, commonFollowers };
  }

  async getUsersByIds(userIds: string[], currentUid?: string): Promise<User[]> {
    const users = await this.userModel.find({ id: { $in: userIds } }).exec();
    if (currentUid && users?.length) {
      return await Promise.all(
        users.map((user) => this.mergeUserInfo(user, currentUid)),
      );
    }
    return users;
  }

  async increaseFollowerCount(id: string): Promise<void> {
    await this.userModel
      .updateOne({ id }, { $inc: { followerCount: 1 } })
      .exec();
  }

  async decreaseFollowerCount(id: string): Promise<void> {
    const user = await this.userModel.findOne({ id }).exec();
    if (user && user.followerCount > 0) {
      await this.userModel
        .updateOne({ id }, { $inc: { followerCount: -1 } })
        .exec();
    }
  }

  async increaseFollowingCount(id: string): Promise<void> {
    await this.userModel
      .updateOne({ id }, { $inc: { followingCount: 1 } })
      .exec();
  }

  async decreaseFollowingCount(id: string): Promise<void> {
    const user = await this.userModel.findOne({ id }).exec();
    if (user && user.followingCount > 0) {
      await this.userModel
        .updateOne({ id }, { $inc: { followingCount: -1 } })
        .exec();
    }
  }

  async getRecommendedUsers(
    page: number,
    pageSize: number,
    currentUid: string,
  ): Promise<{ total: number; users: User[] }> {
    const skip = (page - 1) * pageSize;
    const filter = this.getBannedFilter(currentUid, {
      isPrivate: false,
      '_userRelation.following': { $ne: true },
      id: { $ne: currentUid },
    });
    // 使用您的推荐逻辑来获取用户列表和总数
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

    // 对每个推荐用户进行附加信息处理
    const _users = await Promise.all(
      recommendedUsers.map((user) => this.mergeUserInfo(user, currentUid)),
    );

    return { total: total?.[0]?.total, users: _users };
  }
}
