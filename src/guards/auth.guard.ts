import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new HttpException('not allowed', 401);
    }

    try {
      const user = await this.authService.validateTokenAndGetUser(authHeader);
      request.user = user;
      return true;
    } catch (error) {
      throw new HttpException('not allowed', 401);
    }
  }
}
