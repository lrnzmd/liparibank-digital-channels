import { Account } from './account.types';
import { UUID } from '../../types/common';

/**
 * Interfaccia del repository — astrae l'accesso ai dati.
 * Tutti i metodi sono async (Promise) per simulare latenza DB.
 */
export interface AccountRepository {
  findById(id: UUID): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  save(account: Account): Promise<Account>;
  delete(id: UUID): Promise<boolean>;
}

/**
 * Implementazione in-memory del repository.
 * Usa una Map<string, Account> per storage.
 * Tutti i metodi ritornano Promise (anche se Map è sincrono).
 * 
 * Scopo: simulare un database vero durante il G1-G4.
 * Nel G5, sostituirai questo con PrismaAccountRepository.
 */
export class InMemoryAccountRepository implements AccountRepository {
  private store: Map<string, Account> = new Map();

  /**
   * Cerca un account per ID.
   * @param id UUID dell'account
   * @returns Promise<Account | null>
   */
  async findById(id: UUID): Promise<Account | null> {
    const account = this.store.get(id);
    return account || null;
  }

  /**
   * Recupera tutti gli account.
   * @returns Promise<Account[]>
   */
  async findAll(): Promise<Account[]> {
    return Array.from(this.store.values());
  }

  /**
   * Salva o aggiorna un account.
   * Se l'ID esiste, aggiorna; altrimenti crea nuovo.
   * @param account L'account da salvare
   * @returns Promise<Account> L'account salvato
   */
  async save(account: Account): Promise<Account> {
    this.store.set(account.id, account);
    return account;
  }

  /**
   * Elimina un account per ID.
   * @param id UUID dell'account
   * @returns Promise<boolean> true se eliminato, false se non trovato
   */
  async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  /**
   * Pulisce il store (utile per i test).
   */
  clear(): void {
    this.store.clear();
  }
}