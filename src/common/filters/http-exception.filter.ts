import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || exception.message;
        error = resObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Content Negotiation: Periksa apakah klien meminta format RFC 9457 Problem Details
    const acceptHeader = request.headers['accept'] || '';
    const prefersProblemDetails =
      typeof acceptHeader === 'string' &&
      acceptHeader.includes('application/problem+json');

    if (prefersProblemDetails) {
      const typeMap: Record<number, string> = {
        [HttpStatus.BAD_REQUEST]: 'https://api.perpus.ac.id/errors/bad-request',
        [HttpStatus.NOT_FOUND]: 'https://api.perpus.ac.id/errors/not-found',
        [HttpStatus.CONFLICT]: 'https://api.perpus.ac.id/errors/conflict',
        [HttpStatus.PRECONDITION_FAILED]:
          'https://api.perpus.ac.id/errors/precondition-failed',
        [HttpStatus.INTERNAL_SERVER_ERROR]:
          'https://api.perpus.ac.id/errors/internal-server-error',
      };

      const type =
        typeMap[status] || `https://api.perpus.ac.id/errors/${status}`;
      const title = error || 'Error';
      const detail = Array.isArray(message)
        ? message.join('; ')
        : String(message);
      const instance = request.originalUrl || request.url;

      response.setHeader('Content-Type', 'application/problem+json');
      return response.status(status).json({
        type,
        title,
        status,
        detail,
        instance,
      });
    }

    // Default: amplop seragam JSON untuk kompatibilitas backward
    return response.status(status).json({
      statusCode: status,
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
    });
  }
}
