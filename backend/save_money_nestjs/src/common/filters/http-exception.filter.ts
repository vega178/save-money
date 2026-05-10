import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

/**
 * GlobalHttpExceptionFilter
 *
 * Catches every thrown HttpException (NotFoundException, ConflictException,
 * UnauthorizedException, ForbiddenException, etc.) and returns a consistent
 * JSON error envelope so clients never receive raw NestJS error objects.
 *
 * Shape:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "User with id 1 not found",
 *   "timestamp": "2026-05-09T...",
 *   "path": "/api/users/1"
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // NestJS can return either a string or a class-validator error object
    const message =
      typeof exceptionResponse === 'object' && 'message' in (exceptionResponse as object)
        ? (exceptionResponse as any).message
        : exception.message;

    const body: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(`${status} ${request.method} ${request.url} — ${JSON.stringify(message)}`);
    response.status(status).json(body);
  }
}
