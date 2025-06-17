import { BaseResponse } from './base-response.dto';

export class ResponseHelper {
  static success<T>(message: string, data?: T): BaseResponse<T> {
    return new BaseResponse<T>({
      success: true,
      message,
      data: data ?? null,
      error: null,
    });
  }

  static error(message: string, error?: any, code?: string|null): BaseResponse<null> {
    return new BaseResponse({
      success: false,
      message,
      data: null,
      error: {
        message: error?.message || error || 'Unexpected error',
        code: code ?? null,
        details: error?.details ?? null,
      },
    });
  }
}
