import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { ELDRITCH_INVOCATION } from "../../../../codex/entries";
import {
  getWarlockEldritchInvocationLimitForCharacter,
  getWarlockInvocationBlockingSelectionNamesForCharacter,
  getWarlockInvocationOptionsForCharacter,
  normalizeWarlockInvocationSelectionIdsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  getWarlockPactTomeSelectionFromSelectionId,
  getWarlockInvocationFeatChoice,
  warlockEldritchInvocationEditorTabs,
  type WarlockEldritchInvocationEditorTabKey,
  type WarlockEldritchInvocationOption
} from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type { Character, CharacterFeatEntry } from "../../../../types";
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
  onClose: (selectionIds: string[], lessonsFeatEntries: CharacterFeatEntry[]) => void;
  onOpenInvocationReference: (option: WarlockEldritchInvocationOption) => void;
  renderTrackingButton: TrackingButtonRenderer;
};

type EldritchInvocationOptionGroup = {
  key: string;
  label: string | null;
  invocationGroups: EldritchInvocationCardGroup[];
};

type EldritchInvocationCardGroup = {
  key: string;
  options: WarlockEldritchInvocationOption[];
};

function SelectionCounter({ current, total }: { current: number; total: number }) {
  return (
    <span className={current < total ? styles.validation : undefined}>{`${current}/${total}`}</span>
  );
}

function groupInvocationOptionsByInvocationId(
  options: WarlockEldritchInvocationOption[]
): Map<string, WarlockEldritchInvocationOption[]> {
  const groupsByInvocationId = options.reduce<Map<string, WarlockEldritchInvocationOption[]>>(
    (groups, option) => {
      const currentOptions = groups.get(option.invocation.id) ?? [];
      groups.set(option.invocation.id, [...currentOptions, option]);
      return groups;
    },
    new Map()
  );

  return groupsByInvocationId;
}

function getLessonsFeatEntriesBySelectionId(character: Character): Record<string, CharacterFeatEntry> {
  return (character.feats ?? []).reduce<Record<string, CharacterFeatEntry>>((entriesBySelectionId, entry) => {
    if (
      entry.source.type === "eldritch-invocation" &&
      entry.source.invocation === ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES
    ) {
      entriesBySelectionId[entry.source.selectionId] = entry;
    }

    return entriesBySelectionId;
  }, {});
}

function getInvocationOptionGroupsForTab(
  tabKey: WarlockEldritchInvocationEditorTabKey,
  options: WarlockEldritchInvocationOption[]
): EldritchInvocationOptionGroup[] {
  const tab =
    warlockEldritchInvocationEditorTabs.find((entry) => entry.key === tabKey) ??
    warlockEldritchInvocationEditorTabs[0];
  const optionsByInvocationId = groupInvocationOptionsByInvocationId(options);

  return tab.groups
    .map((group) => ({
      key: group.key,
      label: group.label,
      invocationGroups: group.invocationIds.flatMap((invocationId) => {
        const invocationOptions = optionsByInvocationId.get(invocationId);

        return invocationOptions
          ? [
              {
                key: invocationId,
                options: invocationOptions
              }
            ]
          : [];
      })
    }))
    .filter((group) => group.invocationGroups.length > 0);
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
  const [lessonsFeatEntriesBySelectionId, setLessonsFeatEntriesBySelectionId] = useState<
    Record<string, CharacterFeatEntry>
  >(() => getLessonsFeatEntriesBySelectionId(character));
  const [activeTabKey, setActiveTabKey] =
    useState<WarlockEldritchInvocationEditorTabKey>("general");
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
  const invocationOptionGroups = useMemo(
    () => getInvocationOptionGroupsForTab(activeTabKey, invocationOptions),
    [activeTabKey, invocationOptions]
  );
  const invocationOptionsById = useMemo(
    () => new Map(invocationOptions.map((option) => [option.selectionId, option] as const)),
    [invocationOptions]
  );
  const isInvocationLimitReached = invocationDraftIds.length >= invocationLimit;

  const commitAndClose = useCallback(() => {
    const normalizedSelectionIds = normalizeWarlockInvocationSelectionIdsForCharacter(
      character,
      invocationDraftIds
    );
    const lessonsFeatEntries = normalizedSelectionIds
      .filter((selectionId) => getWarlockInvocationFeatChoice(selectionId) !== null)
      .flatMap((selectionId) => {
        const entry = lessonsFeatEntriesBySelectionId[selectionId];

        return entry ? [entry] : [];
      });

    onClose(normalizedSelectionIds, lessonsFeatEntries);
  }, [character, invocationDraftIds, lessonsFeatEntriesBySelectionId, onClose]);

  const addInvocation = useCallback(
    (selectionId: string, featEntry?: CharacterFeatEntry) => {
      if (invocationDraftIds.includes(selectionId) || invocationDraftIds.length >= invocationLimit) {
        return;
      }

      const option =
        invocationOptionsById.get(selectionId) ??
        (getWarlockPactTomeSelectionFromSelectionId(selectionId)
          ? invocationOptions.find(
              (currentOption) =>
                currentOption.invocation.id === ELDRITCH_INVOCATION.PACT_OF_THE_TOME &&
                !currentOption.isPlaceholder
            )
          : undefined);

      if (
        !option ||
        option.isPlaceholder ||
        !option.isQualified ||
        option.isChoiceDisabled === true
      ) {
        return;
      }

      if (getWarlockInvocationFeatChoice(selectionId) !== null && !featEntry) {
        return;
      }

      setInvocationDraftIds((current) => [...current, selectionId]);

      if (featEntry) {
        setLessonsFeatEntriesBySelectionId((current) => ({
          ...current,
          [selectionId]: featEntry
        }));
      }
    },
    [invocationDraftIds, invocationLimit, invocationOptions, invocationOptionsById]
  );

  const removeInvocation = useCallback((selectionId: string) => {
    const blockingSelections = getWarlockInvocationBlockingSelectionNamesForCharacter(
      selectionId,
      invocationDraftIds
    );

    if (blockingSelections.length > 0) {
      return;
    }

    setInvocationDraftIds((current) =>
      current.filter((currentSelectionId) => currentSelectionId !== selectionId)
    );
    setLessonsFeatEntriesBySelectionId((current) => {
      if (!(selectionId in current)) {
        return current;
      }

      const { [selectionId]: _removedEntry, ...nextEntries } = current;
      return nextEntries;
    });
  }, [invocationDraftIds]);

  return (
    <SheetModal
      titleId="eldritch-invocation-editor-title"
      onClose={commitAndClose}
      size="medium"
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
        <div
          className={clsx(styles.tabRow, styles.invocationTabRow)}
          role="tablist"
          aria-label="Eldritch invocation groups"
        >
          {warlockEldritchInvocationEditorTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTabKey === tab.key}
              className={clsx(styles.tabButton, activeTabKey === tab.key && styles.tabButtonActive)}
              onClick={() => setActiveTabKey(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.optionList}>
          {invocationOptionGroups.length === 0 ? (
            <p className={shared.emptyText}>
              No eldritch invocations are available for this Warlock right now.
            </p>
          ) : (
            invocationOptionGroups.map((group) => {
              return (
                <section
                  key={group.key}
                  className={clsx(group.label && styles.invocationOptionGroup)}
                >
                  {group.label ? (
                    <p className={styles.invocationGroupTitle}>{group.label}</p>
                  ) : null}
                  <div className={styles.invocationGroupList}>
                    {group.invocationGroups.map((invocationGroup) => (
                      <EldritchInvocationEditorCard
                        key={invocationGroup.key}
                        options={invocationGroup.options}
                        selectedOptions={invocationGroup.options.filter((option) =>
                          invocationDraftSet.has(option.selectionId)
                        )}
                        character={invocationManagerCharacter}
                        characterLevel={character.level}
                        skillProficiencies={character.skillProficiencies}
                        savingThrowProficiencies={character.savingThrowProficiencies}
                        weaponProficiencies={character.weaponProficiencies}
                        toolProficiencies={character.toolProficiencies}
                        isLimitReached={isInvocationLimitReached}
                        getBlockingSelectionNames={(selectionId) =>
                          getWarlockInvocationBlockingSelectionNamesForCharacter(
                            selectionId,
                            invocationDraftIds
                          )
                        }
                        onAddInvocation={addInvocation}
                        onRemoveInvocation={removeInvocation}
                        onOpenInvocationReference={onOpenInvocationReference}
                        renderTrackingButton={renderTrackingButton}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default EldritchInvocationEditorModal;
