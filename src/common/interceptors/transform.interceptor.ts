import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createHash } from 'node:crypto';
import { computeEntityETag } from '../utils/etag.util.js';

export interface ResponseFormat<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((resData) => {
        const statusCode = response.statusCode;
        let message = 'Operasi berhasil';
        let meta = undefined;
        let data = resData;

        if (
          resData &&
          typeof resData === 'object' &&
          'data' in resData &&
          ('meta' in resData || 'message' in resData)
        ) {
          data = resData.data;
          meta = resData.meta;
          if (resData.message) {
            message = resData.message;
          }
        }

        const formatted = {
          statusCode,
          success: true,
          message,
          data,
          ...(meta !== undefined ? { meta } : {}),
        };

        // Siapkan Strong ETag header untuk optimasi caching & conditional requests (RFC 9110)
        try {
          let etag: string;
          if (
            data &&
            typeof data === 'object' &&
            !Array.isArray(data) &&
            'id' in data
          ) {
            etag = computeEntityETag(data as Record<string, any>);
          } else {
            const stringified = JSON.stringify(formatted);
            etag = `"${createHash('sha1').update(stringified).digest('hex')}"`;
          }
          response.setHeader('ETag', etag);
        } catch {
          // ignore if non-serializable
        }

        return formatted;
      }),
    );
  }
}
