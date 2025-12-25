import { Controller, Get, HttpCode, Param, ParseIntPipe, Query, Post, Body, Delete, Put, UseFilters, UseGuards, Req } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskDto } from "./dto/task.dto";
import { TaskResponseDto } from "./dto/task-response.dto";
import { ExceptionFilterImp } from "../filters/exception-filter";
import { JwtGuard } from "../auth/common/guards/JwtGuard";
import { RolesGuard } from "../auth/common/guards/RolesGuard";
import { Roles } from "../auth/common/decorators/roles.decorator";
import { CurrentUserId } from "../auth/common/decorators/currentuser.decorator";

@Controller('task')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Get()
  @HttpCode(200)
  async findAll(
    @CurrentUserId() userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tab') tab?: 'my-tasks-all' | 'my-tasks-pending' | 'my-tasks-in_progress' | 'my-tasks-completed' | 'all-tasks-all' | 'all-pending' | 'all-in_progress' | 'all-completed'
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return await this.taskService.findAll(userId, pageNum, limitNum, search, tab);
  }

  @Get('stats')
  @HttpCode(200)
  async getStatistics(@CurrentUserId() userId: number) {
    return await this.taskService.getStatistics(userId);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    return await this.taskService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() taskDto: TaskDto, @CurrentUserId() userId: number): Promise<{ message: string, data: TaskResponseDto }> {
    return await this.taskService.create(taskDto, userId);
  }

  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() taskDto: TaskDto,
    @CurrentUserId() userId: number,
    @Req() req: any
  ): Promise<{ message: string, data: TaskResponseDto }> {
    const userRoles = req.user?.roles?.map((role: any) => role.name) || [];
    return await this.taskService.update(id, taskDto, userId, userRoles);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @Req() req: any
  ) {
    const userRoles = req.user?.roles?.map((role: any) => role.name) || [];
    return await this.taskService.remove(id, userId, userRoles);
  }
}

