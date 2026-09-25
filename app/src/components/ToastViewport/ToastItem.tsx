import clsx from "clsx";
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  DEFAULT_TOAST_DISMISS_MS,
  dismissToast,
  type ToastCardEntry,
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
  toast: ToastCardEntry;
};

function ToastItem({ toast }: ToastItemProps) {
  const dispatch = useAppDispatch();
  const Icon = toastIcons[toast.type];
  const typeLabel = toastLabels[toast.type];
  const gesture = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const direction = toast.position.startsWith("top-") ? -1 : 1;

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    suppressClick.current = false;
    if (event.pointerType !== "touch" || !event.isPrimary || gesture.current) return;
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) > 8) suppressClick.current = true;
    setDragOffset(dy * direction > 0 && Math.abs(dy) > Math.abs(dx) ? dy : 0);
  }

  function finishGesture(event: PointerEvent<HTMLElement>, cancelled = false) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId) return;
    suppressClick.current ||=
      cancelled || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8;
    gesture.current = null;
    setDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!cancelled && dy * direction >= 36 && Math.abs(dy) > Math.abs(dx)) {
      dispatch(dismissToast(toast.id));
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(dismissToast(toast.id));
    }, toast.dismissMs ?? DEFAULT_TOAST_DISMISS_MS);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, toast.dismissMs, toast.id]);

  function handleClose() {
    dispatch(dismissToast(toast.id));
  }

  return (
    <article
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <button
        type="button"
        aria-label={`Dismiss ${typeLabel.toLowerCase()} toast: ${toast.text}`}
        onClick={(event) => {
          if (event.detail === 0 || !suppressClick.current) handleClose();
          suppressClick.current = false;
        }}
        className={clsx(
          styles.toast,
          toastToneClassNames[toast.type],
          dragOffset !== 0 && styles.dragging
        )}
        style={{ translate: `0 ${dragOffset}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishGesture(event)}
        onPointerCancel={(event) => finishGesture(event, true)}
        onLostPointerCapture={(event) => finishGesture(event, true)}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon size={22} strokeWidth={2.1} />
        </span>
        <span className={styles.content}>
          <span className={styles.text}>{toast.text}</span>
        </span>
      </button>
    </article>
  );
}

export default ToastItem;
