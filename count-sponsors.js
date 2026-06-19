const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.registration.count({
    where: {
      type: 'SPONSOR',
      status: 'CONFIRMED'
    }
  });
  
  const sponsors = await prisma.registration.findMany({
    where: {
      type: 'SPONSOR',
      status: 'CONFIRMED'
    },
    select: {
      organization: true
    }
  });
  
  console.log(`Total Confirmed Sponsors: ${count}`);
  sponsors.forEach(s => console.log(`- ${s.organization}`));
}

main().finally(() => prisma.$disconnect());
