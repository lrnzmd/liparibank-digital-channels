import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";

export class AuthController {
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, firstName, lastName } = req.body;
      const { statusCode, user } = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
      });
      res.status(statusCode).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    }
  );

  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await AuthService.login({
        email,
        password,
      });

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
      });
    }
  );

  static refresh = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Refresh token not provided",
          },
        });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await AuthService.refresh(refreshToken);

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
      });
    }
  );

  static logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    }
  );

  static me = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
      }

      const user = await AuthService.getMe(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    }
  );
}
