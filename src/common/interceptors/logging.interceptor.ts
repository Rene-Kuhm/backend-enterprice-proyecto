import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const now = Date.now();

    this.logger.log({
      message: 'Incoming Request',
      method,
      url,
      body: this.sanitizeBody(body),
      userId: user?.id,
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - now;

          this.logger.log({
            message: 'Request Completed',
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userId: user?.id,
          });
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error({
            message: 'Request Failed',
            method,
            url,
            error: error.message,
            duration: `${duration}ms`,
            userId: user?.id,
          });
        },
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
