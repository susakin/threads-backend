"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewModule = void 0;
const common_1 = require("@nestjs/common");
const view_service_1 = require("./view.service");
const view_controller_1 = require("./view.controller");
const mongoose_1 = require("@nestjs/mongoose");
const view_schema_1 = require("./schema/view.schema");
const user_module_1 = require("../user/user.module");
const post_module_1 = require("../post/post.module");
const redis_module_1 = require("../redis/redis.module");
const auth_module_1 = require("../auth/auth.module");
let ViewModule = class ViewModule {
};
exports.ViewModule = ViewModule;
exports.ViewModule = ViewModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: view_schema_1.view.name, schema: view_schema_1.viewtchema }]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
        ],
        controllers: [view_controller_1.viewtController],
        providers: [view_service_1.ViewService],
        exports: [view_service_1.ViewService],
    })
], ViewModule);
//# sourceMappingURL=view.module.js.map