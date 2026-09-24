// Entry point che avvia il server
import { app } from "./app";
import { env } from "./config/env";

console.log("🏦 LipariBank Digital Channels");
console.log("Environment:", env);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
  console.log("");
  console.log("📋 Endpoint Account:");
  console.log(`   GET    /api/accounts`);
  console.log(`   GET    /api/accounts/:id`);
  console.log(`   POST   /api/accounts`);
  console.log(`   PUT    /api/accounts/:id`);
  console.log(`   DELETE /api/accounts/:id`);
  console.log("");
  console.log("👥 Endpoint Customer:");
  console.log(`   GET    /api/customers`);
  console.log(`   GET    /api/customers/:id`);
  console.log(`   POST   /api/customers`);
  console.log(`   PUT    /api/customers/:id`);
  console.log(`   DELETE /api/customers/:id`);
  console.log("");
  console.log("❤️  Health check: GET /health");
});
