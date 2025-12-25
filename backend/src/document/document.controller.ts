import { Controller, Get, HttpCode, Param, ParseIntPipe, Query, Post, Body, Delete, Put, UseFilters, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Res, StreamableFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { DocumentService } from "./document.service";
import { DocumentDto } from "./dto/document.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { ExceptionFilterImp } from "../filters/exception-filter";
import { JwtGuard } from "../auth/common/guards/JwtGuard";
import { RolesGuard } from "../auth/common/guards/RolesGuard";
import { Roles } from "../auth/common/decorators/roles.decorator";
import { CurrentUserId } from "../auth/common/decorators/currentuser.decorator";

@Controller('document')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('shipId') shipId?: string,
    @Query('operationId') operationId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
    const shipIdNum = shipId ? parseInt(shipId, 10) : undefined;
    const operationIdNum = operationId ? parseInt(operationId, 10) : undefined;
    return await this.documentService.findAll(pageNum, limitNum, search, type, status, customerIdNum, shipIdNum, operationIdNum);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, contentType, contentLength, fileName } = await this.documentService.getFileStream(id);
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': contentLength,
    });

    return new StreamableFile(stream);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DocumentResponseDto> {
    return await this.documentService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() documentDto: DocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|image\/(jpeg|jpg|png|gif|webp)|text\/(plain|html|csv))/i }),
        ],
      }),
    ) file: Express.Multer.File,
    @CurrentUserId() userId: number,
  ): Promise<{ message: string, data: DocumentResponseDto }> {
    return await this.documentService.create(documentDto, file, userId);
  }

  @Put(':id')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() documentDto: DocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|image\/(jpeg|jpg|png|gif|webp)|text\/(plain|html|csv))/i }),
        ],
      }),
    ) file?: Express.Multer.File,
  ): Promise<{ message: string, data: DocumentResponseDto }> {
    return await this.documentService.update(id, documentDto, file);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.documentService.remove(id);
  }
}

