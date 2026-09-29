import { z } from "zod";

/**
 * Regex per codice fiscale italiano (16 caratteri alfanumerici)
 */
const FISCAL_CODE_REGEX = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

/**
 * Schema Zod per creare un cliente
 */
export const createCustomerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Nome deve avere almeno 2 caratteri")
    .max(50, "Nome non può superare 50 caratteri"),
  lastName: z
    .string()
    .min(2, "Cognome deve avere almeno 2 caratteri")
    .max(50, "Cognome non può superare 50 caratteri"),
  email: z.email("Email non valida"),
  phone: z
    .string()
    .regex(/^\+39\d{9,10}$/, "Telefono deve essere +39 + 9-10 cifre"),
  fiscalCode: z
    .string()
    .length(16, "Codice fiscale deve essere 16 caratteri")
    .regex(FISCAL_CODE_REGEX, "Codice fiscale non valido"),
  dateOfBirth: z
    .date("Data di nascita non valida (formato: YYYY-MM-DD)")
    .transform(str => new Date(str)),
  residenceAddress: z
    .string()
    .min(5, "Indirizzo deve avere almeno 5 caratteri"),
});

/**
 * Schema per aggiornamenti (tutti i campi opzionali)
 */
export const updateCustomerSchema = createCustomerSchema.partial();

/**
 * Tipi TypeScript inferiti
 */
export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

/**
 * Interfaccia del dominio
 */
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fiscalCode: string;
  dateOfBirth: Date;
  residenceAddress: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}
