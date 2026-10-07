import { Transfer } from "./transfer.types";
import { UUID } from "../../types/common";

/**
 * Interfaccia del repository per Transfer.
 */
export interface TransferRepository {
  findById(id: UUID): Promise<Transfer | null>;
  findAll(): Promise<Transfer[]>;
  save(transfer: Transfer): Promise<Transfer>;
  findByAccountId(accountId: UUID): Promise<Transfer[]>;
}

/**
 * Implementazione in-memory del repository Transfer.
 * Utilizzata durante il development/testing.
 */
export class InMemoryTransferRepository implements TransferRepository {
  private store: Map<string, Transfer> = new Map();

  async findById(id: UUID): Promise<Transfer | null> {
    const transfer = this.store.get(id);
    return transfer || null;
  }

  async findAll(): Promise<Transfer[]> {
    return Array.from(this.store.values());
  }

  async save(transfer: Transfer): Promise<Transfer> {
    this.store.set(transfer.id, transfer);
    return transfer;
  }

  async findByAccountId(accountId: UUID): Promise<Transfer[]> {
    return Array.from(this.store.values()).filter(
      t => t.fromAccountId === accountId || t.toAccountId === accountId
    );
  }

  clear(): void {
    this.store.clear();
  }
}
