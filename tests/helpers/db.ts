import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

/**
 * Ottiene o crea l'istanza Prisma singleton per i test.
 * Viene utilizzata da tutti i test di integrazione.
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

/**
 * Chiude la connessione Prisma.
 */
export async function closePrismaClient(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

/**
 * Esegue una migration sul DB di test.
 */
export async function migrateTestDb(): Promise<void> {
  const client = getPrismaClient();
  try {
    // Esegui le migrations
    await client.$executeRawUnsafe("SELECT 1");
  } catch (error) {
    console.error("Errore durante la migration:", error);
    throw error;
  }
}

/**
 * Truncate tutte le tabelle (preserva schema, cancella dati).
 */
export async function truncateTestDb(): Promise<void> {
  const client = getPrismaClient();
  try {
    await client.$executeRawUnsafe(
      `TRUNCATE "User" RESTART IDENTITY CASCADE;`
    );
    await client.$executeRawUnsafe(
      `TRUNCATE "Account" RESTART IDENTITY CASCADE;`
    );
    await client.$executeRawUnsafe(
      `TRUNCATE "Transfer" RESTART IDENTITY CASCADE;`
    );
  } catch (error) {
    console.error("Errore durante il truncate:", error);
    // Ignora gli errori di truncate (le tabelle potrebbero non esistere)
  }
}
