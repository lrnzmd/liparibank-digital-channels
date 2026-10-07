import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { randomUUID } from "crypto";
import { errorHandler } from "./middleware/errorHandler";
import accountRoutes from "./routes/accountRoutes";
import customerRoutes from "./routes/customerRoutes";
import transferRoutes from "./routes/transferRoutes";

const app = express();

// ─── Middleware (ordine critico!) ───
app.use(helmet()); // 1. Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

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

// ─── Routes ───
app.use("/api/accounts", accountRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/transfers", transferRoutes);

// ─── Health check ───
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handler (deve essere ULTIMO!) ───
app.use(errorHandler);

export { app };
