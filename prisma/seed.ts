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

  const editorRole = await prisma.role.create({
    data: {
      name: 'editor',
      label: '编辑员',
      description: '可编辑文档和内容',
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

  // Editor gets document editing permissions
  await prisma.rolePermission.createMany({
    data: [
      { roleId: editorRole.id, permissionId: permissions[1].id },  // dashboard:view
      { roleId: editorRole.id, permissionId: permissions[2].id },  // users:view
      { roleId: editorRole.id, permissionId: permissions[6].id },  // analytics:view
      { roleId: editorRole.id, permissionId: permissions[10].id }, // documents:view
      { roleId: editorRole.id, permissionId: permissions[11].id }, // documents:create
      { roleId: editorRole.id, permissionId: permissions[12].id }, // documents:edit
      { roleId: editorRole.id, permissionId: permissions[14].id }, // files:view
      { roleId: editorRole.id, permissionId: permissions[15].id }, // files:upload
      { roleId: editorRole.id, permissionId: permissions[17].id }, // messages:view
      { roleId: editorRole.id, permissionId: permissions[18].id }, // messages:send
      { roleId: editorRole.id, permissionId: permissions[19].id }, // calendar:view
      { roleId: editorRole.id, permissionId: permissions[20].id }, // calendar:edit
      { roleId: editorRole.id, permissionId: permissions[21].id }, // notifications:view
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
    // Additional users for frontend requirements (20+ users total)
    prisma.user.create({
      data: {
        email: 'sunqi@halolight.h7ml.cn',
        username: 'sunqi',
        password: regularPassword,
        name: '孙七',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
        status: UserStatus.ACTIVE,
        department: '研发部',
        position: '后端工程师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'zhouba@halolight.h7ml.cn',
        username: 'zhouba',
        password: regularPassword,
        name: '周八',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba',
        status: UserStatus.ACTIVE,
        department: '研发部',
        position: '全栈工程师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'wujiu@halolight.h7ml.cn',
        username: 'wujiu',
        password: regularPassword,
        name: '吴九',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu',
        status: UserStatus.ACTIVE,
        department: '设计部',
        position: '交互设计师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'zhengshi@halolight.h7ml.cn',
        username: 'zhengshi',
        password: regularPassword,
        name: '郑十',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi',
        status: UserStatus.ACTIVE,
        department: '产品部',
        position: '产品助理',
      },
    }),
    prisma.user.create({
      data: {
        email: 'qianyi@halolight.h7ml.cn',
        username: 'qianyi',
        password: regularPassword,
        name: '钱一',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianyi',
        status: UserStatus.SUSPENDED,
        department: '市场部',
        position: '市场经理',
      },
    }),
    prisma.user.create({
      data: {
        email: 'fenger@halolight.h7ml.cn',
        username: 'fenger',
        password: regularPassword,
        name: '冯二',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fenger',
        status: UserStatus.ACTIVE,
        department: '运营部',
        position: '运营专员',
      },
    }),
    prisma.user.create({
      data: {
        email: 'chensan@halolight.h7ml.cn',
        username: 'chensan',
        password: regularPassword,
        name: '陈三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chensan',
        status: UserStatus.ACTIVE,
        department: '研发部',
        position: '测试工程师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'weisi@halolight.h7ml.cn',
        username: 'weisi',
        password: regularPassword,
        name: '魏四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=weisi',
        status: UserStatus.ACTIVE,
        department: '人事部',
        position: 'HR专员',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jiangwu@halolight.h7ml.cn',
        username: 'jiangwu',
        password: regularPassword,
        name: '蒋五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jiangwu',
        status: UserStatus.INACTIVE,
        department: '财务部',
        position: '会计',
      },
    }),
    prisma.user.create({
      data: {
        email: 'shenliu@halolight.h7ml.cn',
        username: 'shenliu',
        password: regularPassword,
        name: '沈六',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shenliu',
        status: UserStatus.ACTIVE,
        department: '研发部',
        position: 'DevOps工程师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'hanqi@halolight.h7ml.cn',
        username: 'hanqi',
        password: regularPassword,
        name: '韩七',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hanqi',
        status: UserStatus.ACTIVE,
        department: '设计部',
        position: '视觉设计师',
      },
    }),
    prisma.user.create({
      data: {
        email: 'yangba@halolight.h7ml.cn',
        username: 'yangba',
        password: regularPassword,
        name: '杨八',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yangba',
        status: UserStatus.ACTIVE,
        department: '客服部',
        position: '客服专员',
      },
    }),
  ]);

  // Assign roles to users
  console.log('🔗 Assigning roles to users...');
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: managerUser.id, roleId: managerRole.id },
      { userId: demoUser.id, roleId: editorRole.id },
      { userId: users[0].id, roleId: editorRole.id },   // zhangsan
      { userId: users[1].id, roleId: editorRole.id },   // lisi
      { userId: users[2].id, roleId: viewerRole.id },   // wangwu
      { userId: users[3].id, roleId: viewerRole.id },   // zhaoliu
      { userId: users[4].id, roleId: editorRole.id },   // sunqi
      { userId: users[5].id, roleId: editorRole.id },   // zhouba
      { userId: users[6].id, roleId: editorRole.id },   // wujiu
      { userId: users[7].id, roleId: viewerRole.id },   // zhengshi
      { userId: users[8].id, roleId: managerRole.id },  // qianyi
      { userId: users[9].id, roleId: editorRole.id },   // fenger
      { userId: users[10].id, roleId: editorRole.id },  // chensan
      { userId: users[11].id, roleId: viewerRole.id },  // weisi
      { userId: users[12].id, roleId: viewerRole.id },  // jiangwu
      { userId: users[13].id, roleId: editorRole.id },  // shenliu
      { userId: users[14].id, roleId: editorRole.id },  // hanqi
      { userId: users[15].id, roleId: viewerRole.id },  // yangba
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

  const opsTeam = await prisma.team.create({
    data: {
      name: '运营团队',
      description: '负责产品运营和用户增长',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ops',
      ownerId: adminUser.id,
    },
  });

  // Add team members
  await prisma.teamMember.createMany({
    data: [
      { teamId: devTeam.id, userId: adminUser.id, roleId: adminRole.id },
      { teamId: devTeam.id, userId: demoUser.id, roleId: editorRole.id },
      { teamId: devTeam.id, userId: users[0].id, roleId: editorRole.id },
      { teamId: devTeam.id, userId: users[4].id, roleId: editorRole.id },
      { teamId: devTeam.id, userId: users[5].id, roleId: editorRole.id },
      { teamId: devTeam.id, userId: users[10].id, roleId: editorRole.id },
      { teamId: devTeam.id, userId: users[13].id, roleId: editorRole.id },
      { teamId: designTeam.id, userId: managerUser.id, roleId: managerRole.id },
      { teamId: designTeam.id, userId: users[1].id, roleId: editorRole.id },
      { teamId: designTeam.id, userId: users[6].id, roleId: editorRole.id },
      { teamId: designTeam.id, userId: users[14].id, roleId: editorRole.id },
      { teamId: marketTeam.id, userId: managerUser.id, roleId: managerRole.id },
      { teamId: marketTeam.id, userId: users[2].id, roleId: viewerRole.id },
      { teamId: marketTeam.id, userId: users[8].id, roleId: managerRole.id },
      { teamId: opsTeam.id, userId: adminUser.id, roleId: adminRole.id },
      { teamId: opsTeam.id, userId: users[9].id, roleId: editorRole.id },
      { teamId: opsTeam.id, userId: users[15].id, roleId: viewerRole.id },
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
      name: '项目文档',
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

  const techDocsFolder = await prisma.folder.create({
    data: {
      name: '技术文档',
      path: '/tech-docs',
      parentId: rootFolder.id,
      ownerId: adminUser.id,
      teamId: devTeam.id,
    },
  });

  const reportsFolder = await prisma.folder.create({
    data: {
      name: '报表',
      path: '/reports',
      parentId: rootFolder.id,
      ownerId: managerUser.id,
    },
  });

  const meetingFolder = await prisma.folder.create({
    data: {
      name: '会议记录',
      path: '/meetings',
      parentId: rootFolder.id,
      ownerId: managerUser.id,
    },
  });

  // ==================== DOCUMENTS ====================
  console.log('📄 Creating documents...');
  const doc1 = await prisma.document.create({
    data: {
      title: 'HaloLight API 使用指南',
      content: '# HaloLight API 使用指南\n\n## 概述\n\nHaloLight API 是基于 NestJS 11 构建的企业级后端服务...\n\n## 快速开始\n\n### 安装\n\n```bash\npnpm install\npnpm dev\n```\n\n### 认证\n\n所有 API 请求需要携带 JWT Token...',
      type: 'doc',
      folder: '技术文档',
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
      type: 'doc',
      folder: '项目文档',
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
      type: 'pdf',
      folder: '设计资源',
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
      type: 'doc',
      folder: '会议记录',
      size: BigInt(768),
      views: 45,
      ownerId: managerUser.id,
    },
  });

  // Additional documents (15+ total)
  const doc5 = await prisma.document.create({
    data: {
      title: '数据库设计文档',
      content: '# 数据库设计\n\n## ER图\n\n数据库采用 PostgreSQL 作为主数据库...\n\n## 表结构\n\n### users 表\n- id: UUID\n- email: VARCHAR(255)',
      type: 'doc',
      folder: '技术文档',
      size: BigInt(3072),
      views: 156,
      ownerId: adminUser.id,
      teamId: devTeam.id,
    },
  });

  const doc6 = await prisma.document.create({
    data: {
      title: '前端架构说明',
      content: '# 前端架构\n\n## 技术栈\n\n- Next.js 15\n- React 19\n- TypeScript\n- Tailwind CSS 4\n\n## 目录结构\n\n```\nsrc/\n├── app/\n├── components/\n└── lib/\n```',
      type: 'code',
      folder: '技术文档',
      size: BigInt(2560),
      views: 234,
      ownerId: demoUser.id,
      teamId: devTeam.id,
    },
  });

  const doc7 = await prisma.document.create({
    data: {
      title: '用户调研报告',
      content: '# 用户调研报告\n\n## 调研背景\n\n为了解用户需求，我们进行了为期两周的用户调研...\n\n## 调研结果\n\n- 用户满意度: 85%\n- 功能需求排名: 1. 文档协作 2. 权限管理',
      type: 'pdf',
      folder: '报表',
      size: BigInt(5120),
      views: 78,
      ownerId: managerUser.id,
    },
  });

  const doc8 = await prisma.document.create({
    data: {
      title: '产品原型设计稿',
      content: '# 产品原型\n\n## 首页设计\n\n仪表盘采用卡片式布局...\n\n## 用户管理页面\n\n表格支持排序、筛选、分页...',
      type: 'image',
      folder: '设计资源',
      size: BigInt(10240),
      views: 312,
      ownerId: users[1].id,
      teamId: designTeam.id,
    },
  });

  const doc9 = await prisma.document.create({
    data: {
      title: 'Q1季度销售报表',
      content: '# Q1 销售报表\n\n## 总览\n\n- 总销售额: ¥1,234,567\n- 同比增长: 23.5%\n\n## 区域分布\n\n华东: 45%\n华南: 30%\n华北: 25%',
      type: 'spreadsheet',
      folder: '报表',
      size: BigInt(8192),
      views: 167,
      ownerId: users[3].id,
    },
  });

  const doc10 = await prisma.document.create({
    data: {
      title: '周会纪要 - 2024/01/22',
      content: '# 周会纪要\n\n## 本周进展\n\n- 完成用户认证模块\n- 权限管理模块进度 60%\n\n## 下周计划\n\n- 完成权限管理\n- 启动文档管理开发',
      type: 'doc',
      folder: '会议记录',
      size: BigInt(640),
      views: 38,
      ownerId: managerUser.id,
    },
  });

  const doc11 = await prisma.document.create({
    data: {
      title: 'API接口文档',
      content: '# API 接口文档\n\n## 认证接口\n\n### POST /api/auth/login\n\n登录接口，返回 JWT Token\n\n### POST /api/auth/register\n\n用户注册接口',
      type: 'doc',
      folder: '技术文档',
      size: BigInt(4096),
      views: 445,
      ownerId: adminUser.id,
      teamId: devTeam.id,
    },
  });

  const doc12 = await prisma.document.create({
    data: {
      title: '品牌视觉规范',
      content: '# 品牌视觉规范\n\n## Logo 使用规范\n\n最小尺寸: 24x24px\n安全区域: Logo周围保持 8px 间距\n\n## 品牌色\n\n主色: #6366f1 (Indigo)',
      type: 'pdf',
      folder: '设计资源',
      size: BigInt(15360),
      views: 198,
      ownerId: users[6].id,
      teamId: designTeam.id,
    },
  });

  const doc13 = await prisma.document.create({
    data: {
      title: '部署运维手册',
      content: '# 部署运维手册\n\n## Docker 部署\n\n```bash\ndocker-compose up -d\n```\n\n## 监控配置\n\n使用 Prometheus + Grafana 进行监控',
      type: 'code',
      folder: '技术文档',
      size: BigInt(3584),
      views: 87,
      ownerId: users[13].id,
      teamId: devTeam.id,
    },
  });

  const doc14 = await prisma.document.create({
    data: {
      title: '市场推广方案',
      content: '# 市场推广方案\n\n## 目标\n\n- 提升品牌知名度\n- 获取 10000 新用户\n\n## 渠道\n\n- 社交媒体\n- 内容营销\n- SEO优化',
      type: 'doc',
      folder: '项目文档',
      size: BigInt(2816),
      views: 123,
      ownerId: users[2].id,
      teamId: marketTeam.id,
    },
  });

  const doc15 = await prisma.document.create({
    data: {
      title: '用户数据分析报告',
      content: '# 用户数据分析\n\n## 日活跃用户\n\n平均 DAU: 5,234\n峰值: 8,901\n\n## 用户留存\n\n次日留存: 45%\n7日留存: 28%',
      type: 'spreadsheet',
      folder: '报表',
      size: BigInt(6144),
      views: 201,
      ownerId: users[9].id,
      teamId: opsTeam.id,
    },
  });

  const doc16 = await prisma.document.create({
    data: {
      title: '周会纪要 - 2024/01/29',
      content: '# 周会纪要\n\n## 议题\n\n1. 权限模块已完成\n2. 文档管理进度 40%\n\n## 问题\n\n- 性能优化需求\n- 用户反馈处理',
      type: 'doc',
      folder: '会议记录',
      size: BigInt(512),
      views: 29,
      ownerId: managerUser.id,
    },
  });

  const doc17 = await prisma.document.create({
    data: {
      title: '竞品分析报告',
      content: '# 竞品分析\n\n## 主要竞品\n\n1. 产品A - 功能全面，价格高\n2. 产品B - 易用性好，功能少\n\n## 差异化优势\n\n- 现代化UI\n- 灵活的权限系统',
      type: 'pdf',
      folder: '项目文档',
      size: BigInt(7168),
      views: 156,
      ownerId: users[7].id,
    },
  });

  const doc18 = await prisma.document.create({
    data: {
      title: '组件库文档',
      content: '# 组件库\n\n## Button 组件\n\n```tsx\n<Button variant="primary">Click me</Button>\n```\n\n## Input 组件\n\n支持多种类型输入',
      type: 'code',
      folder: '技术文档',
      size: BigInt(4608),
      views: 289,
      ownerId: demoUser.id,
      teamId: devTeam.id,
    },
  });

  const documents = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15, doc16, doc17, doc18];

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
      { documentId: doc5.id, tagId: tags[1].id },
      { documentId: doc6.id, tagId: tags[1].id },
      { documentId: doc7.id, tagId: tags[0].id },
      { documentId: doc8.id, tagId: tags[2].id },
      { documentId: doc9.id, tagId: tags[0].id },
      { documentId: doc10.id, tagId: tags[3].id },
      { documentId: doc11.id, tagId: tags[1].id },
      { documentId: doc11.id, tagId: tags[5].id },
      { documentId: doc12.id, tagId: tags[2].id },
      { documentId: doc13.id, tagId: tags[1].id },
      { documentId: doc14.id, tagId: tags[4].id },
      { documentId: doc15.id, tagId: tags[0].id },
      { documentId: doc16.id, tagId: tags[3].id },
      { documentId: doc17.id, tagId: tags[0].id },
      { documentId: doc18.id, tagId: tags[1].id },
    ],
  });

  // Document shares
  await prisma.documentShare.createMany({
    data: [
      { documentId: doc1.id, teamId: devTeam.id, permission: SharePermission.READ },
      { documentId: doc2.id, sharedWithId: demoUser.id, permission: SharePermission.EDIT },
      { documentId: doc3.id, teamId: designTeam.id, permission: SharePermission.READ },
      { documentId: doc5.id, teamId: devTeam.id, permission: SharePermission.READ },
      { documentId: doc6.id, teamId: devTeam.id, permission: SharePermission.EDIT },
      { documentId: doc8.id, teamId: designTeam.id, permission: SharePermission.READ },
      { documentId: doc11.id, teamId: devTeam.id, permission: SharePermission.READ },
      { documentId: doc12.id, teamId: designTeam.id, permission: SharePermission.READ },
      { documentId: doc14.id, teamId: marketTeam.id, permission: SharePermission.EDIT },
      { documentId: doc18.id, teamId: devTeam.id, permission: SharePermission.EDIT },
    ],
  });

  // ==================== FILES ====================
  console.log('📎 Creating files...');
  await prisma.file.createMany({
    data: [
      // Images
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
        name: 'banner.jpg',
        path: '/design/banner.jpg',
        mimeType: 'image/jpeg',
        size: BigInt(512000),
        folderId: designFolder.id,
        ownerId: users[1].id,
        teamId: designTeam.id,
      },
      {
        name: 'icon-set.png',
        path: '/design/icon-set.png',
        mimeType: 'image/png',
        size: BigInt(256000),
        folderId: designFolder.id,
        ownerId: users[6].id,
        teamId: designTeam.id,
      },
      {
        name: 'screenshot-1.webp',
        path: '/design/screenshot-1.webp',
        mimeType: 'image/webp',
        size: BigInt(384000),
        folderId: designFolder.id,
        ownerId: users[14].id,
        teamId: designTeam.id,
      },
      // Documents
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
        isFavorite: true,
      },
      {
        name: 'contract-template.docx',
        path: '/documents/contract-template.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: BigInt(128000),
        folderId: docsFolder.id,
        ownerId: managerUser.id,
      },
      {
        name: 'meeting-notes.pdf',
        path: '/documents/meeting-notes.pdf',
        mimeType: 'application/pdf',
        size: BigInt(768000),
        folderId: meetingFolder.id,
        ownerId: managerUser.id,
      },
      // Spreadsheets
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
      {
        name: 'sales-report-q1.xlsx',
        path: '/reports/sales-report-q1.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: BigInt(256000),
        folderId: reportsFolder.id,
        ownerId: users[3].id,
      },
      {
        name: 'budget-2024.xlsx',
        path: '/reports/budget-2024.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: BigInt(192000),
        folderId: reportsFolder.id,
        ownerId: users[12].id,
      },
      // Archives
      {
        name: 'source-code-v1.zip',
        path: '/projects/source-code-v1.zip',
        mimeType: 'application/zip',
        size: BigInt(10485760),
        folderId: projectsFolder.id,
        ownerId: adminUser.id,
        teamId: devTeam.id,
      },
      {
        name: 'design-assets.rar',
        path: '/design/design-assets.rar',
        mimeType: 'application/x-rar-compressed',
        size: BigInt(52428800),
        folderId: designFolder.id,
        ownerId: users[1].id,
        teamId: designTeam.id,
      },
      {
        name: 'backup-2024-01.7z',
        path: '/documents/backup-2024-01.7z',
        mimeType: 'application/x-7z-compressed',
        size: BigInt(104857600),
        folderId: docsFolder.id,
        ownerId: adminUser.id,
      },
      // Videos
      {
        name: 'product-demo.mp4',
        path: '/design/product-demo.mp4',
        mimeType: 'video/mp4',
        size: BigInt(157286400),
        folderId: designFolder.id,
        ownerId: users[6].id,
        teamId: designTeam.id,
        isFavorite: true,
      },
      {
        name: 'tutorial.mov',
        path: '/documents/tutorial.mov',
        mimeType: 'video/quicktime',
        size: BigInt(83886080),
        folderId: docsFolder.id,
        ownerId: demoUser.id,
      },
      // Audio
      {
        name: 'meeting-recording.mp3',
        path: '/meetings/meeting-recording.mp3',
        mimeType: 'audio/mpeg',
        size: BigInt(15728640),
        folderId: meetingFolder.id,
        ownerId: managerUser.id,
      },
      {
        name: 'podcast-episode-1.wav',
        path: '/documents/podcast-episode-1.wav',
        mimeType: 'audio/wav',
        size: BigInt(41943040),
        folderId: docsFolder.id,
        ownerId: users[9].id,
      },
      // Code files
      {
        name: 'config.ts',
        path: '/tech-docs/config.ts',
        mimeType: 'text/typescript',
        size: BigInt(4096),
        folderId: techDocsFolder.id,
        ownerId: adminUser.id,
        teamId: devTeam.id,
      },
      {
        name: 'schema.prisma',
        path: '/tech-docs/schema.prisma',
        mimeType: 'text/plain',
        size: BigInt(8192),
        folderId: techDocsFolder.id,
        ownerId: adminUser.id,
        teamId: devTeam.id,
      },
      {
        name: 'README.md',
        path: '/projects/README.md',
        mimeType: 'text/markdown',
        size: BigInt(12288),
        folderId: projectsFolder.id,
        ownerId: demoUser.id,
        teamId: devTeam.id,
      },
    ],
  });

  // ==================== CALENDAR EVENTS ====================
  console.log('📅 Creating calendar events...');
  const now = new Date();
  const today = new Date(now);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Past events (5)
  const pastEvent1 = await prisma.calendarEvent.create({
    data: {
      title: '产品评审会议',
      description: '评审第一版产品功能',
      startAt: new Date(lastWeek.setHours(9, 0, 0, 0)),
      endAt: new Date(lastWeek.setHours(11, 0, 0, 0)),
      type: 'meeting',
      color: '#6366f1',
      location: '会议室B',
      ownerId: managerUser.id,
    },
  });

  const pastEvent2 = await prisma.calendarEvent.create({
    data: {
      title: '技术分享会',
      description: 'React 19 新特性介绍',
      startAt: new Date(threeDaysAgo.setHours(15, 0, 0, 0)),
      endAt: new Date(threeDaysAgo.setHours(16, 30, 0, 0)),
      type: 'meeting',
      color: '#8b5cf6',
      location: '线上会议',
      ownerId: adminUser.id,
    },
  });

  const pastEvent3 = await prisma.calendarEvent.create({
    data: {
      title: '客户演示',
      description: '向客户演示产品原型',
      startAt: new Date(twoDaysAgo.setHours(14, 0, 0, 0)),
      endAt: new Date(twoDaysAgo.setHours(15, 0, 0, 0)),
      type: 'meeting',
      color: '#10b981',
      location: '客户公司',
      ownerId: managerUser.id,
    },
  });

  const pastEvent4 = await prisma.calendarEvent.create({
    data: {
      title: '代码提交截止',
      description: 'Sprint 1 代码冻结',
      startAt: new Date(yesterday.setHours(18, 0, 0, 0)),
      endAt: new Date(yesterday.setHours(18, 0, 0, 0)),
      type: 'task',
      color: '#ef4444',
      allDay: false,
      ownerId: adminUser.id,
    },
  });

  const pastEvent5 = await prisma.calendarEvent.create({
    data: {
      title: '团队建设活动',
      description: '季度团建活动',
      startAt: new Date(lastWeek.setHours(0, 0, 0, 0)),
      endAt: new Date(lastWeek.setHours(23, 59, 59, 0)),
      type: 'holiday',
      color: '#f59e0b',
      allDay: true,
      location: '户外拓展基地',
      ownerId: managerUser.id,
    },
  });

  // Today events (3)
  const event1 = await prisma.calendarEvent.create({
    data: {
      title: '项目周会',
      description: '每周一上午的项目进度同步会议',
      startAt: new Date(today.setHours(10, 0, 0, 0)),
      endAt: new Date(today.setHours(11, 0, 0, 0)),
      type: 'meeting',
      color: '#6366f1',
      location: '会议室A',
      ownerId: managerUser.id,
    },
  });

  const event2Today = await prisma.calendarEvent.create({
    data: {
      title: '一对一沟通',
      description: '与团队成员进行一对一沟通',
      startAt: new Date(today.setHours(14, 0, 0, 0)),
      endAt: new Date(today.setHours(14, 30, 0, 0)),
      type: 'meeting',
      color: '#10b981',
      location: '经理办公室',
      ownerId: managerUser.id,
    },
  });

  const event3Today = await prisma.calendarEvent.create({
    data: {
      title: '提交周报',
      description: '本周工作总结提交',
      startAt: new Date(today.setHours(17, 0, 0, 0)),
      endAt: new Date(today.setHours(17, 30, 0, 0)),
      type: 'reminder',
      color: '#f59e0b',
      ownerId: demoUser.id,
    },
  });

  // Future events (9)
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

  const futureEvent1 = await prisma.calendarEvent.create({
    data: {
      title: '设计评审',
      description: '评审新版UI设计稿',
      startAt: new Date(tomorrow.setHours(10, 0, 0, 0)),
      endAt: new Date(tomorrow.setHours(11, 30, 0, 0)),
      type: 'meeting',
      color: '#ec4899',
      location: '设计部',
      ownerId: users[1].id,
    },
  });

  const futureEvent2 = await prisma.calendarEvent.create({
    data: {
      title: '需求讨论会',
      description: '讨论下一版本功能需求',
      startAt: new Date(dayAfterTomorrow.setHours(9, 30, 0, 0)),
      endAt: new Date(dayAfterTomorrow.setHours(11, 0, 0, 0)),
      type: 'meeting',
      color: '#6366f1',
      location: '会议室C',
      ownerId: managerUser.id,
    },
  });

  const futureEvent3 = await prisma.calendarEvent.create({
    data: {
      title: '测试用例评审',
      description: '评审集成测试用例',
      startAt: new Date(dayAfterTomorrow.setHours(14, 0, 0, 0)),
      endAt: new Date(dayAfterTomorrow.setHours(15, 0, 0, 0)),
      type: 'meeting',
      color: '#10b981',
      location: '线上会议',
      ownerId: users[10].id,
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

  const futureEvent4 = await prisma.calendarEvent.create({
    data: {
      title: '部署上线',
      description: '新版本部署到生产环境',
      startAt: new Date(nextWeek.setHours(22, 0, 0, 0)),
      endAt: new Date(nextWeek.setHours(23, 0, 0, 0)),
      type: 'task',
      color: '#ef4444',
      location: '线上',
      ownerId: users[13].id,
    },
  });

  const futureEvent5 = await prisma.calendarEvent.create({
    data: {
      title: '客户培训',
      description: '为客户提供产品使用培训',
      startAt: new Date(twoWeeksLater.setHours(9, 0, 0, 0)),
      endAt: new Date(twoWeeksLater.setHours(12, 0, 0, 0)),
      type: 'meeting',
      color: '#8b5cf6',
      location: '培训室',
      ownerId: managerUser.id,
    },
  });

  const futureEvent6 = await prisma.calendarEvent.create({
    data: {
      title: '季度总结会',
      description: 'Q1季度工作总结与Q2规划',
      startAt: new Date(twoWeeksLater.setHours(14, 0, 0, 0)),
      endAt: new Date(twoWeeksLater.setHours(17, 0, 0, 0)),
      type: 'meeting',
      color: '#6366f1',
      location: '大会议室',
      ownerId: adminUser.id,
    },
  });

  const calendarEvents = [pastEvent1, pastEvent2, pastEvent3, pastEvent4, pastEvent5, event1, event2Today, event3Today, event2, futureEvent1, futureEvent2, futureEvent3, event3, futureEvent4, futureEvent5, futureEvent6];

  // Event attendees
  await prisma.eventAttendee.createMany({
    data: [
      // Past events attendees
      { eventId: pastEvent1.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent1.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent2.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent2.id, userId: users[0].id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent2.id, userId: users[4].id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent3.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent3.id, userId: users[2].id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent5.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent5.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: pastEvent5.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      // Today events attendees
      { eventId: event1.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event1.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event1.id, userId: users[0].id, status: AttendeeStatus.PENDING },
      { eventId: event2Today.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event2Today.id, userId: users[7].id, status: AttendeeStatus.PENDING },
      // Future events attendees
      { eventId: event2.id, userId: demoUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event2.id, userId: users[0].id, status: AttendeeStatus.ACCEPTED },
      { eventId: event2.id, userId: users[4].id, status: AttendeeStatus.PENDING },
      { eventId: futureEvent1.id, userId: users[1].id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent1.id, userId: users[6].id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent1.id, userId: users[14].id, status: AttendeeStatus.PENDING },
      { eventId: futureEvent2.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent2.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent2.id, userId: users[7].id, status: AttendeeStatus.PENDING },
      { eventId: futureEvent3.id, userId: users[10].id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent3.id, userId: demoUser.id, status: AttendeeStatus.PENDING },
      { eventId: event3.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: event3.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent4.id, userId: users[13].id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent4.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent5.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent5.id, userId: users[2].id, status: AttendeeStatus.PENDING },
      { eventId: futureEvent6.id, userId: adminUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent6.id, userId: managerUser.id, status: AttendeeStatus.ACCEPTED },
      { eventId: futureEvent6.id, userId: demoUser.id, status: AttendeeStatus.PENDING },
      { eventId: futureEvent6.id, userId: users[0].id, status: AttendeeStatus.DECLINED },
    ],
  });

  // Event reminders
  await prisma.eventReminder.createMany({
    data: [
      { eventId: event1.id, remindAt: new Date(today.getTime() - 30 * 60 * 1000) },
      { eventId: event2.id, remindAt: new Date(tomorrow.getTime() - 60 * 60 * 1000) },
      { eventId: event3.id, remindAt: new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000) },
      { eventId: futureEvent1.id, remindAt: new Date(tomorrow.getTime() - 30 * 60 * 1000) },
      { eventId: futureEvent5.id, remindAt: new Date(twoWeeksLater.getTime() - 60 * 60 * 1000) },
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
      isGroup: false, // 1对1聊天 admin-manager
    },
  });

  const conv3 = await prisma.conversation.create({
    data: {
      name: '设计团队群',
      isGroup: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=designteam',
    },
  });

  const conv4 = await prisma.conversation.create({
    data: {
      isGroup: false, // 1对1聊天 admin-demo
    },
  });

  const conv5 = await prisma.conversation.create({
    data: {
      name: '项目讨论组',
      isGroup: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=project',
    },
  });

  const conv6 = await prisma.conversation.create({
    data: {
      isGroup: false, // 1对1聊天 manager-zhangsan
    },
  });

  const conv7 = await prisma.conversation.create({
    data: {
      name: '全员通知群',
      isGroup: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=allstaff',
    },
  });

  const conv8 = await prisma.conversation.create({
    data: {
      isGroup: false, // 1对1聊天 demo-lisi
    },
  });

  const conv9 = await prisma.conversation.create({
    data: {
      name: '运营团队群',
      isGroup: true,
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=opsteam',
    },
  });

  const conv10 = await prisma.conversation.create({
    data: {
      isGroup: false, // 1对1聊天 manager-demo
    },
  });

  // Conversation participants
  await prisma.conversationParticipant.createMany({
    data: [
      // conv1 - 研发团队群
      { conversationId: conv1.id, userId: adminUser.id, role: 'owner', unreadCount: 0 },
      { conversationId: conv1.id, userId: demoUser.id, role: 'member', unreadCount: 2 },
      { conversationId: conv1.id, userId: users[0].id, role: 'member', unreadCount: 5 },
      { conversationId: conv1.id, userId: users[4].id, role: 'member', unreadCount: 3 },
      { conversationId: conv1.id, userId: users[5].id, role: 'member', unreadCount: 1 },
      // conv2 - admin-manager
      { conversationId: conv2.id, userId: adminUser.id, role: 'member', unreadCount: 0 },
      { conversationId: conv2.id, userId: managerUser.id, role: 'member', unreadCount: 1 },
      // conv3 - 设计团队群
      { conversationId: conv3.id, userId: managerUser.id, role: 'owner', unreadCount: 0 },
      { conversationId: conv3.id, userId: users[1].id, role: 'member', unreadCount: 4 },
      { conversationId: conv3.id, userId: users[6].id, role: 'member', unreadCount: 2 },
      { conversationId: conv3.id, userId: users[14].id, role: 'member', unreadCount: 0 },
      // conv4 - admin-demo
      { conversationId: conv4.id, userId: adminUser.id, role: 'member', unreadCount: 1 },
      { conversationId: conv4.id, userId: demoUser.id, role: 'member', unreadCount: 0 },
      // conv5 - 项目讨论组
      { conversationId: conv5.id, userId: adminUser.id, role: 'owner', unreadCount: 0 },
      { conversationId: conv5.id, userId: managerUser.id, role: 'admin', unreadCount: 0 },
      { conversationId: conv5.id, userId: demoUser.id, role: 'member', unreadCount: 3 },
      { conversationId: conv5.id, userId: users[0].id, role: 'member', unreadCount: 2 },
      { conversationId: conv5.id, userId: users[1].id, role: 'member', unreadCount: 1 },
      // conv6 - manager-zhangsan
      { conversationId: conv6.id, userId: managerUser.id, role: 'member', unreadCount: 0 },
      { conversationId: conv6.id, userId: users[0].id, role: 'member', unreadCount: 2 },
      // conv7 - 全员通知群
      { conversationId: conv7.id, userId: adminUser.id, role: 'owner', unreadCount: 0 },
      { conversationId: conv7.id, userId: managerUser.id, role: 'admin', unreadCount: 0 },
      { conversationId: conv7.id, userId: demoUser.id, role: 'member', unreadCount: 5 },
      { conversationId: conv7.id, userId: users[0].id, role: 'member', unreadCount: 5 },
      { conversationId: conv7.id, userId: users[1].id, role: 'member', unreadCount: 5 },
      { conversationId: conv7.id, userId: users[2].id, role: 'member', unreadCount: 5 },
      // conv8 - demo-lisi
      { conversationId: conv8.id, userId: demoUser.id, role: 'member', unreadCount: 0 },
      { conversationId: conv8.id, userId: users[1].id, role: 'member', unreadCount: 1 },
      // conv9 - 运营团队群
      { conversationId: conv9.id, userId: adminUser.id, role: 'owner', unreadCount: 0 },
      { conversationId: conv9.id, userId: users[9].id, role: 'member', unreadCount: 2 },
      { conversationId: conv9.id, userId: users[15].id, role: 'member', unreadCount: 3 },
      // conv10 - manager-demo
      { conversationId: conv10.id, userId: managerUser.id, role: 'member', unreadCount: 1 },
      { conversationId: conv10.id, userId: demoUser.id, role: 'member', unreadCount: 0 },
    ],
  });

  // Messages (more messages per conversation)
  await prisma.message.createMany({
    data: [
      // conv1 - 研发团队群
      { conversationId: conv1.id, senderId: adminUser.id, type: 'text', content: '大家好，欢迎加入研发团队群！' },
      { conversationId: conv1.id, senderId: demoUser.id, type: 'text', content: '你好！很高兴加入团队 🎉' },
      { conversationId: conv1.id, senderId: users[0].id, type: 'text', content: '新版本已经部署到测试环境了' },
      { conversationId: conv1.id, senderId: adminUser.id, type: 'text', content: '好的，我去看一下' },
      { conversationId: conv1.id, senderId: users[4].id, type: 'text', content: '后端 API 已经全部完成了' },
      { conversationId: conv1.id, senderId: users[5].id, type: 'text', content: '前端正在对接中，预计明天完成' },
      { conversationId: conv1.id, senderId: adminUser.id, type: 'text', content: '辛苦大家了！继续保持' },
      { conversationId: conv1.id, senderId: demoUser.id, type: 'text', content: '收到！' },
      // conv2 - admin-manager
      { conversationId: conv2.id, senderId: adminUser.id, type: 'text', content: '张经理，下周的发布计划确认了吗？' },
      { conversationId: conv2.id, senderId: managerUser.id, type: 'text', content: '确认了，周五正式发布' },
      { conversationId: conv2.id, senderId: adminUser.id, type: 'text', content: '好的，我会通知技术团队准备' },
      { conversationId: conv2.id, senderId: managerUser.id, type: 'text', content: '记得提前准备回滚方案' },
      // conv3 - 设计团队群
      { conversationId: conv3.id, senderId: managerUser.id, type: 'text', content: '新的设计稿需要今天完成' },
      { conversationId: conv3.id, senderId: users[1].id, type: 'text', content: '好的，正在处理中' },
      { conversationId: conv3.id, senderId: users[6].id, type: 'text', content: '我负责的图标已经完成了' },
      { conversationId: conv3.id, senderId: users[14].id, type: 'text', content: '视觉稿还需要调整一下细节' },
      { conversationId: conv3.id, senderId: managerUser.id, type: 'text', content: '好的，下班前发给我审核' },
      // conv4 - admin-demo
      { conversationId: conv4.id, senderId: adminUser.id, type: 'text', content: '代码评审的意见你看了吗？' },
      { conversationId: conv4.id, senderId: demoUser.id, type: 'text', content: '看了，正在修改中' },
      { conversationId: conv4.id, senderId: adminUser.id, type: 'text', content: '注意代码规范，保持一致性' },
      { conversationId: conv4.id, senderId: demoUser.id, type: 'text', content: '明白，修改好后提交PR' },
      // conv5 - 项目讨论组
      { conversationId: conv5.id, senderId: adminUser.id, type: 'text', content: '本次迭代的目标是完成核心功能' },
      { conversationId: conv5.id, senderId: managerUser.id, type: 'text', content: '产品需求已经整理好了' },
      { conversationId: conv5.id, senderId: users[0].id, type: 'text', content: '技术方案需要讨论一下' },
      { conversationId: conv5.id, senderId: users[1].id, type: 'text', content: '设计稿预计明天出' },
      { conversationId: conv5.id, senderId: demoUser.id, type: 'text', content: '前端开发可以先开始基础框架' },
      { conversationId: conv5.id, senderId: adminUser.id, type: 'text', content: '好的，明天上午开会讨论细节' },
      // conv6 - manager-zhangsan
      { conversationId: conv6.id, senderId: managerUser.id, type: 'text', content: '张三，这周的工作进度怎么样？' },
      { conversationId: conv6.id, senderId: users[0].id, type: 'text', content: '进度正常，预计按时完成' },
      { conversationId: conv6.id, senderId: managerUser.id, type: 'text', content: '有什么困难及时沟通' },
      // conv7 - 全员通知群
      { conversationId: conv7.id, senderId: adminUser.id, type: 'text', content: '公司将于下周一进行系统升级' },
      { conversationId: conv7.id, senderId: adminUser.id, type: 'text', content: '升级期间请保存好工作内容' },
      { conversationId: conv7.id, senderId: managerUser.id, type: 'text', content: '各部门注意配合' },
      { conversationId: conv7.id, senderId: adminUser.id, type: 'text', content: '预计升级时间：22:00-24:00' },
      { conversationId: conv7.id, senderId: adminUser.id, type: 'text', content: '如有问题请联系IT部门' },
      // conv8 - demo-lisi
      { conversationId: conv8.id, senderId: demoUser.id, type: 'text', content: '李四，设计稿出了吗？' },
      { conversationId: conv8.id, senderId: users[1].id, type: 'text', content: '正在最后调整，马上发你' },
      { conversationId: conv8.id, senderId: demoUser.id, type: 'text', content: '好的，我等你' },
      // conv9 - 运营团队群
      { conversationId: conv9.id, senderId: adminUser.id, type: 'text', content: '本月运营数据汇总一下' },
      { conversationId: conv9.id, senderId: users[9].id, type: 'text', content: '好的，今天下班前发' },
      { conversationId: conv9.id, senderId: users[15].id, type: 'text', content: '用户反馈已经整理好了' },
      // conv10 - manager-demo
      { conversationId: conv10.id, senderId: managerUser.id, type: 'text', content: '演示用户，你的任务完成情况如何？' },
      { conversationId: conv10.id, senderId: demoUser.id, type: 'text', content: '基本完成，还有一些细节需要优化' },
      { conversationId: conv10.id, senderId: managerUser.id, type: 'text', content: '好的，加油！' },
    ],
  });

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      // System notifications
      { userId: demoUser.id, type: 'system', title: '欢迎使用 HaloLight', content: '感谢您使用 HaloLight 管理后台，如有问题请随时反馈。', read: false },
      { userId: adminUser.id, type: 'system', title: '系统更新通知', content: '系统将于今晚 22:00 进行例行维护，预计持续 2 小时。', read: true },
      { userId: managerUser.id, type: 'system', title: '新功能上线', content: '文档协作功能已上线，支持多人实时编辑。', read: false },
      { userId: users[0].id, type: 'system', title: '账户安全提示', content: '建议您开启两步验证，提高账户安全性。', read: false },
      // Task notifications
      { userId: demoUser.id, type: 'task', title: '新任务分配', content: '您有一个新任务：完成用户模块前端开发', link: '/tasks/1', read: false },
      { userId: users[0].id, type: 'task', title: '任务即将截止', content: '任务"API接口开发"将于明天截止，请及时完成。', link: '/tasks/2', read: false },
      { userId: adminUser.id, type: 'task', title: '任务已完成', content: '张三 已完成任务"数据库设计"。', link: '/tasks/3', read: true },
      { userId: managerUser.id, type: 'task', title: '任务审批请求', content: '演示用户 提交了任务完成申请，请审批。', link: '/tasks/4', read: false },
      { userId: users[4].id, type: 'task', title: '新任务分配', content: '您被分配了新任务：后端API优化', link: '/tasks/5', read: false },
      // Message notifications
      { userId: demoUser.id, type: 'message', title: '新消息', content: '张三 在研发团队群中@了您', link: '/messages', read: true },
      { userId: adminUser.id, type: 'message', title: '新私信', content: '张经理 给您发送了一条私信。', link: '/messages', read: false },
      { userId: users[1].id, type: 'message', title: '群消息', content: '设计团队群有 5 条新消息。', link: '/messages', read: false },
      { userId: users[0].id, type: 'message', title: '被@提醒', content: '系统管理员 在项目讨论组中@了您。', link: '/messages', read: false },
      // Alert notifications
      { userId: adminUser.id, type: 'alert', title: '安全提醒', content: '检测到新设备登录，如非本人操作请及时修改密码。', read: false },
      { userId: demoUser.id, type: 'alert', title: '登录异常', content: '您的账户在异地登录，请确认是否为本人操作。', read: true },
      { userId: managerUser.id, type: 'alert', title: '存储空间不足', content: '您的存储空间使用率已达 90%，请及时清理。', read: false },
      { userId: users[3].id, type: 'alert', title: '密码即将过期', content: '您的密码将于 7 天后过期，请及时修改。', read: false },
      // User notifications
      { userId: managerUser.id, type: 'user', title: '成员加入', content: '李四 已加入设计团队', read: true },
      { userId: adminUser.id, type: 'user', title: '新用户注册', content: '新用户 杨八 已完成注册。', read: true },
      { userId: managerUser.id, type: 'user', title: '成员离开', content: '赵六 已退出财务团队。', read: false },
      { userId: users[0].id, type: 'user', title: '关注提醒', content: '张经理 开始关注您了。', read: false },
      { userId: demoUser.id, type: 'user', title: '权限变更', content: '您的角色已从"访客"升级为"编辑员"。', read: true },
      // Additional mixed notifications
      { userId: users[5].id, type: 'system', title: '功能更新', content: '日历功能新增了重复事件设置。', read: false },
      { userId: users[6].id, type: 'task', title: '设计任务', content: '新任务：完成首页视觉设计', link: '/tasks/6', read: false },
      { userId: users[9].id, type: 'message', title: '群通知', content: '运营团队群有新消息。', link: '/messages', read: false },
      { userId: users[10].id, type: 'task', title: '测试任务', content: '请完成用户模块的集成测试。', link: '/tasks/7', read: false },
      { userId: users[13].id, type: 'alert', title: '部署提醒', content: '生产环境部署已完成，请确认。', read: true },
      { userId: adminUser.id, type: 'system', title: '数据备份完成', content: '系统数据备份已于凌晨 3:00 完成。', read: true },
      { userId: managerUser.id, type: 'task', title: '审批提醒', content: '有 3 个待审批的请求等待处理。', link: '/approvals', read: false },
    ],
  });

  // ==================== ACTIVITY LOGS ====================
  console.log('📝 Creating activity logs...');
  await prisma.activityLog.createMany({
    data: [
      // User activities
      { actorId: adminUser.id, action: 'user.create', targetType: 'user', targetId: demoUser.id, metadata: { name: '演示用户' } },
      { actorId: adminUser.id, action: 'user.create', targetType: 'user', targetId: users[0].id, metadata: { name: '张三' } },
      { actorId: adminUser.id, action: 'user.create', targetType: 'user', targetId: users[4].id, metadata: { name: '孙七' } },
      { actorId: adminUser.id, action: 'role.assign', targetType: 'user', targetId: demoUser.id, metadata: { role: 'editor' } },
      { actorId: adminUser.id, action: 'user.update', targetType: 'user', targetId: managerUser.id, metadata: { field: 'department', value: '产品部' } },
      // Document activities
      { actorId: demoUser.id, action: 'document.create', targetType: 'document', targetId: doc1.id, metadata: { title: 'HaloLight API 使用指南' } },
      { actorId: managerUser.id, action: 'document.create', targetType: 'document', targetId: doc2.id, metadata: { title: '2024年度产品规划' } },
      { actorId: users[1].id, action: 'document.create', targetType: 'document', targetId: doc3.id, metadata: { title: 'UI设计规范 v2.0' } },
      { actorId: adminUser.id, action: 'document.update', targetType: 'document', targetId: doc1.id, metadata: { field: 'content' } },
      { actorId: demoUser.id, action: 'document.share', targetType: 'document', targetId: doc6.id, metadata: { sharedWith: 'devTeam' } },
      // Team activities
      { actorId: managerUser.id, action: 'team.create', targetType: 'team', targetId: devTeam.id, metadata: { name: '研发团队' } },
      { actorId: managerUser.id, action: 'team.create', targetType: 'team', targetId: designTeam.id, metadata: { name: '设计团队' } },
      { actorId: adminUser.id, action: 'team.addMember', targetType: 'team', targetId: devTeam.id, metadata: { member: '张三' } },
      { actorId: managerUser.id, action: 'team.addMember', targetType: 'team', targetId: designTeam.id, metadata: { member: '李四' } },
      // File activities
      { actorId: users[1].id, action: 'file.upload', targetType: 'file', targetId: 'logo-file', metadata: { name: 'logo.png' } },
      { actorId: adminUser.id, action: 'file.upload', targetType: 'file', targetId: 'api-spec-file', metadata: { name: 'api-spec.json' } },
      { actorId: managerUser.id, action: 'file.download', targetType: 'file', targetId: 'project-plan-file', metadata: { name: 'project-plan.xlsx' } },
      // Calendar activities
      { actorId: managerUser.id, action: 'event.create', targetType: 'event', targetId: event1.id, metadata: { title: '项目周会' } },
      { actorId: adminUser.id, action: 'event.create', targetType: 'event', targetId: event2.id, metadata: { title: '代码评审' } },
      { actorId: adminUser.id, action: 'event.update', targetType: 'event', targetId: event3.id, metadata: { field: 'attendees' } },
      // Login activities
      { actorId: adminUser.id, action: 'auth.login', targetType: 'session', targetId: 'session-1', metadata: { ip: '192.168.1.1', device: 'Chrome/Windows' } },
      { actorId: demoUser.id, action: 'auth.login', targetType: 'session', targetId: 'session-2', metadata: { ip: '192.168.1.2', device: 'Safari/macOS' } },
      { actorId: managerUser.id, action: 'auth.login', targetType: 'session', targetId: 'session-3', metadata: { ip: '192.168.1.3', device: 'Firefox/Linux' } },
      // Message activities
      { actorId: adminUser.id, action: 'message.send', targetType: 'conversation', targetId: conv1.id, metadata: { type: 'group' } },
      { actorId: demoUser.id, action: 'message.send', targetType: 'conversation', targetId: conv4.id, metadata: { type: 'private' } },
    ],
  });

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${permissions.length} permissions (23 total)`);
  console.log('   - 4 roles (admin, manager, editor, viewer)');
  console.log(`   - ${3 + users.length} users (19 total)`);
  console.log('   - 4 teams');
  console.log(`   - ${documents.length} documents (18 total)`);
  console.log('   - 7 folders');
  console.log('   - 20 files');
  console.log(`   - ${calendarEvents.length} calendar events (16 total)`);
  console.log('   - 10 conversations');
  console.log('   - 45 messages');
  console.log('   - 28 notifications');
  console.log('   - 25 activity logs');
  console.log('\n🔑 Demo Accounts:');
  console.log('   - admin@halolight.h7ml.cn / 123456 (Admin)');
  console.log('   - manager@halolight.h7ml.cn / 123456 (Manager)');
  console.log('   - demo@halolight.h7ml.cn / 123456 (Editor)');
  console.log('   - zhangsan@halolight.h7ml.cn / 123456 (Editor)');
  console.log('   - lisi@halolight.h7ml.cn / 123456 (Editor)');
  console.log('   - wangwu@halolight.h7ml.cn / 123456 (Viewer)');
  console.log('   - zhaoliu@halolight.h7ml.cn / 123456 (Inactive)');
  console.log('   ... and 12 more users');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
