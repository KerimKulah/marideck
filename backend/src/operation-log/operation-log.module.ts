import { Module } from '@nestjs/common';
import { OperationLogController } from './operation-log.controller';
import { OperationLogService } from './operation-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from './entities/operation-log.entity';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([OperationLog])],
  controllers: [OperationLogController],
  providers: [OperationLogService, ExceptionFilterImp],
})
export class OperationLogModule { }
