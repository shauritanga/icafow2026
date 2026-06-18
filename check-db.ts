import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.adminUser.findMany();
  console.log("Admins count:", admins.length);
  if (admins.length > 0) {
    console.log("Admins:", admins.map(a => ({ id: a.id, email: a.email, fcmTokensCount: a.fcmTokens.length })));
  }

  const jobs = await prisma.notificationJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log("Recent Notification Jobs:");
  for (const job of jobs) {
    console.log(`- [${job.status}] ${job.type} (Retry: ${job.retryCount}) ${job.errorLog ? 'Error: ' + job.errorLog : ''}`);
  }

  const inApp = await prisma.inAppNotification.count();
  console.log("Total InAppNotifications:", inApp);
}

main().catch(console.error).finally(() => prisma.$disconnect());
