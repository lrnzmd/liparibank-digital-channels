import pino from "pino";
import { NODE_ENV } from "../config/env";

/**
 * Logger Pino configurato per:
 * - Ambienti (dev: pretty, prod: JSON)
 * - Redaction PCI-DSS (carte, PIN, CVV)
 * - Redaction GDPR (email, fiscalCode, telefono, password)
 * - Livello log dipendente dall'ambiente
 */
const logger = pino({
  level: process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "debug"),
  
  base: {
    service: "liparibank-api",
    environment: NODE_ENV,
    version: process.env.APP_VERSION || "1.0.0"
  },

  redact: {
    paths: [
      // 🔐 PCI-DSS Compliance
      "req.body.cardNumber",
      "req.body.cvv",
      "req.body.pin",
      "req.body.pan",
      "req.headers.authorization",
      "req.headers.cookie",
      
      // 🇪🇺 GDPR Compliance
      "*.email",
      "*.phoneNumber",
      "*.fiscalCode",
      "*.password",
      "*.pin",
      
      // Nested arrays
      "req.body.users[*].email",
      "req.body.users[*].password",
      "req.body.users[*].fiscalCode",
      
      // Query parameters sensibili
      "req.query.apiKey",
      "req.query.token",
    ],
    censor: "[REDACTED]"
  },

  transport:
    NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
          }
        }
      : undefined, // In prod, output JSON senza transform
});

export default logger;
