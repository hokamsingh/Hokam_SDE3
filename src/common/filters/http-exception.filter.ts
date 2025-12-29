import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '@common/types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || 'Internal server error';

    let errorCode =
      (exceptionResponse as any)?.errorCode || ErrorCode.INTERNAL_SERVER_ERROR;

    if (!(exceptionResponse as any)?.errorCode) {
      if (status === HttpStatus.NOT_FOUND)
        errorCode = ErrorCode.SESSION_NOT_FOUND;
      if (status === HttpStatus.BAD_REQUEST)
        errorCode = ErrorCode.INVALID_INPUT;
      if (status === HttpStatus.TOO_MANY_REQUESTS)
        errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
