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

type ShowToastMessagePayload = {
  text: string;
  type?: ToastType;
  position?: ToastPosition;
  effect?: ToastEffect;
  dismissMs?: number;
};

type ShowToastEffectPayload = {
  text?: undefined;
  type?: ToastType;
  position?: ToastPosition;
  effect: ToastEffect;
  dismissMs?: number;
};

export type ShowToastPayload = ShowToastMessagePayload | ShowToastEffectPayload;

type ToastEntryBase = {
  id: string;
  type: ToastType;
  position: ToastPosition;
  dismissMs?: number;
};

export type ToastCardEntry = ToastEntryBase & {
  kind: "toast";
  text: string;
  effect?: ToastEffect;
};

export type ToastEffectEntry = ToastEntryBase & {
  kind: "effect";
  effect: ToastEffect;
};

export type ToastEntry = ToastCardEntry | ToastEffectEntry;

export const DEFAULT_TOAST_DISMISS_MS = 6_000;

const DEFAULT_TOAST_TYPE: ToastType = "info";
const DEFAULT_TOAST_POSITION: ToastPosition = "top-middle";

function createToastId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isToastCardEntry(toast: ToastEntry): toast is ToastCardEntry {
  return toast.kind === "toast";
}

export function hasToastCards(toasts: readonly ToastEntry[]): boolean {
  return toasts.some(isToastCardEntry);
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
        const text = "text" in payload ? payload.text : undefined;
        const baseEntry = {
          id: createToastId(),
          type: payload.type ?? DEFAULT_TOAST_TYPE,
          position: payload.position ?? DEFAULT_TOAST_POSITION,
          dismissMs: payload.dismissMs
        };

        if (typeof text === "string" && text.trim().length > 0) {
          return {
            payload: {
              ...baseEntry,
              kind: "toast" as const,
              text,
              effect: payload.effect
            }
          };
        }

        return {
          payload: {
            ...baseEntry,
            kind: "effect" as const,
            effect: payload.effect ?? "default"
          }
        };
      }
    },
    dismissToast(state, action: PayloadAction<string>) {
      return state.filter((toast) => toast.id !== action.payload);
    },
    dismissAllToasts() {
      return [];
    }
  }
});

export const { dismissAllToasts, dismissToast, showToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
