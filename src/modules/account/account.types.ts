export type AccountType = "CHECKING" | "SAVINGS" | "BUSINESS";
export type AccountStatus = "ACTIVE" | "BLOCKED" | "CLOSED";
export interface Account {
  id: string;
  iban: string;
  balance: number;  // al G5 diventerà Decimal
  type: AccountType;
  status: AccountStatus;
  ownerId: string;
  createdAt: Date;
}