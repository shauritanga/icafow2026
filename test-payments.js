const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(all, null, 2));
}

main().finally(() => prisma.$disconnect());
