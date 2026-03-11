import { useEffect } from "react";

let activeBodyScrollLocks = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return;
    }

    const { body, documentElement } = document;

    if (activeBodyScrollLocks === 0) {
      previousBodyOverflow = body.style.overflow;
      previousBodyPaddingRight = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    activeBodyScrollLocks += 1;

    return () => {
      activeBodyScrollLocks = Math.max(0, activeBodyScrollLocks - 1);

      if (activeBodyScrollLocks === 0) {
        body.style.overflow = previousBodyOverflow;
        body.style.paddingRight = previousBodyPaddingRight;
      }
    };
  }, [locked]);
}

