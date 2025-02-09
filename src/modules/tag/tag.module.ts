import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from './schema/tag.schema';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TagController],
  providers: [TagService],
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]),
  ],
  exports: [TagService],
})
export class TagModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
