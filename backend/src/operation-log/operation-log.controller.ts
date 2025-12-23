import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { OperationLogService } from './operation-log.service';
import { OperationLogDto } from './dto/operation-log.dto';
import { CurrentUserId } from 'src/auth/common/decorators/currentuser.decorator';
import { JwtGuard } from '../auth/common/guards/JwtGuard';
import { RolesGuard } from '../auth/common/guards/RolesGuard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { UserService } from 'src/auth/user/user.service';

@Controller('operation-log')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService, private readonly userService: UserService) { }

  // Kullanıcı loglarını oluşturur
  @Post()
  async create(@Body() operationLogDto: OperationLogDto, @CurrentUserId() userId: number) {
    operationLogDto.createdById = userId;
    return this.operationLogService.create(operationLogDto);
  }

  // Kişiler adece kendi logunu silebilir 
  @Delete(':id')
  async remove(@CurrentUserId() userId: number, @Param('id') logId: number): Promise<void> {
    const log = await this.operationLogService.findOne(logId);
    if (!log) throw new NotFoundException('Log not found');

    // Eğer roles admin yok ise currentuserid loguserid kontrolu yapcaz
    const currentUser = await this.userService.getUserDto(userId);
    const isAdmin = currentUser.roles?.some(role => role.name === 'admin');

    if (!isAdmin && log.createdBy.id !== userId) throw new UnauthorizedException('Bu log kaydını silmeye yetkiniz yok.');

    await this.operationLogService.remove(logId);
  }
}
