import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, CreateEventDto } from './dto';
import { PaginationDto } from '@common/dto/pagination.dto';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    async createSession(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.createSession(createSessionDto);
    }

    @Post(':sessionId/events')
    async addEvent(
        @Param('sessionId') sessionId: string,
        @Body() createEventDto: CreateEventDto,
    ) {
        return this.sessionsService.addEvent(sessionId, createEventDto);
    }

    @Get(':sessionId')
    async getSession(
        @Param('sessionId') sessionId: string,
        @Query() paginationDto: PaginationDto,
    ) {
        return this.sessionsService.getSession(sessionId, paginationDto);
    }

    @Post(':sessionId/complete')
    @HttpCode(HttpStatus.OK)
    async completeSession(@Param('sessionId') sessionId: string) {
        return this.sessionsService.completeSession(sessionId);
    }
}
