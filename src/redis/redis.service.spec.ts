import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('RedisService', () => {
    let service: RedisService;
    let mockRedisClient: jest.Mocked<Redis>;

    beforeEach(async () => {
        mockRedisClient = new Redis() as jest.Mocked<Redis>;
        (Redis as unknown as jest.Mock).mockReturnValue(mockRedisClient);

        const module: TestingModule = await Test.createTestingModule({
            providers: [RedisService],
        }).compile();

        service = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('get', () => {
        it('should return value from redis when successful', async () => {
            mockRedisClient.get.mockResolvedValue('cached-value');

            const result = await service.get('test-key');

            expect(result).toBe('cached-value');
            expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
        });

        it('should return null (fallback) when redis fails', async () => {
            mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

            const result = await service.get('test-key');

            expect(result).toBeNull();
            expect(mockRedisClient.get).toHaveBeenCalled();
        });
    });

    describe('set', () => {
        it('should set value in redis when successful', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            await service.set('test-key', 'value', 3600);

            expect(mockRedisClient.setex).toHaveBeenCalledWith('test-key', 3600, 'value');
        });

        it('should not throw error when redis fails during set', async () => {
            mockRedisClient.set.mockRejectedValue(new Error('Redis set failed'));

            await expect(service.set('test-key', 'value')).resolves.not.toThrow();
        });
    });
});
