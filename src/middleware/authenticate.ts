import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../routes/errors";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(
      new UnauthorizedError("Access token not provided", { field: "cookie" })
    );
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Access token expired"));
    }
    return next(new UnauthorizedError("Invalid access token"));
  }
};
