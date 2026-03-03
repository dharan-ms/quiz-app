import { Request, Response } from "express";

import { errorResponse } from "../utils/response";

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.originalUrl}`));
}
