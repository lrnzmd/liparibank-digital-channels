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
      id: crypto.randomUUID(), 
      iban: dto.iban,
      holderName: dto.holderName,
      balance: dto.balance || 0,
      accountType: dto.accountType,
      customerId: dto.customerId,
      status: AccountStatus.ACTIVE, 
      createdAt: new Date(),
    };
    this.accounts.push(account);
    return account;
  }

  async update(id: string, dto: Partial<CreateAccountDto>): Promise<Account | null> {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const current = this.accounts[idx]!;
    const updated: Account = {
      id: current.id,
      iban: dto.iban ?? current.iban,
      holderName: dto.holderName ?? current.holderName,
      balance: dto.balance ?? current.balance,
      accountType: dto.accountType ?? current.accountType,
      customerId: dto.customerId ?? current.customerId,
      status: current.status,
      createdAt: current.createdAt,
    };
    this.accounts[idx] = updated;
    return this.accounts[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.accounts.splice(idx, 1);
    return true;
  }
}