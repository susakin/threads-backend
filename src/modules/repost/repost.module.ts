import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { RepostService } from './repost.service';
import { RepostController } from './repost.controller';
import { UserModule } from 'src/modules/user/user.module';
import { PostModule } from 'src/modules/post/post.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Repost, RepostSchema } from './schema/repost.schema';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Repost.name, schema: RepostSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    forwardRef(() => ActivityModule),
    AuthModule,
  ],
  providers: [RepostService],
  controllers: [RepostController],
  exports: [RepostService],
})
export class RepostModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
