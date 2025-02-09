import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { Quote, quoteSchema } from './schema/quote.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from 'src/modules/post/post.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quote.name, schema: quoteSchema }]),
    forwardRef(() => PostModule),
    forwardRef(() => ActivityModule),
    AuthModule,
  ],
  controllers: [QuoteController],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
