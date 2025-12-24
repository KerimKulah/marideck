import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionFilterImp implements ExceptionFilter {
    private readonly logger = new Logger(ExceptionFilterImp.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Beklenmedik bir sunucu sorunu oluştu';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // HttpException response array olabiliyor
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
                message = exceptionResponse.message;
                // Array ise join et
                if (Array.isArray(message)) {
                    message = message.join(', ');
                }
            } else {
                message = exceptionResponse;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Request ID al (middleware'den gelebilir)
        const requestId = request.headers['x-request-id'] as string ||
            request.headers['x-correlation-id'] as string ||
            undefined;

        // Log exception
        this.logException(exception, request, status, message, requestId);

        // Production'da message sanitize et (500+ hatalar için)
        const isProduction = process.env.NODE_ENV === 'production';
        const clientMessage = status >= 500 && isProduction
            ? 'Bir hata oluştu'
            : message;

        response.status(status).json({
            success: false,
            statusCode: status,
            message: clientMessage,
            path: request.url,
            timestamp: new Date().toISOString(),
            ...(requestId && { requestId }),
        });
    }

    private logException(
        exception: any,
        request: Request,
        status: number,
        message: any,
        requestId?: string
    ): void {
        const { method, url, ip } = request;
        const logContext = `${method} ${url} - ${status}`;
        const logMetadata = requestId ? { requestId, ip } : { ip };

        // Statik dosya isteklerini loglama
        if (this.isStaticAsset(url)) {
            return;
        }

        // 5xx Server Errors - Her zaman logla (error seviyesi)
        if (status >= 500) {
            this.logger.error(
                `${logContext} - ${message} | meta=${JSON.stringify(logMetadata)}`,
                exception instanceof Error ? exception.stack : undefined,
                ExceptionFilterImp.name
            );
            return;
        }

        // 4xx Client Errors - Seçici loglama
        if (status >= 400 && status < 500) {
            // 401 ve 404 normal durumlar, debug seviyesinde logla
            if (status === 401 || status === 404) {
                this.logger.debug(
                    `${logContext} - ${message} | meta=${JSON.stringify(logMetadata)}`
                );
                return;
            }

            // Diğer 4xx hatalar (400, 403, 409, 422 vb.) - warn seviyesi
            this.logger.warn(
                `${logContext} - ${message} | meta=${JSON.stringify(logMetadata)}`
            );
        }
    }

    private isStaticAsset(url: string): boolean {
        const staticAssets = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
        return staticAssets.some(asset => url.includes(asset));
    }
}