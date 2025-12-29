import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventType, IEvent } from '../../common/types';

@Schema({ timestamps: false })
export class ConversationEvent extends Document implements IEvent {
    @Prop({ required: true })
    eventId: string;

    @Prop({ required: true })
    sessionId: string;

    @Prop({ required: true, enum: EventType })
    type: EventType;

    @Prop({ type: Object, required: true })
    payload: Record<string, unknown>;

    @Prop({ required: true })
    timestamp: Date;
}

export const ConversationEventSchema = SchemaFactory.createForClass(ConversationEvent);

ConversationEventSchema.index({ sessionId: 1, eventId: 1 }, { unique: true });
ConversationEventSchema.index({ timestamp: 1 });
