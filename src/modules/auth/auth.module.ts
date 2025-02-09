import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schema/auth.schema';
import { UserModule } from 'src/modules/user/user.module';
import { RedisModule } from '../redis/redis.module';
import { GetUserMiddleware } from 'src/middleware/getUser.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    forwardRef(() => UserModule),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService], // 注册 AuthService 和 UserService
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserMiddleware).forRoutes('*');
  }
}
