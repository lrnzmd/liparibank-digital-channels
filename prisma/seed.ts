import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Crea o aggiorna i customer di test
  const customer1 = await prisma.customer.upsert({
    where: { fiscalCode: "RSSMRA85A01F205E" },
    update: {},
    create: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      fiscalCode: "RSSMRA85A01F205E",
      firstName: "Mario",
      lastName: "Rossi",
      email: "mario.rossi@example.com",
      phone: "+39 334 1234567",
      status: "ACTIVE",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { fiscalCode: "BNCGNN85M15L219T" },
    update: {},
    create: {
      id: "550e8400-e29b-41d4-a716-446655440002",
      fiscalCode: "BNCGNN85M15L219T",
      firstName: "Giovanni",
      lastName: "Bianchi",
      email: "giovanni.bianchi@example.com",
      phone: "+39 334 7654321",
      status: "ACTIVE",
    },
  });

  console.log(`✅ Created/Updated customers:`, { customer1, customer2 });

  // Crea o aggiorna gli account
  const account1 = await prisma.account.upsert({
    where: { iban: "IT60X0542811101000000123456" },
    update: {},
    create: {
      id: "550e8400-e29b-41d4-a716-446655441001",
      iban: "IT60X0542811101000000123456",
      balance: new Prisma.Decimal("1000.00"),
      type: "CHECKING",
      status: "ACTIVE",
      customerId: customer1.id,
    },
  });

  const account2 = await prisma.account.upsert({
    where: { iban: "IT60X0542811101000000123457" },
    update: {},
    create: {
      id: "550e8400-e29b-41d4-a716-446655441002",
      iban: "IT60X0542811101000000123457",
      balance: new Prisma.Decimal("500.00"),
      type: "SAVINGS",
      status: "ACTIVE",
      customerId: customer2.id,
    },
  });

  const account3 = await prisma.account.upsert({
    where: { iban: "IT60X0542811101000000123458" },
    update: {},
    create: {
      id: "550e8400-e29b-41d4-a716-446655441003",
      iban: "IT60X0542811101000000123458",
      balance: new Prisma.Decimal("0.00"),
      type: "DEPOSIT",
      status: "CLOSED",
      customerId: customer1.id,
    },
  });

  console.log(`✅ Created/Updated accounts:`, { account1, account2, account3 });

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
