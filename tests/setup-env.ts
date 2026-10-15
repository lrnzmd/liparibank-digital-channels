import dotenv from "dotenv";
import path from "path";

// Carica .env.test prima di qualsiasi test
dotenv.config({ path: path.join(__dirname, "..", ".env.test") });

// Assicura che siamo in ambiente test
process.env.NODE_ENV = "test";
