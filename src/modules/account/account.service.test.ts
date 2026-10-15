import { AccountService } from "./account.service";
import { AccountRepository } from "./account.repository";
import { Account } from "./account.types";
import { randomUUID } from "crypto";

describe("AccountService", () => {
  let service: AccountService;
  let mockRepo: jest.Mocked<AccountRepository>;

  beforeEach(() => {
    // Mock del repository con Jest
    mockRepo = {
      findById: jest.fn(),
      findByIban: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    service = new AccountService(mockRepo);
  });

  describe("getById", () => {
    it("deve ritornare l'Account dal repo quando l'ID esiste", async () => {
      // Arrange
      const accountId = randomUUID();
      const mockAccount: Account = {
        id: accountId,
        ownerId: randomUUID(),
        iban: "IT60X0542811101000000123456",
        type: "CHECKING",
        balance: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.findById.mockResolvedValue(mockAccount);

      // Act
      const result = await service.getById(accountId);

      // Assert
      expect(result).toEqual(mockAccount);
      expect(mockRepo.findById).toHaveBeenCalledWith(accountId);
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("deve lanciare NotFoundError quando l'ID non esiste", async () => {
      // Arrange
      const accountId = randomUUID();
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById(accountId)).rejects.toThrow(
        `Account with id ${accountId} not found`
      );
      expect(mockRepo.findById).toHaveBeenCalledWith(accountId);
    });
  });

  describe("create", () => {
    it("deve richiamare il repo.save con tutti i campi corretti", async () => {
      // Arrange
      const ownerId = randomUUID();
      const createData = {
        iban: "IT60X0542811101000000123456",
        balance: 5000,
        type: "SAVINGS" as const,
        status: "ACTIVE" as const,
        ownerId,
      };

      const savedAccount: Account = {
        id: randomUUID(),
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.save.mockResolvedValue(savedAccount);

      // Act
      const result = await service.create(createData);

      // Assert
      expect(result).toEqual(savedAccount);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);

      // Verifico che il repo.save sia stato chiamato con un Account
      const callArg = mockRepo.save.mock.calls[0]?.[0];
      expect(callArg).toBeDefined();
      if (!callArg) return;
      expect(callArg).toHaveProperty("id");
      expect(callArg).toHaveProperty("iban", createData.iban);
      expect(callArg).toHaveProperty("balance", createData.balance);
      expect(callArg).toHaveProperty("type", createData.type);
      expect(callArg).toHaveProperty("status", createData.status);
      expect(callArg).toHaveProperty("ownerId", createData.ownerId);
      expect(callArg).toHaveProperty("createdAt");
      expect(callArg).toHaveProperty("updatedAt");
    });
  });

  describe("delete", () => {
    it("deve richiamare il repo.delete una volta con l'ID corretto", async () => {
      // Arrange
      const accountId = randomUUID();
      mockRepo.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(accountId);

      // Assert
      expect(result).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith(accountId);
      expect(mockRepo.delete).toHaveBeenCalledTimes(1);
    });

    it("deve ritornare false quando il delete fallisce", async () => {
      // Arrange
      const accountId = randomUUID();
      mockRepo.delete.mockResolvedValue(false);

      // Act
      const result = await service.delete(accountId);

      // Assert
      expect(result).toBe(false);
      expect(mockRepo.delete).toHaveBeenCalledWith(accountId);
    });
  });
});
