import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as Record<string, unknown>;

    let errors: Record<string, string[]> | string = {};

    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      errors = this.formatValidationErrors(exceptionResponse.message);
    } else {
      errors = (exceptionResponse.message as string) || 'Validation failed';
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      error: 'Validation Error',
      message: 'Input validation failed',
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(`Validation Error: ${request.url}`, JSON.stringify(errorResponse));

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    messages.forEach((message) => {
      const parts = message.split(' ');
      const field = parts[0];

      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    });

    return errors;
  }
}
