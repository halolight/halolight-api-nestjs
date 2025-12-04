import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePermissionDto } from './dto/create-permission.dto';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
export class PermissionsController {
  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieve all available permissions in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          action: { type: 'string' },
          resource: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  async findAll() {
    return [
      {
        id: 'perm_1',
        action: '*',
        resource: '*',
        description: 'All permissions',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'perm_2',
        action: 'users:view',
        resource: 'users',
        description: 'View users',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'perm_3',
        action: 'users:create',
        resource: 'users',
        description: 'Create users',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'perm_4',
        action: 'documents:*',
        resource: 'documents',
        description: 'All document operations',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Retrieve detailed information of a specific permission',
  })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission found',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      action: 'users:view',
      resource: 'users',
      description: 'View users',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create new permission',
    description: 'Create a new permission',
  })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Permission action already exists' })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return {
      id: 'new_perm_id',
      ...createPermissionDto,
      createdAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete permission',
    description: 'Delete a permission',
  })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id') _id: string) {
    return;
  }
}
