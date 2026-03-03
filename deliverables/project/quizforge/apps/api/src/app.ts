import compression from "compression";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import pg from "pg";

import { env } from "./config/env";
import { setupSwagger } from "./config/swagger";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { globalRateLimiter } from "./middleware/rateLimit.middleware";
import { v1Router } from "./routes/v1";

const PgStore = connectPgSimple(session);
const { Pool } = pg;

const sessionPool =
  env.NODE_ENV === "test"
    ? null
    : new Pool({
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

app.use(
  session({
    store:
      env.NODE_ENV === "test" || !sessionPool
        ? new session.MemoryStore()
        : new PgStore({
            pool: sessionPool,
            tableName: "user_sessions",
            createTableIfMissing: true,
          }),
    name: "qid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

setupSwagger(app);
app.use(env.API_BASE_PATH, v1Router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
