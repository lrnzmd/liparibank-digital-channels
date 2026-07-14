// Entry point Giorno 1 — test del dominio tipizzato
import { Account, AccountType, AccountStatus } from "./types/account";
import { Customer } from "./types/customer";
import { Transaction, TransactionStatus } from "./types/transaction";
import { isValidItalianIban, isValidFiscalCode, isPositiveAmount } from "./utils/validators";

// ─── Creazione oggetti tipizzati ───
const mario: Customer = {
  id: "cust-001",
  fiscalCode: "RSSMRA85M01H501Z",
  firstName: "Mario",
  lastName: "Rossi",
  email: "mario.rossi@example.com",
  phone: "+39 333 1234567",
  status: "ACTIVE",
  createdAt: new Date(),
};

const contoCorrente: Account = {
  id: "acc-001",
  iban: "IT60X0542811101000000123456",
  holderName: "Mario Rossi",
  balance: 15420.50,
  accountType: AccountType.CHECKING,
  status: AccountStatus.ACTIVE,
  createdAt: new Date(),
  customerId: mario.id,
};

const contoRisparmio: Account = {
  id: "acc-002",
  iban: "IT60X0542811101000000789012",
  holderName: "Mario Rossi",
  balance: 50000.00,
  accountType: AccountType.SAVINGS,
  status: AccountStatus.ACTIVE,
  createdAt: new Date(),
  customerId: mario.id,
};

// ─── Funzioni tipizzate ───

/** Cerca un conto per IBAN in un array tipizzato */
function findByIban(accounts: Account[], iban: string): Account | undefined {
  return accounts.find(a => a.iban === iban);
}

/** Filtra conti per stato */
function filterByStatus(accounts: Account[], status: AccountStatus): Account[] {
  return accounts.filter(a => a.status === status);
}

/** Calcola il saldo totale di un array di conti */
function totalBalance(accounts: Account[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

/** Formatta un importo con valuta */
function formatAmount(amount: number, currency: string = "EUR"): string {
  return `${amount.toFixed(2)} ${currency}`;
}

// ─── Test ───
const conti = [contoCorrente, contoRisparmio];

console.log("🏦 LipariBank Digital Channels — Giorno 1");
console.log();
console.log("Cliente:", mario.firstName, mario.lastName);
console.log("Codice fiscale valido:", isValidFiscalCode(mario.fiscalCode));
console.log();
console.log("Conti attivi:", filterByStatus(conti, AccountStatus.ACTIVE).length);
console.log("Saldo totale:", formatAmount(totalBalance(conti)));
console.log();

const trovato = findByIban(conti, "IT60X0542811101000000123456");
if (trovato) {
  console.log("Trovato per IBAN:", trovato.holderName, "—", trovato.accountType);
} else {
  console.log("Conto non trovato");
}

console.log();
console.log("Tipi conto disponibili:", Object.values(AccountType).join(", "));
console.log("IBAN valido:", isValidItalianIban(contoCorrente.iban));
console.log("Importo 100 positivo:", isPositiveAmount(100));
console.log("Importo -50 positivo:", isPositiveAmount(-50));

// Esegui con: npx tsx src/index.ts