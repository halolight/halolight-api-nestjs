import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';

class CreateNotificationDto {
  @ApiProperty({ description: 'Notification type', example: 'TASK_ASSIGNMENT' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Recipient user ID' })
  @IsString()
  recipientId: string;
}

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Notifications retrieved' })
  async findAll(@Query('unreadOnly') unreadOnly?: boolean) {
    return [
      {
        id: 'notif_1',
        type: 'TASK_ASSIGNMENT',
        message: 'You were assigned a task',
        read: false,
      },
      {
        id: 'notif_2',
        type: 'SYSTEM',
        message: 'System maintenance scheduled',
        read: !unreadOnly,
      },
    ];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification detail' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      type: 'TASK_ASSIGNMENT',
      message: 'You were assigned a task',
      read: false,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return { id: 'notif_new', ...createNotificationDto, read: false };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification updated' })
  async update(@Param('id') id: string, @Body() updateDto: { read?: boolean }) {
    return {
      id,
      read: updateDto.read ?? false,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
