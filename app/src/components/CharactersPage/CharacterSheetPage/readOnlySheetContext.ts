import { createContext, useContext } from "react";

export const ReadOnlySheetContext = createContext(false);
export const useReadOnlySheet = () => useContext(ReadOnlySheetContext);

// Deliberately never evaluate an updater: even a callback with side effects must
// not enter the owner's persistence or synchronization pipeline during inspection.
export const ignoreCharacterMutation = () => undefined;
