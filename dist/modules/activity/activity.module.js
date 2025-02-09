"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const activity_service_1 = require("./activity.service");
const activity_controller_1 = require("./activity.controller");
const activity_schema_1 = require("./schema/activity.schema");
const redis_module_1 = require("../redis/redis.module");
const user_module_1 = require("../user/user.module");
const auth_module_1 = require("../auth/auth.module");
const getUser_middleware_1 = require("../../middleware/getUser.middleware");
const post_module_1 = require("../post/post.module");
let ActivityModule = class ActivityModule {
    configure(consumer) {
        consumer.apply(getUser_middleware_1.GetUserMiddleware).forRoutes('*');
    }
};
exports.ActivityModule = ActivityModule;
exports.ActivityModule = ActivityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: activity_schema_1.Activity.name, schema: activity_schema_1.ActivitySchema },
            ]),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
        ],
        providers: [activity_service_1.ActivityService],
        controllers: [activity_controller_1.ActivityController],
        exports: [activity_service_1.ActivityService],
    })
], ActivityModule);
//# sourceMappingURL=activity.module.js.map