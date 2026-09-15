// Bug 3 — Promise.all crasha al primo errore
async function fetchData(url: string): Promise<string> {
  // Simula una chiamata HTTP — la seconda fallisce
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url.includes("invalid")) {
        reject(new Error(`Errore nel caricare ${url}`));
      } else {
        resolve(`Dati da ${url}`);
      }
    }, 100);
  });
}

async function loadDashboard() {
  // 🐛 BUG: se una Promise fallisce, Promise.all rigetta tutto
  // e non sappiamo quali operazioni sono riuscite
  // Con Promise.allSettled possiamo gestire errori parziali senza far crashare tutto
  const results = await Promise.allSettled([
    fetchData("https://api.example.com/accounts"),
    fetchData("https://api.example.com/invalid-endpoint"),
    fetchData("https://api.example.com/customers"),
  ]);
  console.log("Tutti i dati caricati:", results);
}

loadDashboard();
// Compito: usa Promise.allSettled per gestire errori parziali
