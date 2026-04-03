import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createCorsOptions } from "./config/cors.js";
import { getAppConfig } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  const config = getAppConfig();

  app.set("trust proxy", true);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors(createCorsOptions(config.corsAllowedOrigins)));
  app.use(express.json());
  app.use("/api/v1", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
