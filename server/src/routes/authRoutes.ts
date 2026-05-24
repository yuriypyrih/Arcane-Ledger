import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  getUserPreferences,
  login,
  logout,
  register,
  resendEmailVerification,
  resetPassword,
  updateUserPreferences,
  verifyEmail
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const AUTH_WRITE_WINDOW_MS = 15 * 60 * 1000;

const authWriteRateLimit = rateLimit({
  windowMs: AUTH_WRITE_WINDOW_MS,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication requests. Try again later."
    }
  }
});

const authRoutes = Router();

authRoutes.get("/me", requireAuth, getCurrentUser);
authRoutes.get("/preferences", requireAuth, getUserPreferences);
authRoutes.patch("/preferences", requireAuth, updateUserPreferences);
authRoutes.post("/register", authWriteRateLimit, register);
authRoutes.post("/login", authWriteRateLimit, login);
authRoutes.post("/logout", logout);
authRoutes.post("/email-verification/verify", authWriteRateLimit, verifyEmail);
authRoutes.post("/email-verification/resend", authWriteRateLimit, resendEmailVerification);
authRoutes.post("/password/forgot", authWriteRateLimit, forgotPassword);
authRoutes.patch("/password/reset", authWriteRateLimit, resetPassword);
authRoutes.patch("/password/change", authWriteRateLimit, requireAuth, changePassword);

export { authRoutes };
