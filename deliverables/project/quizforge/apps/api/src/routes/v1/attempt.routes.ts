import { Router } from "express";

import {
  getAttempt,
  getAttemptResult,
  saveAttemptAnswer,
  submitAttempt,
} from "../../controllers/attempt.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { answerAttemptSchema, attemptIdParamsSchema, submitAttemptSchema } from "../../validators/attempt.validator";

const attemptRouter = Router();

attemptRouter.use(requireAuth);
attemptRouter.get("/:id", validate({ params: attemptIdParamsSchema }), getAttempt);
attemptRouter.post(
  "/:id/answer",
  validate({ params: attemptIdParamsSchema, body: answerAttemptSchema }),
  saveAttemptAnswer,
);
attemptRouter.post(
  "/:id/submit",
  validate({ params: attemptIdParamsSchema, body: submitAttemptSchema }),
  submitAttempt,
);
attemptRouter.get("/:id/result", validate({ params: attemptIdParamsSchema }), getAttemptResult);

export { attemptRouter };
