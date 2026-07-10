import clsx from "clsx";
import { useEffect } from "react";
import {
  dismissToast,
  type ToastEntry,
  type ToastType,
  useAppDispatch
} from "../../store";
import styles from "./ToastViewport.module.css";

const EFFECT_ONLY_DISMISS_MS = 1_100;

const toastEffectToneClassNames: Record<ToastType, string> = {
  info: styles.effectInfo,
  success: styles.effectSuccess,
  warning: styles.effectWarning,
  error: styles.effectError
};

type ToastEffectsProps = {
  toasts: ToastEntry[];
};

type ToastEffectItemProps = {
  toast: ToastEntry;
};

function ToastEffectItem({ toast }: ToastEffectItemProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toast.kind !== "effect") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(dismissToast(toast.id));
    }, toast.dismissMs ?? EFFECT_ONLY_DISMISS_MS);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, toast.dismissMs, toast.id, toast.kind]);

  return (
    <div
      className={clsx(styles.effectOverlay, toastEffectToneClassNames[toast.type])}
      aria-hidden="true"
    />
  );
}

function ToastEffects({ toasts }: ToastEffectsProps) {
  const effectToasts = toasts.filter((toast) => toast.effect === "default");

  if (effectToasts.length === 0) {
    return null;
  }

  return (
    <>
      {effectToasts.map((toast) => (
        <ToastEffectItem key={`toast-effect-${toast.id}`} toast={toast} />
      ))}
    </>
  );
}

export default ToastEffects;
