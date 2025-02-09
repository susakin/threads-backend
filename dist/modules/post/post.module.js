"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const post_controller_1 = require("./post.controller");
const post_service_1 = require("./post.service");
const post_schema_1 = require("./schema/post.schema");
const user_module_1 = require("../user/user.module");
const activity_module_1 = require("../activity/activity.module");
const redis_module_1 = require("../redis/redis.module");
const auth_module_1 = require("../auth/auth.module");
const getUser_middleware_1 = require("../../middleware/getUser.middleware");
const like_module_1 = require("../like/like.module");
const repost_module_1 = require("../repost/repost.module");
const user_relation_module_1 = require("../user-relation/user-relation.module");
const quote_module_1 = require("../quote/quote.module");
const hide_post_module_1 = require("../hide-post/hide-post.module");
const poll_module_1 = require("../poll/poll.module");
const save_post_module_1 = require("../save-post/save-post.module");
const tag_module_1 = require("../tag/tag.module");
const view_module_1 = require("../view/view.module");
let PostModule = class PostModule {
    configure(consumer) {
        consumer.apply(getUser_middleware_1.GetUserMiddleware).forRoutes('*');
    }
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: post_schema_1.Post.name, schema: post_schema_1.PostSchema },
            ]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => like_module_1.LikeModule),
            (0, common_1.forwardRef)(() => repost_module_1.RepostModule),
            (0, common_1.forwardRef)(() => quote_module_1.QuoteModule),
            (0, common_1.forwardRef)(() => activity_module_1.ActivityModule),
            (0, common_1.forwardRef)(() => hide_post_module_1.HidePostModule),
            (0, common_1.forwardRef)(() => poll_module_1.PollModule),
            (0, common_1.forwardRef)(() => save_post_module_1.SavePostModule),
            (0, common_1.forwardRef)(() => tag_module_1.TagModule),
            (0, common_1.forwardRef)(() => view_module_1.ViewModule),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => user_relation_module_1.UserRelationModule),
        ],
        controllers: [post_controller_1.PostController],
        providers: [post_service_1.PostService],
        exports: [post_service_1.PostService],
    })
], PostModule);
//# sourceMappingURL=post.module.js.map