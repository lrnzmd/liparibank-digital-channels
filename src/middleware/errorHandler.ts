import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Middleware centralizzato per error handling (4 argomenti obbligatori!).
 * Deve essere registrato come ULTIMO app.use() in app.ts
 * 
 * Processa:
 * 1. ZodError → 422 VALIDATION_ERROR
 * 2. Errori sconosciuti → 500
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.id || "unknown";

  // Errori Zod (in caso sfuggano al middleware validate)
  if (err instanceof ZodError) {
    console.warn({ code: "VALIDATION_ERROR", requestId, issues: err.issues });
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dati non validi",
        details: err.flatten().fieldErrors
      }
    });
  }

  // Errori sconosciuti
  console.error({
    requestId,
    method: req.method,
    url: req.url,
    error: err instanceof Error ? {
      name: err.name,
      message: err.message,
    } : String(err)
  });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Errore interno del server"
    }
  });
};
