import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSession, ConversationSessionSchema, ConversationEvent, ConversationEventSchema } from './schemas';
import { SessionRepository, EventRepository } from './repositories';

import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConversationSession.name, schema: ConversationSessionSchema },
            { name: ConversationEvent.name, schema: ConversationEventSchema },
        ]),
    ],
    controllers: [SessionsController],
    providers: [SessionRepository, EventRepository, SessionsService],
    exports: [SessionRepository, EventRepository, SessionsService],
})
export class SessionsModule { }
