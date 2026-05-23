import type { CorsOptions } from "cors";
import { AppError } from "../errors/AppError.js";

const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])$/;
const HOME_LAN_PATTERN = /^192\.168\.178\.\d{1,3}$/;
const DEV_ALLOWED_PROTOCOL = "http:";
const DEV_ALLOWED_PORTS = new Set(["5174", "4173"]);

function isDevelopmentFrontendOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);

    if (url.protocol !== DEV_ALLOWED_PROTOCOL || !DEV_ALLOWED_PORTS.has(url.port)) {
      return false;
    }

    return LOCAL_HOST_PATTERN.test(url.hostname) || HOME_LAN_PATTERN.test(url.hostname);
  } catch {
    return false;
  }
}

export function createCorsOptions(configuredOrigins: string[], nodeEnv: string): CorsOptions {
  const allowedOrigins = new Set(configuredOrigins);
  const allowDevelopmentOrigins = nodeEnv !== "production";

  return {
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        (allowDevelopmentOrigins && isDevelopmentFrontendOrigin(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new AppError(`Origin ${origin} is not allowed by CORS.`, 403, "CORS_FORBIDDEN"));
    },
    credentials: true,
    optionsSuccessStatus: 204
  };
}
