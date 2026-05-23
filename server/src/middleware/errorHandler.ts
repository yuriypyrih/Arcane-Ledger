import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { ErrorResponse } from "../types/api.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response<ErrorResponse>,
  _next: NextFunction
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    response.status(413).json({
      error: {
        code: "REQUEST_BODY_TOO_LARGE",
        message: "Request body is too large."
      }
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("Unhandled server error.", error);
  }

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    }
  });
}
