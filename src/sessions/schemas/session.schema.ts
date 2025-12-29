import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ISession, SessionStatus } from '@common/types';

@Schema({ timestamps: true })
export class ConversationSession extends Document implements ISession {
  @Prop({ required: true, unique: true })
  sessionId!: string;

  @Prop({
    required: true,
    type: String,
    enum: SessionStatus,
    default: SessionStatus.INITIATED,
  })
  status!: SessionStatus;

  @Prop({ required: true })
  language!: string;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop({ default: null })
  endedAt!: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const ConversationSessionSchema =
  SchemaFactory.createForClass(ConversationSession);
