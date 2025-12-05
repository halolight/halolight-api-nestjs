import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
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
import { IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';

class CreateEventDto {
  @ApiProperty({ description: 'Event title', example: 'Sprint Planning' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start time', example: '2024-08-01T10:00:00Z' })
  @IsDateString()
  start: string;

  @ApiProperty({ description: 'End time' })
  @IsDateString()
  end: string;

  @ApiProperty({ description: 'Event type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'All day event', required: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

// Mock calendar events
interface Attendee {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  type: string;
  color: string;
  location?: string;
  allDay: boolean;
  attendees: Attendee[];
  reminders: string[];
  createdAt: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: 'event_1',
    title: '项目周会',
    description: '每周一上午的项目进度同步会议',
    start: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    type: 'meeting',
    color: '#6366f1',
    location: '会议室A',
    allDay: false,
    attendees: [
      {
        id: 'user_1',
        name: '系统管理员',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        status: 'accepted',
      },
      {
        id: 'user_2',
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        status: 'pending',
      },
    ],
    reminders: ['30m', '1h'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event_2',
    title: '代码评审',
    description: '评审用户认证模块代码',
    start: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    type: 'meeting',
    color: '#8b5cf6',
    location: '线上会议',
    allDay: false,
    attendees: [
      {
        id: 'user_2',
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        status: 'accepted',
      },
    ],
    reminders: ['1h'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event_3',
    title: '产品发布',
    description: 'HaloLight v1.0 正式发布',
    start: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    type: 'task',
    color: '#ec4899',
    allDay: true,
    attendees: [],
    reminders: [],
    createdAt: new Date().toISOString(),
  },
];

@ApiTags('Calendar')
@ApiBearerAuth('JWT-auth')
@Controller('calendar/events')
export class CalendarController {
  @Get()
  @ApiOperation({ summary: 'List events' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  async findAll(@Query('start') start?: string, @Query('end') end?: string) {
    let events = [...mockEvents];
    if (start) {
      events = events.filter((e) => new Date(e.start) >= new Date(start));
    }
    if (end) {
      events = events.filter((e) => new Date(e.end) <= new Date(end));
    }
    return events;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event detail' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  async findOne(@Param('id') id: string) {
    const event = mockEvents.find((e) => e.id === id);
    return (
      event || {
        id,
        title: 'Unknown Event',
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      }
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(@Body() dto: CreateEventDto) {
    const newEvent = {
      id: `event_${Date.now()}`,
      ...dto,
      attendees: [],
      reminders: [],
      createdAt: new Date().toISOString(),
    };
    return newEvent;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateEventDto>) {
    const event = mockEvents.find((e) => e.id === id);
    if (event) {
      Object.assign(event, dto);
    }
    return { id, ...dto, updatedAt: new Date().toISOString() };
  }

  @Post(':id/attendees')
  @ApiOperation({ summary: 'Add attendees to event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Attendees added' })
  async addAttendees(
    @Param('id') id: string,
    @Body() body: { attendeeIds: string[] },
  ) {
    const event = mockEvents.find((e) => e.id === id);
    const newAttendees = body.attendeeIds.map((aid) => ({
      id: aid,
      name: `User ${aid}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${aid}`,
      status: 'pending',
    }));
    if (event) {
      event.attendees.push(...newAttendees);
    }
    return event || { id, attendees: newAttendees };
  }

  @Delete(':id/attendees/:attendeeId')
  @ApiOperation({ summary: 'Remove attendee from event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiParam({ name: 'attendeeId', description: 'Attendee ID' })
  @ApiResponse({ status: 200, description: 'Attendee removed' })
  async removeAttendee(
    @Param('id') id: string,
    @Param('attendeeId') attendeeId: string,
  ) {
    const event = mockEvents.find((e) => e.id === id);
    if (event) {
      event.attendees = event.attendees.filter((a) => a.id !== attendeeId);
    }
    return event || { id, attendees: [] };
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event rescheduled' })
  async reschedule(
    @Param('id') id: string,
    @Body() body: { start: string; end: string },
  ) {
    const event = mockEvents.find((e) => e.id === id);
    if (event) {
      event.start = body.start;
      event.end = body.end;
    }
    return event || { id, start: body.start, end: body.end };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }

  @Post('batch-delete')
  @ApiOperation({ summary: 'Batch delete events' })
  @ApiResponse({ status: 200, description: 'Events deleted' })
  async batchDelete(@Body() body: { ids: string[] }) {
    return { success: true, deleted: body.ids.length };
  }
}
