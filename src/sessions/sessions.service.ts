import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository, EventRepository } from './repositories';
import { CreateSessionDto, CreateEventDto } from './dto';
import { SessionStatus, PaginatedResult } from '@common/types';
import { PaginationDto } from '@common/dto/pagination.dto';

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

    async getSession(sessionId: string, paginationDto: PaginationDto = { limit: 50, offset: 0 }): Promise<Record<string, unknown> & { events: PaginatedResult<unknown>['items'], pagination: Omit<PaginatedResult<unknown>, 'items'> }> {
        const { limit = 50, offset = 0 } = paginationDto;
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
