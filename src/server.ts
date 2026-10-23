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
  console.log(`   GET    /api/accounts?page=1&pageSize=20&status=ACTIVE&sortBy=createdAt&order=desc`);
  console.log(`   GET    /api/accounts/:id`);
  console.log(`   POST   /api/accounts`);
  console.log(`   PUT    /api/accounts/:id`);
  console.log(`   DELETE /api/accounts/:id (soft delete)`);
  console.log("");
  console.log("👥 Endpoint Customer:");
  console.log(`   GET    /api/customers`);
  console.log(`   GET    /api/customers/:id`);
  console.log(`   POST   /api/customers`);
  console.log(`   PUT    /api/customers/:id`);
  console.log(`   DELETE /api/customers/:id`);
  console.log(`   POST   /api/customers/:customerId/kyc (upload KYC)`);
  console.log(`   GET    /api/customers/:customerId/kyc (lista KYC)`);
  console.log(`   DELETE /api/customers/:customerId/kyc/:documentId`);
  console.log("");
  console.log("💸 Endpoint Transfer:");
  console.log(`   GET    /api/transfers/feed?accountId=<uuid>&cursor=<id>&limit=20`);
  console.log(`   POST   /api/transfers`);
  console.log(`   GET    /api/transfers/:id`);
  console.log("");
  console.log("📊 Endpoint Reports:");
  console.log(`   GET    /api/reports/balance-by-customer (ADMIN/OPERATOR only)`);
  console.log("");
  console.log("🤖 Endpoint AI:");
  console.log(`   GET    /api/ai/stream?q=<question> (SSE mock)`);
  console.log("");
  console.log("📖 Documentazione:");
  console.log(`   GET    /api-docs (Swagger UI)`);
  console.log("");
  console.log("❤️  Health check: GET /health");
});
