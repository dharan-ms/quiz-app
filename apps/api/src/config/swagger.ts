import path from "path";

import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

export function setupSwagger(app: Application) {
  const openApiPath = path.resolve(__dirname, "../../docs/openapi.yaml");
  const spec = YAML.load(openApiPath);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}
