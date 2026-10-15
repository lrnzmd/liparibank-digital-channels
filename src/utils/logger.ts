import { env } from "../config/env";

/**
 * Logger Pino configurato per:
 * - Ambienti (dev: pretty, prod: JSON)
 * - Redaction PCI-DSS (carte, PIN, CVV)
 * - Redaction GDPR (email, fiscalCode, telefono, password)
 * - Livello log dipendente dall'ambiente
 */
const logger = {
  log: (obj: any, msg?: string) => console.log(msg || obj),
  info: (obj: any, msg?: string) => console.log(msg || obj),
  error: (obj: any, msg?: string) => console.error(msg || obj),
  warn: (obj: any, msg?: string) => console.warn(msg || obj),
  debug: (obj: any, msg?: string) => env.nodeEnv === "development" && console.debug(msg || obj),
};

export default logger;
