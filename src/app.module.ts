import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { SessionsModule } from './sessions/sessions.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule, SessionsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
