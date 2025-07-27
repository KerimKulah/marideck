import { Controller, Get, HttpCode, Param, ParseIntPipe, Query, Post, Body, Delete, Put, UseFilters, UseGuards } from "@nestjs/common";
import { OperationService } from "./operation.service";
import { OperationDto } from "./dto/operation.dto";
import { ExceptionFilterImp } from "../filters/exception-filter";
import { JwtGuard } from "../auth/common/guards/JwtGuard";
import { RolesGuard } from "../auth/common/guards/RolesGuard";
import { Roles } from "../auth/common/decorators/roles.decorator";

@Controller('operation')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('search') search?: string
  ) {
    return await this.operationService.findAll(page, limit, search);
  }
 
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.operationService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() operationDto: OperationDto) {
    return await this.operationService.create(operationDto);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id', ParseIntPipe) id: number, @Body() operationDto: OperationDto) {
    return await this.operationService.update(id, operationDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.operationService.remove(id);
  }

}
