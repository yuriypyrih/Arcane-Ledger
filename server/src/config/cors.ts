import type { CorsOptions } from "cors";
import { AppError } from "../errors/AppError.js";

const LOCAL_ALLOWED_ORIGINS = new Set(["http://localhost:5174", "http://127.0.0.1:5174"]);

export function createCorsOptions(configuredOrigins: string[]): CorsOptions {
  const allowedOrigins = new Set([...LOCAL_ALLOWED_ORIGINS, ...configuredOrigins]);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(`Origin ${origin} is not allowed by CORS.`, 403, "CORS_FORBIDDEN"));
    },
    optionsSuccessStatus: 204
  };
}
