"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRelationModule = void 0;
const common_1 = require("@nestjs/common");
const user_relation_controller_1 = require("./user-relation.controller");
const user_relation_service_1 = require("./user-relation.service");
const user_module_1 = require("../user/user.module");
const activity_module_1 = require("../activity/activity.module");
const mongoose_1 = require("@nestjs/mongoose");
const redis_module_1 = require("../redis/redis.module");
const auth_module_1 = require("../auth/auth.module");
const user_relation_schema_1 = require("./schema/user-relation.schema");
let UserRelationModule = class UserRelationModule {
};
exports.UserRelationModule = UserRelationModule;
exports.UserRelationModule = UserRelationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            mongoose_1.MongooseModule.forFeature([
                { name: user_relation_schema_1.UserRelation.name, schema: user_relation_schema_1.UserRelationSchema },
            ]),
            activity_module_1.ActivityModule,
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            redis_module_1.RedisModule,
        ],
        controllers: [user_relation_controller_1.UserRelationController],
        providers: [user_relation_service_1.UserRelationService],
        exports: [user_relation_service_1.UserRelationService],
    })
], UserRelationModule);
//# sourceMappingURL=user-relation.module.js.map