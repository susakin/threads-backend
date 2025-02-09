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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("./activity.service");
const create_activity_dto_1 = require("./dto/create-activity.dto");
const auth_guard_1 = require("../../guards/auth.guard");
let ActivityController = class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    async create(createActivityDto) {
        return this.activityService.create(createActivityDto);
    }
    async findByTo(request, page, pageSize, type) {
        const currentUid = request.user?.id;
        return this.activityService.findByTo(currentUid, type, page, pageSize);
    }
    async newActivitiesAfterId(request, id, pageSize, type) {
        const currentUid = request.user?.id;
        const newActivities = await this.activityService.getNewActivitiesAfterId(currentUid, id, type, pageSize);
        return newActivities;
    }
    async delete(request, id) {
        const currentUid = request.user?.id;
        const activity = await this.activityService.findById(id);
        if (activity.to !== currentUid) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        return this.activityService.delete(id);
    }
    async getPostSummary(postId, req) {
        const currentUid = req.user?.id;
        const summary = await this.activityService.getPostSummary(currentUid, postId, 20);
        return summary;
    }
    async getPostActivity(postCode, type, pageSize, page, req) {
        const currentUid = req.user?.id;
        const summary = await this.activityService.findByPostCode(postCode, currentUid, type, page, pageSize);
        return summary;
    }
    async markActivitiesAsRead(request, ids) {
        const currentUid = request.user?.id;
        try {
            const modifiedCount = await this.activityService.markActivitiesAsRead(currentUid, ids);
            return { modifiedCount };
        }
        catch (error) {
            throw new common_1.HttpException('Internal Server Error', 500);
        }
    }
    async hasUnreadActivity(request) {
        return await this.activityService.getUnreadActivityNum(request.user?.id);
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_activity_dto_1.CreateActivityDto]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user-activities/:type?'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "findByTo", null);
__decorate([
    (0, common_1.Get)('new-activities-after-id/:type?'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "newActivitiesAfterId", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('/post/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getPostSummary", null);
__decorate([
    (0, common_1.Get)('/post/:postCode/:type'),
    __param(0, (0, common_1.Param)('postCode')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getPostActivity", null);
__decorate([
    (0, common_1.Post)('/mark-as-read'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "markActivitiesAsRead", null);
__decorate([
    (0, common_1.Get)('/unread'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "hasUnreadActivity", null);
exports.ActivityController = ActivityController = __decorate([
    (0, common_1.Controller)('activity'),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map