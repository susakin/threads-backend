import { Module, forwardRef } from '@nestjs/common';
import { ViewService } from './view.service';
import { viewtController } from './view.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { view, viewtchema } from './schema/view.schema';
import { UserModule } from 'src/modules/user/user.module';
import { PostModule } from 'src/modules/post/post.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: view.name, schema: viewtchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    RedisModule,
    AuthModule,
  ],
  controllers: [viewtController],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
