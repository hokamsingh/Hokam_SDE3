import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<any>();

    // pino-http attaches the id to the request object
    const requestId = request.id || request.headers['x-request-id'];

    if (requestId) {
      response.setHeader('X-Request-Id', requestId);
    }

    return next.handle();
  }
}
