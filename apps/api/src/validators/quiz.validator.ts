import { Difficulty } from "@prisma/client";
import { z } from "zod";

export const listQuizzesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().min(1).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  category: z.string().trim().min(1).optional(),
});

export const quizIdParamsSchema = z.object({
  id: z.string().min(1),
});
