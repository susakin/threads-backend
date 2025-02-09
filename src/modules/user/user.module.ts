import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from './schema/user.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { UserRelationModule } from '../user-relation/user-relation.module';
import { ActivityModule } from '../activity/activity.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    forwardRef(() => UserRelationModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => ActivityModule),
    forwardRef(() => PostModule),
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
