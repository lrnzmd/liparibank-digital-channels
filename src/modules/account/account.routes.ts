import { Router } from "express";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { InMemoryAccountRepository } from "./account.repository";

const repository = new InMemoryAccountRepository();
const service = new AccountService(repository);
const controller = new AccountController(service);

const router = Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;