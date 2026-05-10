import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * ResponseInterceptor
 *
 * Wraps every successful controller response in a standard envelope so all
 * API clients receive a uniform structure regardless of the endpoint.
 *
 * Shape:
 * {
 *   "success": true,
 *   "data": <original response>,
 *   "timestamp": "2026-05-09T..."
 * }
 *
 * NOTE: 204 No Content responses are excluded since they carry no body.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    // Skip wrapping for 204 No Content
    if (statusCode === 204) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
