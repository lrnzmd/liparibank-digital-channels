import { PrismaClient, Account as PrismaAccount } from "@prisma/client";
import { Account, AccountType, AccountStatus } from "./account.types";
import { AccountRepository } from "./account.repository";
import { UUID } from "../../types/common";

/**
 * Implementazione Prisma del repository Account.
 * Sostituisce InMemoryAccountRepository nel composition root.
 * L'interfaccia AccountRepository rimane invariata.
 */
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cerca un account per ID.
   */
  async findById(id: UUID): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });
    return account ? this.mapToAccount(account) : null;
  }

  /**
   * Recupera tutti gli account.
   */
  async findAll(): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany();
    return accounts.map(a => this.mapToAccount(a));
  }

  /**
   * Salva o aggiorna un account.
   */
  async save(account: Account): Promise<Account> {
    const existing = await this.prisma.account.findUnique({
      where: { id: account.id },
    });

    if (existing) {
      // Update
      const updated = await this.prisma.account.update({
        where: { id: account.id },
        data: {
          iban: account.iban,
          balance: account.balance,
          type: account.type,
          status: account.status,
          customerId: account.ownerId,
        },
      });
      return this.mapToAccount(updated);
    } else {
      // Create
      const created = await this.prisma.account.create({
        data: {
          id: account.id,
          iban: account.iban,
          balance: account.balance,
          type: account.type,
          status: account.status,
          customerId: account.ownerId,
          createdAt: account.createdAt,
        },
      });
      return this.mapToAccount(created);
    }
  }

  /**
   * Elimina un account per ID.
   */
  async delete(id: UUID): Promise<boolean> {
    try {
      await this.prisma.account.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Trova un account per IBAN.
   */
  async findByIban(iban: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { iban },
    });
    return account ? this.mapToAccount(account) : null;
  }

  /**
   * Mappa un Account Prisma al tipo di dominio.
   * Prisma usa `customerId`, il dominio usa `ownerId`.
   */
  private mapToAccount(prismaAccount: PrismaAccount): Account {
    return {
      id: prismaAccount.id,
      ownerId: prismaAccount.customerId,
      iban: prismaAccount.iban,
      type: prismaAccount.type as AccountType,
      balance: prismaAccount.balance.toNumber(),
      status: prismaAccount.status as AccountStatus,
      createdAt: prismaAccount.createdAt,
      updatedAt: prismaAccount.updatedAt,
    };
  }
}
