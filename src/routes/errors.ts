/**
 * Gerarchia di errori custom mappati su HTTP status codes.
 * Base class con serializzazione JSON per le risposte.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  
  readonly details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    };
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message: string = "Risorsa non trovata", details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 422 Unprocessable Entity — errori di validazione
 */
export class ValidationError extends AppError {
  readonly statusCode = 422;
  readonly code = "VALIDATION_ERROR";

  constructor(message: string = "Dati non validi", details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 401 Unauthorized — autenticazione mancante/invalida (Giorno 6)
 */
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";

  constructor(message: string = "Autenticazione richiesta", details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden — autenticazione ok ma permesso negato (Giorno 6)
 */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";

  constructor(message: string = "Accesso negato", details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 409 Conflict — risorsa duplicata (es. IBAN, fiscalCode)
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";

  constructor(message: string = "Risorsa duplicata nel sistema", details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
