import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Seeding User accounts for Sales staff...');

  // Map employee codes to their data (must match seed-sales.ts)
  const staffList = [
    // The Sun
    { empCode: 'EMP-001', name: 'Lisa - Đặng Thị Mỹ Nhung',       email: 'lisanhung.sgroup@gmail.com',      salesRole: 'team_lead',  teamCode: 'THE_SUN' },
    { empCode: 'EMP-002', name: 'Chloe - Nguyễn Thị Xuân Mai',     email: 'chloemai.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_SUN' },
    { empCode: 'EMP-003', name: 'Tini - Nguyễn Thị Ngọc Trinh',    email: 'tinitrinh.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_SUN' },
    { empCode: 'EMP-004', name: 'David - Nguyễn Công Thảo',         email: 'davidthao.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_SUN' },
    { empCode: 'EMP-005', name: 'Darius - Phạm Văn Thiệu',         email: 'dariusthieu.sgroup@gmail.com',    salesRole: 'sales',      teamCode: 'THE_SUN' },
    // The Jupiter
    { empCode: 'EMP-006', name: 'Sophia - Trần Ngọc Nguyễn Anh',   email: 'sophiaanh.sgroup@gmail.com',      salesRole: 'team_lead',  teamCode: 'THE_JUPITER' },
    { empCode: 'EMP-007', name: 'Helios - Đinh Trần Thế Anh',      email: 'heliosanh.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_JUPITER' },
    { empCode: 'EMP-008', name: 'Mina - Đỗ Nguyễn Yến Nhi',        email: 'minanhi.sgroup@gmail.com',        salesRole: 'sales',      teamCode: 'THE_JUPITER' },
    { empCode: 'EMP-009', name: 'Kazu - Trần Thạch Thanh Hoài',     email: 'kazuhoai.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_JUPITER' },
    { empCode: 'EMP-010', name: 'Sunnie - Lê Bích Nhi',             email: 'sunnienhi.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_JUPITER' },
    { empCode: 'EMP-011', name: 'Victoria - Hoàng Thị Quỳnh Trang', email: 'victoriatrang.sgroup@gmail.com',  salesRole: 'sales',      teamCode: 'THE_JUPITER' },
    // The Polaris
    { empCode: 'EMP-012', name: 'Silva - Từ Gia Thanh',              email: 'silvathanh.sgroup@gmail.com',     salesRole: 'team_lead',  teamCode: 'THE_POLARIS' },
    { empCode: 'EMP-013', name: 'Iris - Huỳnh Thị Thúy Kiều',       email: 'iriskieu.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_POLARIS' },
    { empCode: 'EMP-014', name: 'Liam - Phan Thanh Liêm',            email: 'liamliem.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_POLARIS' },
    { empCode: 'EMP-015', name: 'Nami - Ngô Thị Thanh Ngân',         email: 'namingan.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_POLARIS' },
    { empCode: 'EMP-016', name: 'Ruby - Mai Thủy Ngọc Kim',          email: 'rubykim.sgroup@gmail.com',        salesRole: 'sales',      teamCode: 'THE_POLARIS' },
    // The Mercury
    { empCode: 'EMP-017', name: 'Vincent - Huỳnh Phú Bình',          email: 'vincentbinh.sgroup@gmail.com',    salesRole: 'team_lead',  teamCode: 'THE_MERCURY' },
    { empCode: 'EMP-018', name: 'Felix - Đoàn Minh Anh',             email: 'felixanh.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_MERCURY' },
    { empCode: 'EMP-019', name: 'Aston - Nguyễn Hoàng Anh Tuấn',    email: 'astontuan.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_MERCURY' },
    { empCode: 'EMP-020', name: 'Kaylee - Trần Phương Linh',         email: 'kaylee.sgroup@gmail.com',         salesRole: 'sales',      teamCode: 'THE_MERCURY' },
    { empCode: 'EMP-021', name: 'Helen - Lê Thị Ngọc Như',           email: 'helennhu.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_MERCURY' },
    // The Venus
    { empCode: 'EMP-022', name: 'Otis - Lê Huy Hoàng',               email: 'otishoang.sgroup@gmail.com',      salesRole: 'team_lead',  teamCode: 'THE_VENUS' },
    { empCode: 'EMP-023', name: 'Sol - Hồ Đắc Duy Khánh',           email: 'solkhanh.sgroup@gmail.com',       salesRole: 'sales',      teamCode: 'THE_VENUS' },
    { empCode: 'EMP-024', name: 'Cookie - Lưu Hữu Lợi',             email: 'cookieloi.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_VENUS' },
    { empCode: 'EMP-025', name: 'Alice - Đỗ Hoàng Kim Ngân',         email: 'alicengan.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_VENUS' },
    { empCode: 'EMP-026', name: 'Anna - Hồ Minh Trang',              email: 'annatrang.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_VENUS' },
    { empCode: 'EMP-027', name: 'Anita - Nguyễn Thị Thúy Diễm',     email: 'anitadiem.sgroup@gmail.com',      salesRole: 'sales',      teamCode: 'THE_VENUS' },
  ];

  // Hash default password
  const salt = await bcrypt.genSalt();
  const defaultPassword = await bcrypt.hash('123456', salt);

  // Get team IDs
  const allTeams = await prisma.salesTeam.findMany();
  const teamMap: Record<string, string> = {};
  for (const t of allTeams) {
    teamMap[t.code] = t.id;
  }

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@sgroup.vn' },
    update: {},
    create: {
      email: 'admin@sgroup.vn',
      name: 'Admin SGROUP',
      password: defaultPassword,
      role: 'admin',
      department: 'MANAGEMENT',
    },
  });
  console.log('✅ Admin account: admin@sgroup.vn');

  // Create sales_manager user
  await prisma.user.upsert({
    where: { email: 'manager@sgroup.vn' },
    update: {},
    create: {
      email: 'manager@sgroup.vn',
      name: 'Sales Manager',
      password: defaultPassword,
      role: 'employee',
      department: 'SALES',
      salesRole: 'sales_manager',
    },
  });
  console.log('✅ Sales Manager account: manager@sgroup.vn');

  // Create user accounts for all 27 staff
  for (const s of staffList) {
    const teamId = teamMap[s.teamCode];

    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        salesRole: s.salesRole,
        teamId: teamId,
        department: 'SALES',
      },
      create: {
        email: s.email,
        name: s.name,
        password: defaultPassword,
        role: 'employee',
        department: 'SALES',
        salesRole: s.salesRole,
        teamId: teamId,
      },
    });

    // Link User → SalesStaff
    const staff = await prisma.salesStaff.findUnique({
      where: { employeeCode: s.empCode },
    });
    if (staff) {
      await prisma.salesStaff.update({
        where: { id: staff.id },
        data: { userId: user.id },
      });
    }

    console.log(`  🔑 [${s.empCode}] ${s.name} → ${s.salesRole}`);
  }

  console.log(`\n🎉 User seeding complete! Created ${staffList.length + 2} accounts.`);
  console.log('   Default password: 123456');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
