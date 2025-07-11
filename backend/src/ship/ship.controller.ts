import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, UseFilters, UseGuards, Query } from '@nestjs/common';
import { ShipService } from './ship.service';
import { CreateShipDto } from './dto/create-ship.dto';
import { UpdateShipDto } from './dto/update-ship.dto';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { JwtGuard } from '../auth/common/guards/JwtGuard';
import { RolesGuard } from '../auth/common/guards/RolesGuard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Ship } from './entities/ship.entity';
import { Put } from '@nestjs/common';

@Controller('ship')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
@ApiBearerAuth('jwt')
export class ShipController {
  constructor(private readonly shipService: ShipService) { }

  @Post()
  @HttpCode(201)
  async create(@Body() createShipDto: CreateShipDto): Promise<{ message: string, data: Ship }> {
    return await this.shipService.create(createShipDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string): Promise<Ship[]> {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return await this.shipService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Ship> {
    return await this.shipService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateShipDto: UpdateShipDto): Promise<{ message: string, data: Ship }> {
    return await this.shipService.update(id, updateShipDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.shipService.remove(id);
  }

  @Put(':id/restore')
  @HttpCode(200)
  async restore(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.shipService.restore(id);
  }
}
