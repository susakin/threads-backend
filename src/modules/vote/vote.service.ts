import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from './schema/vote.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PollService } from '../poll/poll.service';
import { PostService } from '../post/post.service';

@Injectable()
export class VoteService {
  constructor(
    @InjectModel(Vote.name)
    private voteModel: Model<VoteDocument>,
    @Inject(forwardRef(() => PollService))
    private readonly pollService: PollService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async create(createVoteDto: CreateVoteDto) {
    const poll = await this.pollService.findOne(createVoteDto.pollId);
    const post = await this.postService.findPostById(
      poll.postId,
      createVoteDto.uid,
    );
    const { allowedMentionUsers } =
      await this.postService.getMentionUserAndCaption(
        post?.caption,
        createVoteDto.uid,
      );
    const isBanned = await this.postService.isPostBanned(
      post,
      createVoteDto.uid,
      allowedMentionUsers,
    );

    const _vote = await this.voteModel.findOne({
      uid: createVoteDto.uid,
      pollId: createVoteDto.pollId,
    });
    if (
      !poll ||
      !poll.tallies?.find((item) => item.id === createVoteDto.pollItemId) ||
      _vote ||
      isBanned
    ) {
      throw new Error('not allowed');
    }

    const vote = this.voteModel.create(createVoteDto);
    return vote;
  }

  async getTallyCount(pollItemId: string) {
    const tallyCount = await this.voteModel.countDocuments({ pollItemId });
    return tallyCount;
  }

  async delteByPollId(pollId: string) {
    this.voteModel.deleteMany({ pollId });
  }

  async findOne(pollId: string, uid: string): Promise<Vote> {
    const vote = await this.voteModel.findOne({ pollId, uid }).exec();
    return vote;
  }
  async findByPollId(pollId: string): Promise<Vote[]> {
    const votes = await this.voteModel.find({ pollId });
    return votes;
  }
}
