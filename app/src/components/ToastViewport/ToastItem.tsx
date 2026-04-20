import clsx from "clsx";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { useEffect } from "react";
import {
  DEFAULT_TOAST_DISMISS_MS,
  dismissToast,
  type ToastEntry,
  type ToastType,
  useAppDispatch
} from "../../store";
import styles from "./ToastViewport.module.css";

const toastIcons: Record<ToastType, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert
};

const toastLabels: Record<ToastType, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error"
};

const toastToneClassNames: Record<ToastType, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  error: styles.error
};

type ToastItemProps = {
  toast: ToastEntry;
};

function ToastItem({ toast }: ToastItemProps) {
  const dispatch = useAppDispatch();
  const Icon = toastIcons[toast.type];
  const typeLabel = toastLabels[toast.type];

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(dismissToast(toast.id));
    }, DEFAULT_TOAST_DISMISS_MS);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, toast.id]);

  function handleClose() {
    dispatch(dismissToast(toast.id));
  }

  return (
    <article
      className={clsx(styles.toast, toastToneClassNames[toast.type])}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon size={22} strokeWidth={2.1} />
      </span>
      <div className={styles.content}>
        <p className={styles.text}>{toast.text}</p>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label={`Dismiss ${typeLabel.toLowerCase()} toast`}
      >
        <X size={16} strokeWidth={2.1} />
      </button>
    </article>
  );
}

export default ToastItem;
