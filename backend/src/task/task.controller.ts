import { Controller, Get, HttpCode, Param, ParseIntPipe, Query, Post, Body, Delete, Put, UseFilters, UseGuards } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskDto } from "./dto/task.dto";
import { ExceptionFilterImp } from "../filters/exception-filter";
import { JwtGuard } from "../auth/common/guards/JwtGuard";
import { RolesGuard } from "../auth/common/guards/RolesGuard";
import { Roles } from "../auth/common/decorators/roles.decorator";

@Controller('task')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('tab') tab?: 'active' | 'completed' | 'all'
  ) {
    const pageNum = page ? parseInt(page.toString()) : undefined;
    const limitNum = limit ? parseInt(limit.toString()) : undefined;
    return await this.taskService.findAll(pageNum, limitNum, search, tab);
  }

  @Get('stats')
  @HttpCode(200)
  async getStatistics() {
    return await this.taskService.getStatistics();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.taskService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() taskDto: TaskDto) {
    return await this.taskService.create(taskDto);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id', ParseIntPipe) id: number, @Body() taskDto: TaskDto) {
    return await this.taskService.update(id, taskDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.taskService.remove(id);
  }
}

