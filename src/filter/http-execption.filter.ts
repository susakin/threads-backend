import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

HttpException;
export class HttpExecptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const msg = exception.message ? exception.message : 'Internal Server Error';
    console.log(exception, 'exception');
    response.status(status).json({
      code: status,
      msg,
    });
  }
}
