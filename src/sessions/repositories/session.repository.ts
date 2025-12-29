import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationSession, SessionStatus } from '../schemas/session.schema';

@Injectable()
export class SessionRepository {
    constructor(
        @InjectModel(ConversationSession.name)
        private readonly sessionModel: Model<ConversationSession>,
    ) { }

    async upsertSession(sessionId: string, language: string, metadata?: Record<string, unknown>): Promise<ConversationSession> {
        const session = await this.sessionModel.findOneAndUpdate(
            { sessionId },
            {
                $setOnInsert: {
                    sessionId,
                    language,
                    status: SessionStatus.INITIATED,
                    startedAt: new Date(),
                    metadata: metadata || {},
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        return session;
    }

    async findBySessionId(sessionId: string): Promise<ConversationSession | null> {
        return this.sessionModel.findOne({ sessionId }).exec();
    }

    async updateStatus(sessionId: string, status: SessionStatus, endedAt?: Date): Promise<ConversationSession | null> {
        const update: Partial<ConversationSession> = { status };
        if (endedAt) {
            update.endedAt = endedAt;
        }
        return this.sessionModel.findOneAndUpdate({ sessionId }, update, { new: true }).exec();
    }
}
