// Identico al Giorno 2
import { Account, CreateAccountDto, AccountStatus } from "../types/account";
import { IAccountRepository } from "../services/accountService";

export class InMemoryAccountRepository implements IAccountRepository {
  private accounts: Account[] = [];

  async findAll(): Promise<Account[]> { return [...this.accounts]; }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find(a => a.id === id) ?? null;
  }

  async findByIban(iban: string): Promise<Account | null> {
    return this.accounts.find(a => a.iban === iban) ?? null;
  }

  async create(dto: CreateAccountDto): Promise<Account> {
    const account: Account = {
      id: crypto.randomUUID(), ...dto,
      status: AccountStatus.ACTIVE, createdAt: new Date(),
    };
    this.accounts.push(account);
    return account;
  }
}