import { Request, Response } from "express";
import { AccountService } from "./account.service";
import { UUID } from "../../types/common";

export class AccountController {
  constructor(private readonly service: AccountService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const accounts = await this.service.getAll();
    res.status(200).json({ data: accounts });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as UUID;
    try {
      const account = await this.service.getById(id);
      res.status(200).json({ data: account });
    } catch (error) {
      res.status(404).json({ error: "Account not found" });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const account = await this.service.create(req.body);
      res.status(201).json({ data: account });
    } catch (error) {
      res.status(400).json({ error: "Failed to create account" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as UUID;
    try {
      const account = await this.service.update(id, req.body);
      res.status(200).json({ data: account });
    } catch (error) {
      res.status(404).json({ error: "Account not found" });
    }
  }

  // Implementa il metodo delete per rimuovere un account
  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as UUID;
    const deleted = await this.service.delete(id);
    if (!deleted) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.status(204).send();
  }
}