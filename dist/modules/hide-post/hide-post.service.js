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
exports.HidePostService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const hide_post_schema_1 = require("./schema/hide-post.schema");
const mongoose_2 = require("@nestjs/mongoose");
const post_service_1 = require("../post/post.service");
let HidePostService = class HidePostService {
    constructor(hidePostModel, postService) {
        this.hidePostModel = hidePostModel;
        this.postService = postService;
    }
    async create(createHidePostDto) {
        const uid = createHidePostDto.uid;
        const postId = createHidePostDto.postId;
        const post = await this.postService.findPostById(postId, uid);
        if (post.uid === uid) {
            throw new Error('cannot hide own post');
        }
        const hidePost = await this.hidePostModel.create(createHidePostDto);
        return hidePost;
    }
    async deleteByPostId(postId, uid) {
        const hidePost = await this.hidePostModel.deleteOne({ postId, uid });
        return hidePost;
    }
    async isHiddenPost(postId, uid) {
        const hidePost = await this.hidePostModel.findOne({ postId, uid });
        return !!hidePost;
    }
};
exports.HidePostService = HidePostService;
exports.HidePostService = HidePostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(hide_post_schema_1.HidePost.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => post_service_1.PostService))),
    __metadata("design:paramtypes", [mongoose_1.Model,
        post_service_1.PostService])
], HidePostService);
//# sourceMappingURL=hide-post.service.js.map