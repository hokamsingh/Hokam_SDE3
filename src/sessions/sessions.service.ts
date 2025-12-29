import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository, EventRepository } from './repositories';
import { CreateSessionDto, CreateEventDto } from './dto';
import { SessionStatus, PaginatedResult, ErrorCode } from '@common/types';
import { PaginationDto } from '@common/dto/pagination.dto';
import { ConversationSession, ConversationEvent } from './schemas';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly eventRepository: EventRepository,
    private readonly redisService: RedisService,
  ) {}

  private getCacheKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async createSession(
    createSessionDto: CreateSessionDto,
  ): Promise<ConversationSession> {
    const session = await this.sessionRepository.upsertSession(
      createSessionDto.sessionId,
      createSessionDto.language,
      createSessionDto.metadata || {},
    );
    // Cache the new/updated session
    await this.redisService.set(
      this.getCacheKey(session.sessionId),
      JSON.stringify(session),
      600,
    );
    return session;
  }

  async addEvent(
    sessionId: string,
    createEventDto: CreateEventDto,
  ): Promise<ConversationEvent> {
    // Minimal check: Redis first, then Mongo
    const sessionData = await this.redisService.get(
      this.getCacheKey(sessionId),
    );
    if (!sessionData) {
      const session = await this.sessionRepository.findBySessionId(sessionId);
      if (!session) {
        throw new NotFoundException({
          message: `Session ${sessionId} not found`,
          errorCode: ErrorCode.SESSION_NOT_FOUND,
        });
      }
      // Populate cache on miss
      await this.redisService.set(
        this.getCacheKey(sessionId),
        JSON.stringify(session),
        600,
      );
    }

    return this.eventRepository.createEvent(
      sessionId,
      createEventDto.eventId,
      createEventDto.type,
      createEventDto.payload,
      new Date(createEventDto.timestamp),
    );
  }

  async getSession(
    sessionId: string,
    paginationDto: PaginationDto = { limit: 50, offset: 0 },
  ): Promise<
    Record<string, unknown> & {
      events: ConversationEvent[];
      pagination: Omit<PaginatedResult<ConversationEvent>, 'items'>;
    }
  > {
    const { limit = 50, offset = 0 } = paginationDto;

    // 1. Try Cache for Session Metadata (Stable)
    let session: Record<string, unknown>;
    const cachedSession = await this.redisService.get(
      this.getCacheKey(sessionId),
    );

    if (cachedSession) {
      session = JSON.parse(cachedSession) as Record<string, unknown>;
    } else {
      const dbSession = await this.sessionRepository.findBySessionId(sessionId);
      if (!dbSession) {
        throw new NotFoundException({
          message: `Session ${sessionId} not found`,
          errorCode: ErrorCode.SESSION_NOT_FOUND,
        });
      }
      session = (dbSession as any).toObject
        ? (dbSession as any).toObject()
        : (dbSession as unknown as Record<string, unknown>);
      // Cache for 10 minutes
      await this.redisService.set(
        this.getCacheKey(sessionId),
        JSON.stringify(session),
        600,
      );
    }

    // 2. Events are fetched LIVE from DB (Volatile)
    const events = await this.eventRepository.findBySessionId(
      sessionId,
      limit,
      offset,
    );

    return {
      ...session,
      events: events.events,
      pagination: {
        total: events.total,
        limit,
        offset,
        hasMore: events.hasMore,
      },
    };
  }

  async completeSession(sessionId: string): Promise<ConversationSession> {
    const session = await this.sessionRepository.findBySessionId(sessionId);
    if (!session) {
      throw new NotFoundException({
        message: `Session ${sessionId} not found`,
        errorCode: ErrorCode.SESSION_NOT_FOUND,
      });
    }

    if (session.status === SessionStatus.COMPLETED) {
      return session;
    }

    const updatedSession = await this.sessionRepository.updateStatus(
      sessionId,
      SessionStatus.COMPLETED,
      new Date(),
    );

    if (!updatedSession) {
      throw new NotFoundException({
        message: `Session ${sessionId} not found`,
        errorCode: ErrorCode.SESSION_NOT_FOUND,
      });
    }

    // Update Cache with new status
    await this.redisService.set(
      this.getCacheKey(sessionId),
      JSON.stringify(updatedSession),
      600,
    );

    return updatedSession;
  }
}
