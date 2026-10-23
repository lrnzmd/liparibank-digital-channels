import { Request, Response } from "express";
import { TransferService, NotFoundError, InsufficientFundsError } from "./transfer.service";
import { createTransferSchema } from "./transfer.types";
import { listTransfersQuerySchema } from "./transfer.schemas";
import { ValidationError } from "../../routes/errors";
import prisma from "../../config/prisma";

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

  /**
   * GET /api/transfers/feed
   * Cursor-based pagination per feed movimenti
   * Query: ?accountId=<uuid>&cursor=<transferId>&limit=20
   */
  async getTransfersFeed(req: Request, res: Response): Promise<void> {
    try {
      // Valida query params
      const parseResult = listTransfersQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        throw new ValidationError("Query params non validi", {
          errors: parseResult.error.flatten(),
        });
      }

      const { accountId, cursor, limit } = parseResult.data;

      // Verifica che l'account esista
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new ValidationError("Account non trovato", { field: "accountId" });
      }

      // Query con cursor pagination
      const transfers = await prisma.transfer.findMany({
        where: {
          OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
        },
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0, // Skip il cursor stesso
        take: limit,
        orderBy: { executedAt: "desc" },
        include: {
          fromAccount: {
            select: {
              id: true,
              iban: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          toAccount: {
            select: {
              id: true,
              iban: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Calcola il nextCursor
      const nextCursor =
        transfers.length === limit ? transfers[transfers.length - 1]?.id : null;

      res.json({
        data: transfers,
        meta: {
          nextCursor,
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message,
          details: error.details,
        });
      } else {
        throw error;
      }
    }
  }
}
