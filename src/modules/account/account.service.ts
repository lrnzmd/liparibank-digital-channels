import { Account, AccountStatus, AccountType } from "./account.types";
import { AccountRepository } from "./account.repository";
import { UUID } from "../../types/common";
import { randomUUID } from "crypto";

/**
 * DTO per l'aggiornamento di un Account.
 * Tutti i campi sono opzionali (Partial).
 * Non incluso: id, createdAt (immutabili).
 */
export interface UpdateAccountDto {
  iban?: string;
  holderName?: string;
  balance?: number;
  accountType?: AccountType;
  status?: AccountStatus;
}

/**
 * Service di dominio per Account.
 * Responsabilità:
 * - Logica di business (validazione, trasformazione)
 * - Coordinamento tra repository e logica
 * - Nessuna logica HTTP (eccezioni generiche)
 *
 * Usa DI: il repository è iniettato nel constructor.
 */
export class AccountService {
  constructor(private readonly repo: AccountRepository) {}
  async create(data: {
    iban: string;
    balance: number;
    type: AccountType;
    status: AccountStatus;
    ownerId: string;
  }): Promise<Account> {
    const account: Account = {
      id: randomUUID(),
      iban: data.iban,
      balance: data.balance,
      type: data.type,
      status: data.status,
      ownerId: data.ownerId,
      createdAt: new Date(),
    };
    return this.repo.save(account);
  }

  /**
   * Recupera tutti gli account.
   * @returns Promise<Account[]>
   */
  async getAll(): Promise<Account[]> {
    return this.repo.findAll();
  }

  /**
   * Recupera un account per ID.
   * @param id UUID dell'account
   * @returns Promise<Account>
   * @throws Error se l'account non esiste
   */
  async getById(id: UUID): Promise<Account> {
    const account = await this.repo.findById(id);
    if (!account) {
      throw new Error(`Account with id ${id} not found`);
    }
    return account;
  }

  /**
   * Aggiorna un account.
   * - Carica l'account esistente
   * - Effettua un merge parziale con il DTO
   * - Salva le modifiche
   * 
   * @param id UUID dell'account
   * @param dto Campi da aggiornare (Partial)
   * @returns Promise<Account> L'account aggiornato
   * @throws Error se l'account non esiste
   */
  async update(id: UUID, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.getById(id);
    const updated: Account = {
      ...account,
      ...dto,
    };
    return this.repo.save(updated);
  }

  /**
   * Elimina un account.
   * @param id UUID dell'account
   * @returns Promise<boolean> true se eliminato, false se non trovato
   */
  async delete(id: UUID): Promise<boolean> {
    return this.repo.delete(id);
  }
}