import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { ConflictError, UnauthorizedError } from "../../routes/errors";
import { RegisterRequest, LoginRequest, TokenPayload } from "./auth.types";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export class AuthService {
  static async register(req: RegisterRequest) {
    const { email, password, firstName, lastName } = req;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError("Email already registered", { email });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let customer = null;
    if (firstName && lastName) {
      const fiscalCode = `${firstName.toUpperCase().substring(0, 3)}${lastName.toUpperCase().substring(0, 3)}${Date.now()}`;
      customer = await prisma.customer.create({
        data: {
          fiscalCode,
          firstName,
          lastName,
          email,
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER",
        customerId: customer?.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return { statusCode: 201, user };
  }

  static async login(req: LoginRequest) {
    const { email, password } = req;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const newPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = jwt.sign(newPayload, env.jwtAccessSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const newRefreshToken = jwt.sign(newPayload, env.jwtRefreshSecret, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  }
}
