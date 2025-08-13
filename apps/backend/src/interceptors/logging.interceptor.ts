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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    const startTime = Date.now();

    this.logger.log(`📥 ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const contentLength = response.get('Content-Length') || 0;

          this.logger.log(
            `📤 ${method} ${url} - ${response.statusCode} - ${contentLength}bytes - ${duration}ms`,
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          let status = 500;
          let message = 'Unknown error';

          if (error && typeof error === 'object') {
            status = (error as { status?: number }).status || 500;
            message =
              (error as { message?: string }).message || 'Unknown error';
          }

          this.logger.error(
            `❌ ${method} ${url} - ${status} - ${message} - ${duration}ms`,
          );
        },
      }),
    );
  }
}
