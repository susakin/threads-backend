"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_execption_filter_1 = require("./filter/http-execption.filter");
const transform_interceptor_1 = require("./interception/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new http_execption_filter_1.HttpExecptionFilter());
    app.setGlobalPrefix('api');
    app.useStaticAssets('uploads', {
        prefix: '/uploads/',
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map