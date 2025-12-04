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
import { IsDateString, IsOptional, IsString } from 'class-validator';

class CreateEventDto {
  @ApiProperty({ description: 'Event title', example: 'Sprint Planning' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Start time', example: '2024-08-01T10:00:00Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ description: 'End time', required: false })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

@ApiTags('Calendar')
@ApiBearerAuth('JWT-auth')
@Controller('calendar/events')
export class CalendarController {
  @Get()
  @ApiOperation({ summary: 'List events' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  async findAll(@Query('from') from?: string, @Query('to') _to?: string) {
    return [
      {
        id: 'event_1',
        title: 'Sprint Planning',
        startAt: from || new Date().toISOString(),
        location: 'Meeting Room A',
      },
    ];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event detail' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  async findOne(@Param('id') id: string) {
    return { id, title: 'Sprint Planning', startAt: new Date().toISOString() };
  }

  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(@Body() createEventDto: CreateEventDto) {
    return { id: 'event_new', ...createEventDto };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: Partial<CreateEventDto>,
  ) {
    return { id, ...updateEventDto, updatedAt: new Date().toISOString() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
