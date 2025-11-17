import { Controller, Get, HttpCode, Param, ParseIntPipe, Query, Post, Body, Delete, Put, UseFilters, UseGuards, Optional } from "@nestjs/common";
import { OperationService } from "./operation.service";
import { OperationDto } from "./dto/operation.dto";
import { ExceptionFilterImp } from "../filters/exception-filter";
import { JwtGuard } from "../auth/common/guards/JwtGuard";
import { RolesGuard } from "../auth/common/guards/RolesGuard";
import { Roles } from "../auth/common/decorators/roles.decorator";
import { CurrentUserId } from "../auth/common/decorators/currentuser.decorator";

@Controller('operation')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class OperationController {
  constructor(private readonly operationService: OperationService) { }

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('tab') tab?: 'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed',
    @CurrentUserId() userId?: number
  ) {
    const pageNum = page ? parseInt(page.toString()) : undefined;
    const limitNum = limit ? parseInt(limit.toString()) : undefined;
    return await this.operationService.findAll(pageNum, limitNum, search, tab, userId);
  }

  @Get('stats')
  @HttpCode(200)
  async getStatistics(@CurrentUserId() userId?: number) {
    return await this.operationService.getStatistics(userId);
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
