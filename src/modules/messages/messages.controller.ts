import {
  Controller,
  Get,
  Post,
  Body,
  Put,
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
import { IsString, IsOptional } from 'class-validator';

class SendMessageDto {
  @ApiProperty({ description: 'Conversation ID', example: 'conv_1' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello team!' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Message type', example: 'text', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

// Mock conversations data
const mockConversations = [
  {
    id: 'conv_1',
    type: 'group',
    name: '研发团队群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=devteam',
    lastMessage: '新版本已经部署到测试环境了',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCount: 3,
    online: true,
    members: [
      { id: 'user_1', name: '系统管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
      { id: 'user_2', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
      { id: 'user_3', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
    ],
  },
  {
    id: 'conv_2',
    type: 'private',
    name: '张经理',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    lastMessage: '确认了，周五正式发布',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unreadCount: 1,
    online: true,
    members: [
      { id: 'user_1', name: '系统管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
      { id: 'user_4', name: '张经理', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager' },
    ],
  },
  {
    id: 'conv_3',
    type: 'private',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    lastMessage: '设计稿已经更新了',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 0,
    online: false,
    members: [
      { id: 'user_1', name: '系统管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
      { id: 'user_3', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
    ],
  },
];

// Mock messages data
const mockMessages: Record<string, any[]> = {
  conv_1: [
    { id: 'msg_1', sender: { id: 'user_1', name: '系统管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' }, content: '大家好，欢迎加入研发团队群！', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
    { id: 'msg_2', sender: { id: 'user_2', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' }, content: '你好！很高兴加入团队 🎉', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: true },
    { id: 'msg_3', sender: { id: 'user_3', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' }, content: '新版本已经部署到测试环境了', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false },
  ],
  conv_2: [
    { id: 'msg_4', sender: { id: 'user_1', name: '系统管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' }, content: '张经理，下周的发布计划确认了吗？', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), read: true },
    { id: 'msg_5', sender: { id: 'user_4', name: '张经理', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager' }, content: '确认了，周五正式发布', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false },
  ],
  conv_3: [
    { id: 'msg_6', sender: { id: 'user_3', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' }, content: '设计稿已经更新了', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
  ],
};

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
export class MessagesController {
  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async getConversations() {
    return mockConversations;
  }

  @Get(':conversationId')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  async getMessages(@Param('conversationId') conversationId: string) {
    return mockMessages[conversationId] || [];
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(@Body() dto: SendMessageDto) {
    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: { id: 'user_1', name: '系统管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
      type: dto.type || 'text',
      content: dto.content,
      createdAt: new Date().toISOString(),
      read: true,
    };
    return newMessage;
  }

  @Put(':conversationId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(@Param('conversationId') conversationId: string) {
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
    return { success: true, conversationId };
  }

  @Delete(':conversationId')
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  async deleteConversation(@Param('conversationId') conversationId: string) {
    return { id: conversationId, deleted: true };
  }
}
