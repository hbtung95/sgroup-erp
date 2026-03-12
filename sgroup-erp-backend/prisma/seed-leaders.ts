import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating Team Leaders...');

  const leaders = [
    { teamCode: 'THE_SUN',     empCode: 'EMP-001', name: 'Lisa - Đặng Thị Mỹ Nhung' },
    { teamCode: 'THE_JUPITER', empCode: 'EMP-006', name: 'Sophia - Trần Ngọc Nguyễn Anh' },
    { teamCode: 'THE_POLARIS', empCode: 'EMP-012', name: 'Silva - Từ Gia Thanh' },
    { teamCode: 'THE_MERCURY', empCode: 'EMP-017', name: 'Vincent - Huỳnh Phú Bình' },
    { teamCode: 'THE_VENUS',   empCode: 'EMP-022', name: 'Otis - Lê Huy Hoàng' },
  ];

  for (const l of leaders) {
    // Lấy SalesStaff record
    const staff = await prisma.salesStaff.findUnique({ where: { employeeCode: l.empCode } });
    if (!staff) { console.log(`❌ Không tìm thấy ${l.empCode}`); continue; }

    // Cập nhật SalesTeam: gán leaderId + leaderName
    await prisma.salesTeam.update({
      where: { code: l.teamCode },
      data: {
        leaderId: staff.id,
        leaderName: l.name,
      },
    });

    // Cập nhật role của trưởng nhóm thành team_lead
    await prisma.salesStaff.update({
      where: { employeeCode: l.empCode },
      data: { role: 'team_lead' },
    });

    console.log(`✅ ${l.teamCode} → Leader: ${l.name}`);
  }

  console.log('\n🎉 All team leaders updated!');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
