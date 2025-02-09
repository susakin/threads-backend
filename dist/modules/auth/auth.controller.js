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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const redis_service_1 = require("../redis/redis.service");
const user_service_1 = require("../user/user.service");
const auth_guard_1 = require("../../guards/auth.guard");
let AuthController = class AuthController {
    constructor(authService, redisService, userService) {
        this.authService = authService;
        this.redisService = redisService;
        this.userService = userService;
    }
    async login(account, password) {
        const { token, user } = await this.authService.login(account, password);
        if (!token) {
            throw new common_1.HttpException('Invalid credentials', 500);
        }
        return { token, user };
    }
    async logout(request) {
        const token = await this.redisService.get(request.user?.id);
        await this.authService.logout(token);
    }
    async getCurrentUser(request) {
        const user = request.user;
        const clientIp = request.headers['x-real-ip'] ||
            request.headers['x-forwarded-for'] ||
            request?.connection?.remoteAddress;
        await this.userService.updateUserLocationByIp(user.id, clientIp);
        return { user };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)('account')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        redis_service_1.RedisService,
        user_service_1.UserService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map