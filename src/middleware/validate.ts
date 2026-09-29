import { NextFunction, Request, Response } from "express";
import { z, ZodType } from "zod";
import { ValidationError } from "../routes/errors";

/**
 * Middleware generico di validazione Zod.
 *
 * @param schema Schema Zod da applicare
 * @param target Campo di req da validare ("body", "query", "params")
 *
 * @example
 * router.post("/", validate(createAccountSchema, "body"), controller.create);
 * router.get("/:id", validate(paramsSchema, "params"), controller.getById);
 */
export const validate = <T extends ZodType>(
  schema: T,
  target: "body" | "query" | "params" = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // Trasforma gli errori Zod in formato leggibile
      const details = z.flattenError(result.error).fieldErrors;
      return next(new ValidationError(`Validazione fallita su ${target}`, details));
    }

    // Se tutto ok, sostituisci il target con i dati validati (type-safe)
    req[target] = result.data;
    next();
  };
};
