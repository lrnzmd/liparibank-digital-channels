import { z } from "zod";
import { AccountStatus, AccountType } from "@prisma/client";

export const listAccountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["ACTIVE", "BLOCKED", "CLOSED"]).optional(),
  type: z.enum(["CHECKING", "SAVINGS", "DEPOSIT"]).optional(),
  sortBy: z.enum(["createdAt", "balance", "iban"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ListAccountsQueryParams = z.infer<typeof listAccountsQuerySchema>;
