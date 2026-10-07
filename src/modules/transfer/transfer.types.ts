import { z } from "zod";

/**
 * Schema Zod per creare un Transfer.
 */
export const createTransferSchema = z.object({
  fromIban: z
    .string()
    .length(27, "IBAN italiano deve essere esattamente 27 caratteri")
    .regex(/^IT\d{2}[A-Z0-9]{23}$/, "IBAN non valido"),
  toIban: z
    .string()
    .length(27, "IBAN italiano deve essere esattamente 27 caratteri")
    .regex(/^IT\d{2}[A-Z0-9]{23}$/, "IBAN non valido"),
  amount: z
    .number()
    .positive("Importo deve essere positivo"),
  description: z
    .string()
    .max(140, "Descrizione non può superare 140 caratteri")
    .optional()
    .default(""),
});

export type CreateTransferDto = z.infer<typeof createTransferSchema>;

/**
 * Interfaccia del dominio per Transfer.
 */
export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  executedAt?: Date;
}

export type TransferStatus = "PENDING" | "COMPLETED" | "FAILED";
