import { InMemoryAccountRepository } from "./account.repository";
import { Account } from "./account.types";
import { randomUUID } from "crypto";

describe("InMemoryAccountRepository", () => {
  let repo: InMemoryAccountRepository;

  beforeEach(() => {
    repo = new InMemoryAccountRepository();
  });

  describe("save & findById", () => {
    it("deve salvare e ritrovare un account", async () => {
      // Arrange
      const accountId = randomUUID();
      const account: Account = {
        id: accountId,
        ownerId: randomUUID(),
        iban: "IT60X0542811101000000123456",
        type: "CHECKING",
        balance: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const saved = await repo.save(account);
      const found = await repo.findById(accountId);

      // Assert
      expect(saved).toEqual(account);
      expect(found).toEqual(account);
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

    it("deve ritornare tutti gli account salvati", async () => {
      // Arrange
      const account1: Account = {
        id: randomUUID(),
        ownerId: randomUUID(),
        iban: "IT60X0542811101000000111111",
        type: "CHECKING",
        balance: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const account2: Account = {
        id: randomUUID(),
        ownerId: randomUUID(),
        iban: "IT60X0542811101000000222222",
        type: "SAVINGS",
        balance: 2000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      await repo.save(account1);
      await repo.save(account2);
      const result = await repo.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(account1);
      expect(result).toContainEqual(account2);
    });
  });

  describe("delete", () => {
    it("deve eliminare un account e ritornare true", async () => {
      // Arrange
      const accountId = randomUUID();
      const account: Account = {
        id: accountId,
        ownerId: randomUUID(),
        iban: "IT60X0542811101000000123456",
        type: "CHECKING",
        balance: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await repo.save(account);

      // Act
      const result = await repo.delete(accountId);
      const found = await repo.findById(accountId);

      // Assert
      expect(result).toBe(true);
      expect(found).toBeNull();
    });

    it("deve ritornare false quando si cerca di eliminare un ID inesistente", async () => {
      // Act
      const result = await repo.delete(randomUUID());

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findByIban", () => {
    it("deve trovare un account per IBAN", async () => {
      // Arrange
      const iban = "IT60X0542811101000000123456";
      const account: Account = {
        id: randomUUID(),
        ownerId: randomUUID(),
        iban,
        type: "CHECKING",
        balance: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      await repo.save(account);
      const result = await repo.findByIban(iban);

      // Assert
      expect(result).toEqual(account);
    });

    it("deve ritornare null quando findByIban non trova nulla", async () => {
      // Act
      const result = await repo.findByIban("IT60X0542811101000000XXXXXX");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("clear", () => {
    it("deve eliminare tutti gli account dal repository", async () => {
      // Arrange
      const account1: Account = {
        id: randomUUID(),
        ownerId: randomUUID(),
        iban: "IT60X0542811101000000111111",
        type: "CHECKING",
        balance: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await repo.save(account1);

      // Act
      repo.clear();
      const result = await repo.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
