import {
  useCallback,
  useEffect,
  useRef,
  type MouseEventHandler,
  type PointerEventHandler
} from "react";
import { useBodyScrollLock } from "../../lib/useBodyScrollLock";
import { dismissAllToasts, useAppDispatch } from "../../store";

type UseDismissableOverlayOptions = {
  isOpen: boolean;
  onClose: () => void;
  onEscape?: () => void;
};

type DismissableOverlayHandlers = {
  onBackdropClick: MouseEventHandler<HTMLElement>;
  onBackdropPointerDown: PointerEventHandler<HTMLElement>;
  onContentClick: MouseEventHandler<HTMLElement>;
};

export function useExplicitBackdropClick(onClose: () => void): DismissableOverlayHandlers {
  const didPointerStartOnBackdropRef = useRef(false);

  const onBackdropPointerDown = useCallback<PointerEventHandler<HTMLElement>>((event) => {
    didPointerStartOnBackdropRef.current = event.target === event.currentTarget;
  }, []);

  const onBackdropClick = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      const didExplicitlyClickBackdrop =
        didPointerStartOnBackdropRef.current && event.target === event.currentTarget;

      didPointerStartOnBackdropRef.current = false;

      if (!didExplicitlyClickBackdrop) {
        return;
      }

      onClose();
    },
    [onClose]
  );

  const onContentClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
    event.stopPropagation();
  }, []);

  return {
    onBackdropClick,
    onBackdropPointerDown,
    onContentClick
  };
}

export function useDismissableOverlay({
  isOpen,
  onClose,
  onEscape
}: UseDismissableOverlayOptions): DismissableOverlayHandlers {
  const dispatch = useAppDispatch();
  const backdropClickHandlers = useExplicitBackdropClick(onClose);

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

  return backdropClickHandlers;
}
