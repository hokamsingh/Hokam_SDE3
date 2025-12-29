import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [DatabaseModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
