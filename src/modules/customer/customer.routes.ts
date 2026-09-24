import { Router } from "express";
import { CustomerController } from "./customer.controller";
import { InMemoryCustomerRepository } from "./customer.repository";
import { CustomerService } from "./customer.service";

/**
 * Composition root per il modulo Customer.
 * Istanzia repository → service → controller in ordine di dipendenza.
 */
const repository = new InMemoryCustomerRepository();
const service = new CustomerService(repository);
const controller = new CustomerController(service);

/**
 * Router per gli endpoint Customer.
 * Pattern REST standard:
 * - GET /           → getAll()
 * - GET /:id        → getById()
 * - POST /          → create() [201]
 * - PUT /:id        → update()
 * - DELETE /:id     → delete() [204]
 */
const router = Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
