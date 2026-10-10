import { createRoot } from "react-dom/client";
import {
  initializeAppUpdateLifecycle,
  reloadForAppUpdate,
  useAppUpdateState
} from "./legacyAppUpdate";
// This uses the unchanged deployed updater (054f3bb6); its initial transition
// retains the old limitations. Subsequent updates must use the fixed runtime.
function Legacy() {
  const state = useAppUpdateState();
  return (
    <>
      <p data-testid="build">legacy</p>
      {state.updateRequired && <button onClick={() => void reloadForAppUpdate()}>Reload</button>}
    </>
  );
}
initializeAppUpdateLifecycle();
createRoot(document.getElementById("root")!).render(<Legacy />);
