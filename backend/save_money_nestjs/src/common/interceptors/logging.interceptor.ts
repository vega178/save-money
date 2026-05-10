import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * LoggingInterceptor
 *
 * Logs every incoming request and its response time.
 * Runs before the route handler and after the response is sent.
 *
 * Format:
 *   → [GET] /api/users
 *   ← [GET] /api/users 200 — 12ms
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req    = context.switchToHttp().getRequest<Request>();
    const res    = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const start  = Date.now();

    this.logger.log(`→ [${method}] ${url}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`← [${method}] ${url} ${res.statusCode} — ${ms}ms`);
      }),
    );
  }
}
