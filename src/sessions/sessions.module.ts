import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSession, ConversationSessionSchema } from './schemas/session.schema';
import { ConversationEvent, ConversationEventSchema } from './schemas/event.schema';
import { SessionRepository } from './repositories/session.repository';
import { EventRepository } from './repositories/event.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConversationSession.name, schema: ConversationSessionSchema },
            { name: ConversationEvent.name, schema: ConversationEventSchema },
        ]),
    ],
    providers: [SessionRepository, EventRepository],
    exports: [SessionRepository, EventRepository],
})
export class SessionsModule { }
