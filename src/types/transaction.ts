// Dominio Transaction — bonifici tra conti LipariBank
import { BaseEntity, UUID } from "./common";

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export interface Transaction extends BaseEntity {
  fromAccountId: UUID;
  toAccountId: UUID;
  amount: number; // ⚠️ In produzione: Decimal
  description: string;
  executedAt: Date;
  status: TransactionStatus;
}

export interface CreateTransactionDto {
  fromAccountId: UUID;
  toAccountId: UUID;
  amount: number;
  description: string;
}

/**
 * Validazione di una transazione.
 * Verifica:
 * - Importo positivo
 * - Account diversi (non puoi trasferire soldi a te stesso)
 * - Descrizione non vuota
 */
export function isValidTransaction(tx: CreateTransactionDto): boolean {
  // Importo deve essere positivo
  if (tx.amount <= 0) {
    return false;
  }

  // I due account devono essere diversi
  if (tx.fromAccountId === tx.toAccountId) {
    return false;
  }

  // Descrizione non vuota (trim per evitare stringhe di soli spazi)
  if (!tx.description || tx.description.trim().length === 0) {
    return false;
  }

  return true;
}
