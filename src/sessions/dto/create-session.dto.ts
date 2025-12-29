import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
    @ApiProperty({ example: 'sess_123' })
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @ApiProperty({ example: 'en-US' })
    @IsString()
    @IsNotEmpty()
    language: string;

    @ApiProperty({ required: false, example: { userId: 'user_456' } })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, unknown>;
}
