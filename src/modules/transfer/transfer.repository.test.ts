import { InMemoryTransferRepository } from "./transfer.repository";
import { Transfer } from "./transfer.types";
import { randomUUID } from "crypto";

describe("InMemoryTransferRepository", () => {
  let repo: InMemoryTransferRepository;

  beforeEach(() => {
    repo = new InMemoryTransferRepository();
  });

  describe("save & findById", () => {
    it("deve salvare e ritrovare un transfer", async () => {
      // Arrange
      const transferId = randomUUID();
      const transfer: Transfer = {
        id: transferId,
        fromAccountId: randomUUID(),
        toAccountId: randomUUID(),
        amount: 100,
        description: "Test transfer",
        status: "COMPLETED",
        createdAt: new Date(),
        executedAt: new Date(),
      };

      // Act
      const saved = await repo.save(transfer);
      const found = await repo.findById(transferId);

      // Assert
      expect(saved).toEqual(transfer);
      expect(found).toEqual(transfer);
    });

    it("deve ritornare null quando findById cerca un ID inesistente", async () => {
      // Act
      const result = await repo.findById(randomUUID());

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("deve ritornare un array vuoto inizialmente", async () => {
      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it("deve ritornare tutti i transfer salvati", async () => {
      // Arrange
      const transfer1: Transfer = {
        id: randomUUID(),
        fromAccountId: randomUUID(),
        toAccountId: randomUUID(),
        amount: 100,
        description: "Transfer 1",
        status: "COMPLETED",
        createdAt: new Date(),
        executedAt: new Date(),
      };

      const transfer2: Transfer = {
        id: randomUUID(),
        fromAccountId: randomUUID(),
        toAccountId: randomUUID(),
        amount: 200,
        description: "Transfer 2",
        status: "PENDING",
        createdAt: new Date(),
      };

      // Act
      await repo.save(transfer1);
      await repo.save(transfer2);
      const result = await repo.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(transfer1);
      expect(result).toContainEqual(transfer2);
    });
  });

  describe("findByAccountId", () => {
    it("deve trovare tutti i transfer associati a un account (come sorgente o destinazione)", async () => {
      // Arrange
      const accountId1 = randomUUID();
      const accountId2 = randomUUID();
      const accountId3 = randomUUID();

      const transfer1: Transfer = {
        id: randomUUID(),
        fromAccountId: accountId1,
        toAccountId: accountId2,
        amount: 100,
        description: "Transfer 1",
        status: "COMPLETED",
        createdAt: new Date(),
        executedAt: new Date(),
      };

      const transfer2: Transfer = {
        id: randomUUID(),
        fromAccountId: accountId2,
        toAccountId: accountId3,
        amount: 200,
        description: "Transfer 2",
        status: "COMPLETED",
        createdAt: new Date(),
        executedAt: new Date(),
      };

      const transfer3: Transfer = {
        id: randomUUID(),
        fromAccountId: accountId3,
        toAccountId: accountId1,
        amount: 150,
        description: "Transfer 3",
        status: "PENDING",
        createdAt: new Date(),
      };

      // Act
      await repo.save(transfer1);
      await repo.save(transfer2);
      await repo.save(transfer3);

      // Assert - account 1 ha transfer1 (as source) e transfer3 (as destination)
      const result1 = await repo.findByAccountId(accountId1);
      expect(result1).toHaveLength(2);
      expect(result1).toContainEqual(transfer1);
      expect(result1).toContainEqual(transfer3);

      // Assert - account 2 ha transfer1 (as destination) e transfer2 (as source)
      const result2 = await repo.findByAccountId(accountId2);
      expect(result2).toHaveLength(2);
      expect(result2).toContainEqual(transfer1);
      expect(result2).toContainEqual(transfer2);

      // Assert - account 3 ha transfer2 (as destination) e transfer3 (as source)
      const result3 = await repo.findByAccountId(accountId3);
      expect(result3).toHaveLength(2);
      expect(result3).toContainEqual(transfer2);
      expect(result3).toContainEqual(transfer3);
    });

    it("deve ritornare array vuoto per account senza transfer", async () => {
      // Act
      const result = await repo.findByAccountId(randomUUID());

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("clear", () => {
    it("deve eliminare tutti i transfer dal repository", async () => {
      // Arrange
      const transfer: Transfer = {
        id: randomUUID(),
        fromAccountId: randomUUID(),
        toAccountId: randomUUID(),
        amount: 100,
        description: "Test transfer",
        status: "COMPLETED",
        createdAt: new Date(),
        executedAt: new Date(),
      };

      await repo.save(transfer);

      // Act
      repo.clear();
      const result = await repo.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
