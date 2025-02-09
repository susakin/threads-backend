"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteModule = void 0;
const common_1 = require("@nestjs/common");
const vote_service_1 = require("./vote.service");
const vote_controller_1 = require("./vote.controller");
const poll_module_1 = require("../poll/poll.module");
const mongoose_1 = require("@nestjs/mongoose");
const vote_schema_1 = require("./schema/vote.schema");
const getUser_middleware_1 = require("../../middleware/getUser.middleware");
const post_module_1 = require("../post/post.module");
const auth_module_1 = require("../auth/auth.module");
let VoteModule = class VoteModule {
    configure(consumer) {
        consumer.apply(getUser_middleware_1.GetUserMiddleware).forRoutes('*');
    }
};
exports.VoteModule = VoteModule;
exports.VoteModule = VoteModule = __decorate([
    (0, common_1.Module)({
        controllers: [vote_controller_1.VoteController],
        providers: [vote_service_1.VoteService],
        imports: [
            (0, common_1.forwardRef)(() => poll_module_1.PollModule),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            mongoose_1.MongooseModule.forFeature([{ name: vote_schema_1.Vote.name, schema: vote_schema_1.VoteSchema }]),
        ],
        exports: [vote_service_1.VoteService],
    })
], VoteModule);
//# sourceMappingURL=vote.module.js.map