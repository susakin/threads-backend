import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { User } from '../user/schema/user.schema';
export declare class AuthController {
    private readonly authService;
    private readonly redisService;
    private readonly userService;
    constructor(authService: AuthService, redisService: RedisService, userService: UserService);
    login(account: string, password: string): Promise<{
        token: string;
        user: User;
    }>;
    logout(request: any): Promise<void>;
    getCurrentUser(request: any): Promise<any>;
}
