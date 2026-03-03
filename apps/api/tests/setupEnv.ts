process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/quiz_app_test";
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret";
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";
process.env.PORT = process.env.PORT ?? "4000";
