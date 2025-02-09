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
exports.PostController = void 0;
const common_1 = require("@nestjs/common");
const post_service_1 = require("./post.service");
const create_post_dot_1 = require("./dto/create-post.dot");
const post_schema_1 = require("./schema/post.schema");
const auth_guard_1 = require("../../guards/auth.guard");
let PostController = class PostController {
    constructor(postService) {
        this.postService = postService;
    }
    async createPost(createPostDto, request) {
        createPostDto.uid = request.user?.id;
        return this.postService.createPost(createPostDto);
    }
    async updatePost(id, updatePostDto, request) {
        const user = request.user;
        if (!(await this.postService.checkIsPostOwner(id, user.id))) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        return this.postService.updatePost(id, updatePostDto);
    }
    async updatePostReplyAuth(id, replyAuth, request) {
        const user = request.user;
        if (!(await this.postService.checkIsPostOwner(id, user.id))) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        return this.postService.updatePostReplyAuth(id, replyAuth);
    }
    async deletePost(id, request) {
        const user = request.user;
        if (!(await this.postService.checkIsPostOwner(id, user.id))) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        return this.postService.deletePost(id);
    }
    async findPostsByUid(uid, page, pageSize, req) {
        return this.postService.findPostsByUid(uid, req?.user?.id, page, pageSize);
    }
    async getTimelinePosts(page, pageSize, req) {
        return this.postService.findTimelinePosts(req.user?.id, page, pageSize);
    }
    async findPostByCode(code, req) {
        return this.postService.findPostByCode(code, req.user?.id);
    }
    async pinPost(id, request) {
        const user = request.user;
        if (!(await this.postService.checkIsPostOwner(id, user?.id))) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        const updatedPost = await this.postService.pinToProfile(id);
        return updatedPost;
    }
    async pinToComment(id, request) {
        const user = request.user;
        const updatedPost = await this.postService.pinToComment(id, user.id);
        return updatedPost;
    }
    async unpinToComment(id, request) {
        const user = request.user;
        const updatedPost = await this.postService.unpinToComment(id, user.id);
        return updatedPost;
    }
    async updateLikeAndviewtsDisabled(id, request, likeAndViewCountDisabled) {
        const user = request.user;
        if (!(await this.postService.checkIsPostOwner(id, user?.id))) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        const updatedPost = await this.postService.updateLikeAndviewtsDisabled(id, likeAndViewCountDisabled);
        return updatedPost;
    }
    async unpinPost(id, request) {
        const user = request.user;
        if (!(await this.postService.checkIsPostOwner(id, user?.id))) {
            throw new common_1.HttpException('Unauthorized', 401);
        }
        const updatedPost = await this.postService.unpinToProfile(id);
        return updatedPost;
    }
    async getPostDetail(code, req) {
        return this.postService.findPostParentChainByCode(code, req.user?.id);
    }
    async getUserReplies(uid, pageSize, page, req) {
        return this.postService.findRepliesByUid(uid, req.user?.id, page, pageSize);
    }
    async getUserPinned(req) {
        return this.postService.getUserPinned(req.user?.id);
    }
    async getPostCommentPinned(id) {
        return this.postService.getPostCommentPinned(id);
    }
    async getUserRepost(id, pageSize, page, excludePostCode, req) {
        return this.postService.findReplyPostsById(id, req.user?.id, page, pageSize, excludePostCode);
    }
    async getTimelineAfterId(id, pageSize, req) {
        return this.postService.findTimeLinePostsAfterId(req.user?.id, id, pageSize);
    }
    async getCommentAfterId(id, replyId, pageSize, req) {
        return this.postService.getReplyAfterId(req.user?.id, id, replyId, pageSize);
    }
    async getFollowingPosts(page, pageSize, req) {
        return this.postService.findFollowingPosts(req.user?.id, page, pageSize);
    }
    async getFollowingPostsAfterId(id, pageSize, req) {
        return this.postService.findFollowingPostsAfterId(req.user?.id, id, pageSize);
    }
    async findPostsByQuery(caption, tag, filter, page, pageSize, req) {
        return await this.postService.findPostsByQuery({ caption, tag, filter }, req.user?.id, page, pageSize);
    }
    async findPostById(id, req) {
        return this.postService.findPostById(id, req.user?.id);
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dot_1.CreatePostDto, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, post_schema_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Patch)(':id/reply-auth'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('replyAuth')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePostReplyAuth", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Get)('user/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "findPostsByUid", null);
__decorate([
    (0, common_1.Get)('timeline'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getTimelinePosts", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "findPostByCode", null);
__decorate([
    (0, common_1.Patch)(':id/pin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "pinPost", null);
__decorate([
    (0, common_1.Patch)(':id/pin-to-comment'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "pinToComment", null);
__decorate([
    (0, common_1.Patch)(':id/unpin-to-comment'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "unpinToComment", null);
__decorate([
    (0, common_1.Patch)(':id/like-and-view-counts'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('likeAndViewCountDisabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updateLikeAndviewtsDisabled", null);
__decorate([
    (0, common_1.Patch)(':id/unpin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "unpinPost", null);
__decorate([
    (0, common_1.Get)('/detail/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostDetail", null);
__decorate([
    (0, common_1.Get)('/replies/uid/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getUserReplies", null);
__decorate([
    (0, common_1.Get)('/profile-pinned'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getUserPinned", null);
__decorate([
    (0, common_1.Get)('/:id/pinned'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPostCommentPinned", null);
__decorate([
    (0, common_1.Get)('/replies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('excludePostCode')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getUserRepost", null);
__decorate([
    (0, common_1.Get)('timeline-after-id/:id?'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getTimelineAfterId", null);
__decorate([
    (0, common_1.Get)('reply-after-id/:id?'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('replyId')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getCommentAfterId", null);
__decorate([
    (0, common_1.Get)('following-posts'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getFollowingPosts", null);
__decorate([
    (0, common_1.Get)('following-posts-after-id/:id?'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getFollowingPostsAfterId", null);
__decorate([
    (0, common_1.Get)('/search'),
    __param(0, (0, common_1.Query)('caption')),
    __param(1, (0, common_1.Query)('tag')),
    __param(2, (0, common_1.Query)('filter')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "findPostsByQuery", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "findPostById", null);
exports.PostController = PostController = __decorate([
    (0, common_1.Controller)('post'),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostController);
//# sourceMappingURL=post.controller.js.map