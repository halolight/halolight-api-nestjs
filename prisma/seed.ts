import { PrismaClient, UserStatus, SharePermission, AttendeeStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Match AuthService hash rounds
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.refreshToken.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.eventReminder.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.documentTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // ==================== PERMISSIONS ====================
  // Permission naming follows frontend convention: resource:action (view/create/edit/delete)
  console.log('🔒 Creating permissions...');
  const permissions = await Promise.all([
    // [0] Wildcard permission (super admin)
    prisma.permission.create({
      data: { action: '*', resource: '*', description: 'Full system access' },
    }),
    // Dashboard permissions [1]
    prisma.permission.create({
      data: { action: 'dashboard:view', resource: 'dashboard', description: 'View dashboard' },
    }),
    // User permissions [2-5]
    prisma.permission.create({
      data: { action: 'users:view', resource: 'users', description: 'View users' },
    }),
    prisma.permission.create({
      data: { action: 'users:create', resource: 'users', description: 'Create users' },
    }),
    prisma.permission.create({
      data: { action: 'users:edit', resource: 'users', description: 'Edit users' },
    }),
    prisma.permission.create({
      data: { action: 'users:delete', resource: 'users', description: 'Delete users' },
    }),
    // Analytics permissions [6-7]
    prisma.permission.create({
      data: { action: 'analytics:view', resource: 'analytics', description: 'View analytics' },
    }),
    prisma.permission.create({
      data: { action: 'analytics:export', resource: 'analytics', description: 'Export analytics data' },
    }),
    // Settings permissions [8-9]
    prisma.permission.create({
      data: { action: 'settings:view', resource: 'settings', description: 'View settings' },
    }),
    prisma.permission.create({
      data: { action: 'settings:edit', resource: 'settings', description: 'Edit settings' },
    }),
    // Document permissions [10-13]
    prisma.permission.create({
      data: { action: 'documents:view', resource: 'documents', description: 'View documents' },
    }),
    prisma.permission.create({
      data: { action: 'documents:create', resource: 'documents', description: 'Create documents' },
    }),
    prisma.permission.create({
      data: { action: 'documents:edit', resource: 'documents', description: 'Edit documents' },
    }),
    prisma.permission.create({
      data: { action: 'documents:delete', resource: 'documents', description: 'Delete documents' },
    }),
    // File permissions [14-16]
    prisma.permission.create({
      data: { action: 'files:view', resource: 'files', description: 'View files' },
    }),
    prisma.permission.create({
      data: { action: 'files:upload', resource: 'files', description: 'Upload files' },
    }),
    prisma.permission.create({
      data: { action: 'files:delete', resource: 'files', description: 'Delete files' },
    }),
    // Message permissions [17-18]
    prisma.permission.create({
      data: { action: 'messages:view', resource: 'messages', description: 'View messages' },
    }),
    prisma.permission.create({
      data: { action: 'messages:send', resource: 'messages', description: 'Send messages' },
    }),
    // Calendar permissions [19-20]
    prisma.permission.create({
      data: { action: 'calendar:view', resource: 'calendar', description: 'View calendar' },
    }),
    prisma.permission.create({
      data: { action: 'calendar:edit', resource: 'calendar', description: 'Edit calendar events' },
    }),
    // Notification permissions [21-22]
    prisma.permission.create({
      data: { action: 'notifications:view', resource: 'notifications', description: 'View notifications' },
    }),
    prisma.permission.create({
      data: { action: 'notifications:manage', resource: 'notifications', description: 'Manage notifications' },
    }),
  ]);

  // ==================== ROLES ====================
  console.log('🎭 Creating roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      label: '系统管理员',
      description: '拥有系统全部权限',
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'manager',
      label: '部门经理',
      description: '部门管理权限',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      label: '普通用户',
      description: '基本操作权限',
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: 'viewer',
      label: '访客',
      description: '只读权限',
    },
  });

  // Assign permissions to roles
  // Permission indices:
  // [0] *                    [1] dashboard:view
  // [2] users:view           [3] users:create        [4] users:edit          [5] users:delete
  // [6] analytics:view       [7] analytics:export
  // [8] settings:view        [9] settings:edit
  // [10] documents:view      [11] documents:create   [12] documents:edit     [13] documents:delete
  // [14] files:view          [15] files:upload       [16] files:delete
  // [17] messages:view       [18] messages:send
  // [19] calendar:view       [20] calendar:edit
  // [21] notifications:view  [22] notifications:manage
  console.log('🔗 Assigning permissions to roles...');

  // Admin gets wildcard permission (all access)
  await prisma.rolePermission.create({
    data: { roleId: adminRole.id, permissionId: permissions[0].id }, // *
  });

  // Manager gets most permissions except settings:edit and users:delete
  await prisma.rolePermission.createMany({
    data: [
      { roleId: managerRole.id, permissionId: permissions[1].id },  // dashboard:view
      { roleId: managerRole.id, permissionId: permissions[2].id },  // users:view
      { roleId: managerRole.id, permissionId: permissions[3].id },  // users:create
      { roleId: managerRole.id, permissionId: permissions[4].id },  // users:edit
      { roleId: managerRole.id, permissionId: permissions[6].id },  // analytics:view
      { roleId: managerRole.id, permissionId: permissions[7].id },  // analytics:export
      { roleId: managerRole.id, permissionId: permissions[8].id },  // settings:view
      { roleId: managerRole.id, permissionId: permissions[10].id }, // documents:view
      { roleId: managerRole.id, permissionId: permissions[11].id }, // documents:create
      { roleId: managerRole.id, permissionId: permissions[12].id }, // documents:edit
      { roleId: managerRole.id, permissionId: permissions[13].id }, // documents:delete
      { roleId: managerRole.id, permissionId: permissions[14].id }, // files:view
      { roleId: managerRole.id, permissionId: permissions[15].id }, // files:upload
      { roleId: managerRole.id, permissionId: permissions[16].id }, // files:delete
      { roleId: managerRole.id, permissionId: permissions[17].id }, // messages:view
      { roleId: managerRole.id, permissionId: permissions[18].id }, // messages:send
      { roleId: managerRole.id, permissionId: permissions[19].id }, // calendar:view
      { roleId: managerRole.id, permissionId: permissions[20].id }, // calendar:edit
      { roleId: managerRole.id, permissionId: permissions[21].id }, // notifications:view
      { roleId: managerRole.id, permissionId: permissions[22].id }, // notifications:manage
    ],
  });

  // User gets standard operational permissions
  await prisma.rolePermission.createMany({
    data: [
      { roleId: userRole.id, permissionId: permissions[1].id },  // dashboard:view
      { roleId: userRole.id, permissionId: permissions[2].id },  // users:view
      { roleId: userRole.id, permissionId: permissions[6].id },  // analytics:view
      { roleId: userRole.id, permissionId: permissions[10].id }, // documents:view
      { roleId: userRole.id, permissionId: permissions[11].id }, // documents:create
      { roleId: userRole.id, permissionId: permissions[12].id }, // documents:edit
      { roleId: userRole.id, permissionId: permissions[14].id }, // files:view
      { roleId: userRole.id, permissionId: permissions[15].id }, // files:upload
      { roleId: userRole.id, permissionId: permissions[17].id }, // messages:view
      { roleId: userRole.id, permissionId: permissions[18].id }, // messages:send
      { roleId: userRole.id, permissionId: permissions[19].id }, // calendar:view
      { roleId: userRole.id, permissionId: permissions[20].id }, // calendar:edit
      { roleId: userRole.id, permissionId: permissions[21].id }, // notifications:view
    ],
  });

  // Viewer gets read-only permissions
  await prisma.rolePermission.createMany({
    data: [
      { roleId: viewerRole.id, permissionId: permissions[1].id },  // dashboard:view
      { roleId: viewerRole.id, permissionId: permissions[2].id },  // users:view
      { roleId: viewerRole.id, permissionId: permissions[6].id },  // analytics:view
      { roleId: viewerRole.id, permissionId: permissions[10].id }, // documents:view
      { roleId: viewerRole.id, permissionId: permissions[14].id }, // files:view
      { roleId: viewerRole.id, permissionId: permissions[17].id }, // messages:view
      { roleId: viewerRole.id, permissionId: permissions[19].id }, // calendar:view
      { roleId: viewerRole.id, permissionId: permissions[21].id }, // notifications:view
    ],
  });

  // ==================== USERS ====================
  console.log('👥 Creating users...');

  // Different passwords for different users
  const adminPassword = await hashPassword('123456');
  const regularPassword = await hashPassword('123456');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@halolight.h7ml.cn',
      username: 'admin',
      password: adminPassword,
      name: '系统管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      status: UserStatus.ACTIVE,
      department: '技术部',
      position: 'CTO',
      bio: 'HaloLight 系统管理员',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@halolight.h7ml.cn',
      username: 'manager',
      password: regularPassword,
      name: '张经理',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
      status: UserStatus.ACTIVE,
      department: '产品部',
      position: '产品经理',
      bio: '负责产品规划和团队管理',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@halolight.h7ml.cn',
      username: 'demo',
      password: regularPassword,
      name: '演示用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      status: UserStatus.ACTIVE,
      department: '研发部',
      position: '前端工程师',
      bio: '这是一个演示账号',
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'zhangsan@halolight.h7ml.cn',
        username: 'zhangsan',
        password: regularPassword,
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        status: UserStatus.ACTIVE,
        department: '研发部',
        position: '高级工程师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisi@halolight.h7ml.cn',
        username: 'lisi',
        password: regularPassword,
        name: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
        status: UserStatus.ACTIVE,
        department: '设计部',
        position: 'UI设计师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'wangwu@halolight.h7ml.cn',
        username: 'wangwu',
        password: regularPassword,
        name: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
        status: UserStatus.ACTIVE,
        department: '市场部',
        position: '市场专员',
      },
    }),
    prisma.user.create({
      data: {
        email: 'zhaoliu@halolight.h7ml.cn',
        username: 'zhaoliu',
        password: regularPassword,
        name: '赵六',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
        status: UserStatus.INACTIVE,
        department: '财务部',
        position: '财务主管',
      },
    }),
  ]);

  // Assign roles to users
  console.log('🔗 Assigning roles to users...');
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: managerUser.id, roleId: managerRole.id },
      { userId: demoUser.id, roleId: userRole.id },
      { userId: users[0].id, roleId: userRole.id },
      { userId: users[1].id, roleId: userRole.id },
      { userId: users[2].id, roleId: viewerRole.id },
      { userId: users[3].id, roleId: viewerRole.id },
    ],
  });

  // ==================== TEAMS ====================
  console.log('👨‍👩‍👧‍👦 Creating teams...');
  const devTeam = await prisma.team.create({
    data: {
      name: '研发团队',
      description: '负责产品研发和技术创新',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dev',
      ownerId: adminUser.id,
    },
  });

  const designTeam = await prisma.team.create({
    data: {
      name: '设计团队',
      description: '负责产品UI/UX设计',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=design',
      ownerId: managerUser.id,
    },
  });

  const marketTeam = await prisma.team.create({
    data: {
      name: '市场团队',
      description: '负责市场推广和运营',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=market',
      ownerId: managerUser.id,
    },
  });

  // Add team members
  await prisma.teamMember.createMany({
    data: [
      { teamId: devTeam.id, userId: adminUser.id, roleId: adminRole.id },
      { teamId: devTeam.id, userId: demoUser.id, roleId: userRole.id },
      { teamId: devTeam.id, userId: users[0].id, roleId: userRole.id },
      { teamId: designTeam.id, userId: managerUser.id, roleId: managerRole.id },
      { teamId: designTeam.id, userId: users[1].id, roleId: userRole.id },
      { teamId: marketTeam.id, userId: managerUser.id, roleId: managerRole.id },
      { teamId: marketTeam.id, userId: users[2].id, roleId: userRole.id },
    ],
  });

  // ==================== TAGS ====================
  console.log('🏷️  Creating tags...');
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: '重要' } }),
    prisma.tag.create({ data: { name: '技术文档' } }),
    prisma.tag.create({ data: { name: '设计规范' } }),
    prisma.tag.create({ data: { name: '会议纪要' } }),
    prisma.tag.create({ data: { name: '项目计划' } }),
    prisma.tag.create({ data: { name: '用户手册' } }),
  ]);

  // ==================== FOLDERS ====================
  console.log('📁 Creating folders...');
  const rootFolder = await prisma.folder.create({
    data: {
      name: '根目录',
      path: '/',
      ownerId: adminUser.id,
    },
  });

  const docsFolder = await prisma.folder.create({
    data: {
      name: '文档中心',
      path: '/documents',
      parentId: rootFolder.id,
      ownerId: adminUser.id,
    },
  });

  const projectsFolder = await prisma.folder.create({
    data: {
      name: '项目文件',
      path: '/projects',
      parentId: rootFolder.id,
      ownerId: adminUser.id,
      teamId: devTeam.id,
    },
  });

  const designFolder = await prisma.folder.create({
    data: {
      name: '设计资源',
      path: '/design',
      parentId: rootFolder.id,
      ownerId: managerUser.id,
      teamId: designTeam.id,
    },
  });

  // ==================== DOCUMENTS ====================
  console.log('📄 Creating documents...');
  const doc1 = await prisma.document.create({
    data: {
      title: 'HaloLight API 使用指南',
      content: '# HaloLight API 使用指南\n\n## 概述\n\nHaloLight API 是基于 NestJS 11 构建的企业级后端服务...\n\n## 快速开始\n\n### 安装\n\n```bash\npnpm install\npnpm dev\n```\n\n### 认证\n\n所有 API 请求需要携带 JWT Token...',
      type: 'markdown',
      size: BigInt(2048),
      views: 128,
      ownerId: adminUser.id,
      teamId: devTeam.id,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      title: '2024年度产品规划',
      content: '# 2024年度产品规划\n\n## Q1 目标\n\n- 完成基础架构搭建\n- 实现用户认证模块\n\n## Q2 目标\n\n- 完善权限管理\n- 添加文件管理功能',
      type: 'markdown',
      size: BigInt(1536),
      views: 256,
      ownerId: managerUser.id,
      teamId: devTeam.id,
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      title: 'UI设计规范 v2.0',
      content: '# UI设计规范\n\n## 色彩系统\n\n主色调: #6366f1\n辅助色: #8b5cf6\n强调色: #ec4899\n\n## 字体规范\n\n标题: Inter Bold\n正文: Inter Regular',
      type: 'markdown',
      size: BigInt(1024),
      views: 89,
      ownerId: users[1].id,
      teamId: designTeam.id,
    },
  });

  const doc4 = await prisma.document.create({
    data: {
      title: '周会纪要 - 2024/01/15',
      content: '# 周会纪要\n\n## 参会人员\n\n张经理、张三、李四、王五\n\n## 议题\n\n1. 项目进度汇报\n2. 下周工作安排\n\n## 决议\n\n- 本周完成用户模块开发\n- 下周启动文档管理模块',
      type: 'markdown',
      size: BigInt(768),
      views: 45,
      ownerId: managerUser.id,
    },
  });

  // Add tags to documents
  await prisma.documentTag.createMany({
    data: [
      { documentId: doc1.id, tagId: tags[0].id },
      { documentId: doc1.id, tagId: tags[1].id },
      { documentId: doc1.id, tagId: tags[5].id },
      { documentId: doc2.id, tagId: tags[0].id },
      { documentId: doc2.id, tagId: tags[4].id },
      { documentId: doc3.id, tagId: tags[2].id },
      { documentId: doc4.id, tagId: tags[3].id },
    ],
  });

  // Document shares
  await prisma.documentShare.createMany({
    data: [
      { documentId: doc1.id, teamId: devTeam.id, permission: SharePermission.READ },
      { documentId: doc2.id, sharedWithId: demoUser.id, permission: SharePermission.EDIT },
      { documentId: doc3.id, teamId: designTeam.id, permission: SharePermission.READ },
    ],
  });

  // ==================== FILES ====================
  console.log('📎 Creating files...');
  await prisma.file.createMany({
    data: [
      {
        name: 'logo.png',
        path: '/design/logo.png',
        mimeType: 'image/png',
        size: BigInt(102400),
        folderId: designFolder.id,
        ownerId: users[1].id,
        teamId: designTeam.id,
        isFavorite: true,
      },
      {
        name: 'api-spec.json',
        path: '/documents/api-spec.json',
        mimeType: 'application/json',
        size: BigInt(51200),
        folderId: docsFolder.id,
        ownerId: adminUser.id,
        teamId: devTeam.id,
      },
      {
        name: 'user-guide.pdf',
        path: '/documents/user-guide.pdf',
        mimeType: 'application/pdf',
        size: BigInt(2048000),
        folderId: docsFolder.id,
        ownerId: adminUser.id,
      },
      {
        name: 'project-plan.xlsx',
        path: '/projects/project-plan.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: BigInt(153600),
        folderId: projectsFolder.id,
        ownerId: managerUser.id,
        teamId: devTeam.id,
        isFavorite: true,
      },
    ],
  });

  // ==================== CALENDAR EVENTS ====================
  console.log('📅 Creating calendar events...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const event1 = await prisma.calendarEvent.create({
    data: {
      title: '项目周会',
      description: '每周一上午的项目进度同步会议',
      startAt: new Date(now.setHours(10, 0, 0, 0)),
      endAt: new Date(now.setHours(11, 0, 0, 0)),
      type: 'meeting',
      color: '#6366f1',
      location: '会议室A',
      ownerId: managerUser.id,
    },
  });

  const event2 = await prisma.calendarEvent.create({
    data: {
      title: '代码评审',
      description: '评审用户认证模块代码',
      startAt: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endAt: new Date(tomorrow.setHours(15, 30, 0, 0)),
      type: 'meeting',
      color: '#8b5cf6',
      location: '线上会议',
      ownerId: adminUser.id,
    },
  });

  const event3 = await prisma.calendarEvent.create({
    data: {
      title: '产品发布',
      description: 'HaloLight v1.0 正式发布',
      startAt: new Date(nextWeek.setHours(0, 0, 0, 0)),
      endAt: new Date(nextWeek.setHours(23, 59, 59, 0)),
      type: 'task',
      color: '#ec4899',
      allDay: true,
      ownerId: managerUser.id,
    },
  });

  // Event attendees
  await prisma.eventAttendee.createMany({
    data: [
      { eventId: event1.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event1.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event1.id, userId: users[0].id, status: AttendeeStatus.PENDING },
      { eventId: event2.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event2.id, userId: users[0].id, status: AttendeeStatus.ACCEPTED },
      { eventId: event3.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event3.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
    ],
  });

  // Event reminders
  await prisma.eventReminder.createMany({
    data: [
      { eventId: event1.id, remindAt: new Date(now.getTime() - 30 * 60 * 1000) },
      { eventId: event2.id, remindAt: new Date(tomorrow.getTime() - 60 * 60 * 1000) },
    ],
  });

  // ==================== CONVERSATIONS & MESSAGES ====================
  console.log('💬 Creating conversations and messages...');
  const conv1 = await prisma.conversation.create({
    data: {
      name: '研发团队群',
      isGroup: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=devteam',
    },
  });

  const conv2 = await prisma.conversation.create({
    data: {
      isGroup: false, // 1对1聊天
    },
  });

  // Conversation participants
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv1.id, userId: adminUser.id, role: 'owner', unreadCount: 0 },
      { conversationId: conv1.id, userId: demoUser.id, role: 'member', unreadCount: 2 },
      { conversationId: conv1.id, userId: users[0].id, role: 'member', unreadCount: 5 },
      { conversationId: conv2.id, userId: adminUser.id, role: 'member', unreadCount: 0 },
      { conversationId: conv2.id, userId: managerUser.id, role: 'member', unreadCount: 1 },
    ],
  });

  // Messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: adminUser.id,
        type: 'text',
        content: '大家好，欢迎加入研发团队群！',
      },
      {
        conversationId: conv1.id,
        senderId: demoUser.id,
        type: 'text',
        content: '你好！很高兴加入团队 🎉',
      },
      {
        conversationId: conv1.id,
        senderId: users[0].id,
        type: 'text',
        content: '新版本已经部署到测试环境了',
      },
      {
        conversationId: conv1.id,
        senderId: adminUser.id,
        type: 'text',
        content: '好的，我去看一下',
      },
      {
        conversationId: conv2.id,
        senderId: adminUser.id,
        type: 'text',
        content: '张经理，下周的发布计划确认了吗？',
      },
      {
        conversationId: conv2.id,
        senderId: managerUser.id,
        type: 'text',
        content: '确认了，周五正式发布',
      },
    ],
  });

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'system',
        title: '欢迎使用 HaloLight',
        content: '感谢您使用 HaloLight 管理后台，如有问题请随时反馈。',
        read: false,
      },
      {
        userId: demoUser.id,
        type: 'task',
        title: '新任务分配',
        content: '您有一个新任务：完成用户模块前端开发',
        link: '/tasks/1',
        read: false,
      },
      {
        userId: demoUser.id,
        type: 'message',
        title: '新消息',
        content: '张三 在研发团队群中@了您',
        link: '/messages',
        read: true,
      },
      {
        userId: adminUser.id,
        type: 'alert',
        title: '安全提醒',
        content: '检测到新设备登录，如非本人操作请及时修改密码。',
        read: false,
      },
      {
        userId: managerUser.id,
        type: 'user',
        title: '成员加入',
        content: '李四 已加入设计团队',
        read: true,
      },
    ],
  });

  // ==================== ACTIVITY LOGS ====================
  console.log('📝 Creating activity logs...');
  await prisma.activityLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: 'user.create',
        targetType: 'user',
        targetId: demoUser.id,
        metadata: { name: '演示用户' },
      },
      {
        actorId: demoUser.id,
        action: 'document.create',
        targetType: 'document',
        targetId: doc1.id,
        metadata: { title: 'HaloLight API 使用指南' },
      },
      {
        actorId: managerUser.id,
        action: 'team.create',
        targetType: 'team',
        targetId: devTeam.id,
        metadata: { name: '研发团队' },
      },
      {
        actorId: adminUser.id,
        action: 'role.assign',
        targetType: 'user',
        targetId: demoUser.id,
        metadata: { role: 'user' },
      },
    ],
  });

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${permissions.length} permissions (23 total)`);
  console.log('   - 4 roles');
  console.log('   - 7 users');
  console.log('   - 3 teams');
  console.log('   - 4 documents');
  console.log('   - 4 folders');
  console.log('   - 4 files');
  console.log('   - 3 calendar events');
  console.log('   - 2 conversations');
  console.log('   - 6 messages');
  console.log('   - 5 notifications');
  console.log('   - 4 activity logs');
  console.log('\n🔑 Demo Accounts:');
  console.log('   - admin@halolight.h7ml.cn / 123456 (Admin)');
  console.log('   - manager@halolight.h7ml.cn / 123456 (Manager)');
  console.log('   - demo@halolight.h7ml.cn / 123456 (User)');
  console.log('   - zhangsan@halolight.h7ml.cn / 123456 (User)');
  console.log('   - lisi@halolight.h7ml.cn / 123456 (User)');
  console.log('   - wangwu@halolight.h7ml.cn / 123456 (Viewer)');
  console.log('   - zhaoliu@halolight.h7ml.cn / 123456 (Inactive)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
