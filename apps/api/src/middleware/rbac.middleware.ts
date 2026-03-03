import { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/apiError";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) {
    next(new ApiError(401, "Unauthorized"));
    return;
  }

  if (req.session.role !== "ADMIN") {
    next(new ApiError(403, "Admin access required"));
    return;
  }

  next();
}
