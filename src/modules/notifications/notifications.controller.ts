import { Controller, Get, Put, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

// Mock notifications data
const mockNotifications = [
  {
    id: 'notif_1',
    type: 'system',
    title: '欢迎使用 HaloLight',
    content: '感谢您使用 HaloLight 管理后台，如有问题请随时反馈。',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/docs',
  },
  {
    id: 'notif_2',
    type: 'task',
    title: '新任务分配',
    content: '您有一个新任务：完成用户模块前端开发',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/tasks/1',
  },
  {
    id: 'notif_3',
    type: 'message',
    title: '新消息',
    content: '张三 在研发团队群中@了您',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    link: '/messages',
    sender: {
      id: 'user_2',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    },
  },
  {
    id: 'notif_4',
    type: 'alert',
    title: '安全提醒',
    content: '检测到新设备登录，如非本人操作请及时修改密码。',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif_5',
    type: 'user',
    title: '成员加入',
    content: '李四 已加入设计团队',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    sender: {
      id: 'user_3',
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    },
  },
];

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved' })
  async findAll() {
    return mockNotifications;
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount() {
    const count = mockNotifications.filter((n) => !n.read).length;
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string) {
    const notification = mockNotifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return { success: true, id };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead() {
    mockNotifications.forEach((n) => (n.read = true));
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
