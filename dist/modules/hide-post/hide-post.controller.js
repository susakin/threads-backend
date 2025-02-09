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
exports.HidePostController = void 0;
const common_1 = require("@nestjs/common");
const hide_post_service_1 = require("./hide-post.service");
const auth_guard_1 = require("../../guards/auth.guard");
let HidePostController = class HidePostController {
    constructor(hidePostService) {
        this.hidePostService = hidePostService;
    }
    create(postId, request) {
        return this.hidePostService.create({
            postId,
            uid: request.user?.id,
        });
    }
    remove(postId, request) {
        return this.hidePostService.deleteByPostId(postId, request.user?.id);
    }
};
exports.HidePostController = HidePostController;
__decorate([
    (0, common_1.Post)(':postId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HidePostController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':postId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HidePostController.prototype, "remove", null);
exports.HidePostController = HidePostController = __decorate([
    (0, common_1.Controller)('hide-post'),
    __metadata("design:paramtypes", [hide_post_service_1.HidePostService])
], HidePostController);
//# sourceMappingURL=hide-post.controller.js.map