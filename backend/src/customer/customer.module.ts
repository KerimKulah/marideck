import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Operation } from '../operation/entities/operation.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Customer, Operation])],
  controllers: [CustomerController],
  providers: [CustomerService, ExceptionFilterImp],
})

export class CustomerModule { }
