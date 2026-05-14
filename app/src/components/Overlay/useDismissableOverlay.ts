import { useCallback, useEffect, type MouseEventHandler } from "react";
import { useBodyScrollLock } from "../../lib/useBodyScrollLock";
import { dismissAllToasts, useAppDispatch } from "../../store";

type UseDismissableOverlayOptions = {
  isOpen: boolean;
  onClose: () => void;
  onEscape?: () => void;
};

type DismissableOverlayHandlers = {
  onBackdropClick: MouseEventHandler<HTMLElement>;
  onContentClick: MouseEventHandler<HTMLElement>;
};

export function useDismissableOverlay({
  isOpen,
  onClose,
  onEscape
}: UseDismissableOverlayOptions): DismissableOverlayHandlers {
  const dispatch = useAppDispatch();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      dispatch(dismissAllToasts());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      (onEscape ?? onClose)();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onEscape]);

  const onBackdropClick = useCallback<MouseEventHandler<HTMLElement>>(
    () => {
      onClose();
    },
    [onClose]
  );

  const onContentClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
    event.stopPropagation();
  }, []);

  return {
    onBackdropClick,
    onContentClick
  };
}
