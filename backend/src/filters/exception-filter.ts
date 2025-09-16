import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionFilterImp implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Beklenmedik bir sunucu sorunu oluştu';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();

            // If the response is an object with message and statusCode, use it directly
            if (typeof response === 'object' && response !== null && 'message' in response) {
                message = response.message;
            } else {
                message = response;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        console.error(`[ExceptionFilter] ${request.method} ${request.url}`, exception);

        response.status(status).json({
            success: false,
            statusCode: status,
            message: message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}