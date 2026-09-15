// src/broken/bug1.ts
interface Account {
  id: string;
  iban: string;
  balance: number;
  status: "ACTIVE" | "BLOCKED" | "CLOSED";
}

const conto: Account = {
  id: "1",
  iban: "IT60X0542811101000000123456",
  balance: 15420.50,
  status: "ACTIVE",   // 🐛 Il bug è qui — "ATTIVO" non è un valore valido del literal type
};

function getSaldo(account: Account) {
  return account.balance;
}

console.log(getSaldo(conto));