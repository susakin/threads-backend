/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Model } from 'mongoose';
import { AuthDocument } from './schema/auth.schema';
import { UserService } from 'src/modules/user/user.service';
import { RedisService } from '../redis/redis.service';
import { User } from '../user/schema/user.schema';
export declare class AuthService {
    private authModel;
    private readonly userService;
    private readonly redisService;
    token: string;
    constructor(authModel: Model<AuthDocument>, userService: UserService, redisService: RedisService);
    generateAuthToken(uid: string): string;
    validateTokenAndGetUser(token: string): Promise<any>;
    generateAuthInfo(uid: string, account: string, password: string): Promise<void>;
    validatePassword(password: string, salt: string, hashedPassword: string): boolean;
    validatePasswordByUid(uid: any, password: string): Promise<boolean>;
    login(account: string, password: string): Promise<{
        token: string;
        user: User;
    }>;
    logout(authToken: any): Promise<void>;
    deleteAuthInfoByUid(uid: string): Promise<void>;
    isAccountExists(account: string): Promise<boolean>;
}
