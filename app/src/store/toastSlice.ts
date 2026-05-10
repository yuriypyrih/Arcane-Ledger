import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const TOAST_TYPES = ["info", "success", "warning", "error"] as const;
export const TOAST_POSITIONS = [
  "top-left",
  "top-middle",
  "top-right",
  "bottom-left",
  "bottom-middle",
  "bottom-right"
] as const;
export const TOAST_EFFECTS = ["default"] as const;

export type ToastType = (typeof TOAST_TYPES)[number];
export type ToastPosition = (typeof TOAST_POSITIONS)[number];
export type ToastEffect = (typeof TOAST_EFFECTS)[number];

export type ShowToastPayload = {
  text: string;
  type?: ToastType;
  position?: ToastPosition;
  effect?: ToastEffect;
};

export type ToastEntry = {
  id: string;
  text: string;
  type: ToastType;
  position: ToastPosition;
  effect?: ToastEffect;
};

export const DEFAULT_TOAST_DISMISS_MS = 6_000;

const DEFAULT_TOAST_TYPE: ToastType = "info";
const DEFAULT_TOAST_POSITION: ToastPosition = "top-middle";

function createToastId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const toastSlice = createSlice({
  name: "toasts",
  initialState: [] as ToastEntry[],
  reducers: {
    showToast: {
      reducer(state, action: PayloadAction<ToastEntry>) {
        state.unshift(action.payload);
      },
      prepare(payload: ShowToastPayload) {
        return {
          payload: {
            id: createToastId(),
            text: payload.text,
            type: payload.type ?? DEFAULT_TOAST_TYPE,
            position: payload.position ?? DEFAULT_TOAST_POSITION,
            effect: payload.effect
          }
        };
      }
    },
    dismissToast(state, action: PayloadAction<string>) {
      return state.filter((toast) => toast.id !== action.payload);
    }
  }
});

export const { dismissToast, showToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
