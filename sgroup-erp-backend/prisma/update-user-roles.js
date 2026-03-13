const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Update all sales staff users with correct salesRole
  const staffEmails = {
    'lisanhung.sgroup@gmail.com': 'team_lead',
    'sophiaanh.sgroup@gmail.com': 'team_lead',
    'silvathanh.sgroup@gmail.com': 'team_lead',
    'vincentbinh.sgroup@gmail.com': 'team_lead',
    'otishoang.sgroup@gmail.com': 'team_lead',
  };

  for (const [email, salesRole] of Object.entries(staffEmails)) {
    const user = await p.user.findFirst({ where: { email } });
    if (user) {
      // Find corresponding SalesStaff to get teamId
      const staff = await p.salesStaff.findFirst({ where: { email } });
      await p.user.update({
        where: { id: user.id },
        data: { 
          salesRole,
          department: 'SALES',
          teamId: staff?.teamId || null,
        },
      });
      console.log('Updated', email, '→ salesRole:', salesRole, 'teamId:', staff?.teamId);
    } else {
      console.log('User not found:', email);
    }
  }

  // Also update all remaining sales users with 'sales' role
  const allStaff = await p.salesStaff.findMany({ where: { role: 'sales' } });
  for (const s of allStaff) {
    if (s.email) {
      const user = await p.user.findFirst({ where: { email: s.email } });
      if (user && !user.salesRole) {
        await p.user.update({
          where: { id: user.id },
          data: { salesRole: 'sales', department: 'SALES', teamId: s.teamId },
        });
        console.log('Updated', s.email, '→ salesRole: sales');
      }
    }
  }

  await p["$disconnect"]();
  console.log('Done!');
}

main();
