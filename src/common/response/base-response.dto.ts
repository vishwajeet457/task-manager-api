import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data: T | null;

  @ApiProperty({
    required: false,
    type: Object,
    example: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { field: 'email' },
    },
  })
  error: {
    message: string;
    code?: string | null;
    details?: any;
  } | null;

  constructor(params: {
    success: boolean;
    message: string;
    data?: T | null;
    error?: {
      message: string;
      code?: string | null;
      details?: any;
    } | null;
  }) {
    this.success = params.success;
    this.message = params.message;
    this.data = params.data ?? null;
    this.error = params.error ?? null;
  }
}
