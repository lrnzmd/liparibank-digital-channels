import request from "supertest";
import { app } from "../../src/app";
import { getPrismaClient, truncateTestDb, closePrismaClient } from "../helpers/db";
import { generateTestToken } from "../helpers/auth";
import { randomUUID } from "crypto";

// Usa describe.skip se il DB non è disponibile
const dbAvailable = process.env.DATABASE_URL?.includes("localhost:5433");
const describeIfDbAvailable = dbAvailable ? describe : describe.skip;

describeIfDbAvailable("Transfer API Integration Tests", () => {
  const prisma = getPrismaClient();

  beforeAll(async () => {
    // Le migrations dovrebbero essere state eseguite prima di lanciare i test
  });

  beforeEach(async () => {
    // Pulisci il database prima di ogni test
    await truncateTestDb();
  });

  afterAll(async () => {
    await closePrismaClient();
  });

  describe("POST /api/transfers", () => {
    it("deve completare un transfer valido e aggiornare i saldi", async () => {
      // Arrange
      const token = generateTestToken("test-admin", "ADMIN");
      const ownerId1 = randomUUID();
      const ownerId2 = randomUUID();
      const ibanFrom = "IT60X0542811101000000111111";
      const ibanTo = "IT60X0542811101000000222222";

      // Crea due account
      const account1Response = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId: ownerId1,
          iban: ibanFrom,
          type: "CHECKING",
          initialBalance: 1000,
        });

      const account2Response = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId: ownerId2,
          iban: ibanTo,
          type: "CHECKING",
          initialBalance: 500,
        });

      const accountId1 = account1Response.body.data.id;
      const accountId2 = account2Response.body.data.id;

      // Act: Esegui il transfer
      const transferResponse = await request(app)
        .post("/api/transfers")
        .set("Cookie", `access_token=${token}`)
        .send({
          fromIban: ibanFrom,
          toIban: ibanTo,
          amount: 100,
          description: "Test transfer",
        });

      // Assert
      expect(transferResponse.status).toBe(201);
      expect(transferResponse.body.success).toBe(true);
      expect(transferResponse.body.data.status).toBe("COMPLETED");
      expect(transferResponse.body.data.amount).toBe(100);

      // Verifica i saldi aggiornati
      const account1Check = await request(app)
        .get(`/api/accounts/${accountId1}`)
        .set("Cookie", `access_token=${token}`);

      const account2Check = await request(app)
        .get(`/api/accounts/${accountId2}`)
        .set("Cookie", `access_token=${token}`);

      expect(account1Check.body.data.balance).toBe(900); // 1000 - 100
      expect(account2Check.body.data.balance).toBe(600); // 500 + 100
    });

    it("deve ritornare 409 e non modificare i saldi quando l'importo è maggiore del balance", async () => {
      // Arrange
      const token = generateTestToken("test-admin", "ADMIN");
      const ownerId1 = randomUUID();
      const ownerId2 = randomUUID();
      const ibanFrom = "IT60X0542811101000000333333";
      const ibanTo = "IT60X0542811101000000444444";

      // Crea due account
      const account1Response = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId: ownerId1,
          iban: ibanFrom,
          type: "CHECKING",
          initialBalance: 100, // Saldo basso
        });

      const account2Response = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId: ownerId2,
          iban: ibanTo,
          type: "CHECKING",
          initialBalance: 500,
        });

      const accountId1 = account1Response.body.data.id;
      const accountId2 = account2Response.body.data.id;

      // Act: Tenta un transfer con importo troppo grande
      const transferResponse = await request(app)
        .post("/api/transfers")
        .set("Cookie", `access_token=${token}`)
        .send({
          fromIban: ibanFrom,
          toIban: ibanTo,
          amount: 500, // Maggiore del balance disponibile
          description: "Test transfer - Insufficient funds",
        });

      // Assert
      expect(transferResponse.status).toBe(409);
      expect(transferResponse.body.code).toBe("INSUFFICIENT_FUNDS");

      // Verifica che i saldi NON siano stati modificati
      const account1Check = await request(app)
        .get(`/api/accounts/${accountId1}`)
        .set("Cookie", `access_token=${token}`);

      const account2Check = await request(app)
        .get(`/api/accounts/${accountId2}`)
        .set("Cookie", `access_token=${token}`);

      expect(account1Check.body.data.balance).toBe(100); // Invariato
      expect(account2Check.body.data.balance).toBe(500); // Invariato
    });

    it("deve ritornare 404 quando il conto sorgente non esiste", async () => {
      // Arrange
      const token = generateTestToken("test-admin", "ADMIN");
      const ownerId = randomUUID();
      const ibanTo = "IT60X0542811101000000555555";

      // Crea solo l'account destinazione
      await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId,
          iban: ibanTo,
          type: "CHECKING",
          initialBalance: 500,
        });

      // Act: Tenta il transfer da un conto inesistente
      const transferResponse = await request(app)
        .post("/api/transfers")
        .set("Cookie", `access_token=${token}`)
        .send({
          fromIban: "IT60X0542811101000000XXXXXX",
          toIban: ibanTo,
          amount: 100,
          description: "Test transfer - source not found",
        });

      // Assert
      expect(transferResponse.status).toBe(404);
    });
  });
});
