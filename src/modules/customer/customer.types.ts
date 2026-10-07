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
    .regex(/^\+39\d{9,10}$/, "Telefono deve essere +39 + 9-10 cifre")
    .optional(),
  fiscalCode: z
    .string()
    .length(16, "Codice fiscale deve essere 16 caratteri")
    .regex(FISCAL_CODE_REGEX, "Codice fiscale non valido"),
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

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

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
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

