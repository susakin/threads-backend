import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const user = await this.authService.validateTokenAndGetUser(authHeader);
        req.user = user;
      } catch (error) {
        // 处理token验证失败的情况
      }
    }
    next();
  }
}
