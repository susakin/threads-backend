import { Module, forwardRef } from '@nestjs/common';
import { HidePostService } from './hide-post.service';
import { HidePostController } from './hide-post.controller';
import { HidePost, HidePostSchema } from './schema/hide-post.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HidePost.name, schema: HidePostSchema },
    ]),
    AuthModule,
    forwardRef(() => PostModule),
  ],
  controllers: [HidePostController],
  providers: [HidePostService],
  exports: [HidePostService],
})
export class HidePostModule {}
