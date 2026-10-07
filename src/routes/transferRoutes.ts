import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { TransferController } from "../modules/transfer/transfer.controller";
import { TransferService } from "../modules/transfer/transfer.service";
import { PrismaTransferRepository } from "../modules/transfer/transfer.repository.prisma";
import { PrismaAccountRepository } from "../modules/account/account.repository.prisma";

const router = Router();

// Istanzia le dipendenze
const prisma = new PrismaClient();
const transferRepository = new PrismaTransferRepository(prisma);
const accountRepository = new PrismaAccountRepository(prisma);
const transferService = new TransferService(transferRepository, accountRepository, prisma);
const controller = new TransferController(transferService);

/**
 * POST /api/transfers
 * Crea un nuovo transfer tra due conti.
 */
router.post("/", (req, res) => controller.createTransfer(req, res));

/**
 * GET /api/transfers/:id
 * Recupera un transfer per ID.
 */
router.get("/:id", (req, res) => controller.getTransfer(req, res));

/**
 * GET /api/transfers
 * Recupera tutti i transfer.
 */
router.get("/", (req, res) => controller.getAllTransfers(req, res));

/**
 * GET /api/transfers/account/:accountId
 * Recupera tutti i transfer di un conto.
 */
router.get("/account/:accountId", (req, res) =>
  controller.getTransfersByAccount(req, res),
);

export default router;
