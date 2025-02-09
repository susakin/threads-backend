"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollModule = void 0;
const common_1 = require("@nestjs/common");
const poll_service_1 = require("./poll.service");
const poll_controller_1 = require("./poll.controller");
const auth_module_1 = require("../auth/auth.module");
const mongoose_1 = require("@nestjs/mongoose");
const poll_schema_1 = require("./schema/poll.schema");
const getUser_middleware_1 = require("../../middleware/getUser.middleware");
const vote_module_1 = require("../vote/vote.module");
const user_module_1 = require("../user/user.module");
const post_module_1 = require("../post/post.module");
const activity_module_1 = require("../activity/activity.module");
let PollModule = class PollModule {
    configure(consumer) {
        consumer.apply(getUser_middleware_1.GetUserMiddleware).forRoutes('*');
    }
};
exports.PollModule = PollModule;
exports.PollModule = PollModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: poll_schema_1.Poll.name, schema: poll_schema_1.PollSchema }]),
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => vote_module_1.VoteModule),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            (0, common_1.forwardRef)(() => activity_module_1.ActivityModule),
        ],
        controllers: [poll_controller_1.PollController],
        providers: [poll_service_1.PollService],
        exports: [poll_service_1.PollService],
    })
], PollModule);
//# sourceMappingURL=poll.module.js.map