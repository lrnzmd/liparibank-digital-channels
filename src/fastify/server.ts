import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import { accountPlugin } from "./account.plugin";

/**
 * Server Fastify standalone (porta 3001).
 * Dimostra il porting del modulo Account da Express a Fastify.
 * 
 * Differenze da Express:
 * - Schema JSON inline (no middleware separate)
 * - preHandler hooks automatici per validazione + autenticazione
 * - Error handler centralizzato
 * - Serializzazione basata su schema (fast-json-stringify)
 */
const fastify = Fastify({
  logger: true,
});

// Registra il plugin per i cookie
fastify.register(fastifyCookie);

// Endpoint di test: GET /hello
fastify.get("/hello", async (req, reply) => {
  return reply.send({ ok: true });
});

// Registra il plugin Account sulla rotta /api/accounts
fastify.register(accountPlugin, { prefix: "/api/accounts" });

// Custom error handler per mappare errori di dominio a codici HTTP
fastify.setErrorHandler((error: any, request, reply) => {
  if (error.name === "UnauthorizedError") {
    return reply.status(401).send({
      success: false,
      error: error.message,
    });
  }

  if (error.name === "NotFoundError") {
    return reply.status(404).send({
      success: false,
      error: error.message,
    });
  }

  if (error.name === "ValidationError") {
    return reply.status(400).send({
      success: false,
      error: error.message,
      details: (error as any).details,
    });
  }

  // Errori di validazione JSON Schema
  if (error.statusCode === 400) {
    return reply.status(400).send({
      success: false,
      error: "Validation error",
      details: error.validation,
    });
  }

  // Errori generici
  console.error(error);
  return reply.status(500).send({
    success: false,
    error: "Internal server error",
  });
});

// Avvia il server
const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: "0.0.0.0" });
    console.log("Fastify server running on http://localhost:3002");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
