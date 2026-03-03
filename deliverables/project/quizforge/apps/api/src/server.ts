import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}${env.API_BASE_PATH}`);
});

function shutdown(signal: string) {
  logger.info(`Received ${signal}, closing API server...`);
  server.close(() => {
    logger.info("API server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
