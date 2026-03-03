import rateLimit from "express-rate-limit";

import { env } from "../config/env";

const windowMs = env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

export const globalRateLimiter = rateLimit({
  windowMs,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});
