import { Router } from "express";

import {
  getAdminQuizDetails,
  listAdminQuizzes,
  createQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getAdminAnalytics,
  updateQuestion,
  updateQuiz,
} from "../../controllers/admin.controller";
import { requireAdmin } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createQuestionSchema,
  createQuizSchema,
  updateQuestionSchema,
  updateQuizSchema,
} from "../../validators/admin.validator";
import { idParamSchema } from "../../validators/common.validator";

const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/quizzes", listAdminQuizzes);
adminRouter.get("/quizzes/:id", validate({ params: idParamSchema }), getAdminQuizDetails);
adminRouter.post("/quizzes", validate({ body: createQuizSchema }), createQuiz);
adminRouter.put("/quizzes/:id", validate({ params: idParamSchema, body: updateQuizSchema }), updateQuiz);
adminRouter.delete("/quizzes/:id", validate({ params: idParamSchema }), deleteQuiz);
adminRouter.post(
  "/quizzes/:id/questions",
  validate({ params: idParamSchema, body: createQuestionSchema }),
  createQuestion,
);
adminRouter.put(
  "/questions/:id",
  validate({ params: idParamSchema, body: updateQuestionSchema }),
  updateQuestion,
);
adminRouter.delete("/questions/:id", validate({ params: idParamSchema }), deleteQuestion);
adminRouter.get("/analytics", getAdminAnalytics);

export { adminRouter };
