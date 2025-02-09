import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserRelationModule } from './modules/user-relation/user-relation.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PostModule } from './modules/post/post.module';
import { LikeModule } from './modules/like/like.module';
import { RepostModule } from './modules/repost/repost.module';
import { QuoteModule } from './modules/quote/quote.module';
import { UploadModule } from './modules/upload/upload.module';
import { HidePostModule } from './modules/hide-post/hide-post.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    UserRelationModule,
    ActivityModule,
    PostModule,
    LikeModule,
    RepostModule,
    QuoteModule,
    UploadModule,
    HidePostModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
