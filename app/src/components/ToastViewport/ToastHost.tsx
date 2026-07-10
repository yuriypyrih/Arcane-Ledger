import { createPortal } from "react-dom";
import {
  isToastCardEntry,
  TOAST_POSITIONS,
  type ToastCardEntry,
  type ToastPosition,
  useAppSelector
} from "../../store";
import ToastEffects from "./ToastEffects";
import ToastViewport from "./ToastViewport";

function createToastBuckets(toasts: ToastCardEntry[]) {
  const buckets = TOAST_POSITIONS.reduce(
    (result, position) => {
      result[position] = [];
      return result;
    },
    {} as Record<ToastPosition, ToastCardEntry[]>
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

  const buckets = createToastBuckets(toasts.filter(isToastCardEntry));

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
