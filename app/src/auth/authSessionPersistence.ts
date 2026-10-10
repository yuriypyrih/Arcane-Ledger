import type { Middleware } from "@reduxjs/toolkit";
import { clearAuthSession, setAuthenticatedUser } from "../store/authSlice";
import { forgetAuthUser, rememberAuthUser } from "./authSessionStorage";

export const authSessionPersistence: Middleware = () => (next) => (action) => {
  // Persist synchronously, including account updates and logout/login in one render.
  if (setAuthenticatedUser.match(action)) rememberAuthUser(action.payload);
  if (clearAuthSession.match(action)) forgetAuthUser();
  return next(action);
};
