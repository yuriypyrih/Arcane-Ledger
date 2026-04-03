import type { NextFunction, Request, Response } from "express";

export function requestLogger(request: Request, _response: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "test") {
    console.info(`${request.method} ${request.originalUrl}`);
  }

  next();
}
