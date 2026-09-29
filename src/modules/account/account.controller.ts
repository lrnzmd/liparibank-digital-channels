import { NextFunction, Request, RequestHandler, Response } from "express";
import { AccountService } from "./account.service";
import { NotFoundError } from "../../routes/errors";

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
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const accounts = await this.service.getAllAccounts();
    res.json({
      success: true,
      data: accounts,
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
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const success = await this.service.deleteAccount(req.params.id);

    if (!success) {
      throw new NotFoundError(`Account con ID ${req.params.id} non trovato`);
    }

    res.status(204).send();
  });
}
