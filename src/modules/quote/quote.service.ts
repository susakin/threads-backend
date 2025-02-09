import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument } from './schema/quote.schema';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { PostService } from 'src/modules/post/post.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { getBannedFilter } from '../save-post/save-post.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<QuoteDocument>,

    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
  ) {}

  async createQuote(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const newQuote = await this.quoteModel.create(createQuoteDto);

    // 生成对应的活动记录
    const post = await this.postService.findPostById(
      createQuoteDto.postId,
      createQuoteDto.uid,
    );
    if (post?.user?.friendshipStatus.isBanned) {
      throw new Error('not allowed');
    }

    const quoteToPost = await this.postService.findPostById(
      createQuoteDto.quoteToPostId,
      createQuoteDto.uid,
    );
    if (post) {
      const activityDto = {
        type: 'quote' as any,
        from: createQuoteDto.uid, // 使用引用用户的uid作为活动记录的from字段
        to: post.user?.id, // 使用帖子发布者的uid作为活动记录的to字段
        postCode: post.code,
        relatePostId: quoteToPost.id,
        relatePostCode: quoteToPost.code,
        // 其他字段...
      };
      await this.activityService.create(activityDto);
    }

    return newQuote;
  }

  async deleteQuotes(postId: string): Promise<void> {
    // 查找该帖子的所有引用信息
    await this.quoteModel.deleteMany({ postId }).exec();
  }

  async getPostQuotes(
    postId: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ quotes: any[]; total: number }> {
    const skip = pageSize * (page - 1);

    const filter = getBannedFilter(currentUid, { postId });

    const [quotes, total] = await Promise.all([
      await this.quoteModel.aggregate([
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
      await this.quoteModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    // 获取引用用户的实体信息
    const _quotes = await Promise.all(
      quotes.map(async (quote) => {
        const post = await this.postService.findPostById(
          quote.quoteToPostId,
          currentUid,
        );
        return { quote, user: post.user, post };
      }),
    );

    return { quotes, total: total?.[0]?.total };
  }
}
