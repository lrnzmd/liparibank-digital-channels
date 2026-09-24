// Configurazione Express app — separata da index.ts per i test (Giorno 7)
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import accountRoutes from "./routes/accountRoutes";
import customerRoutes from "./routes/customerRoutes";

const app = express();

// ─── Middleware (ordine critico!) ───
app.use(helmet()); // 1. Security headers
app.use(cors({ origin: "http://localhost:5173" })); // 2. CORS per React/Vite
app.use(express.json());

// ─── Request logger ───
const requestLogger = (req: Request, res: Response, next: any) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

app.use(requestLogger); // 3. Request logger

// ─── Routes ───
app.use("/api/accounts", accountRoutes);

// ─── Health check ───
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/customers", customerRoutes);

export { app };