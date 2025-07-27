import { Module } from '@nestjs/common';
import { OperationService } from './operation.service';
import { OperationController } from './operation.controller';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operation } from './entities/operation.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Operation])],
  controllers: [OperationController],
  providers: [OperationService, ExceptionFilterImp],
})
export class OperationModule {}
