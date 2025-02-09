import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './schema/post.schema'; // 这里只需要导入PostSchema
import { UserModule } from 'src/modules/user/user.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { LikeModule } from '../like/like.module';
import { RepostModule } from '../repost/repost.module';
import { UserRelationModule } from '../user-relation/user-relation.module';
import { QuoteModule } from '../quote/quote.module';
import { HidePostModule } from '../hide-post/hide-post.module';
import { PollModule } from '../poll/poll.module';
import { SavePostModule } from '../save-post/save-post.module';
import { TagModule } from '../tag/tag.module';
import { ViewModule } from '../view/view.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema }, // 只导入Post模型和对应的Schema
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => LikeModule),
    forwardRef(() => RepostModule),
    forwardRef(() => QuoteModule),
    forwardRef(() => ActivityModule),
    forwardRef(() => HidePostModule),
    forwardRef(() => PollModule),
    forwardRef(() => SavePostModule),
    forwardRef(() => TagModule),
    forwardRef(() => ViewModule),
    RedisModule,
    AuthModule,
    forwardRef(() => UserRelationModule),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
