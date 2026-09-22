import type { ComponentType, SyntheticEvent } from "react";
import type { PersistCharacterUpdater } from "../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  ReadOnlySheetContext,
  ignoreCharacterMutation,
  useReadOnlySheet
} from "./readOnlySheetContext";
import styles from "./ReadOnlySheet.module.css";

function blockInteraction(event: SyntheticEvent) {
  const target = event.target;
  if (target instanceof Element) {
    const navigation = target.closest('[data-read-only-navigation="true"]');
    // Buttons nested in a navigable card are still disabled editing/tracking controls.
    if (navigation && !target.closest("button, input, select, textarea, a")) return;
    if (!event.currentTarget.contains(target) && target.closest('[data-read-only-reference="true"]')) return;
  }
  event.preventDefault();
  event.stopPropagation();
}

/** Native disabled controls cover pointer and keyboard input. Capture guards
 * also cover reference links, custom controls, and synthetic events. */
export function withReadOnlySheet<P extends { onPersistCharacter: PersistCharacterUpdater }>(
  Component: ComponentType<P>
) {
  return function SheetSection(props: P & { readOnly?: boolean }) {
    const inheritedReadOnly = useReadOnlySheet();
    const readOnly = inheritedReadOnly || props.readOnly === true;
    if (!readOnly) return <Component {...props} />;

    return (
      <ReadOnlySheetContext.Provider value={true}>
        <fieldset
          disabled
          className={styles.boundary}
          data-read-only-sheet-section="true"
          onClickCapture={blockInteraction}
          onDoubleClickCapture={blockInteraction}
          onChangeCapture={blockInteraction}
          onInputCapture={blockInteraction}
          onSubmitCapture={blockInteraction}
          onKeyDownCapture={(event) => {
            if (event.key === "Enter" || event.key === " ") blockInteraction(event);
          }}
        >
          <Component
            {...props}
            onPersistCharacter={ignoreCharacterMutation}
            onQueueHitPointCharacter={ignoreCharacterMutation}
            onAdoptCloudCharacter={ignoreCharacterMutation}
            onRequestCreateCompanion={undefined}
            partyMembership={undefined}
          />
        </fieldset>
      </ReadOnlySheetContext.Provider>
    );
  };
}
