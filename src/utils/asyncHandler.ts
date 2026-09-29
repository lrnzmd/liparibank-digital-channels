import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper per route handlers async.
 * Cattura le promise rejection e le passa a next(err).
 * 
 * @example
 * router.post("/", asyncHandler(async (req, res) => {
 *   const account = await service.create(req.body);
 *   res.status(201).json({ success: true, data: account });
 * }));
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
