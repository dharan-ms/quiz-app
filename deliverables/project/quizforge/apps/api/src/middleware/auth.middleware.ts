import { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/apiError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) {
    next(new ApiError(401, "Unauthorized"));
    return;
  }
  next();
}
