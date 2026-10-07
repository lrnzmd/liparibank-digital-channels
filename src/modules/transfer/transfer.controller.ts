import { Request, Response } from "express";
import { TransferService, NotFoundError, InsufficientFundsError } from "./transfer.service";
import { createTransferSchema } from "./transfer.types";

/**
 * Controller per le operazioni di Transfer.
 */
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  /**
   * POST /api/transfers
   * Crea un nuovo transfer tra due conti.
   */
  async createTransfer(req: Request, res: Response): Promise<void> {
    try {
      // Validazione con Zod
      const validated = createTransferSchema.parse(req.body);

      // Esegui il transfer
      const transfer = await this.transferService.execute(
        validated.fromIban,
        validated.toIban,
        validated.amount,
        validated.description,
      );

      res.status(201).json({
        success: true,
        data: transfer,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error instanceof InsufficientFundsError) {
        res.status(409).json({
          success: false,
          error: error.message,
          code: "INSUFFICIENT_FUNDS",
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * GET /api/transfers/:id
   * Recupera un transfer per ID.
   */
  async getTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        res.status(400).json({
          success: false,
          error: "Invalid transfer ID",
        });
        return;
      }
      const transfer = await this.transferService.getById(id);
      res.json({
        success: true,
        data: transfer,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * GET /api/transfers
   * Recupera tutti i transfer.
   */
  async getAllTransfers(req: Request, res: Response): Promise<void> {
    const transfers = await this.transferService.getAll();
    res.json({
      success: true,
      data: transfers,
    });
  }

  /**
   * GET /api/transfers/account/:accountId
   * Recupera tutti i transfer di un conto.
   */
  async getTransfersByAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      if (!accountId || typeof accountId !== "string") {
        res.status(400).json({
          success: false,
          error: "Invalid account ID",
        });
        return;
      }
      const transfers = await this.transferService.getByAccountId(accountId);
      res.json({
        success: true,
        data: transfers,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        throw error;
      }
    }
  }
}

