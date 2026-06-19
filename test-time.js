const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.registration.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  for(let i=0; i < all.length - 1; i++) {
    const diff = Math.abs(all[i].createdAt - all[i+1].createdAt);
    if (diff < 5000) {
      console.log(`Duplicate found within 5s!`);
      console.log(all[i].id, all[i].createdAt);
      console.log(all[i+1].id, all[i+1].createdAt);
    }
  }
  console.log("Check complete.");
}

main().finally(() => prisma.$disconnect());
