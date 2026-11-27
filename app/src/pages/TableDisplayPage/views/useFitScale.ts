import { useLayoutEffect, useRef, useState, type RefObject } from "react";

const DEFAULT_MIN_FIT = 0.4;
const FIT_STEP = 0.94;

/**
 * A 0-1 size factor for a board of elements marked `data-fit-area`. It starts at `estimate`, then
 * shrinks until none of those areas overflows, and starts over when the screen size or `signature` changes.
 */
export function useFitScale<T extends HTMLElement>(
  boardRef: RefObject<T | null>,
  estimate: number,
  signature: string,
  minFit = DEFAULT_MIN_FIT
) {
  const [measured, setMeasured] = useState({ fit: estimate, signature });
  const latest = useRef({ estimate, signature });
  const fit = measured.signature === signature ? measured.fit : estimate;

  latest.current = { estimate, signature };

  useLayoutEffect(() => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const overflows = Array.from(board.querySelectorAll<HTMLElement>("[data-fit-area]")).some(
      (element) =>
        element.scrollHeight > element.clientHeight + 1 ||
        element.scrollWidth > element.clientWidth + 1
    );

    if (overflows && fit > minFit) {
      setMeasured({ fit: Math.max(minFit, fit * FIT_STEP), signature });
    } else if (measured.signature !== signature) {
      setMeasured({ fit, signature });
    }
  }, [boardRef, fit, measured.signature, minFit, signature]);

  useLayoutEffect(() => {
    const board = boardRef.current;

    if (!board || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    // A new screen size changes how much room there is, so start over from the estimate.
    const observer = new ResizeObserver(() =>
      setMeasured({ fit: latest.current.estimate, signature: latest.current.signature })
    );

    observer.observe(board);

    return () => observer.disconnect();
  }, [boardRef]);

  return fit;
}
