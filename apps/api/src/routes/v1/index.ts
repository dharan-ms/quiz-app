import { Router } from "express";

import { adminRouter } from "./admin.routes";
import { attemptRouter } from "./attempt.routes";
import { authRouter } from "./auth.routes";
import { quizRouter } from "./quiz.routes";
import { userRouter } from "./user.routes";

const v1Router = Router();

v1Router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    data: { uptime: process.uptime() },
  });
});

v1Router.use("/auth", authRouter);
v1Router.use("/quizzes", quizRouter);
v1Router.use("/attempts", attemptRouter);
v1Router.use("/users", userRouter);
v1Router.use("/admin", adminRouter);

export { v1Router };
