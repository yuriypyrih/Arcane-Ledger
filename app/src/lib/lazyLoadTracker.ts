import { lazy, useSyncExternalStore, type ComponentType, type LazyExoticComponent } from "react";

const lazyLoadListeners = new Set<() => void>();

let pendingLazyLoadCount = 0;
let lazyLoadEmitScheduled = false;

function hasPendingLazyLoad() {
  return pendingLazyLoadCount > 0;
}

function emitLazyLoadState() {
  if (lazyLoadEmitScheduled) {
    return;
  }

  lazyLoadEmitScheduled = true;
  queueMicrotask(() => {
    lazyLoadEmitScheduled = false;
    lazyLoadListeners.forEach((listener) => listener());
  });
}

function setPendingLazyLoadCount(nextCount: number) {
  const wasPending = hasPendingLazyLoad();
  pendingLazyLoadCount = Math.max(0, nextCount);

  if (wasPending !== hasPendingLazyLoad()) {
    emitLazyLoadState();
  }
}

function beginLazyLoad() {
  setPendingLazyLoadCount(pendingLazyLoadCount + 1);
}

function endLazyLoad() {
  setPendingLazyLoadCount(pendingLazyLoadCount - 1);
}

function subscribeToLazyLoadState(listener: () => void) {
  lazyLoadListeners.add(listener);

  return () => {
    lazyLoadListeners.delete(listener);
  };
}

export function trackLazyLoad<T>(loader: () => Promise<T>): Promise<T> {
  beginLazyLoad();

  try {
    return loader().finally(endLazyLoad);
  } catch (error) {
    endLazyLoad();
    return Promise.reject(error);
  }
}

export function lazyWithTrackedLoad<TProps>(
  loader: () => Promise<{ default: ComponentType<TProps> }>
): LazyExoticComponent<ComponentType<TProps>> {
  return lazy(() => trackLazyLoad(loader));
}

export function useIsLazyLoading() {
  return useSyncExternalStore(
    subscribeToLazyLoadState,
    hasPendingLazyLoad,
    () => false
  );
}
