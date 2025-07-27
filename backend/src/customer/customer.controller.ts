import { Controller, HttpCode, Get, Query, Param, Post, Body, Put, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './entities/customer.entity';
import { CustomerDto } from './dto/customer-dto';
import { UseFilters } from '@nestjs/common';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/common/guards/JwtGuard';
import { RolesGuard } from 'src/auth/common/guards/RolesGuard';
import { Roles } from 'src/auth/common/decorators/roles.decorator';

@Controller('customer')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get()
  async findAll(@Query('page', ParseIntPipe) page?: number, @Query('limit', ParseIntPipe) limit?: number, @Query('search') search?: string) {
    return this.customerService.findAll(page, limit, search);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.customerService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() customerDto: CustomerDto) {
    return await this.customerService.create(customerDto);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id', ParseIntPipe) id: number, @Body() customerDto: CustomerDto) {
    return await this.customerService.update(id, customerDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.customerService.delete(id);
  }
}
