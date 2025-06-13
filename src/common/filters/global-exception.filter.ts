import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseHelper } from '../response/response.helper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';
    let details: any = null;
    let code: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const r = res as any;
        // Validation errors often return { message: [...], error: 'Bad Request' }
        if (Array.isArray(r.message)) {
          errorMessage = 'Validation failed';
          details = r.message;
        } else {
          errorMessage = r.message || errorMessage;
        }
        code = r.code || null;
      } else if (typeof res === 'string') {
        errorMessage = res;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    response.status(status).json(
      ResponseHelper.error(errorMessage, { message: errorMessage, details }, code),
    );
  }
}
