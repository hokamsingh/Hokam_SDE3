import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [DatabaseModule, SessionsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
