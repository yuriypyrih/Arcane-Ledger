import type { NextFunction, Request, RequestHandler, Response } from "express";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { getUserFromAuthToken } from "../services/authUserService.js";
import type { UserDocument } from "../models/User.js";

export type AuthenticatedLocals = {
  authUser: UserDocument;
};

export const requireAuth: RequestHandler = (
  request: Request,
  response: Response<unknown, Partial<AuthenticatedLocals>>,
  next: NextFunction
) => {
  const { authCookieName } = getAppConfig();
  const token = request.cookies?.[authCookieName];

  if (typeof token !== "string" || !token) {
    next(new AppError("Authentication is required.", 401, "AUTH_REQUIRED"));
    return;
  }

  void getUserFromAuthToken(token)
    .then((user) => {
      response.locals.authUser = user;
      next();
    })
    .catch(next);
};
