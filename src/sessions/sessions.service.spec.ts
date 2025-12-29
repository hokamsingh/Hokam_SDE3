import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { SessionRepository, EventRepository } from './repositories';
import { RedisService } from '../redis/redis.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionStatus } from '@common/types';
import { NotFoundException } from '@nestjs/common';

describe('SessionsService', () => {
    let service: SessionsService;
    let sessionRepo: Partial<SessionRepository>;
    let eventRepo: Partial<EventRepository>;
    let redisService: Partial<RedisService>;

    const mockSession = {
        sessionId: '123',
        status: SessionStatus.ACTIVE,
        toObject: jest.fn().mockReturnThis(),
    };

    beforeEach(async () => {
        sessionRepo = {
            upsertSession: jest.fn(),
            findBySessionId: jest.fn(),
            updateStatus: jest.fn(),
        };
        eventRepo = {
            createEvent: jest.fn(),
            findBySessionId: jest.fn(),
        };
        redisService = {
            get: jest.fn(),
            set: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                { provide: SessionRepository, useValue: sessionRepo },
                { provide: EventRepository, useValue: eventRepo },
                { provide: RedisService, useValue: redisService },
            ],
        }).compile();

        service = module.get<SessionsService>(SessionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createSession', () => {
        it('should upsert session and cache it', async () => {
            const dto = { sessionId: '123', language: 'en' } as CreateSessionDto;
            (sessionRepo.upsertSession as jest.Mock).mockResolvedValue(mockSession);

            const result = await service.createSession(dto);

            expect(result).toEqual(mockSession);
            expect(sessionRepo.upsertSession).toHaveBeenCalledWith('123', 'en', {});
            expect(redisService.set).toHaveBeenCalled();
        });
    });

    describe('getSession', () => {
        it('should return cached session if available', async () => {
            (redisService.get as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));
            (eventRepo.findBySessionId as jest.Mock).mockResolvedValue({ events: [], total: 0 });

            const result = await service.getSession('123');

            expect(sessionRepo.findBySessionId).not.toHaveBeenCalled(); // Cached!
            expect(result.sessionId).toBe('123');
        });

        it('should fetch from DB and cache if cache miss', async () => {
            (redisService.get as jest.Mock).mockResolvedValue(null);
            (sessionRepo.findBySessionId as jest.Mock).mockResolvedValue(mockSession);
            (eventRepo.findBySessionId as jest.Mock).mockResolvedValue({ events: [], total: 0 });

            await service.getSession('123');

            expect(sessionRepo.findBySessionId).toHaveBeenCalledWith('123');
            expect(redisService.set).toHaveBeenCalled();
        });
    });

    describe('completeSession', () => {
        it('should update status and update cache', async () => {
            (sessionRepo.findBySessionId as jest.Mock).mockResolvedValue({ ...mockSession, status: SessionStatus.ACTIVE });
            (sessionRepo.updateStatus as jest.Mock).mockResolvedValue({ ...mockSession, status: SessionStatus.COMPLETED });

            const result = await service.completeSession('123');

            expect(result.status).toBe(SessionStatus.COMPLETED);
            expect(redisService.set).toHaveBeenCalled();
        });

        it('should throw NotFoundException if session does not exist', async () => {
            (sessionRepo.findBySessionId as jest.Mock).mockResolvedValue(null);

            await expect(service.completeSession('999')).rejects.toThrow(NotFoundException);
        });
    });
});
