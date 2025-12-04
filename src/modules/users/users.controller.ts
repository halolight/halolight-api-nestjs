import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve paginated list of users with optional filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string' },
              name: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') _search?: string,
    @Query('status') _status?: string,
  ) {
    return {
      data: [
        {
          id: 'user_1',
          email: 'user1@example.com',
          username: 'user1',
          name: 'User One',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user_2',
          email: 'user2@example.com',
          username: 'user2',
          name: 'User Two',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ],
      meta: {
        total: 2,
        page: page || 1,
        limit: limit || 10,
        totalPages: 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information of a specific user',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'clx1234567890' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string', nullable: true },
        status: { type: 'string' },
        department: { type: 'string', nullable: true },
        position: { type: 'string', nullable: true },
        bio: { type: 'string', nullable: true },
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      email: 'user@example.com',
      username: 'username',
      name: 'User Name',
      avatar: null,
      status: 'ACTIVE',
      department: 'Engineering',
      position: 'Developer',
      bio: 'Software engineer',
      roles: [
        {
          id: 'role_1',
          name: 'user',
          label: 'User',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      id: 'new_user_id',
      email: createUserDto.email,
      username: createUserDto.username,
      name: createUserDto.name,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        name: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return {
      id,
      ...updateUserDto,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft delete or permanently remove a user',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') _id: string) {
    return;
  }
}
