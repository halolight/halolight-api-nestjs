import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class RolesController {
  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieve all roles with their permissions',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          label: { type: 'string' },
          description: { type: 'string', nullable: true },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                action: { type: 'string' },
                resource: { type: 'string' },
              },
            },
          },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  async findAll() {
    return [
      {
        id: 'role_admin',
        name: 'admin',
        label: 'Administrator',
        description: 'Full system access',
        permissions: [{ id: 'perm_1', action: '*', resource: '*' }],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'role_user',
        name: 'user',
        label: 'User',
        description: 'Basic user permissions',
        permissions: [
          { id: 'perm_2', action: 'users:view', resource: 'users' },
          { id: 'perm_3', action: 'documents:view', resource: 'documents' },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrieve detailed information of a specific role',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        label: { type: 'string' },
        description: { type: 'string', nullable: true },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              action: { type: 'string' },
              resource: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      name: 'admin',
      label: 'Administrator',
      description: 'Full system access',
      permissions: [
        {
          id: 'perm_1',
          action: '*',
          resource: '*',
          description: 'All permissions',
        },
      ],
      users: [
        {
          id: 'user_1',
          name: 'Admin User',
          email: 'admin@halolight.h7ml.cn',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create new role',
    description: 'Create a new role with optional permissions',
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        label: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return {
      id: 'new_role_id',
      name: createRoleDto.name,
      label: createRoleDto.label,
      description: createRoleDto.description,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update role',
    description: 'Update role information',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        label: { type: 'string' },
        description: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return {
      id,
      ...updateRoleDto,
      updatedAt: new Date().toISOString(),
    };
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign permissions to role',
    description: 'Assign or update permissions for a specific role',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              action: { type: 'string' },
              resource: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return {
      id,
      name: 'role_name',
      permissions: assignPermissionsDto.permissionIds.map((permId) => ({
        id: permId,
        action: 'action_example',
        resource: 'resource_example',
      })),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete role',
    description: 'Delete a role',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete role with assigned users',
  })
  async remove(@Param('id') _id: string) {
    return;
  }
}
