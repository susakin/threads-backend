import {
  Controller,
  Post,
  Body,
  HttpException,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from '../user/schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(
    @Body('account') account: string,
    @Body('password') password: string,
  ): Promise<{ token: string; user: User }> {
    const { token, user } = await this.authService.login(account, password);

    if (!token) {
      throw new HttpException('Invalid credentials', 500);
    }

    return { token, user };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Request() request): Promise<void> {
    const token = await this.redisService.get(request.user?.id);
    await this.authService.logout(token);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() request): Promise<any> {
    const user = request.user;
    const clientIp =
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request?.connection?.remoteAddress;
    await this.userService.updateUserLocationByIp(user.id, clientIp);
    return { user };
  }
}
