import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository, EventRepository } from './repositories';
import { CreateSessionDto, CreateEventDto } from './dto';
import { SessionStatus } from '@common/types';

@Injectable()
export class SessionsService {
    constructor(
        private readonly sessionRepository: SessionRepository,
        private readonly eventRepository: EventRepository,
    ) { }

    async createSession(createSessionDto: CreateSessionDto) {
        return this.sessionRepository.upsertSession(
            createSessionDto.sessionId,
            createSessionDto.language,
            createSessionDto.metadata || {},
        );
    }

    async addEvent(sessionId: string, createEventDto: CreateEventDto) {
        const session = await this.sessionRepository.findBySessionId(sessionId);
        if (!session) {
            throw new NotFoundException(`Session ${sessionId} not found`);
        }

        return this.eventRepository.createEvent(
            sessionId,
            createEventDto.eventId,
            createEventDto.type,
            createEventDto.payload,
            new Date(createEventDto.timestamp),
        );
    }

    async getSession(sessionId: string, limit: number = 50, offset: number = 0) {
        const session = await this.sessionRepository.findBySessionId(sessionId);
        if (!session) {
            throw new NotFoundException(`Session ${sessionId} not found`);
        }

        const events = await this.eventRepository.findBySessionId(sessionId, limit, offset);

        return {
            ...session.toObject(),
            events: events.events,
            pagination: {
                total: events.total,
                limit,
                offset,
                hasMore: events.hasMore,
            },
        };
    }

    async completeSession(sessionId: string) {
        const session = await this.sessionRepository.findBySessionId(sessionId);
        if (!session) {
            throw new NotFoundException(`Session ${sessionId} not found`);
        }

        if (session.status === SessionStatus.COMPLETED) {
            return session;
        }

        return this.sessionRepository.updateStatus(
            sessionId,
            SessionStatus.COMPLETED,
            new Date(),
        );
    }
}
