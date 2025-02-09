import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { PollModule } from '../poll/poll.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './schema/vote.schema';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { PostModule } from '../post/post.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [VoteController],
  providers: [VoteService],
  imports: [
    forwardRef(() => PollModule),
    forwardRef(() => PostModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
  ],
  exports: [VoteService],
})
export class VoteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
