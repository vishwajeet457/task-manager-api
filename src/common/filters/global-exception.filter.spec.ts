import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
    };
  });

  const createMockArgumentsHost = (): ArgumentsHost => ({
    switchToHttp: (): HttpArgumentsHost => ({
      getRequest: jest.fn(),
      getResponse: () => mockResponse as any,
      getNext: jest.fn(),
    }),
  } as unknown as ArgumentsHost);

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong');

    filter.catch(error, createMockArgumentsHost());

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Something went wrong',
      data: null,
      error: {
        message: 'Something went wrong',
        code: null,
        details: null,
      },
    });
  });
});
