import { PrismaClient } from "@prisma/client";
import { setupSoftDeleteMiddleware } from "../middleware/prismaMiddleware";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

// Registra middleware soft delete
setupSoftDeleteMiddleware(prisma);

export default prisma;
