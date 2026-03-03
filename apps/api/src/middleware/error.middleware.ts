import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";
import { errorResponse } from "../utils/response";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error("Unhandled error", {
    path: req.path,
    method: req.method,
    error,
  });

  if (error instanceof ApiError) {
    res.status(error.statusCode).json(errorResponse(error.message, error.details));
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json(errorResponse("Database error", error.message));
    return;
  }

  res
    .status(500)
    .json(errorResponse("Internal server error", env.NODE_ENV === "development" ? error : undefined));
}
