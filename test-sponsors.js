const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.registration.findMany({
    where: { type: 'SPONSOR' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(all, null, 2));
}

main().finally(() => prisma.$disconnect());
