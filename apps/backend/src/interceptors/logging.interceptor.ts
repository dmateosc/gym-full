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
    
    this.logger.log(
      `📥 ${method} ${url} - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const contentLength = response.get('Content-Length') || 0;
          
          this.logger.log(
            `📤 ${method} ${url} - ${response.statusCode} - ${contentLength}bytes - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          
          this.logger.error(
            `❌ ${method} ${url} - ${error.status || 500} - ${error.message} - ${duration}ms`,
          );
        },
      }),
    );
  }
}
