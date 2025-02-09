"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisProvider = void 0;
const ioredis_1 = require("ioredis");
exports.redisProvider = {
    useFactory: () => {
        return new ioredis_1.default({
            host: 'localhost',
            port: 6379,
        });
    },
    provide: 'REDIS_CLIENT',
};
//# sourceMappingURL=redis.providers.js.map