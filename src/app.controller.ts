import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
  ) { }

  @Get('health')
  async getHealth() {
    const mongoStatus = this.mongoConnection.readyState === 1 ? 'up' : 'down';
    let redisStatus = 'down';

    try {
      const pong = await this.redisService.ping();
      if (pong === 'PONG') {
        redisStatus = 'up';
      }
    } catch (e) {
      redisStatus = 'down';
    }

    return {
      status: mongoStatus === 'up' && redisStatus === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'conversation-service',
      dependencies: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    };
  }
}
