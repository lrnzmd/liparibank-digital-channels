import { z } from "zod";

/**
 * Schema Zod per creare un account.
 * ownerId: UUID del cliente proprietario
 * iban: 27 caratteri (standard italiano)
 * type: tipo di conto
 * initialBalance: saldo iniziale (non negativo)
 */
export const createAccountSchema = z.object({
  ownerId: z.uuid("ownerId deve essere un UUID valido"),
  iban: z
    .string()
    .length(27, "IBAN italiano deve essere esattamente 27 caratteri")
    .regex(/^IT\d{2}[A-Z0-9]{23}$/, "IBAN non valido (formato: IT + 25 caratteri alfanumerici)"),
  type: z.enum(["CHECKING", "SAVINGS", "BUSINESS"], {
    message: "Tipo conto deve essere CHECKING, SAVINGS o BUSINESS",
  }),
  initialBalance: z.number().nonnegative("Saldo iniziale non può essere negativo").default(0),
});

/**
 * Schema per aggiornamenti (tutti i campi opzionali)
 */
export const updateAccountSchema = createAccountSchema.partial();

/**
 * Tipi TypeScript inferiti da Zod (type-safe)
 */
export type CreateAccountDto = z.infer<typeof createAccountSchema>;
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;

/**
 * Interfaccia del dominio (stored nel DB)
 */
export interface Account {
  id: string;
  ownerId: string;
  iban: string;
  type: "CHECKING" | "SAVINGS" | "BUSINESS";
  balance: number;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountStatus {
  accountId: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
}
