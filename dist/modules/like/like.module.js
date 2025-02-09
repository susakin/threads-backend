"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const like_controller_1 = require("./like.controller");
const like_service_1 = require("./like.service");
const like_schema_1 = require("./schema/like.schema");
const user_module_1 = require("../user/user.module");
const post_module_1 = require("../post/post.module");
const activity_module_1 = require("../activity/activity.module");
const redis_module_1 = require("../redis/redis.module");
const auth_module_1 = require("../auth/auth.module");
let LikeModule = class LikeModule {
};
exports.LikeModule = LikeModule;
exports.LikeModule = LikeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: like_schema_1.Like.name, schema: like_schema_1.LikeSchema }]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            (0, common_1.forwardRef)(() => activity_module_1.ActivityModule),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
        ],
        controllers: [like_controller_1.LikeController],
        providers: [like_service_1.LikeService],
        exports: [like_service_1.LikeService],
    })
], LikeModule);
//# sourceMappingURL=like.module.js.map