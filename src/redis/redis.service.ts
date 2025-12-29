import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import CircuitBreaker from 'opossum';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;
    private breaker: CircuitBreaker;
    private readonly logger = new Logger(RedisService.name);

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        const breakerOptions = {
            timeout: 3000, // If action takes longer than 3s, trigger failure
            errorThresholdPercentage: 50, // When 50% of requests fail, trip breaker
            resetTimeout: 10000, // After 10s, try again (half-open)
        };

        this.breaker = new CircuitBreaker(async (action: () => Promise<any>) => action(), breakerOptions);
        this.breaker.fallback(() => null); // Default fallback: return null (Cache Miss)

        this.breaker.on('open', () => this.logger.warn('Redis Circuit Breaker OPEN: Caching disabled'));
        this.breaker.on('close', () => this.logger.log('Redis Circuit Breaker CLOSED: Caching enabled'));
    }

    async get(key: string): Promise<string | null> {
        // Wrap the call in the breaker
        return this.breaker.fire(() => this.client.get(key));
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        // Fire and forget, catch errors to avoid crashing main flow
        try {
            await this.breaker.fire(async () => {
                if (ttl) {
                    await this.client.setex(key, ttl, value);
                } else {
                    await this.client.set(key, value);
                }
            });
        } catch (error) {
            this.logger.error(`Failed to set cache key ${key}: ${error.message}`);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.breaker.fire(() => this.client.del(key));
        } catch (error) {
            this.logger.error(`Failed to delete cache key ${key}: ${error.message}`);
        }
    }

    async ping(): Promise<string> {
        return this.client.ping();
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}
