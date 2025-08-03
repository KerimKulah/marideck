import { Controller, Post, Body, HttpCode, Delete, Param, ParseIntPipe, Get, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/common/guards/JwtGuard';
import { RolesGuard } from 'src/auth/common/guards/RolesGuard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class UserController {
  constructor(private readonly userService: UserService) { }

  //CREATE USER
  @Post()
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    return this.userService.create(createUserDto);
  }

  // DELETE USER
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.userService.delete(id);
  }

  // GET ALL USER DTO with pagination and search
  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ): Promise<{
    users: UserDto[];
    usersCount: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    // Convert string query params to numbers if they exist
    const pageNumber = page ? Number(page) : undefined;
    const limitNumber = limit ? Number(limit) : undefined;

    return this.userService.findAll(pageNumber, limitNumber, search);
  }

  //GET USER
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.userService.getUserDto(id);
  }

  //DISABLE USER
  @Put(':id/disable')
  @HttpCode(204)
  async disableUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.userService.disableUser(id);
  }

  //ENABLE USER
  @Put(':id/enable')
  @HttpCode(204)
  async enableUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.userService.enableUser(id);
  }

  //HARD DELETE
  @Delete(':id/hard-delete')
  @HttpCode(204)
  async hardDelete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.userService.hardDelete(id);
  }

  //UPDATE USER
  @Put(':id')
  @HttpCode(200)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<{ message: string }> {
    return this.userService.updateUser(id, updateUserDto);
  }

  //UPDATE USER ROLE
  @Put(':id/role')
  @HttpCode(200)
  async changeUserRole(@Param('id', ParseIntPipe) id: number, @Body() updateUserRoleDto: UpdateUserRoleDto): Promise<{ message: string }> {
    return this.userService.updateUserRole(id, updateUserRoleDto);
  }
}
