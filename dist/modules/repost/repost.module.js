"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepostModule = void 0;
const common_1 = require("@nestjs/common");
const repost_service_1 = require("./repost.service");
const repost_controller_1 = require("./repost.controller");
const user_module_1 = require("../user/user.module");
const post_module_1 = require("../post/post.module");
const activity_module_1 = require("../activity/activity.module");
const mongoose_1 = require("@nestjs/mongoose");
const repost_schema_1 = require("./schema/repost.schema");
const getUser_middleware_1 = require("../../middleware/getUser.middleware");
const auth_module_1 = require("../auth/auth.module");
let RepostModule = class RepostModule {
    configure(consumer) {
        consumer.apply(getUser_middleware_1.GetUserMiddleware).forRoutes('*');
    }
};
exports.RepostModule = RepostModule;
exports.RepostModule = RepostModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: repost_schema_1.Repost.name, schema: repost_schema_1.RepostSchema }]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            (0, common_1.forwardRef)(() => activity_module_1.ActivityModule),
            auth_module_1.AuthModule,
        ],
        providers: [repost_service_1.RepostService],
        controllers: [repost_controller_1.RepostController],
        exports: [repost_service_1.RepostService],
    })
], RepostModule);
//# sourceMappingURL=repost.module.js.map