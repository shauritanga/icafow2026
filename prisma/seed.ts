import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@icafow.org";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "ICAFoW Admin", passwordHash, role: "admin" },
  });
  console.log(`✔ Seeded admin user: ${email}`);

  // A couple of sample registrations so the dashboard isn't empty.
  const samples = [
    {
      reference: "ICA-DEMO01",
      type: "ATTENDEE" as const,
      status: "CONFIRMED" as const,
      fullName: "Amina Mussa",
      email: "amina@example.com",
      organization: "University of Dar es Salaam",
      packageId: "researcher",
      packageLabel: "Researcher Pass",
      amount: 300,
    },
    {
      reference: "ICA-DEMO02",
      type: "EXHIBITOR" as const,
      status: "PENDING" as const,
      fullName: "John Mremi",
      email: "john@techco.co.tz",
      organization: "TechCo Ltd",
      packageId: "innovation",
      packageLabel: "Innovation Booth (3m × 3m)",
      amount: 1500,
    },
  ];

  for (const s of samples) {
    await prisma.registration.upsert({
      where: { reference: s.reference },
      update: {},
      create: s,
    });
  }
  console.log(`✔ Seeded ${samples.length} sample registrations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
