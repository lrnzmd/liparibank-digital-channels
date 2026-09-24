// Configurazione Express app — separata da index.ts per i test (Giorno 7)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import accountRoutes from "./routes/accountRoutes";

const app = express();

// ─── Middleware (ordine critico!) ───
app.use(helmet());                                     // 1. Security headers
app.use(cors({ origin: "http://localhost:5173" }));    // 2. CORS per React/Vite
app.use(express.json());                               // 3. Parse body JSON

// ─── Routes ───
app.use("/api/accounts", accountRoutes);

// ─── Health check ───
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export { app };