import { Router } from "express";

import {
  getGlobalLeaderboard,
  getQuizDetails,
  listQuizzes,
  startQuizAttempt,
} from "../../controllers/quiz.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { listQuizzesQuerySchema, quizIdParamsSchema } from "../../validators/quiz.validator";

const quizRouter = Router();

quizRouter.get("/", validate({ query: listQuizzesQuerySchema }), listQuizzes);
quizRouter.get("/leaderboard", getGlobalLeaderboard);
quizRouter.get("/:id", validate({ params: quizIdParamsSchema }), getQuizDetails);
quizRouter.post("/:id/start", requireAuth, validate({ params: quizIdParamsSchema }), startQuizAttempt);

export { quizRouter };
