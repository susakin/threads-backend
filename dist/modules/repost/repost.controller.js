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
exports.RepostController = void 0;
const common_1 = require("@nestjs/common");
const repost_service_1 = require("./repost.service");
const auth_guard_1 = require("../../guards/auth.guard");
let RepostController = class RepostController {
    constructor(repostService) {
        this.repostService = repostService;
    }
    async createRepost(postId, request) {
        return this.repostService.createRepost({ postId, uid: request.user?.id });
    }
    async unrepostPost(postId, request) {
        return this.repostService.unRepostPost(postId, request.user?.id);
    }
    async getPostReposts(postId, page = 1, pageSize = 10, req) {
        return this.repostService.getPostReposts(postId, req.user?.id, page, pageSize);
    }
    async getRepostsByUserId(uid, page = 1, pageSize = 10, req) {
        return this.repostService.getRepostsByUid(uid, req.user?.id, page, pageSize);
    }
};
exports.RepostController = RepostController;
__decorate([
    (0, common_1.Post)(':postId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "createRepost", null);
__decorate([
    (0, common_1.Delete)(':postId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "unrepostPost", null);
__decorate([
    (0, common_1.Get)('post/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "getPostReposts", null);
__decorate([
    (0, common_1.Get)('user/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Query)('page', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('pageSize', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "getRepostsByUserId", null);
exports.RepostController = RepostController = __decorate([
    (0, common_1.Controller)('repost'),
    __metadata("design:paramtypes", [repost_service_1.RepostService])
], RepostController);
//# sourceMappingURL=repost.controller.js.map