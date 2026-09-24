// Entry point — avvia il server HTTP
import { app } from "./app";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

app.listen(PORT, () => {
  console.log("🏦 LipariBank API su http://localhost:" + PORT);
  console.log("   GET  /api/accounts");
  console.log("   GET  /api/accounts/:id");
  console.log("   POST /api/accounts");
  console.log("   PUT  /api/accounts/:id");
  console.log("   DEL  /api/accounts/:id");
});