// Entry point che avvia il server
import { app } from "./app";
import { env } from "./config/env";
import prisma from "./config/prisma";

console.log("🏦 LipariBank Digital Channels");
console.log("Environment:", env);

const PORT = env.port;

const server = app.listen(PORT, () => {
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
  console.log("❤️  Health check: GET /api/health");
  console.log("🟢 Readiness check: GET /api/ready");
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 Received ${signal}, starting graceful shutdown...`);
  
  server.close(async () => {
    console.log("✅ HTTP server closed");
    try {
      await prisma.$disconnect();
      console.log("✅ Prisma disconnected");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during graceful shutdown:", error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error("❌ Graceful shutdown timeout, forcing exit");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
