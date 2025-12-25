import { DocumentType } from '../enums/document-type.enum';
import { DocumentStatus } from '../enums/document-status.enum';

export class DocumentUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
}

export class DocumentCustomerDto {
  id: number;
  name: string;
}

export class DocumentShipDto {
  id: number;
  name: string;
  imoNumber?: string;
}

export class DocumentOperationDto {
  id: number;
  name: string;
}

export class DocumentResponseDto {
  id: number;
  title: string;
  type: DocumentType;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  customer?: DocumentCustomerDto;
  ship?: DocumentShipDto;
  operation?: DocumentOperationDto;
  issueDate?: string;
  expiryDate?: string;
  status: DocumentStatus;
  notes?: string;
  uploadedBy: DocumentUserDto;
  createdAt: string;
  updatedAt: string;
}

