// Dominio Account — entità principale di LipariBank Digital Channels
import { UUID, BaseEntity } from './common';

/**
 * Enum per il tipo di conto.
 * Genera codice JS reale — puoi iterare con Object.values(AccountType).
 */
export enum AccountType {
  CHECKING = "CHECKING",   // Conto corrente
  SAVINGS = "SAVINGS",     // Conto risparmio
  DEPOSIT = "DEPOSIT",     // Deposito vincolato
}

/**
 * Enum per lo stato del conto.
 * Un conto BLOCKED non può effettuare operazioni.
 * Un conto CLOSED è chiuso definitivamente.
 */
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  CLOSED = "CLOSED",
}

/**
 * Interfaccia Account — modello di dominio.
 * Estende BaseEntity per ereditare id e createdAt.
 * Al Giorno 5, questa interfaccia diventerà il modello Prisma.
 */
export interface Account extends BaseEntity {
  iban: string;
  holderName: string;
  balance: number;               // ⚠️ In produzione: Decimal (vedi Giorno 5)
  accountType: AccountType;
  status: AccountStatus;
  customerId: UUID;              // FK al Customer (relazione 1:N)
}

/**
 * DTO per la creazione di un Account.
 * NON include id, createdAt, status — generati dal server.
 * Il client invia solo questi campi nel body del POST.
 */
export interface CreateAccountDto {
  iban: string;
  holderName: string;
  balance: number;
  accountType: AccountType;
  customerId: UUID;
}

/**
 * DTO per la risposta API.
 * Tutti i campi sono serializzabili (Date → ISODateString).
 * Il client riceve questo oggetto nel response body.
 */
export interface AccountResponseDto {
  id: UUID;
  iban: string;
  holderName: string;
  balance: number;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: string;    // ISODateString
  customerId: UUID;
}