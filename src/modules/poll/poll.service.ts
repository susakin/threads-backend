import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poll, PollDocument } from './schema/poll.schema';
import { v4 as uuidv4 } from 'uuid';
import { VoteService } from '../vote/vote.service';
import { UserService } from '../user/user.service';
import { Interval } from '@nestjs/schedule';
import { PostService } from '../post/post.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class PollService {
  constructor(
    @InjectModel(Poll.name)
    private pollModel: Model<PollDocument>,
    @Inject(forwardRef(() => VoteService))
    private readonly voteService: VoteService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
  ) {}

  async create(createPollDto: CreatePollDto): Promise<Poll> {
    createPollDto.id = uuidv4();
    createPollDto?.tallies?.forEach((item) => {
      item.id = uuidv4();
      item.count = 0;
    });
    createPollDto.expiresAt = Date.now() + 24 * 60 * 60 * 1000; //12小时到期
    const poll = await this.pollModel.create(createPollDto);
    return poll;
  }

  async findOne(id: string, currentUid: string = '', isBanned: boolean = true) {
    const poll = await this.pollModel.findOne({ id });
    if (!poll) return null;
    const { uid, tallies, expiresAt } = poll;
    const vote = await this.voteService.findOne(id, currentUid);
    await Promise.all(
      tallies.map(async (item) => {
        item.count = await this.voteService.getTallyCount(item?.id);
        if (item?.id === vote?.pollItemId) {
          const user = await this.userService.findUserById(
            vote?.uid,
            currentUid,
          );
          item.voteUserAvatar = [user?.profilePicUrl];
        }
      }),
    );
    poll.finished = Date.now() >= expiresAt;
    poll.viewerIsOwner = uid === currentUid;
    poll.viewerCanVote = uid !== currentUid && !isBanned;
    poll.viewerVote = !!vote;
    return poll;
  }

  async deleteById(id: string) {
    await this.pollModel.deleteOne({ id });
    await this.voteService.delteByPollId(id);
  }

  //检查投票是否结束
  @Interval(60000 * 10) // 每10分钟执行一次
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
          type: 'vote' as any,
          from: post?.uid, // 使用点赞用户的uid作为活动记录的from字段
          to: vote?.uid, // 使用帖子发布者的uid作为活动记录的to字段
          postCode: post.code,
          // 其他字段...
        };
        await this.activityService.create(activityDto);
      }
    }
  }
}
