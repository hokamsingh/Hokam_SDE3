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

    async getSession(sessionId: string) {
        const session = await this.sessionRepository.findBySessionId(sessionId);
        if (!session) {
            throw new NotFoundException(`Session ${sessionId} not found`);
        }

        // TODO: Add pagination support for events
        const events = await this.eventRepository.findBySessionId(sessionId);

        return {
            ...session.toObject(),
            events: events.events,
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
