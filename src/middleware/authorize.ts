import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../routes/errors";

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ForbiddenError("User information not found", { field: "req.user" })
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Insufficient permissions", {
          required: roles,
          actual: req.user.role,
        })
      );
    }

    next();
  };
