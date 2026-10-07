import { PrismaClient, Prisma } from "@prisma/client";
import { Transfer } from "./transfer.types";
import { TransferRepository } from "./transfer.repository";
import { AccountRepository } from "../account/account.repository";
import { UUID } from "../../types/common";
import { randomUUID } from "crypto";

/**
 * Errore personalizzato per transazioni fallite.
 */
export class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Service per gestire i transfer con logica transazionale.
 * Responsabilità:
 * - Validazione dei conti
 * - Controllo del saldo
 * - Atomicità della transazione (aggiornamento saldi + salvataggio transfer)
 */
export class TransferService {
  constructor(
    private readonly transferRepo: TransferRepository,
    private readonly accountRepo: AccountRepository,
    private readonly prisma: PrismaClient,
  ) {}

  /**
   * Esegue un transfer tra due conti con transazione atomica.
   * 
   * @param fromIban IBAN del conto sorgente
   * @param toIban IBAN del conto destinazione
   * @param amount Importo da trasferire
   * @param description Descrizione opzionale
   * @returns Promise<Transfer> Il transfer completato
   * @throws NotFoundError se uno dei conti non esiste
   * @throws InsufficientFundsError se il saldo è insufficiente
   */
  async execute(
    fromIban: string,
    toIban: string,
    amount: number,
    description: string = "",
  ): Promise<Transfer> {
    // 1. Verifica che i conti esistano
    const fromAccount = await this.accountRepo.findByIban(fromIban);
    if (!fromAccount) {
      throw new NotFoundError(`Conto sorgente con IBAN ${fromIban} non trovato`);
    }

    const toAccount = await this.accountRepo.findByIban(toIban);
    if (!toAccount) {
      throw new NotFoundError(`Conto destinazione con IBAN ${toIban} non trovato`);
    }

    // 2. Verifica saldo sufficiente
    if (fromAccount.balance < amount) {
      throw new InsufficientFundsError(
        `Saldo insufficiente: richiesti ${amount}, disponibili ${fromAccount.balance}`,
      );
    }

    // 3. Esegui transazione atomica con Prisma
    const transferId = randomUUID();
    const transferResult = await this.prisma.$transaction(
      async (tx) => {
        // Decrement balance from source account
        await tx.account.update({
          where: { id: fromAccount.id },
          data: {
            balance: {
              decrement: new Prisma.Decimal(amount),
            },
          },
        });

        // Increment balance to destination account
        await tx.account.update({
          where: { id: toAccount.id },
          data: {
            balance: {
              increment: new Prisma.Decimal(amount),
            },
          },
        });

        // Create transfer record
        const transfer = await tx.transfer.create({
          data: {
            id: transferId,
            fromAccountId: fromAccount.id,
            toAccountId: toAccount.id,
            amount: new Prisma.Decimal(amount),
            description,
            status: "COMPLETED",
            executedAt: new Date(),
          },
        });

        return transfer;
      },
    );

    return {
      id: transferResult.id,
      fromAccountId: transferResult.fromAccountId,
      toAccountId: transferResult.toAccountId,
      amount: transferResult.amount.toNumber(),
      description: transferResult.description,
      status: transferResult.status as "PENDING" | "COMPLETED" | "FAILED",
      createdAt: transferResult.createdAt,
      executedAt: transferResult.executedAt || undefined,
    };
  }

  /**
   * Recupera un transfer per ID.
   */
  async getById(id: UUID): Promise<Transfer> {
    const transfer = await this.transferRepo.findById(id);
    if (!transfer) {
      throw new NotFoundError(`Transfer con ID ${id} non trovato`);
    }
    return transfer;
  }

  /**
   * Recupera tutti i transfer.
   */
  async getAll(): Promise<Transfer[]> {
    return this.transferRepo.findAll();
  }

  /**
   * Recupera tutti i transfer associati a un conto.
   */
  async getByAccountId(accountId: UUID): Promise<Transfer[]> {
    return this.transferRepo.findByAccountId(accountId);
  }
}
