import jwt from "jsonwebtoken";

/**
 * Genera un JWT di test per le route protette.
 * @param userId ID dell'utente
 * @param role Role dell'utente (e.g., "USER", "ADMIN")
 * @returns Token JWT firmato
 */
export function generateTestToken(
  userId: string = "test-user-id",
  role: string = "USER",
  email: string = "test@example.com"
): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET non definito in .env.test");
  }

  return jwt.sign(
    {
      id: userId,
      email,
      role,
    },
    secret,
    {
      expiresIn: "1h",
    }
  );
}
