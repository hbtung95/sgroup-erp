/**
 * seed-sales-staff.js — Seed REAL sales teams and staff data
 * Run: node prisma/seed-sales-staff.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Xóa dữ liệu cũ...');
  await prisma.salesStaff.deleteMany({});
  await prisma.salesTeam.deleteMany({});

  console.log('🌱 Tạo dữ liệu thật...');

  // ── 5 Teams ──
  const teams = [
    { code: 'THE-SUN',     name: 'The Sun',     leaderName: 'Đặng Thị Mỹ Nhung',    region: 'HCM' },
    { code: 'THE-JUPITER', name: 'The Jupiter',  leaderName: 'Trần Ngọc Nguyễn Anh', region: 'HCM' },
    { code: 'THE-POLARIS', name: 'The Polaris',  leaderName: 'Từ Gia Thanh',          region: 'HCM' },
    { code: 'THE-MERCURY', name: 'The Mercury',  leaderName: 'Huỳnh Phú Bình',        region: 'HCM' },
    { code: 'THE-VENUS',   name: 'The Venus',    leaderName: 'Lê Huy Hoàng',          region: 'HCM' },
  ];

  const teamMap = {};
  for (const t of teams) {
    const team = await prisma.salesTeam.create({ data: t });
    teamMap[t.name] = team;
    console.log(`  ✅ Team: ${team.name} (${team.id})`);
  }

  // ── 27 Staff members ──
  const staffData = [
    // The Sun (5 members)
    { fullName: 'Đặng Thị Mỹ Nhung',     employeeCode: 'NV001', email: 'lisanhung.sgroup@gmail.com',     role: 'team_lead', team: 'The Sun' },
    { fullName: 'Nguyễn Thị Xuân Mai',    employeeCode: 'NV002', email: 'chloemai.sgroup@gmail.com',      role: 'sales',     team: 'The Sun' },
    { fullName: 'Nguyễn Thị Ngọc Trinh',  employeeCode: 'NV003', email: 'tinitrinh.sgroup@gmail.com',     role: 'sales',     team: 'The Sun' },
    { fullName: 'Nguyễn Công Thảo',        employeeCode: 'NV004', email: 'davidthao.sgroup@gmail.com',     role: 'sales',     team: 'The Sun' },
    { fullName: 'Phạm Văn Thiệu',         employeeCode: 'NV005', email: 'dariusthieu.sgroup@gmail.com',   role: 'sales',     team: 'The Sun' },

    // The Jupiter (6 members)
    { fullName: 'Trần Ngọc Nguyễn Anh',   employeeCode: 'NV006', email: 'sophiaanh.sgroup@gmail.com',     role: 'team_lead', team: 'The Jupiter' },
    { fullName: 'Đinh Trần Thế Anh',      employeeCode: 'NV007', email: 'heliosanh.sgroup@gmail.com',     role: 'sales',     team: 'The Jupiter' },
    { fullName: 'Đỗ Nguyễn Yến Nhi',      employeeCode: 'NV008', email: 'minanhi.sgroup@gmail.com',       role: 'sales',     team: 'The Jupiter' },
    { fullName: 'Trần Thạch Thanh Hoài',  employeeCode: 'NV009', email: 'kazuhoai.sgroup@gmail.com',      role: 'sales',     team: 'The Jupiter' },
    { fullName: 'Lê Bích Nhi',            employeeCode: 'NV010', email: 'sunnienhi.sgroup@gmail.com',     role: 'sales',     team: 'The Jupiter' },
    { fullName: 'Hoàng Thị Quỳnh Trang',  employeeCode: 'NV011', email: 'victoriatrang.sgroup@gmail.com', role: 'sales',     team: 'The Jupiter' },

    // The Polaris (5 members)
    { fullName: 'Từ Gia Thanh',            employeeCode: 'NV012', email: 'silvathanh.sgroup@gmail.com',    role: 'team_lead', team: 'The Polaris' },
    { fullName: 'Huỳnh Thị Thúy Kiều',    employeeCode: 'NV013', email: 'iriskieu.sgroup@gmail.com',      role: 'sales',     team: 'The Polaris' },
    { fullName: 'Phan Thanh Liêm',         employeeCode: 'NV014', email: 'liamliem.sgroup@gmail.com',      role: 'sales',     team: 'The Polaris' },
    { fullName: 'Ngô Thị Thanh Ngân',      employeeCode: 'NV015', email: 'namingan.sgroup@gmail.com',      role: 'sales',     team: 'The Polaris' },
    { fullName: 'Mai Thủy Ngọc Kim',       employeeCode: 'NV016', email: 'rubykim.sgroup@gmail.com',       role: 'sales',     team: 'The Polaris' },

    // The Mercury (5 members)
    { fullName: 'Huỳnh Phú Bình',         employeeCode: 'NV017', email: 'vincentbinh.sgroup@gmail.com',   role: 'team_lead', team: 'The Mercury' },
    { fullName: 'Đoàn Minh Anh',          employeeCode: 'NV018', email: 'felixanh.sgroup@gmail.com',      role: 'sales',     team: 'The Mercury' },
    { fullName: 'Nguyễn Hoàng Anh Tuấn',  employeeCode: 'NV019', email: 'astontuan.sgroup@gmail.com',     role: 'sales',     team: 'The Mercury' },
    { fullName: 'Trần Phương Linh',        employeeCode: 'NV020', email: 'kaylee.sgroup@gmail.com',        role: 'sales',     team: 'The Mercury' },
    { fullName: 'Lê Thị Ngọc Như',         employeeCode: 'NV021', email: 'helennhu.sgroup@gmail.com',      role: 'sales',     team: 'The Mercury' },

    // The Venus (6 members)
    { fullName: 'Lê Huy Hoàng',           employeeCode: 'NV022', email: 'otishoang.sgroup@gmail.com',     role: 'team_lead', team: 'The Venus' },
    { fullName: 'Hồ Đắc Duy Khánh',       employeeCode: 'NV023', email: 'solkhanh.sgroup@gmail.com',      role: 'sales',     team: 'The Venus' },
    { fullName: 'Lưu Hữu Lợi',            employeeCode: 'NV024', email: 'cookieloi.sgroup@gmail.com',     role: 'sales',     team: 'The Venus' },
    { fullName: 'Đỗ Hoàng Kim Ngân',      employeeCode: 'NV025', email: 'alicengan.sgroup@gmail.com',     role: 'sales',     team: 'The Venus' },
    { fullName: 'Hồ Minh Trang',           employeeCode: 'NV026', email: 'annatrang.sgroup@gmail.com',     role: 'sales',     team: 'The Venus' },
    { fullName: 'Nguyễn Thị Thúy Diễm',   employeeCode: 'NV027', email: 'anitadiem.sgroup@gmail.com',     role: 'sales',     team: 'The Venus' },
  ];

  for (const s of staffData) {
    const { team: teamName, ...data } = s;
    const staff = await prisma.salesStaff.create({
      data: {
        ...data,
        teamId: teamMap[teamName].id,
        status: 'ACTIVE',
        personalTarget: data.role === 'team_lead' ? 5 : 2,
        leadsCapacity: data.role === 'team_lead' ? 50 : 30,
        joinDate: new Date('2024-01-15'),
      },
    });

    // Set leaderId for team leads
    if (data.role === 'team_lead') {
      await prisma.salesTeam.update({
        where: { id: teamMap[teamName].id },
        data: { leaderId: staff.id },
      });
    }

    console.log(`  ✅ ${staff.employeeCode} ${staff.fullName} → ${teamName}`);
  }

  console.log(`\n🎉 Done! ${teams.length} teams, ${staffData.length} nhân viên.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
