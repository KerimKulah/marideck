import { Module } from '@nestjs/common';
import { ShipService } from './ship.service';
import { ShipController } from './ship.controller';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ship } from './entities/ship.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Ship])],
  controllers: [ShipController],
  providers: [ShipService, ExceptionFilterImp],
})
export class ShipModule {}
  