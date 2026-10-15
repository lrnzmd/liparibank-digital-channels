import request from "supertest";
import { app } from "../../src/app";
import { getPrismaClient, truncateTestDb, closePrismaClient } from "../helpers/db";
import { generateTestToken } from "../helpers/auth";
import { randomUUID } from "crypto";

// Usa describe.skip se il DB non è disponibile
const dbAvailable = process.env.DATABASE_URL?.includes("localhost:5433");
const describeIfDbAvailable = dbAvailable ? describe : describe.skip;

describeIfDbAvailable("Account API Integration Tests", () => {
  const prisma = getPrismaClient();

  beforeAll(async () => {
    // Le migrations dovrebbero essere state eseguite prima di lanciare i test
    // Ad es. con: npm run prisma:deploy -- --schema prisma/schema.prisma
  });

  beforeEach(async () => {
    // Pulisci il database prima di ogni test
    await truncateTestDb();
  });

  afterAll(async () => {
    await closePrismaClient();
  });

  describe("POST /api/accounts", () => {
    it("deve ritornare 401 quando il token JWT è assente", async () => {
      // Act
      const response = await request(app)
        .post("/api/accounts")
        .send({
          ownerId: randomUUID(),
          iban: "IT60X0542811101000000123456",
          type: "CHECKING",
          initialBalance: 1000,
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error?.code).toBe("UNAUTHORIZED");
    });

    it("deve ritornare 201 con JWT valido e body corretto, contiene data.iban", async () => {
      // Arrange
      const ownerId = randomUUID();
      const token = generateTestToken("test-admin", "ADMIN");
      const ibanToCreate = "IT60X0542811101000000123456";

      // Act
      const response = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId,
          iban: ibanToCreate,
          type: "CHECKING",
          initialBalance: 1000,
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.iban).toBe(ibanToCreate);
      expect(response.body.data.ownerId).toBe(ownerId);
      expect(response.body.data.balance).toBe(1000);
      expect(response.body.data.type).toBe("CHECKING");
      expect(response.body.data.id).toBeDefined();
    });
  });

  describe("GET /api/accounts/:id", () => {
    it("deve ritornare 404 con error.code === NOT_FOUND quando l'ID non esiste", async () => {
      // Arrange
      const token = generateTestToken("test-user", "USER");
      const fakeId = randomUUID();

      // Act
      const response = await request(app)
        .get(`/api/accounts/${fakeId}`)
        .set("Cookie", `access_token=${token}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error?.code).toBe("NOT_FOUND");
    });

    it("deve ritornare 200 con i dati dell'account quando esiste", async () => {
      // Arrange
      const token = generateTestToken("test-user", "USER");
      const ownerId = randomUUID();
      const ibanToCreate = "IT60X0542811101000000123456";

      // Crea un account
      const createResponse = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${token}`)
        .send({
          ownerId,
          iban: ibanToCreate,
          type: "CHECKING",
          initialBalance: 2000,
        });

      const accountId = createResponse.body.data.id;

      // Act: Recupera l'account
      const response = await request(app)
        .get(`/api/accounts/${accountId}`)
        .set("Cookie", `access_token=${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(accountId);
      expect(response.body.data.iban).toBe(ibanToCreate);
      expect(response.body.data.balance).toBe(2000);
    });
  });

  describe("DELETE /api/accounts/:id", () => {
    it("deve ritornare 403 quando l'utente ha ruolo USER (non ADMIN)", async () => {
      // Arrange
      const userToken = generateTestToken("test-user", "USER");
      const adminToken = generateTestToken("test-admin", "ADMIN");
      const ownerId = randomUUID();

      // Crea un account con token admin
      const createResponse = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${adminToken}`)
        .send({
          ownerId,
          iban: "IT60X0542811101000000123456",
          type: "CHECKING",
          initialBalance: 1000,
        });

      const accountId = createResponse.body.data.id;

      // Act: Tenta di eliminare con token USER
      const response = await request(app)
        .delete(`/api/accounts/${accountId}`)
        .set("Cookie", `access_token=${userToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error?.code).toBe("FORBIDDEN");
    });

    it("deve ritornare 204 quando l'utente ha ruolo ADMIN", async () => {
      // Arrange
      const adminToken = generateTestToken("test-admin", "ADMIN");
      const ownerId = randomUUID();

      // Crea un account con token admin
      const createResponse = await request(app)
        .post("/api/accounts")
        .set("Cookie", `access_token=${adminToken}`)
        .send({
          ownerId,
          iban: "IT60X0542811101000000123456",
          type: "CHECKING",
          initialBalance: 1000,
        });

      const accountId = createResponse.body.data.id;

      // Act: Elimina con token ADMIN
      const response = await request(app)
        .delete(`/api/accounts/${accountId}`)
        .set("Cookie", `access_token=${adminToken}`);

      // Assert
      expect(response.status).toBe(204);
    });
  });
});
