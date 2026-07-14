// src/broken/bug3.ts
interface Account {
  id: string;
  iban: string;
  balance: number;
}

function processAccount(account: Account) {
  // 🐛 Il parametro è "any" → TypeScript non controlla nulla
  console.log(`IBAN: ${account.iban}`);
  console.log(`Saldo: ${account.balance}`);  // Campo inesistente! Ma nessun errore...
  console.log(`id: ${account.id}`);             // Altro campo inesistente!
}

const conto: Account = {
  id: "1",
  iban: "IT60X0542811101000000123456",
  balance: 15420.50,
};

processAccount(conto);  // Stampa "undefined" per i campi inesistenti, nessun errore