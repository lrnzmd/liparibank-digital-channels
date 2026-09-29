import { Router } from "express";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { InMemoryAccountRepository } from "./account.repository";
import { validate } from "../../middleware/validate";
import { createAccountSchema, updateAccountSchema } from "./account.types";

const router = Router();

// Istanzia le dipendenze (Giorno 5: userà Prisma)
const repository = new InMemoryAccountRepository();
const service = new AccountService(repository);
const controller = new AccountController(service);

// ─── Routes con validazione ───
router.post("/", 
  validate(createAccountSchema, "body"),
  controller.create
);

router.get("/", controller.getAll);

router.get("/:id", controller.getById);

router.put("/:id",
  validate(updateAccountSchema, "body"),
  controller.update
);

router.delete("/:id", controller.delete);

export default router;