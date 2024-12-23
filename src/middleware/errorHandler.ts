import { Request, Response, NextFunction } from "express";
import { logError } from "@/shared/logger";

/**
 * Middleware for global error handling.
 * Logs the error and returns a JSON response with the error message.
 *
 * @param err The error object
 * @param req The HTTP request
 * @param res The HTTP response
 * @param next The next middleware function
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  logError(err.stack || "Unknown error");
  res.status(err.status || 500).json({
    error: err.message || "Server Error",
  });
}
