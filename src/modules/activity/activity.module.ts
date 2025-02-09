import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { Activity, ActivitySchema } from './schema/activity.schema';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    RedisModule,
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
