import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LipariBank Digital Channels API",
      version: "1.0.0",
      description: "API per la gestione conto e transfer bancari",
      contact: {
        name: "LipariBank",
        email: "support@liparibank.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token from auth endpoint",
        },
      },
      schemas: {
        Account: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            iban: { type: "string" },
            balance: { type: "number" },
            type: { type: "string", enum: ["CHECKING", "SAVINGS", "DEPOSIT"] },
            status: { type: "string", enum: ["ACTIVE", "BLOCKED", "CLOSED"] },
            customerId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            deletedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Transfer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            amount: { type: "number" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED"] },
            fromAccountId: { type: "string", format: "uuid" },
            toAccountId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            executedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            fiscalCode: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string", nullable: true },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            deletedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        KycDocument: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            customerId: { type: "string", format: "uuid" },
            fileName: { type: "string" },
            mimeType: { type: "string" },
            sizeBytes: { type: "integer" },
            storageUrl: { type: "string" },
            uploadedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            code: { type: "string" },
            details: { type: "object" },
          },
        },
      },
    },
    tags: [
      { name: "Accounts", description: "Account management" },
      { name: "Customers", description: "Customer management" },
      { name: "Transfers", description: "Transfer operations" },
      { name: "KYC", description: "KYC Document upload" },
      { name: "Reports", description: "Analytics reports" },
      { name: "AI", description: "AI Mock Service" },
      { name: "Auth", description: "Authentication" },
    ],
  },
  apis: [
    "./src/modules/**/*.routes.ts",
    "./src/modules/**/*.controller.ts",
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
