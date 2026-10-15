import { TransferService, NotFoundError, InsufficientFundsError } from "./transfer.service";
import { TransferRepository } from "./transfer.repository";
import { AccountRepository } from "../account/account.repository";
import { PrismaClient, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

describe("TransferService", () => {
  let service: TransferService;
  let mockTransferRepo: jest.Mocked<TransferRepository>;
  let mockAccountRepo: jest.Mocked<AccountRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    // Mock del transfer repository
    mockTransferRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      findByAccountId: jest.fn(),
    };

    // Mock del account repository
    mockAccountRepo = {
      findById: jest.fn(),
      findByIban: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    // Mock del Prisma client
    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    service = new TransferService(mockTransferRepo, mockAccountRepo, mockPrisma);
  });

  describe("execute", () => {
    const fromAccountId = randomUUID();
    const toAccountId = randomUUID();
    const fromIban = "IT60X0542811101000000111111";
    const toIban = "IT60X0542811101000000222222";
    const amount = 100;

    it("deve completare il transfer con transazione atomica quando è valido", async () => {
      // Arrange
      const fromAccount = {
        id: fromAccountId,
        ownerId: randomUUID(),
        iban: fromIban,
        type: "CHECKING" as const,
        balance: 1000,
        status: "ACTIVE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const toAccount = {
        id: toAccountId,
        ownerId: randomUUID(),
        iban: toIban,
        type: "CHECKING" as const,
        balance: 500,
        status: "ACTIVE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const transferId = randomUUID();
      const transferResult = {
        id: transferId,
        fromAccountId,
        toAccountId,
        amount: new Prisma.Decimal(amount),
        description: "Test transfer",
        status: "COMPLETED",
        createdAt: new Date(),
        executedAt: new Date(),
      };

      mockAccountRepo.findByIban
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(toAccount);

      mockPrisma.$transaction.mockResolvedValue(transferResult);

      // Act
      const result = await service.execute(fromIban, toIban, amount, "Test transfer");

      // Assert
      expect(result.status).toBe("COMPLETED");
      expect(result.fromAccountId).toBe(fromAccountId);
      expect(result.toAccountId).toBe(toAccountId);
      expect(result.amount).toBe(amount);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockAccountRepo.findByIban).toHaveBeenCalledTimes(2);
    });

    it("deve lanciare InsufficientFundsError quando il saldo è insufficiente", async () => {
      // Arrange
      const fromAccount = {
        id: fromAccountId,
        ownerId: randomUUID(),
        iban: fromIban,
        type: "CHECKING" as const,
        balance: 50, // Meno dell'importo richiesto
        status: "ACTIVE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const toAccount = {
        id: toAccountId,
        ownerId: randomUUID(),
        iban: toIban,
        type: "CHECKING" as const,
        balance: 500,
        status: "ACTIVE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepo.findByIban
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(toAccount);

      // Act & Assert
      await expect(
        service.execute(fromIban, toIban, amount, "Test transfer")
      ).rejects.toThrow(InsufficientFundsError);

      // Verifica che $transaction NON sia stato chiamato
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("deve lanciare NotFoundError quando il conto sorgente non esiste", async () => {
      // Arrange
      mockAccountRepo.findByIban.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.execute(fromIban, toIban, amount, "Test transfer")
      ).rejects.toThrow(NotFoundError);

      // Verifica che $transaction NON sia stato chiamato
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("deve lanciare NotFoundError quando il conto destinazione non esiste", async () => {
      // Arrange
      const fromAccount = {
        id: fromAccountId,
        ownerId: randomUUID(),
        iban: fromIban,
        type: "CHECKING" as const,
        balance: 1000,
        status: "ACTIVE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepo.findByIban
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.execute(fromIban, toIban, amount, "Test transfer")
      ).rejects.toThrow(NotFoundError);

      // Verifica che $transaction NON sia stato chiamato
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
