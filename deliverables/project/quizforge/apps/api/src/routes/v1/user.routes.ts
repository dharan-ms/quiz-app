import { Router } from "express";

import { listMyAttempts } from "../../controllers/attempt.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { paginationQuerySchema } from "../../validators/common.validator";

const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/me/attempts", validate({ query: paginationQuerySchema }), listMyAttempts);

export { userRouter };
