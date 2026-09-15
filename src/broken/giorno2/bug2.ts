// Bug 2 — Promise non await-ata
function getBalance(id: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(15420.50), 500);
  });
}

// 🐛 BUG: manca await → saldo è una Promise, non un number
async function main(): Promise<void> {
  const saldo = await getBalance("account-001");
  console.log("Saldo:", saldo);  // Stampa: Promise { <pending> }
}

main();



// Bonus: cosa succede se aggiungi await qui?
// E se wrapi tutto in una funzione async?
