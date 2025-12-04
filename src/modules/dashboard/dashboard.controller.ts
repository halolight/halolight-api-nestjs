import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateWidgetDto {
  @ApiProperty({ description: 'Widget name', example: 'Tasks Overview' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Refresh interval in minutes',
    required: false,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  refreshInterval?: number;
}

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved' })
  async getSummary() {
    return { totalUsers: 128, activeProjects: 12, pendingTasks: 47 };
  }

  @Get('widgets')
  @ApiOperation({ summary: 'List dashboard widgets' })
  @ApiResponse({ status: 200, description: 'Widgets retrieved' })
  async listWidgets() {
    return [
      { id: 'widget_tasks', name: 'Tasks Overview', refreshInterval: 5 },
      { id: 'widget_projects', name: 'Projects Snapshot', refreshInterval: 10 },
    ];
  }

  @Post('widgets')
  @ApiOperation({ summary: 'Create widget' })
  @ApiResponse({ status: 201, description: 'Widget created' })
  async createWidget(@Body() createWidgetDto: CreateWidgetDto) {
    return { id: 'widget_new', ...createWidgetDto };
  }

  @Patch('widgets/:id')
  @ApiOperation({ summary: 'Update widget' })
  @ApiParam({ name: 'id', description: 'Widget ID' })
  @ApiResponse({ status: 200, description: 'Widget updated' })
  async updateWidget(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateWidgetDto>,
  ) {
    return { id, ...updateDto, updatedAt: new Date().toISOString() };
  }

  @Delete('widgets/:id')
  @ApiOperation({ summary: 'Delete widget' })
  @ApiParam({ name: 'id', description: 'Widget ID' })
  @ApiResponse({ status: 200, description: 'Widget deleted' })
  async removeWidget(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
