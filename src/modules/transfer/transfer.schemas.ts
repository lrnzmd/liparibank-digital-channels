import { z } from "zod";

export const listTransfersQuerySchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  cursor: z.string().uuid("Invalid cursor").optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListTransfersQueryParams = z.infer<typeof listTransfersQuerySchema>;
