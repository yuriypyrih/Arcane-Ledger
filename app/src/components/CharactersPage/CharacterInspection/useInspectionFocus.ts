import { useEffect, type RefObject } from "react";

const focusable =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

/** Keep keyboard navigation in the active inspection surface, including portals. */
export function isTopInspectionDialog(panel: HTMLElement | null) {
  return panel === Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).at(-1);
}

export function useInspectionFocus(ref: RefObject<HTMLElement>, active = true, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !active) return;
    const panel = ref.current;
    if (!panel) return;
    const controls = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusable)).filter(
        (element) => !element.matches(":disabled") &&
          (!element.closest("fieldset:disabled") || element.matches('[data-read-only-navigation="true"]'))
      );
    if (isTopInspectionDialog(panel)) controls()[0]?.focus();
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab" || !isTopInspectionDialog(panel)) return;
      const elements = controls();
      event.preventDefault();
      if (!elements.length) return;
      const index = elements.indexOf(document.activeElement as HTMLElement);
      const next =
        index < 0
          ? event.shiftKey
            ? elements.length - 1
            : 0
          : (index + (event.shiftKey ? -1 : 1) + elements.length) % elements.length;
      elements[next]?.focus();
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
    };
  }, [active, enabled, ref]);
}
