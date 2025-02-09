import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Poll, PollSchema } from './schema/poll.schema';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';

import { VoteModule } from '../vote/vote.module';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    AuthModule,
    forwardRef(() => VoteModule),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    forwardRef(() => ActivityModule),
  ],
  controllers: [PollController],
  providers: [PollService],
  exports: [PollService],
})
export class PollModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
