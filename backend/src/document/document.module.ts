import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/user/entities/user.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Ship } from '../ship/entities/ship.entity';
import { Operation } from '../operation/entities/operation.entity';
import { R2StorageService } from './r2-storage.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Document, User, Customer, Ship, Operation])],
  controllers: [DocumentController],
  providers: [DocumentService, R2StorageService, ExceptionFilterImp],
})
export class DocumentModule { }

