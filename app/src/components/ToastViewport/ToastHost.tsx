import { createPortal } from "react-dom";
import { TOAST_POSITIONS, type ToastEntry, type ToastPosition, useAppSelector } from "../../store";
import ToastEffects from "./ToastEffects";
import ToastViewport from "./ToastViewport";

function createToastBuckets(toasts: ToastEntry[]) {
  const buckets = TOAST_POSITIONS.reduce(
    (result, position) => {
      result[position] = [];
      return result;
    },
    {} as Record<ToastPosition, ToastEntry[]>
  );

  for (const toast of toasts) {
    buckets[toast.position].push(toast);
  }

  return buckets;
}

function ToastHost() {
  const toasts = useAppSelector((state) => state.toasts);

  if (typeof document === "undefined") {
    return null;
  }

  const buckets = createToastBuckets(toasts);

  return createPortal(
    <>
      <ToastEffects toasts={toasts} />
      {TOAST_POSITIONS.map((position) => (
        <ToastViewport key={position} position={position} toasts={buckets[position]} />
      ))}
    </>,
    document.body
  );
}

export default ToastHost;
