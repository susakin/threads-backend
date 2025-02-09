"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteModule = void 0;
const common_1 = require("@nestjs/common");
const quote_controller_1 = require("./quote.controller");
const quote_service_1 = require("./quote.service");
const quote_schema_1 = require("./schema/quote.schema");
const mongoose_1 = require("@nestjs/mongoose");
const post_module_1 = require("../post/post.module");
const activity_module_1 = require("../activity/activity.module");
const getUser_middleware_1 = require("../../middleware/getUser.middleware");
const auth_module_1 = require("../auth/auth.module");
let QuoteModule = class QuoteModule {
    configure(consumer) {
        consumer.apply(getUser_middleware_1.GetUserMiddleware).forRoutes('*');
    }
};
exports.QuoteModule = QuoteModule;
exports.QuoteModule = QuoteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: quote_schema_1.Quote.name, schema: quote_schema_1.quoteSchema }]),
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            (0, common_1.forwardRef)(() => activity_module_1.ActivityModule),
            auth_module_1.AuthModule,
        ],
        controllers: [quote_controller_1.QuoteController],
        providers: [quote_service_1.QuoteService],
        exports: [quote_service_1.QuoteService],
    })
], QuoteModule);
//# sourceMappingURL=quote.module.js.map