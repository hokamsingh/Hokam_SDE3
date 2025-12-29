import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
    @ApiProperty({ required: false, default: 0, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiProperty({ required: false, default: 50, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 50;
}
