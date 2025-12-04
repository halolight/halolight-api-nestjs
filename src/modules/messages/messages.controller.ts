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

class CreateMessageDto {
  @ApiProperty({ description: 'Conversation ID', example: 'conv_1' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello team!' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Sender user ID', example: 'user_1' })
  @IsString()
  senderId: string;
}

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
export class MessagesController {
  @Get()
  @ApiOperation({ summary: 'List messages' })
  @ApiQuery({ name: 'conversationId', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  async findAll(
    @Query('conversationId') conversationId: string,
    @Query('page') _page?: number,
  ) {
    return [
      {
        id: 'msg_1',
        content: 'Hello team!',
        senderId: 'user_1',
        conversationId,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message detail' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      content: 'Hello team!',
      senderId: 'user_1',
      conversationId: 'conv_1',
      createdAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message created' })
  async create(@Body() createMessageDto: CreateMessageDto) {
    return { id: 'msg_new', ...createMessageDto };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: { content?: string },
  ) {
    return {
      id,
      content: updateDto.content || 'Hello team!',
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
