import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import prisma from "../config/prisma";
import { AccountService } from "../modules/account/account.service";
import { PrismaAccountRepository } from "../modules/account/account.repository.prisma";
import { UnauthorizedError, NotFoundError, ValidationError } from "../routes/errors";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

// Extend FastifyRequest to include user property
declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

/**
 * JSON Schema per validazione Fastify.
 * Fastify usa fast-json-stringify per serializzazione basata su schema.
 */
const createAccountSchema = {
  body: {
    type: "object" as const,
    required: ["iban", "balance", "type", "status", "ownerId"],
    properties: {
      iban: { type: "string", minLength: 15, maxLength: 34 },
      balance: { type: "number", minimum: 0 },
      type: { type: "string", enum: ["CHECKING", "SAVINGS", "DEPOSIT"] },
      status: { type: "string", enum: ["ACTIVE", "BLOCKED", "CLOSED"] },
      ownerId: { type: "string", format: "uuid" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            iban: { type: "string" },
            balance: { type: "number" },
            type: { type: "string" },
            status: { type: "string" },
            ownerId: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
      },
    },
  },
};

const getAccountSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            iban: { type: "string" },
            balance: { type: "number" },
            type: { type: "string" },
            status: { type: "string" },
            ownerId: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
      },
    },
  },
};

const updateAccountSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    properties: {
      iban: { type: "string", minLength: 15, maxLength: 34 },
      balance: { type: "number", minimum: 0 },
      type: { type: "string", enum: ["CHECKING", "SAVINGS", "DEPOSIT"] },
      status: { type: "string", enum: ["ACTIVE", "BLOCKED", "CLOSED"] },
      ownerId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        data: {
          type: "object",
        },
      },
    },
  },
};

const listAccountsSchema = {
  querystring: {
    type: "object",
    properties: {
      page: { type: "number", default: 1 },
      pageSize: { type: "number", default: 20 },
      status: { type: "string" },
      type: { type: "string" },
      sortBy: { type: "string", default: "createdAt" },
      order: { type: "string", default: "desc" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: { type: "array" },
        meta: {
          type: "object",
          properties: {
            total: { type: "number" },
            page: { type: "number" },
            pageSize: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  },
};

/**
 * Middleware autenticazione JWT (preHandler).
 * Estrae il token dal cookie e lo valida.
 */
export async function authenticatePreHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const token = req.cookies.access_token;

  if (!token) {
    throw new UnauthorizedError("Access token not provided", { field: "cookie" });
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}

/**
 * Middleware autorizzazione (per ruoli).
 * Verifica che l'utente abbia un ruolo specifico.
 */
export function authorizeRole(requiredRole: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (req.user?.role !== requiredRole) {
      throw new UnauthorizedError(`Role ${requiredRole} required`);
    }
  };
}

/**
 * Plugin Fastify che registra gli endpoint Account.
 * Riusa AccountService e PrismaAccountRepository (stesso Repository pattern di Express).
 */
export async function accountPlugin(fastify: FastifyInstance) {
  const repository = new PrismaAccountRepository(prisma);
  const service = new AccountService(repository);

  /**
   * POST /accounts
   * Crea un nuovo account.
   */
  fastify.post<{ Body: any }>(
    "/",
    {
      preHandler: authenticatePreHandler,
      schema: createAccountSchema,
    },
    async (req, reply) => {
      try {
        const account = await service.createAccount(req.body);
        return reply.status(201).send({
          success: true,
          data: account,
        });
      } catch (error: any) {
        throw error;
      }
    }
  );

  /**
   * GET /accounts/:id
   * Recupera un account per ID.
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: authenticatePreHandler,
      schema: getAccountSchema,
    },
    async (req, reply) => {
      try {
        const account = await service.getAccountById(req.params.id);

        if (!account) {
          throw new NotFoundError(
            `Account con ID ${req.params.id} non trovato`
          );
        }

        return reply.send({
          success: true,
          data: account,
        });
      } catch (error: any) {
        throw error;
      }
    }
  );

  /**
   * GET /accounts
   * Lista gli account con paginazione.
   */
  fastify.get<{ Querystring: any }>(
    "/",
    {
      preHandler: authenticatePreHandler,
      schema: listAccountsSchema,
    },
    async (req, reply) => {
      try {
        const query = req.query as any;
        const page = Number(query.page) || 1;
        const pageSize = Number(query.pageSize) || 20;
        const status = query.status;
        const type = query.type;
        const sortBy = (query.sortBy || "createdAt") as
          | "createdAt"
          | "balance"
          | "iban";
        const order = (query.order || "desc") as "asc" | "desc";

        const offset = (page - 1) * pageSize;
        const where: any = {};
        if (status) where.status = status;
        if (type) where.type = type;

        const [accounts, total] = await Promise.all([
          service.listAccountsWithPagination({
            where,
            skip: offset,
            take: pageSize,
            sortBy,
            order,
          }),
          service.countAccounts(where),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        return reply.send({
          data: accounts,
          meta: {
            total,
            page,
            pageSize,
            totalPages,
          },
        });
      } catch (error: any) {
        throw error;
      }
    }
  );

  /**
   * PUT /accounts/:id
   * Aggiorna un account.
   */
  fastify.put<{ Params: { id: string }; Body: any }>(
    "/:id",
    {
      preHandler: authenticatePreHandler,
      schema: updateAccountSchema,
    },
    async (req, reply) => {
      try {
        const account = await service.updateAccount(req.params.id, req.body);

        if (!account) {
          throw new NotFoundError(
            `Account con ID ${req.params.id} non trovato`
          );
        }

        return reply.send({
          success: true,
          data: account,
        });
      } catch (error: any) {
        throw error;
      }
    }
  );

  /**
   * DELETE /accounts/:id
   * Elimina (soft delete) un account.
   */
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: [authenticatePreHandler, authorizeRole("ADMIN")],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const success = await service.softDeleteAccount(req.params.id);

        if (!success) {
          throw new NotFoundError(
            `Account con ID ${req.params.id} non trovato`
          );
        }

        return reply.status(204).send();
      } catch (error: any) {
        throw error;
      }
    }
  );
}
