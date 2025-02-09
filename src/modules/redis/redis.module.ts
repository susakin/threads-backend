import { Module } from '@nestjs/common';
import { redisProvider } from './redis.providers';
import { RedisService } from './redis.service';

@Module({
  providers: [redisProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
