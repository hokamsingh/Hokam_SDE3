export enum SessionStatus {
    INITIATED = 'initiated',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum EventType {
    USER_SPEECH = 'user_speech',
    BOT_SPEECH = 'bot_speech',
    SYSTEM = 'system',
}

export interface ISession {
    sessionId: string;
    status: SessionStatus;
    language: string;
    startedAt: Date;
    endedAt: Date | null;
    metadata: Record<string, unknown>;
}

export interface IEvent {
    eventId: string;
    sessionId: string;
    type: EventType;
    payload: Record<string, unknown>;
    timestamp: Date;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
