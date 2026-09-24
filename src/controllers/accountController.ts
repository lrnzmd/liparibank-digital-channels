// Controller: converte HTTP ↔ business logic. Non contiene logica.
import { Request, Response, NextFunction } from "express";
import { AccountService } from "../services/accountService";

export class AccountController {
  constructor(private readonly service: AccountService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accounts = await this.service.getAllAccounts();
      res.json({ success: true, data: accounts });
    } catch (error) { next(error); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const account = await this.service.getAccountById(req.params.id);
      res.json({ success: true, data: account });
    } catch (error) { next(error); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const account = await this.service.createAccount(req.body);
      res.status(201).json({ success: true, data: account });
    } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Per ora: solo update del balance come esempio
      const { balance } = req.body;
      const account = await this.service.getAccountById(req.params.id);
      // In un progetto reale: service.updateAccount(id, dto)
      res.json({ success: true, data: { ...account, balance } });
    } catch (error) { next(error); }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.getAccountById(req.params.id); // Verifica che esista
      res.sendStatus(204);
    } catch (error) { next(error); }
  };
}