import { RedisClient } from './redis.providers';
export declare class RedisService {
    private readonly client;
    constructor(client: RedisClient);
    set(key: string, value: string, expirationSeconds: number): Promise<void>;
    get(key: string): Promise<string | null>;
    delete(key: string): Promise<void>;
}
