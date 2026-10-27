import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

// Rate limiting per login (max 5 tentativi ogni 15 minuti)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // max 5 richieste
  message: "Troppi tentativi di login, riprova tra 15 minuti",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Rate limiting per refresh (max 10 al minuto)
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: "Troppi tentativi di refresh, riprova tra 1 minuto",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", AuthController.register);
router.post("/login", loginLimiter, AuthController.login);
router.post("/refresh", refreshLimiter, AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;

