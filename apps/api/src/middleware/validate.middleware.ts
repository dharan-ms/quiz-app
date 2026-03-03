import { NextFunction, Request, Response } from "express";
import { z, ZodSchema } from "zod";

import { ApiError } from "../utils/apiError";

export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ApiError(400, "Validation failed", error.flatten()));
        return;
      }
      next(error);
    }
  };
}
