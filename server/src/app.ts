import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { createCorsOptions } from "./config/cors.js";
import { getAppConfig } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";
import { setupSentryExpressErrorHandler } from "./sentry.js";

export function createApp() {
  const app = express();
  const config = getAppConfig();

  app.set("trust proxy", config.trustProxyHops > 0 ? config.trustProxyHops : false);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors(createCorsOptions(config.corsAllowedOrigins, config.nodeEnv)));
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/v1", apiRouter);
  setupSentryExpressErrorHandler(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
