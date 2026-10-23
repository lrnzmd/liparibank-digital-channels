import { NextFunction, Request, RequestHandler, Response } from "express";
import { AccountService } from "./account.service";
import { NotFoundError, ValidationError } from "../../routes/errors";
import { listAccountsQuerySchema } from "./account.schemas";

const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

export class AccountController {
  constructor(private readonly service: AccountService) {}

  /**
   * POST /api/accounts
   * Crea un nuovo account (body validato da middleware validate())
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const account = await this.service.createAccount(req.body);
    res.status(201).json({
      success: true,
      data: account,
    });
  });

  /**
   * GET /api/accounts/:id
   * Recupera account per ID, butta NotFoundError se non esiste
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const account = await this.service.getAccountById(req.params.id);

    if (!account) {
      throw new NotFoundError(`Account con ID ${req.params.id} non trovato`);
    }

    res.json({
      success: true,
      data: account,
    });
  });

  /**
   * GET /api/accounts
   * Pagination offset-based con filtri e sorting
   * Query: ?page=1&pageSize=20&status=ACTIVE&type=CHECKING&sortBy=createdAt&order=desc
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    // Valida query params con Zod
    const parseResult = listAccountsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      throw new ValidationError("Query params non validi", {
        errors: parseResult.error.flatten(),
      });
    }

    const { page, pageSize, status, type, sortBy, order } = parseResult.data;

    // Calcola offset
    const offset = (page - 1) * pageSize;

    // Costruisci il where filter (whitelist esplicita)
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    // Esegui la query con paginazione
    const [accounts, total] = await Promise.all([
      this.service.listAccountsWithPagination({
        where,
        skip: offset,
        take: pageSize,
        sortBy,
        order,
      }),
      this.service.countAccounts(where),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.json({
      data: accounts,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  });

  /**
   * PUT /api/accounts/:id
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const account = await this.service.updateAccount(req.params.id, req.body);

    if (!account) {
      throw new NotFoundError(`Account con ID ${req.params.id} non trovato`);
    }

    res.json({
      success: true,
      data: account,
    });
  });

  /**
   * DELETE /api/accounts/:id
   * Soft delete: setta deletedAt instead of hard delete
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const accountId = typeof req.params.id === "string" ? req.params.id : "";
    const success = await this.service.softDeleteAccount(accountId);

    if (!success) {
      throw new NotFoundError(`Account con ID ${accountId} non trovato`);
    }

    res.status(204).send();
  });
}

