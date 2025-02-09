import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = '';
    const authHeader = request.headers?.['security'];

    if (!authHeader) {
      throw new HttpException('Missing authorization header', 500);
    }

    try {
      return authHeader === token;
    } catch (error) {
      throw new HttpException('Invalid or expired token', 500);
    }
  }
}
