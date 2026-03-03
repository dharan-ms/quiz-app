import { Router } from "express";

import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
} from "../../controllers/auth.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../validators/auth.validator";

const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate({ body: registerSchema }), register);
authRouter.post("/login", authRateLimiter, validate({ body: loginSchema }), login);
authRouter.post("/logout", requireAuth, logout);
authRouter.get("/me", requireAuth, me);
authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  resetPassword,
);

export { authRouter };
