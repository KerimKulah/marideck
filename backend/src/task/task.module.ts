import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/user/entities/user.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Ship } from '../ship/entities/ship.entity';
import { Operation } from '../operation/entities/operation.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Task, User, Customer, Ship, Operation])],
  controllers: [TaskController],
  providers: [TaskService, ExceptionFilterImp],
})
export class TaskModule { }

