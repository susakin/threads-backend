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
exports.ViewService = void 0;
const common_1 = require("@nestjs/common");
const view_schema_1 = require("./schema/view.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_service_1 = require("../post/post.service");
let ViewService = class ViewService {
    constructor(viewModel, postService) {
        this.viewModel = viewModel;
        this.postService = postService;
    }
    async create({ postId, uid }) {
        const post = await this.postService.findPostById(postId, uid);
        if (post?.user?.id === uid) {
            return;
        }
        if (post?.user?.friendshipStatus?.isBanned) {
            throw new Error('Not allow');
        }
        const view = await this.viewModel.findOne({ postId, uid });
        if (!view) {
            const view = await this.viewModel.create({ postId, uid });
            return view;
        }
    }
    async getViewCount(postId) {
        const count = await this.viewModel
            .aggregate([
            {
                $match: { postId },
            },
            {
                $count: 'count',
            },
        ])
            .exec();
        return count.length > 0 ? count[0].count : 0;
    }
    async deleteByPostId(postId) {
        await this.viewModel.deleteMany({ postId });
    }
    async getByPostIdAndUid(postId, uid) {
        const view = await this.viewModel.findOne({ postId, uid });
        return !!view;
    }
};
exports.ViewService = ViewService;
exports.ViewService = ViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(view_schema_1.view.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        post_service_1.PostService])
], ViewService);
//# sourceMappingURL=view.service.js.map