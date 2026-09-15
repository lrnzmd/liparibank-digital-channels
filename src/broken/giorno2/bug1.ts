// Bug 1 — await fuori da funzione async
import { readFile } from "fs/promises";

// 🐛 BUG: await non può essere usato al top level senza configurazione ESM
// oppure deve essere wrappato in una funzione async
// NOTE: Wrapping the await call inside an async function resolves the top-level await issue.
async function getData(): Promise<void> {
  const data = await readFile("package.json", "utf-8");

  console.log(JSON.parse(data).name);
}

getData();
