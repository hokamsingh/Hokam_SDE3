import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsObject,
  IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@common/types';

export class CreateEventDto {
  @ApiProperty({ example: 'evt_123' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ enum: EventType, example: EventType.USER_SPEECH })
  @IsEnum(EventType)
  @IsNotEmpty()
  type!: EventType;

  @ApiProperty({ example: { transcript: 'hello' } })
  @IsObject()
  @IsNotEmpty()
  payload!: Record<string, unknown>;

  @ApiProperty({ example: '2025-12-25T10:00:00Z' })
  @IsISO8601()
  @IsNotEmpty()
  timestamp!: string;
}
