import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Repository, Brackets, WhereExpressionBuilder } from 'typeorm';
import { DocumentDto } from './dto/document.dto';
import { DocumentResponseDto, DocumentUserDto, DocumentCustomerDto, DocumentShipDto, DocumentOperationDto } from './dto/document-response.dto';
import { User } from 'src/auth/user/entities/user.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Ship } from 'src/ship/entities/ship.entity';
import { Operation } from 'src/operation/entities/operation.entity';
import { R2StorageService } from './r2-storage.service';
import { Readable } from 'stream';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Ship) private shipRepository: Repository<Ship>,
    @InjectRepository(Operation) private operationRepository: Repository<Operation>,
    private r2StorageService: R2StorageService,
  ) {}

  // Helper method to convert Document entity to DocumentResponseDto
  private toDocumentResponseDto(document: Document): DocumentResponseDto {
    const dto = new DocumentResponseDto();
    dto.id = document.id;
    dto.title = document.title;
    dto.type = document.type;
    dto.documentNumber = document.documentNumber;
    
    // Artık sadece download endpoint URL'i döndür (JWT korumalı)
    dto.fileUrl = `/api/document/${document.id}/download`;
    
    dto.fileName = document.fileName;
    dto.fileSize = document.fileSize;
    dto.mimeType = document.mimeType;
    dto.issueDate = document.issueDate?.toISOString().split('T')[0];
    dto.expiryDate = document.expiryDate?.toISOString().split('T')[0];
    dto.status = document.status;
    dto.notes = document.notes;
    dto.createdAt = document.createdAt.toISOString();
    dto.updatedAt = document.updatedAt.toISOString();

    // Convert uploadedBy user to DocumentUserDto
    if (document.uploadedBy) {
      const uploadedByDto = new DocumentUserDto();
      uploadedByDto.id = document.uploadedBy.id;
      uploadedByDto.firstName = document.uploadedBy.firstName;
      uploadedByDto.lastName = document.uploadedBy.lastName;
      uploadedByDto.email = document.uploadedBy.email;
      uploadedByDto.phone = document.uploadedBy.phone;
      uploadedByDto.photo = document.uploadedBy.photo;
      dto.uploadedBy = uploadedByDto;
    }

    // Convert customer to DocumentCustomerDto
    if (document.customer) {
      const customerDto = new DocumentCustomerDto();
      customerDto.id = document.customer.id;
      customerDto.name = document.customer.name ?? '';
      dto.customer = customerDto;
    }

    // Convert ship to DocumentShipDto
    if (document.ship) {
      const shipDto = new DocumentShipDto();
      shipDto.id = document.ship.id;
      shipDto.name = document.ship.name ?? '';
      shipDto.imoNumber = document.ship.imoNumber ?? '';
      dto.ship = shipDto;
    }

    // Convert operation to DocumentOperationDto
    if (document.operation) {
      const operationDto = new DocumentOperationDto();
      operationDto.id = document.operation.id;
      operationDto.name = document.operation.name ?? '';
      dto.operation = operationDto;
    }

    return dto;
  }

  async findAll(
    page?: number,
    limit?: number,
    search?: string,
    type?: string,
    status?: string,
    customerId?: number,
    shipId?: number,
    operationId?: number,
  ) {
    const queryBuilder = this.documentRepository.createQueryBuilder('document')
      .leftJoin('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.customer', 'customer')
      .leftJoinAndSelect('document.ship', 'ship')
      .leftJoinAndSelect('document.operation', 'operation')
      .addSelect('document')
      .addSelect(['uploadedBy.id', 'uploadedBy.firstName', 'uploadedBy.lastName', 'uploadedBy.email', 'uploadedBy.phone', 'uploadedBy.photo']);

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('document.title ILIKE :search', { search: `%${search}%` })
            .orWhere('document.documentNumber ILIKE :search', { search: `%${search}%` })
            .orWhere('document.notes ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (type) {
      queryBuilder.andWhere('document.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('document.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('document.customer.id = :customerId', { customerId });
    }

    if (shipId) {
      queryBuilder.andWhere('document.ship.id = :shipId', { shipId });
    }

    if (operationId) {
      queryBuilder.andWhere('document.operation.id = :operationId', { operationId });
    }

    queryBuilder.orderBy('document.createdAt', 'DESC');

    if (page != null && limit != null) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const [documents, documentsCount] = await queryBuilder.getManyAndCount();

    const result: { documents: DocumentResponseDto[], documentsCount: number, page?: number, limit?: number, totalPages?: number } = {
      documents: documents.map(document => this.toDocumentResponseDto(document)),
      documentsCount,
    };

    if (page != null && limit != null) {
      result.page = page;
      result.limit = limit;
      result.totalPages = Math.ceil(documentsCount / limit);
    }

    return result;
  }

  private async findEntity(id: number): Promise<Document> {
    const document = await this.documentRepository.createQueryBuilder('document')
      .leftJoin('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.customer', 'customer')
      .leftJoinAndSelect('document.ship', 'ship')
      .leftJoinAndSelect('document.operation', 'operation')
      .addSelect('document')
      .addSelect(['uploadedBy.id', 'uploadedBy.firstName', 'uploadedBy.lastName', 'uploadedBy.email', 'uploadedBy.phone', 'uploadedBy.photo'])
      .where('document.id = :id', { id })
      .getOne();

    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async findOne(id: number): Promise<DocumentResponseDto> {
    const document = await this.findEntity(id);
    return this.toDocumentResponseDto(document);
  }

  async getFileStream(id: number): Promise<{ stream: Readable; contentType: string; contentLength: number; fileName: string }> {
    const document = await this.findEntity(id);
    const fileKey = document.fileUrl; // fileUrl aslında fileKey
    
    const { stream, contentType, contentLength } = await this.r2StorageService.getFileStream(fileKey);
    
    return {
      stream,
      contentType: document.mimeType || contentType,
      contentLength: document.fileSize || contentLength,
      fileName: document.fileName,
    };
  }

  async create(
    documentDto: DocumentDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    // Upload file to R2
    const fileData = await this.r2StorageService.uploadFile(file);

    const document = new Document();
    document.title = documentDto.title;
    document.type = documentDto.type;
    document.documentNumber = documentDto.documentNumber;
    document.fileUrl = fileData.fileKey; // fileKey'i fileUrl field'ında tutuyoruz
    document.fileName = fileData.fileName;
    document.fileSize = fileData.fileSize;
    document.mimeType = fileData.mimeType;
    document.issueDate = documentDto.issueDate;
    document.expiryDate = documentDto.expiryDate;
    document.status = documentDto.status;
    document.notes = documentDto.notes;

    // Set uploadedBy (current user)
    const uploadedByUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!uploadedByUser) throw new NotFoundException('User not found');
    const { password, ...uploadedByWithoutPassword } = uploadedByUser;
    document.uploadedBy = uploadedByWithoutPassword as User;

    // Set optional relationships
    if (documentDto.customerId) {
      const customer = await this.customerRepository.findOne({ where: { id: documentDto.customerId } });
      if (!customer) throw new NotFoundException('Customer not found');
      document.customer = customer;
    }

    if (documentDto.shipId) {
      const ship = await this.shipRepository.findOne({ where: { id: documentDto.shipId } });
      if (!ship) throw new NotFoundException('Ship not found');
      document.ship = ship;
    }

    if (documentDto.operationId) {
      const operation = await this.operationRepository.findOne({ where: { id: documentDto.operationId } });
      if (!operation) throw new NotFoundException('Operation not found');
      document.operation = operation;
    }

    try {
      const savedDocument = await this.documentRepository.save(document);
      return { message: 'Document created successfully', data: this.toDocumentResponseDto(savedDocument) };
    } catch (error) {
      // If save fails, delete the uploaded file
      await this.r2StorageService.deleteFile(fileData.fileKey);
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async update(id: number, documentDto: DocumentDto, file?: Express.Multer.File): Promise<{ message: string, data: DocumentResponseDto }> {
    const document = await this.findEntity(id);

    // Update basic fields
    document.title = documentDto.title;
    document.type = documentDto.type;
    document.documentNumber = documentDto.documentNumber;
    document.issueDate = documentDto.issueDate;
    document.expiryDate = documentDto.expiryDate;
    document.status = documentDto.status;
    document.notes = documentDto.notes;

    // If new file is provided, upload it and delete old one
    if (file) {
      const oldFileKey = document.fileUrl; // fileUrl aslında fileKey
      const fileData = await this.r2StorageService.uploadFile(file);
      document.fileUrl = fileData.fileKey; // fileKey'i fileUrl field'ında tutuyoruz
      document.fileName = fileData.fileName;
      document.fileSize = fileData.fileSize;
      document.mimeType = fileData.mimeType;

      // Delete old file
      try {
        await this.r2StorageService.deleteFile(oldFileKey);
      } catch (error) {
        // Log error but don't fail the update
        console.error('Failed to delete old file:', error);
      }
    }

    // Update optional relationships
    if (documentDto.customerId !== undefined) {
      if (documentDto.customerId === null) {
        document.customer = undefined;
      } else {
        const customer = await this.customerRepository.findOne({ where: { id: documentDto.customerId } });
        if (!customer) throw new NotFoundException('Customer not found');
        document.customer = customer;
      }
    }

    if (documentDto.shipId !== undefined) {
      if (documentDto.shipId === null) {
        document.ship = undefined;
      } else {
        const ship = await this.shipRepository.findOne({ where: { id: documentDto.shipId } });
        if (!ship) throw new NotFoundException('Ship not found');
        document.ship = ship;
      }
    }

    if (documentDto.operationId !== undefined) {
      if (documentDto.operationId === null) {
        document.operation = undefined;
      } else {
        const operation = await this.operationRepository.findOne({ where: { id: documentDto.operationId } });
        if (!operation) throw new NotFoundException('Operation not found');
        document.operation = operation;
      }
    }

    const updated = await this.documentRepository.save(document);
    return { message: 'Document updated successfully', data: this.toDocumentResponseDto(updated) };
  }

  async remove(id: number): Promise<{ message: string }> {
    const document = await this.findEntity(id);

    // Delete file from R2 (fileUrl aslında fileKey)
    // If R2 deletion fails, don't proceed with soft delete
    try {
      await this.r2StorageService.deleteFile(document.fileUrl);
    } catch (error) {
      // If R2 deletion fails, throw error and don't proceed with soft delete
      console.error('Failed to delete file from R2:', error);
      throw new Error(`Failed to delete file from R2: ${error.message}`);
    }

    // Only proceed with soft delete if R2 deletion was successful
    await this.documentRepository.softDelete(id);
    return { message: 'Document deleted successfully' };
  }
}

