import { IsNotEmpty, IsString, IsEnum, IsObject, IsDateString } from 'class-validator';
import { EventType } from '@common/types';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsEnum(EventType)
    @IsNotEmpty()
    type: EventType;

    @IsObject()
    @IsNotEmpty()
    payload: Record<string, unknown>;

    @IsDateString()
    @IsNotEmpty()
    timestamp: string;
}
