import { lazy, Suspense, type ComponentProps } from "react";

const CodexDivinityDrawer = lazy(
  () => import("./CodexDivinityDrawer/CodexDivinityDrawer")
);
const CodexFeatDrawer = lazy(() => import("./CodexFeatDrawer/CodexFeatDrawer"));
const CodexSpellDrawer = lazy(() => import("./CodexSpellDrawer/CodexSpellDrawer"));

type LazyCodexDivinityDrawerProps = ComponentProps<typeof CodexDivinityDrawer>;
type LazyCodexFeatDrawerProps = ComponentProps<typeof CodexFeatDrawer>;
type LazyCodexSpellDrawerProps = ComponentProps<typeof CodexSpellDrawer>;

export function LazyCodexDivinityDrawer(props: LazyCodexDivinityDrawerProps) {
  return (
    <Suspense fallback={null}>
      <CodexDivinityDrawer {...props} />
    </Suspense>
  );
}

export function LazyCodexFeatDrawer(props: LazyCodexFeatDrawerProps) {
  return (
    <Suspense fallback={null}>
      <CodexFeatDrawer {...props} />
    </Suspense>
  );
}

export function LazyCodexSpellDrawer(props: LazyCodexSpellDrawerProps) {
  return (
    <Suspense fallback={null}>
      <CodexSpellDrawer {...props} />
    </Suspense>
  );
}
