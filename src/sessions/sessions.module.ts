import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSession, ConversationSessionSchema, ConversationEvent, ConversationEventSchema } from './schemas';
import { SessionRepository, EventRepository } from './repositories';

import { SessionsService } from './sessions.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConversationSession.name, schema: ConversationSessionSchema },
            { name: ConversationEvent.name, schema: ConversationEventSchema },
        ]),
    ],
    providers: [SessionRepository, EventRepository, SessionsService],
    exports: [SessionRepository, EventRepository, SessionsService],
})
export class SessionsModule { }
