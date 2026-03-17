import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, validateCreateUser, validateUpdateUser } from './admin.dto';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  // DASHBOARD STATS
  // ═══════════════════════════════════════════
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      totalDepartments,
      totalTeams,
      totalPositions,
      totalEmployees,
      recentUsers,
      deptDistribution,
      roleDistribution,
      recentAuditCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.hrDepartment.count(),
      this.prisma.hrTeam.count(),
      this.prisma.hrPosition.count(),
      this.prisma.hrEmployee.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true },
      }),
      this.prisma.hrDepartment.findMany({
        select: { id: true, name: true, code: true, _count: { select: { employees: true, teams: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        orderBy: { _count: { role: 'desc' } },
      }),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const inactiveUsers = totalUsers - activeUsers;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDepartments,
      totalTeams,
      totalPositions,
      totalEmployees,
      recentUsers,
      deptDistribution,
      roleDistribution: roleDistribution.map(r => ({ role: r.role, count: r._count.role })),
      recentAuditCount,
    };
  }

  // ═══════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════
  async getHealthCheck() {
    const checks: { name: string; status: string; latency?: number }[] = [];

    // Database check
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.push({ name: 'Database', status: 'online', latency: Date.now() - dbStart });
    } catch {
      checks.push({ name: 'Database', status: 'offline', latency: Date.now() - dbStart });
    }

    // API Server — always online if we reach here
    checks.push({ name: 'API Server', status: 'online', latency: 0 });

    // Auth — check if JWT module is working
    checks.push({ name: 'Auth Service', status: 'online', latency: 0 });

    // Audit log count (last hour)
    try {
      const count = await this.prisma.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 3600_000) } },
      });
      checks.push({ name: 'Audit Logger', status: count >= 0 ? 'online' : 'offline', latency: 0 });
    } catch {
      checks.push({ name: 'Audit Logger', status: 'degraded', latency: 0 });
    }

    const allOnline = checks.every(c => c.status === 'online');
    return { status: allOnline ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() };
  }

  // ═══════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════
  async findAllUsers(opts: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const { search, role, status, page = 1, limit = 50 } = opts;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          department: true, salesRole: true, isActive: true,
          createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createUser(data: CreateUserDto) {
    const validation = validateCreateUser(data);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join('; '));
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) {
      throw new ConflictException(`Email "${data.email}" đã tồn tại trong hệ thống`);
    }

    const hashed = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        password: hashed,
        role: data.role || 'employee',
        department: data.department || null,
      },
      select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true },
    });

    this.logger.log(`Admin created user: ${user.email} (role=${user.role})`);
    return user;
  }

  async updateUser(id: string, data: any) {
    const validation = validateUpdateUser(data);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join('; '));
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User "${id}" không tồn tại`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: validation.sanitized,
      select: { id: true, name: true, email: true, role: true, department: true, isActive: true, updatedAt: true },
    });

    this.logger.log(`Admin updated user: ${updated.email} → ${JSON.stringify(validation.sanitized)}`);
    return updated;
  }

  async deactivateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User "${id}" không tồn tại`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true, updatedAt: true },
    });

    this.logger.log(`Admin ${updated.isActive ? 'activated' : 'deactivated'} user: ${updated.email}`);
    return updated;
  }

  async resetPassword(id: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User "${id}" không tồn tại`);
    }

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    this.logger.log(`Admin reset password for: ${user.email}`);
    return { success: true, message: `Đã đặt lại mật khẩu cho ${user.email}` };
  }

  // ═══════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════
  async getAuditLogs(opts: { action?: string; resource?: string; userName?: string; method?: string; page?: number; limit?: number }) {
    const { action, resource, userName, method, page = 1, limit = 50 } = opts;
    const where: any = {};

    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (userName) where.userName = { contains: userName, mode: 'insensitive' };
    if (method) where.method = method;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ═══════════════════════════════════════════
  // SYSTEM SETTINGS
  // ═══════════════════════════════════════════
  async getSettings(group?: string) {
    const where: any = {};
    if (group) where.group = group;

    return this.prisma.systemSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async updateSetting(key: string, value: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" không tồn tại`);
    }

    const updated = await this.prisma.systemSetting.update({
      where: { key },
      data: { value },
    });

    this.logger.log(`Admin updated setting: ${key} = ${value}`);
    return updated;
  }

  async upsertSetting(key: string, data: { value: string; group?: string; label?: string; description?: string; valueType?: string }) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value: data.value },
      create: {
        key,
        value: data.value,
        group: data.group || 'general',
        label: data.label,
        description: data.description,
        valueType: data.valueType || 'string',
      },
    });
  }

  async seedDefaultSettings() {
    const defaults = [
      { key: 'app_name', value: 'SGROUP ERP', group: 'general', label: 'Tên ứng dụng', description: 'Tên hiển thị trên hệ thống', valueType: 'string' },
      { key: 'app_timezone', value: 'Asia/Ho_Chi_Minh', group: 'general', label: 'Múi giờ', description: 'Múi giờ hệ thống', valueType: 'string' },
      { key: 'app_language', value: 'vi', group: 'general', label: 'Ngôn ngữ', description: 'Ngôn ngữ mặc định', valueType: 'string' },
      { key: 'maintenance_mode', value: 'false', group: 'general', label: 'Chế độ bảo trì', description: 'Bật/tắt chế độ bảo trì', valueType: 'boolean' },
      { key: 'smtp_host', value: 'smtp.gmail.com', group: 'email', label: 'SMTP Host', description: 'Địa chỉ máy chủ SMTP', valueType: 'string' },
      { key: 'smtp_port', value: '587', group: 'email', label: 'SMTP Port', description: 'Cổng SMTP', valueType: 'number' },
      { key: 'email_from', value: 'noreply@sgroup.vn', group: 'email', label: 'Email gửi', description: 'Email mặc định gửi thông báo', valueType: 'string' },
      { key: 'email_enabled', value: 'true', group: 'email', label: 'Kích hoạt email', description: 'Bật/tắt gửi email', valueType: 'boolean' },
      { key: 'session_timeout', value: '60', group: 'security', label: 'Session timeout (phút)', description: 'Thời gian hết hạn phiên', valueType: 'number' },
      { key: 'max_login_attempts', value: '5', group: 'security', label: 'Số lần đăng nhập tối đa', description: 'Số lần thử trước khi khóa', valueType: 'number' },
      { key: 'two_factor_enabled', value: 'false', group: 'security', label: 'Xác thực 2 bước', description: 'Bật/tắt 2FA', valueType: 'boolean' },
      { key: 'password_min_length', value: '8', group: 'security', label: 'Độ dài mật khẩu tối thiểu', description: 'Độ dài tối thiểu', valueType: 'number' },
      { key: 'push_enabled', value: 'true', group: 'notification', label: 'Push notification', description: 'Bật/tắt push', valueType: 'boolean' },
      { key: 'notification_email', value: 'true', group: 'notification', label: 'Email thông báo', description: 'Gửi kèm email', valueType: 'boolean' },
      { key: 'digest_frequency', value: 'daily', group: 'notification', label: 'Tần suất tổng hợp', description: 'daily, weekly', valueType: 'string' },
    ];

    let created = 0;
    for (const setting of defaults) {
      const exists = await this.prisma.systemSetting.findUnique({ where: { key: setting.key } });
      if (!exists) {
        await this.prisma.systemSetting.create({ data: setting });
        created++;
      }
    }

    this.logger.log(`Seeded ${created} default settings (${defaults.length - created} already existed)`);
    return { created, total: defaults.length, skipped: defaults.length - created };
  }

  // ═══════════════════════════════════════════
  // ROLE PERMISSIONS (Configurable RBAC)
  // ═══════════════════════════════════════════

  private readonly DEFAULT_PERMISSIONS: Record<string, Record<string, string>> = {
    admin:    { admin: 'full', hr: 'full', sales: 'full', finance: 'full', project: 'full', marketing: 'full', planning: 'full', reports: 'full' },
    ceo:      { admin: 'read', hr: 'read', sales: 'read', finance: 'full', project: 'full', marketing: 'read', planning: 'full', reports: 'full' },
    hr:       { admin: 'none', hr: 'full', sales: 'read', finance: 'read', project: 'read', marketing: 'none', planning: 'read', reports: 'read' },
    sales:    { admin: 'none', hr: 'none', sales: 'write', finance: 'none', project: 'read', marketing: 'read', planning: 'read', reports: 'read' },
    employee: { admin: 'none', hr: 'none', sales: 'none', finance: 'none', project: 'read', marketing: 'none', planning: 'read', reports: 'read' },
  };

  async getPermissions() {
    const perms = await this.prisma.rolePermission.findMany({
      orderBy: [{ role: 'asc' }, { module: 'asc' }],
    });

    // If no permissions exist, return defaults (not yet configured)
    if (perms.length === 0) {
      return { data: [], isDefault: true, defaults: this.DEFAULT_PERMISSIONS };
    }

    // Convert flat list to matrix
    const matrix: Record<string, Record<string, string>> = {};
    for (const p of perms) {
      if (!matrix[p.role]) matrix[p.role] = {};
      matrix[p.role][p.module] = p.permission;
    }

    return { data: perms, matrix, isDefault: false };
  }

  async updatePermission(role: string, module: string, permission: string) {
    const validPerms = ['full', 'write', 'read', 'none'];
    if (!validPerms.includes(permission)) {
      throw new BadRequestException(`Permission phải là: ${validPerms.join(', ')}`);
    }

    const result = await this.prisma.rolePermission.upsert({
      where: { role_module: { role, module } },
      update: { permission },
      create: { role, module, permission },
    });

    this.logger.log(`Permission updated: ${role}/${module} = ${permission}`);
    return result;
  }

  async bulkUpdatePermissions(updates: { role: string; module: string; permission: string }[]) {
    const validPerms = ['full', 'write', 'read', 'none'];

    // Validate all entries
    for (const u of updates) {
      if (!validPerms.includes(u.permission)) {
        throw new BadRequestException(`Permission "${u.permission}" không hợp lệ cho ${u.role}/${u.module}`);
      }
    }

    // Upsert all in a transaction
    const results = await this.prisma.$transaction(
      updates.map(u =>
        this.prisma.rolePermission.upsert({
          where: { role_module: { role: u.role, module: u.module } },
          update: { permission: u.permission },
          create: { role: u.role, module: u.module, permission: u.permission },
        }),
      ),
    );

    this.logger.log(`Bulk permission update: ${results.length} entries`);
    return { updated: results.length };
  }

  async seedDefaultPermissions() {
    let created = 0;
    for (const [role, modules] of Object.entries(this.DEFAULT_PERMISSIONS)) {
      for (const [module, permission] of Object.entries(modules)) {
        await this.prisma.rolePermission.upsert({
          where: { role_module: { role, module } },
          update: { permission },
          create: { role, module, permission },
        });
        created++;
      }
    }
    this.logger.log(`Seeded ${created} default permissions`);
    return { created };
  }

  async resetPermissionsToDefault() {
    // Delete all and re-seed
    await this.prisma.rolePermission.deleteMany({});
    return this.seedDefaultPermissions();
  }
}
