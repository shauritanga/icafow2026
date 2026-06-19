const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.registration.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const groups = {};
  all.forEach(r => {
    if (!groups[r.email]) groups[r.email] = [];
    groups[r.email].push(r);
  });
  
  Object.keys(groups).forEach(email => {
    if (groups[email].length > 1) {
      console.log(`Email: ${email} has ${groups[email].length} registrations`);
      groups[email].forEach(r => {
        console.log(`  - ID: ${r.id}, Type: ${r.type}, CreatedAt: ${r.createdAt}`);
      });
    }
  });
}

main().finally(() => prisma.$disconnect());
