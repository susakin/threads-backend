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
exports.UserRelationController = void 0;
const common_1 = require("@nestjs/common");
const user_relation_service_1 = require("./user-relation.service");
const auth_guard_1 = require("../../guards/auth.guard");
let UserRelationController = class UserRelationController {
    constructor(userRelationService) {
        this.userRelationService = userRelationService;
    }
    async followUser(uid, request) {
        await this.userRelationService.followUser(request.user?.id, uid);
    }
    async unfollowUser(uid, request) {
        await this.userRelationService.unfollowUser(request.user?.id, uid);
    }
    async deleteFollowUser(uid, request) {
        await this.userRelationService.unfollowUser(uid, request.user?.id);
    }
    async blockUser(uid, request) {
        await this.userRelationService.buildRelation(request.user?.id, uid, 'blocking');
    }
    async unblockUser(uid, request) {
        await this.userRelationService.dissolveRelation(request.user?.id, uid, 'blocking');
    }
    async restricteUser(uid, request) {
        await this.userRelationService.buildRelation(request.user?.id, uid, 'restricting');
    }
    async unrestricteUser(uid, request) {
        await this.userRelationService.dissolveRelation(request.user?.id, uid, 'restricting');
    }
    async muteUser(uid, request) {
        await this.userRelationService.buildRelation(request.user?.id, uid, 'muting');
    }
    async unmuteUser(uid, request) {
        await this.userRelationService.dissolveRelation(request.user?.id, uid, 'muting');
    }
    async deleteFollowRequest(uid, request) {
        await this.userRelationService.unFollowPrivateUser(uid, request.user?.id);
    }
    async followRequest(uid, request) {
        await this.userRelationService.followPrivateUser(uid, request.user?.id);
    }
    async getFollowingList(page, pageSize, uid, req) {
        return this.userRelationService.getFollowingList(uid, req?.user?.id, page, pageSize);
    }
    async getFollowerList(page, pageSize, uid, req) {
        return this.userRelationService.getFollowerList(uid, req?.user?.id, page, pageSize);
    }
};
exports.UserRelationController = UserRelationController;
__decorate([
    (0, common_1.Post)('follow/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "followUser", null);
__decorate([
    (0, common_1.Post)('unfollow/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Delete)('follow/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "deleteFollowUser", null);
__decorate([
    (0, common_1.Post)('block/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Post)('unblock/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Post)('restricte/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "restricteUser", null);
__decorate([
    (0, common_1.Post)('unrestricte/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "unrestricteUser", null);
__decorate([
    (0, common_1.Post)('mute/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "muteUser", null);
__decorate([
    (0, common_1.Post)('unmute/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "unmuteUser", null);
__decorate([
    (0, common_1.Post)('unfollow-request/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "deleteFollowRequest", null);
__decorate([
    (0, common_1.Post)('follow-request/:uid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "followRequest", null);
__decorate([
    (0, common_1.Get)('following/:uid'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Param)('uid')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "getFollowingList", null);
__decorate([
    (0, common_1.Get)('follower/:uid'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Param)('uid')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], UserRelationController.prototype, "getFollowerList", null);
exports.UserRelationController = UserRelationController = __decorate([
    (0, common_1.Controller)('user-relation'),
    __metadata("design:paramtypes", [user_relation_service_1.UserRelationService])
], UserRelationController);
//# sourceMappingURL=user-relation.controller.js.map