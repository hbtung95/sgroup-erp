const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const emps = await p.hrEmployee.findMany({
    select: {
      employeeCode: true, fullName: true, teamId: true,
      department: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { employeeCode: 'asc' },
  });

  const teams = await p.hrTeam.findMany({
    select: { id: true, name: true, department: { select: { id: true, name: true } } },
  });

  console.log('=== EMPLOYEES (' + emps.length + ') ===');
  emps.forEach(e => {
    console.log(
      e.employeeCode, '|', e.fullName,
      '| Dept:', e.department?.name || 'N/A',
      '| Team:', e.team?.name || 'NO TEAM',
      '| teamId:', e.teamId || 'null'
    );
  });

  console.log('\n=== AVAILABLE TEAMS (' + teams.length + ') ===');
  teams.forEach(t => {
    console.log(t.id, '|', t.name, '| Dept:', t.department?.name);
  });

  // Find employees without team
  const noTeam = emps.filter(e => !e.teamId && e.department);
  console.log('\n=== EMPLOYEES WITHOUT TEAM: ' + noTeam.length + ' ===');
  for (const e of noTeam) {
    const matchTeams = teams.filter(t => t.department?.id === e.department?.id);
    console.log(e.employeeCode, e.fullName, '| Dept:', e.department?.name, '| Available teams:', matchTeams.map(t => t.name).join(', ') || 'NONE');
  }

  await p.$disconnect();
}

main().catch(console.error);
