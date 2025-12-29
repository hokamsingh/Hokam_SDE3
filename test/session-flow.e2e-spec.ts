import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { CorrelationIdInterceptor } from '../src/common/interceptors/correlation-id.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Session Flow (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: '1',
        });
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalFilters(new AllExceptionsFilter());
        app.useGlobalInterceptors(new TransformInterceptor(), new CorrelationIdInterceptor());

        await app.init();
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    it('should complete a full session lifecycle', async () => {
        const sessionId = `e2e_sess_${Date.now()}`;

        // 1. Create Session
        const createRes = await request(app.getHttpServer())
            .post('/v1/sessions')
            .send({
                sessionId,
                language: 'en-US',
                metadata: { e2e: true }
            });

        expect(createRes.status).toBe(201);
        expect(createRes.body.success).toBe(true);

        // Check Correlation ID Header
        const rid = createRes.header['x-request-id'] || createRes.header['X-Request-Id'];
        expect(rid).toBeDefined();

        // 2. Add Event
        const eventRes = await request(app.getHttpServer())
            .post(`/v1/sessions/${sessionId}/events`)
            .send({
                eventId: `evt_${Date.now()}`,
                type: 'user_speech',
                payload: { text: 'Hello from E2E' },
                timestamp: new Date().toISOString(),
            });

        expect(eventRes.status).toBe(201);
        expect(eventRes.body.success).toBe(true);

        // 3. Get Session (Verify event is there)
        const getRes = await request(app.getHttpServer())
            .get(`/v1/sessions/${sessionId}`)
            .query({ limit: 10 });

        expect(getRes.status).toBe(200);
        expect(getRes.body.success).toBe(true);
        expect(getRes.body.data.sessionId).toBe(sessionId);
        expect(getRes.body.data.events).toHaveLength(1);

        // 4. Complete Session (Note: Controller uses @HttpCode(OK))
        const completeRes = await request(app.getHttpServer())
            .post(`/v1/sessions/${sessionId}/complete`);

        expect(completeRes.status).toBe(200);
        expect(completeRes.body.success).toBe(true);
        expect(completeRes.body.data.status).toBe('completed');
    }, 20000);

    it('should return 404 for non-existent session with standardized error code', async () => {
        const res = await request(app.getHttpServer())
            .get('/v1/sessions/non-existent-id');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.errorCode).toBe('SESSION_NOT_FOUND');
    });
});
