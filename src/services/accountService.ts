import { Account, CreateAccountDto } from "../types/account";

/**
 * Interfaccia del repository — astrae l'accesso ai dati.
 * Implementata da InMemoryAccountRepository.
 */
export interface IAccountRepository {
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  findByIban(iban: string): Promise<Account | null>;
  create(dto: CreateAccountDto): Promise<Account>;
  update(id: string, dto: Partial<CreateAccountDto>): Promise<Account | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Service di dominio per Account.
 * Contiene la logica di business, usa il repository per accedere ai dati.
 */
export class AccountService {
  constructor(private readonly repo: IAccountRepository) {}

  async getAllAccounts(): Promise<Account[]> {
    return this.repo.findAll();
  }

  async getAccountById(id: string): Promise<Account | null> {
    return this.repo.findById(id);
  }

  async getAccountByIban(iban: string): Promise<Account | null> {
    return this.repo.findByIban(iban);
  }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    return this.repo.create(dto);
  }

  async updateAccount(id: string, dto: Partial<CreateAccountDto>): Promise<Account | null> {
    return this.repo.update(id, dto);
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}