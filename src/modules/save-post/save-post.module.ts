import { Module, forwardRef } from '@nestjs/common';
import { SavePostService } from './save-post.service';
import { SavePostController } from './save-post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavePost, SavePostSchema } from './schema/like.schema';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavePost.name, schema: SavePostSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    RedisModule,
    AuthModule,
  ],
  controllers: [SavePostController],
  providers: [SavePostService],
  exports: [SavePostService],
})
export class SavePostModule {}
