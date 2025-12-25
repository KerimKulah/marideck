import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { DocumentType } from "../enums/document-type.enum";
import { DocumentStatus } from "../enums/document-status.enum";

export class DocumentDto {
  @IsNotEmpty({ message: 'Başlık zorunlu' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Belge tipi zorunlu' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsNotEmpty({ message: 'Durum zorunlu' })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  // Task'taki gibi isteğe bağlı ilişkilendirmeler
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  shipId?: number;

  @IsOptional()
  @IsNumber()
  operationId?: number;
}

