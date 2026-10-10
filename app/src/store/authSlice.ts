import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthStatus, AuthUser } from "../types/auth";

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  sessionVerified: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  status: "unknown",
  user: null,
  sessionVerified: false,
  loading: false,
  error: null
};

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
      state.status = "authenticated";
      state.user = action.payload;
      state.sessionVerified = true;
      state.loading = false;
      state.error = null;
    },
    restoreOfflineAuthUser(state, action: PayloadAction<AuthUser>) {
      state.status = "authenticated";
      state.user = action.payload;
      state.sessionVerified = false;
      state.loading = false;
      state.error = null;
    },
    setGuestSession(state) {
      state.status = "guest";
      state.user = null;
      state.sessionVerified = false;
      state.loading = false;
    },
    clearAuthSession(state) {
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
  setAuthLoading,
  setGuestSession
} = authSlice.actions;
export const authReducer = authSlice.reducer;
