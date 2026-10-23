import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { randomUUID } from "crypto";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/authenticate";
import { authorize } from "./middleware/authorize";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./modules/auth/auth.routes";
import accountRoutes from "./routes/accountRoutes";
import customerRoutes from "./routes/customerRoutes";
import transferRoutes from "./routes/transferRoutes";
import kycRoutes from "./modules/kyc/kyc.routes";
import reportRoutes from "./routes/reportRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();

// ─── Middleware (ordine critico!) ───
app.use(helmet()); // 1. Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Serve uploaded files (per KYC documents)
app.use("/uploads", express.static("uploads"));

// ─── Request ID middleware ───
app.use((req: Request, res: Response, next: any) => {
  req.id = randomUUID(); // Genera ID univoco per la richiesta
  res.setHeader("X-Request-Id", req.id); // Invia al client per tracking
  next();
});

// ─── Pino logger middleware ───
app.use((req: Request, res: Response, next: any) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        requestId: req.id,
      },
      "HTTP request",
    );
  });
  next();
});

// ─── Swagger/OpenAPI ───
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───
app.use("/api/auth", authRoutes); // Public routes
app.use("/api/accounts", authenticate, accountRoutes); // Protected routes
app.use("/api/customers", authenticate, customerRoutes); // Protected routes (con KYC)
app.use("/api/transfers", authenticate, transferRoutes); // Protected routes
app.use("/api/reports", reportRoutes); // Protected routes (con authorize)
app.use("/api/ai", aiRoutes); // Protected routes (con authenticate)

// ─── Health check ───
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handler (deve essere ULTIMO!) ───
app.use(errorHandler);

export { app };
