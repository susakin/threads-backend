"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGuard = void 0;
const common_1 = require("@nestjs/common");
let SecurityGuard = class SecurityGuard {
    constructor() { }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = '9A@v3wFm1QhPx5YkLbTzGc8Rn6Ui2Eo7Hs4WrDjXqKg9VfCbNrMp1Z';
        const authHeader = request.headers?.['security'];
        if (!authHeader) {
            throw new common_1.HttpException('Missing authorization header', 500);
        }
        try {
            return authHeader === token;
        }
        catch (error) {
            throw new common_1.HttpException('Invalid or expired token', 500);
        }
    }
};
exports.SecurityGuard = SecurityGuard;
exports.SecurityGuard = SecurityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SecurityGuard);
//# sourceMappingURL=security.guard.js.map