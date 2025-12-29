import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationEvent } from '../schemas';
import { EventType } from '@common/types';

export interface PaginatedEvents {
    events: ConversationEvent[];
    total: number;
    hasMore: boolean;
}

@Injectable()
export class EventRepository {
    constructor(
        @InjectModel(ConversationEvent.name)
        private readonly eventModel: Model<ConversationEvent>,
    ) { }

    async createEvent(
        sessionId: string,
        eventId: string,
        type: EventType,
        payload: Record<string, unknown>,
        timestamp: Date,
    ): Promise<ConversationEvent> {
        const event = new this.eventModel({
            sessionId,
            eventId,
            type,
            payload,
            timestamp,
        });
        return event.save();
    }

    async findBySessionId(sessionId: string, limit: number = 50, offset: number = 0): Promise<PaginatedEvents> {
        const [events, total] = await Promise.all([
            this.eventModel
                .find({ sessionId })
                .sort({ timestamp: 1 })
                .skip(offset)
                .limit(limit)
                .exec(),
            this.eventModel.countDocuments({ sessionId }).exec(),
        ]);

        return {
            events,
            total,
            hasMore: offset + events.length < total,
        };
    }

    async eventExists(sessionId: string, eventId: string): Promise<boolean> {
        const count = await this.eventModel.countDocuments({ sessionId, eventId }).exec();
        return count > 0;
    }
}
