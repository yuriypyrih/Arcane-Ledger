import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthStatus, AuthUser } from "../types/auth";

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  sessionVerified: boolean;
  sessionGeneration: number;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  status: "unknown",
  user: null,
  sessionVerified: false,
  sessionGeneration: 0,
  loading: false,
  error: null
};

function applyAuthenticatedUser(state: AuthState, user: AuthUser) {
  state.status = "authenticated";
  state.user = user;
  state.sessionVerified = true;
  state.loading = false;
  state.error = null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setAuthenticatedUser(state, action: PayloadAction<AuthUser>) {
      if (state.status !== "authenticated" || state.user?.id !== action.payload.id) {
        state.sessionGeneration += 1;
      }
      applyAuthenticatedUser(state, action.payload);
    },
    setAuthenticatedSession(state, action: PayloadAction<AuthUser>) {
      // A successful login starts a new session even when the account did not change.
      state.sessionGeneration += 1;
      applyAuthenticatedUser(state, action.payload);
    },
    restoreOfflineAuthUser(state, action: PayloadAction<AuthUser>) {
      if (state.status !== "authenticated" || state.user?.id !== action.payload.id) {
        state.sessionGeneration += 1;
      }
      state.status = "authenticated";
      state.user = action.payload;
      state.sessionVerified = false;
      state.loading = false;
      state.error = null;
    },
    setGuestSession(state) {
      if (state.status === "authenticated") state.sessionGeneration += 1;
      state.status = "guest";
      state.user = null;
      state.sessionVerified = false;
      state.loading = false;
    },
    clearAuthSession(state) {
      // Invalidate requests even if logout/login is batched or returns to the same account.
      state.sessionGeneration += 1;
      state.status = "guest";
      state.user = null;
      state.sessionVerified = false;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  clearAuthSession,
  restoreOfflineAuthUser,
  setAuthError,
  setAuthenticatedUser,
  setAuthenticatedSession,
  setAuthLoading,
  setGuestSession
} = authSlice.actions;
export const authReducer = authSlice.reducer;
