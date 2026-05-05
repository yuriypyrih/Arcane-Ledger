import { useCallback, useMemo, useState } from "react";
import {
  getWarlockEldritchInvocationLimitForCharacter,
  getWarlockInvocationBlockingSelectionNamesForCharacter,
  getWarlockInvocationOptionsForCharacter,
  normalizeWarlockInvocationSelectionIdsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type { Character } from "../../../../types";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  SheetModal
} from "../../../Overlay";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import EldritchInvocationEditorCard from "./EldritchInvocationEditorCard";
import styles from "./FeatEditorModal.module.css";
import type { TrackingButtonRenderer } from "./types";

type EldritchInvocationEditorModalProps = {
  character: Character;
  selectedInvocationIds: string[];
  onClose: (selectionIds: string[]) => void;
  onOpenInvocationReference: (option: WarlockEldritchInvocationOption) => void;
  renderTrackingButton: TrackingButtonRenderer;
};

function SelectionCounter({ current, total }: { current: number; total: number }) {
  return (
    <span className={current < total ? styles.validation : undefined}>{`${current}/${total}`}</span>
  );
}

function EldritchInvocationEditorModal({
  character,
  selectedInvocationIds,
  onClose,
  onOpenInvocationReference,
  renderTrackingButton
}: EldritchInvocationEditorModalProps) {
  const [invocationDraftIds, setInvocationDraftIds] = useState<string[]>(
    () => selectedInvocationIds
  );
  const invocationLimit = getWarlockEldritchInvocationLimitForCharacter(character);
  const invocationDraftSet = useMemo(() => new Set(invocationDraftIds), [invocationDraftIds]);
  const invocationManagerCharacter = useMemo<Character>(
    () => ({
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        warlock: {
          ...character.classFeatureState?.warlock,
          eldritchInvocationIds: invocationDraftIds
        }
      }
    }),
    [character, invocationDraftIds]
  );
  const invocationOptions = useMemo(
    () => getWarlockInvocationOptionsForCharacter(invocationManagerCharacter, invocationDraftIds),
    [invocationDraftIds, invocationManagerCharacter]
  );
  const invocationOptionsById = useMemo(
    () => new Map(invocationOptions.map((option) => [option.selectionId, option] as const)),
    [invocationOptions]
  );
  const isInvocationLimitReached = invocationDraftIds.length >= invocationLimit;

  const commitAndClose = useCallback(() => {
    onClose(normalizeWarlockInvocationSelectionIdsForCharacter(character, invocationDraftIds));
  }, [character, invocationDraftIds, onClose]);

  const addInvocation = useCallback(
    (selectionId: string) => {
      setInvocationDraftIds((current) => {
        if (current.includes(selectionId) || current.length >= invocationLimit) {
          return current;
        }

        const option = invocationOptionsById.get(selectionId);

        if (!option || option.isPlaceholder || !option.isQualified) {
          return current;
        }

        return [...current, selectionId];
      });
    },
    [invocationLimit, invocationOptionsById]
  );

  const removeInvocation = useCallback((selectionId: string) => {
    setInvocationDraftIds((current) => {
      const blockingSelections = getWarlockInvocationBlockingSelectionNamesForCharacter(
        selectionId,
        current
      );

      return blockingSelections.length > 0
        ? current
        : current.filter((currentSelectionId) => currentSelectionId !== selectionId);
    });
  }, []);

  return (
    <SheetModal
      titleId="eldritch-invocation-editor-title"
      onClose={commitAndClose}
      panelClassName={styles.modalPanel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Class Feature</OverlayEyebrow>
          <div className={styles.heading}>
            <h3 id="eldritch-invocation-editor-title" className={styles.headingTitle}>
              Edit Eldritch Invocations
            </h3>
            <OverlaySummary className={shared.helperText}>
              <SelectionCounter current={invocationDraftIds.length} total={invocationLimit} />{" "}
              selected
            </OverlaySummary>
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close eldritch invocation editor" onClick={commitAndClose} />
      </OverlayHeader>

      <OverlayBody className={styles.scrollArea}>
        <div className={styles.optionList}>
          {invocationOptions.length === 0 ? (
            <p className={shared.emptyText}>
              No eldritch invocations are available for this Warlock right now.
            </p>
          ) : (
            invocationOptions.map((option) => {
              const isSelected = invocationDraftSet.has(option.selectionId);
              const blockingSelectionNames = isSelected
                ? getWarlockInvocationBlockingSelectionNamesForCharacter(
                    option.selectionId,
                    invocationDraftIds
                  )
                : [];

              return (
                <EldritchInvocationEditorCard
                  key={option.selectionId}
                  option={option}
                  isSelected={isSelected}
                  isLimitReached={isInvocationLimitReached}
                  blockingSelectionNames={blockingSelectionNames}
                  onAddInvocation={addInvocation}
                  onRemoveInvocation={removeInvocation}
                  onOpenInvocationReference={onOpenInvocationReference}
                  renderTrackingButton={renderTrackingButton}
                />
              );
            })
          )}
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default EldritchInvocationEditorModal;
