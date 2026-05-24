import type { NextFunction, Request, Response } from "express";
import { recordBackendRequestMetric, sanitizeRequestRoute } from "../services/analyticsService.js";

function getRequestRoute(request: Request) {
  const route = (request as Request & { route?: { path?: unknown } }).route;

  if (typeof route?.path === "string") {
    return `${request.baseUrl}${route.path}`;
  }

  return sanitizeRequestRoute(request.originalUrl);
}

export function requestLogger(request: Request, _response: Response, next: NextFunction) {
  const startedAt = performance.now();

  if (process.env.NODE_ENV !== "test") {
    console.info(`${request.method} ${request.originalUrl}`);
  }

  _response.on("finish", () => {
    recordBackendRequestMetric({
      durationMs: performance.now() - startedAt,
      method: request.method,
      route: getRequestRoute(request),
      statusCode: _response.statusCode
    });
  });

  next();
}
