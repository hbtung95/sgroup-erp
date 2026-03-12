import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Sales Department data...');

  // 1. Tạo Phòng ban HR — Phòng Kinh Doanh
  const dept = await prisma.hrDepartment.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      code: 'SALES',
      name: 'Phòng Kinh Doanh',
      description: 'Phòng Kinh Doanh - Sales Department',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Department:', dept.name);

  // 2. Tạo 5 Sales Teams
  const teamsData = [
    { code: 'THE_SUN',     name: 'The Sun',     sortOrder: 1 },
    { code: 'THE_JUPITER', name: 'The Jupiter',  sortOrder: 2 },
    { code: 'THE_POLARIS', name: 'The Polaris',  sortOrder: 3 },
    { code: 'THE_MERCURY', name: 'The Mercury',  sortOrder: 4 },
    { code: 'THE_VENUS',   name: 'The Venus',    sortOrder: 5 },
  ];

  const teams: Record<string, any> = {};
  for (const t of teamsData) {
    const team = await prisma.salesTeam.upsert({
      where: { code: t.code },
      update: { name: t.name, departmentId: dept.id },
      create: {
        code: t.code,
        name: t.name,
        departmentId: dept.id,
        region: 'HCM',
        status: 'ACTIVE',
        sortOrder: t.sortOrder,
      },
    });
    teams[t.name] = team;
    console.log('✅ Team:', team.name, '→', team.id);
  }

  // 3. Danh sách nhân viên
  const staffList = [
    // The Sun
    { fullName: 'Đặng Thị Mỹ Nhung',      nickName: 'Lisa',     email: 'lisanhung.sgroup@gmail.com',      team: 'The Sun' },
    { fullName: 'Nguyễn Thị Xuân Mai',      nickName: 'Chloe',    email: 'chloemai.sgroup@gmail.com',       team: 'The Sun' },
    { fullName: 'Nguyễn Thị Ngọc Trinh',    nickName: 'Tini',     email: 'tinitrinh.sgroup@gmail.com',      team: 'The Sun' },
    { fullName: 'Nguyễn Công Thảo',          nickName: 'David',    email: 'davidthao.sgroup@gmail.com',      team: 'The Sun' },
    { fullName: 'Phạm Văn Thiệu',           nickName: 'Darius',   email: 'dariusthieu.sgroup@gmail.com',    team: 'The Sun' },
    // The Jupiter
    { fullName: 'Trần Ngọc Nguyễn Anh',     nickName: 'Sophia',   email: 'sophiaanh.sgroup@gmail.com',      team: 'The Jupiter' },
    { fullName: 'Đinh Trần Thế Anh',        nickName: 'Helios',   email: 'heliosanh.sgroup@gmail.com',      team: 'The Jupiter' },
    { fullName: 'Đỗ Nguyễn Yến Nhi',        nickName: 'Mina',     email: 'minanhi.sgroup@gmail.com',        team: 'The Jupiter' },
    { fullName: 'Trần Thạch Thanh Hoài',    nickName: 'Kazu',     email: 'kazuhoai.sgroup@gmail.com',       team: 'The Jupiter' },
    { fullName: 'Lê Bích Nhi',              nickName: 'Sunnie',   email: 'sunnienhi.sgroup@gmail.com',      team: 'The Jupiter' },
    { fullName: 'Hoàng Thị Quỳnh Trang',    nickName: 'Victoria', email: 'victoriatrang.sgroup@gmail.com',  team: 'The Jupiter' },
    // The Polaris
    { fullName: 'Từ Gia Thanh',              nickName: 'Silva',    email: 'silvathanh.sgroup@gmail.com',     team: 'The Polaris' },
    { fullName: 'Huỳnh Thị Thúy Kiều',      nickName: 'Iris',     email: 'iriskieu.sgroup@gmail.com',       team: 'The Polaris' },
    { fullName: 'Phan Thanh Liêm',           nickName: 'Liam',     email: 'liamliem.sgroup@gmail.com',       team: 'The Polaris' },
    { fullName: 'Ngô Thị Thanh Ngân',        nickName: 'Nami',     email: 'namingan.sgroup@gmail.com',       team: 'The Polaris' },
    { fullName: 'Mai Thủy Ngọc Kim',         nickName: 'Ruby',     email: 'rubykim.sgroup@gmail.com',        team: 'The Polaris' },
    // The Mercury
    { fullName: 'Huỳnh Phú Bình',           nickName: 'Vincent',  email: 'vincentbinh.sgroup@gmail.com',    team: 'The Mercury' },
    { fullName: 'Đoàn Minh Anh',            nickName: 'Felix',    email: 'felixanh.sgroup@gmail.com',       team: 'The Mercury' },
    { fullName: 'Nguyễn Hoàng Anh Tuấn',    nickName: 'Aston',    email: 'astontuan.sgroup@gmail.com',      team: 'The Mercury' },
    { fullName: 'Trần Phương Linh',          nickName: 'Kaylee',   email: 'kaylee.sgroup@gmail.com',         team: 'The Mercury' },
    { fullName: 'Lê Thị Ngọc Như',           nickName: 'Helen',    email: 'helennhu.sgroup@gmail.com',       team: 'The Mercury' },
    // The Venus
    { fullName: 'Lê Huy Hoàng',             nickName: 'Otis',     email: 'otishoang.sgroup@gmail.com',      team: 'The Venus' },
    { fullName: 'Hồ Đắc Duy Khánh',         nickName: 'Sol',      email: 'solkhanh.sgroup@gmail.com',       team: 'The Venus' },
    { fullName: 'Lưu Hữu Lợi',              nickName: 'Cookie',   email: 'cookieloi.sgroup@gmail.com',      team: 'The Venus' },
    { fullName: 'Đỗ Hoàng Kim Ngân',         nickName: 'Alice',    email: 'alicengan.sgroup@gmail.com',      team: 'The Venus' },
    { fullName: 'Hồ Minh Trang',             nickName: 'Anna',     email: 'annatrang.sgroup@gmail.com',      team: 'The Venus' },
    { fullName: 'Nguyễn Thị Thúy Diễm',      nickName: 'Anita',    email: 'anitadiem.sgroup@gmail.com',      team: 'The Venus' },
  ];

  let idx = 1;
  for (const s of staffList) {
    const empCode = `EMP-${String(idx).padStart(3, '0')}`;
    const team = teams[s.team];

    // Tạo hồ sơ HR Employee
    const hrEmployee = await prisma.hrEmployee.upsert({
      where: { employeeCode: empCode },
      update: {
        fullName: s.fullName,
        email: s.email,
        departmentId: dept.id,
      },
      create: {
        employeeCode: empCode,
        fullName: s.fullName,
        email: s.email,
        departmentId: dept.id,
        joinDate: new Date('2026-01-01'),
        status: 'ACTIVE',
      },
    });

    // Tạo SalesStaff và liên kết với HrEmployee + SalesTeam
    await prisma.salesStaff.upsert({
      where: { employeeCode: empCode },
      update: {
        fullName: `${s.nickName} - ${s.fullName}`,
        email: s.email,
        teamId: team.id,
        hrEmployeeId: hrEmployee.id,
      },
      create: {
        hrEmployeeId: hrEmployee.id,
        employeeCode: empCode,
        fullName: `${s.nickName} - ${s.fullName}`,
        phone: null,
        email: s.email,
        teamId: team.id,
        role: 'sales',
        status: 'ACTIVE',
        joinDate: new Date('2026-01-01'),
        leadsCapacity: 30,
        personalTarget: 0,
      },
    });

    console.log(`  👤 [${empCode}] ${s.nickName} (${s.fullName}) → ${s.team}`);
    idx++;
  }

  console.log(`\n🎉 Seeding complete! Inserted ${staffList.length} staff into ${Object.keys(teams).length} teams.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
