import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SessionStatus {
    INITIATED = 'initiated',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Schema({ timestamps: true })
export class ConversationSession extends Document {
    @Prop({ required: true, unique: true, index: true })
    sessionId: string;

    @Prop({ required: true, enum: SessionStatus, default: SessionStatus.INITIATED })
    status: SessionStatus;

    @Prop({ required: true })
    language: string;

    @Prop({ required: true })
    startedAt: Date;

    @Prop({ default: null })
    endedAt: Date;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, unknown>;
}

export const ConversationSessionSchema = SchemaFactory.createForClass(ConversationSession);

ConversationSessionSchema.index({ sessionId: 1 }, { unique: true });
