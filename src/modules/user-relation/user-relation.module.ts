import { Module, forwardRef } from '@nestjs/common';
import { UserRelationController } from './user-relation.controller';
import { UserRelationService } from './user-relation.service';
import { UserModule } from 'src/modules/user/user.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

import {
  UserRelation,
  UserRelationSchema,
} from './schema/user-relation.schema';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: UserRelation.name, schema: UserRelationSchema },
    ]),
    ActivityModule,
    forwardRef(() => AuthModule),
    RedisModule,
  ],
  controllers: [UserRelationController],
  providers: [UserRelationService],
  exports: [UserRelationService],
})
export class UserRelationModule {}
