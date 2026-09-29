import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

/**
 * Middleware centralizzato per error handling (4 argomenti obbligatori!).
 * Deve essere registrato come ULTIMO app.use() in app.ts
 * 
 * Processa:
 * 1. AppError (custom) → statusCode + code + message
 * 2. ZodError → 422 VALIDATION_ERROR
 * 3. Errori sconosciuti → 500 + log completo
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.id || "unknown";

  // 1️⃣ Errori custom AppError
  if (err instanceof AppError) {
    logger.warn(
      { code: err.code, statusCode: err.statusCode, requestId },
      err.message
    );
    return res.status(err.statusCode).json(err.toJSON());
  }

  // 2️⃣ Errori Zod (in caso sfuggano al middleware validate)
  if (err instanceof ZodError) {
    logger.warn(
      { code: "VALIDATION_ERROR", requestId, issues: err.issues },
      "Validazione Zod fallita"
    );
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dati non validi",
        details: err.flatten().fieldErrors
      }
    });
  }

  // 3️⃣ Errori sconosciuti (stack trace solo nei log, mai al client!)
  logger.error(
    { 
      requestId,
      method: req.method,
      url: req.url,
      error: err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack
      } : String(err)
    },
    "Unhandled error"
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Errore interno del server"
    }
  });
};
