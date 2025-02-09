import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Like, LikeSchema } from './schema/like.schema';
import { UserModule } from 'src/modules/user/user.module';
import { PostModule } from 'src/modules/post/post.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    forwardRef(() => ActivityModule),
    RedisModule,
    AuthModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
