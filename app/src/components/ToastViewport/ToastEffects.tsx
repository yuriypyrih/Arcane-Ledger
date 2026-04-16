import clsx from "clsx";
import type { ToastEntry, ToastType } from "../../store";
import styles from "./ToastViewport.module.css";

const toastEffectToneClassNames: Record<ToastType, string> = {
  info: styles.effectInfo,
  success: styles.effectSuccess,
  warning: styles.effectWarning,
  error: styles.effectError
};

type ToastEffectsProps = {
  toasts: ToastEntry[];
};

function ToastEffects({ toasts }: ToastEffectsProps) {
  const effectToasts = toasts.filter((toast) => toast.effect === "default");

  if (effectToasts.length === 0) {
    return null;
  }

  return (
    <>
      {effectToasts.map((toast) => (
        <div
          key={`toast-effect-${toast.id}`}
          className={clsx(styles.effectOverlay, toastEffectToneClassNames[toast.type])}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export default ToastEffects;
