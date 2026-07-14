// Tipi base riutilizzabili in tutto il progetto LipariBank

/** UUID come stringa — in produzione generato con crypto.randomUUID() */
export type UUID = string;

/** Data in formato ISO 8601 per le risposte JSON */
export type ISODateString = string;

/**
 * Interfaccia base per tutte le entità.
 * Ogni entità ha un id univoco e una data di creazione.
 * Equivalente di @MappedSuperclass in Spring Boot.
 */
export interface BaseEntity {
  readonly id: UUID;
  createdAt: Date;
}

/**
 * Envelope standard per le risposte API.
 * Il frontend React Query si aspetta questa struttura.
 * T è il tipo dei dati (Account, Customer, ecc.)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Envelope per risposte paginate.
 * Meta contiene le informazioni di paginazione per React Query.
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}