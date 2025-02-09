"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const auth_schema_1 = require("./schema/auth.schema");
const crypto = require("crypto");
const user_service_1 = require("../user/user.service");
const jwt = require('jsonwebtoken');
const redis_service_1 = require("../redis/redis.service");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(authModel, userService, redisService) {
        this.authModel = authModel;
        this.userService = userService;
        this.redisService = redisService;
        this.token = '9A@v3wFm1QhPx5YkLbTzGc8Rn6Ui2Eo7Hs4WrDjXqKg%$';
    }
    generateAuthToken(uid) {
        const payload = { uid };
        const token = jwt.sign(payload, this.token, { expiresIn: '15d' });
        return token;
    }
    async validateTokenAndGetUser(token) {
        try {
            token = token.replace('Bearer ', '');
            const { uid } = jwt.verify(token.replace('Bearer ', ''), this.token);
            const cachedToken = await this.redisService.get(uid);
            if (cachedToken === token) {
                const user = await this.userService.findUserById(uid, uid);
                return user;
            }
            throw new Error('Invalid or expired token');
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    async generateAuthInfo(uid, account, password) {
        const existingAuth = await this.authModel.findOne({ uid });
        const user = await this.userService.findUserById(uid);
        if (!existingAuth && user) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hashedPassword = crypto
                .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
                .toString('hex');
            if (existingAuth) {
                await this.authModel.deleteOne({ id: existingAuth.id });
            }
            await this.authModel.create({
                id: (0, uuid_1.v4)(),
                uid: user.id,
                salt,
                password: hashedPassword,
                account,
            });
        }
    }
    validatePassword(password, salt, hashedPassword) {
        const hash = crypto
            .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
            .toString('hex');
        return hash === hashedPassword;
    }
    async validatePasswordByUid(uid, password) {
        const authInfo = await this.authModel.findOne({ uid });
        if (!authInfo) {
            throw new common_1.HttpException('Invalid authInfo', 500);
        }
        return this.validatePassword(password, authInfo.salt, authInfo.password);
    }
    async login(account, password) {
        const authInfo = await this.authModel.findOne({ account });
        if (!authInfo) {
            throw new common_1.HttpException('Invalid authInfo', 500);
        }
        const user = await this.userService.findUserById(authInfo.uid);
        if (!user) {
            throw new common_1.HttpException('Invalid authInfo', 500);
        }
        if (this.validatePassword(password, authInfo.salt, authInfo.password)) {
            const token = this.generateAuthToken(user.id);
            this.redisService.set(user.id, token, 60 * 60 * 24 * 15);
            return { token, user };
        }
        else {
            throw new common_1.HttpException('Invalid credentials', 500);
        }
    }
    async logout(authToken) {
        const decodedToken = jwt.verify(authToken, this.token);
        const userId = decodedToken.uid;
        this.redisService.delete(userId);
    }
    async deleteAuthInfoByUid(uid) {
        await this.authModel.deleteOne({ uid });
    }
    async isAccountExists(account) {
        const existingAuth = await this.authModel.findOne({ account });
        return !!existingAuth;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(auth_schema_1.Auth.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map