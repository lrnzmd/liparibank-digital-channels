import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL"] as const;

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: nodeEnv as "development" | "production" | "test",
  dbUrl: process.env.DATABASE_URL!,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
} as const;
