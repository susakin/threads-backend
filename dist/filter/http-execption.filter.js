"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExecptionFilter = void 0;
const common_1 = require("@nestjs/common");
common_1.HttpException;
class HttpExecptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : 500;
        const msg = exception.message ? exception.message : 'Internal Server Error';
        console.log(exception, 'exception');
        response.status(status).json({
            code: status,
            msg,
        });
    }
}
exports.HttpExecptionFilter = HttpExecptionFilter;
//# sourceMappingURL=http-execption.filter.js.map