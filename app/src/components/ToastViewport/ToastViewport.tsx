import clsx from "clsx";
import type { ToastEntry, ToastPosition } from "../../store";
import ToastItem from "./ToastItem";
import styles from "./ToastViewport.module.css";

const viewportPositionClassNames: Record<ToastPosition, string> = {
  "top-left": styles.topLeft,
  "top-middle": styles.topMiddle,
  "top-right": styles.topRight,
  "bottom-left": styles.bottomLeft,
  "bottom-middle": styles.bottomMiddle,
  "bottom-right": styles.bottomRight
};

type ToastViewportProps = {
  position: ToastPosition;
  toasts: ToastEntry[];
};

function ToastViewport({ position, toasts }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={clsx(styles.viewport, viewportPositionClassNames[position])}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default ToastViewport;
