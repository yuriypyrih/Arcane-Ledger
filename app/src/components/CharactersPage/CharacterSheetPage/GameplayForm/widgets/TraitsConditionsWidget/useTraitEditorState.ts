import { useState } from "react";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  CharacterCustomTraitEffect,
  CharacterStatusDuration,
  CharacterStatusValue
} from "../../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../../types";
import {
  createCharacterStatusEntry,
  resolveCharacterStatusEntries,
  upsertManualStatusEntry
} from "../../../../../../pages/CharactersPage/statusEntries";
import {
  isExhaustionConditionOptionValue,
  parseConditionOptionValue,
  reconcileCharacterStatusConsequences
} from "../../../../../../pages/CharactersPage/traits";
import {
  createCustomTraitEffectDraft,
  createDefaultCustomTraitDraft,
  isCustomTraitDraftValid,
  parseCustomTraitEffectDraft,
  type CustomTraitMode
} from "./customTraitDraft";
import {
  createDefaultStatusDraftValues,
  getTraitEditorGroup,
  type TraitEditorTab
} from "./traitsWidgetUtils";
import {
  createManualStatusDuration,
  defaultManualStatusDurationDraft
} from "./manualStatusDuration";

type UseTraitEditorStateOptions = {
  onPersistCharacter: PersistCharacterUpdater;
};

export function useTraitEditorState({ onPersistCharacter }: UseTraitEditorStateOptions) {
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [traitEditorMode, setTraitEditorMode] = useState<CustomTraitMode>("quick-add");
  const [activeTraitEditorTab, setActiveTraitEditorTab] = useState<TraitEditorTab>("conditions");
  const [statusDraftValues, setStatusDraftValues] = useState<Record<TraitEditorTab, string>>(
    createDefaultStatusDraftValues
  );
  const [statusDraftDurationType, setStatusDraftDurationType] = useState(
    defaultManualStatusDurationDraft.type
  );
  const [statusDraftDurationValue, setStatusDraftDurationValue] = useState(
    defaultManualStatusDurationDraft.value
  );
  const [customTraitDraft, setCustomTraitDraft] = useState(createDefaultCustomTraitDraft);

  function resetTraitEditorState() {
    setTraitEditorMode("quick-add");
    setActiveTraitEditorTab("conditions");
    setStatusDraftValues(createDefaultStatusDraftValues());
    setStatusDraftDurationType(defaultManualStatusDurationDraft.type);
    setStatusDraftDurationValue(defaultManualStatusDurationDraft.value);
    setCustomTraitDraft(createDefaultCustomTraitDraft());
  }

  function closeTraitEditor() {
    resetTraitEditorState();
    setIsTraitModalOpen(false);
  }

  function openTraitEditor() {
    resetTraitEditorState();
    setIsTraitModalOpen(true);
  }

  function addStatusEntry() {
    const selectedValue = statusDraftValues[activeTraitEditorTab]?.trim();

    if (!selectedValue) {
      return;
    }

    const nextGroup = getTraitEditorGroup(activeTraitEditorTab);
    const parsedConditionValue =
      nextGroup === STATUS_ENTRY_GROUP.CONDITIONS ? parseConditionOptionValue(selectedValue) : null;
    const nextValue = parsedConditionValue?.value ?? (selectedValue as CharacterStatusValue);
    const nextDuration: CharacterStatusDuration =
      parsedConditionValue?.conditionLevel !== undefined
        ? { kind: STATUS_DURATION_KIND.INFINITE }
        : createManualStatusDuration(statusDraftDurationType, statusDraftDurationValue);

    onPersistCharacter((currentCharacter) =>
      reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: upsertManualStatusEntry(currentCharacter.statusEntries, {
          group: nextGroup,
          value: nextValue,
          conditionLevel: parsedConditionValue?.conditionLevel ?? null,
          source: "Manual",
          duration: nextDuration
        })
      })
    );

    setStatusDraftDurationType(defaultManualStatusDurationDraft.type);
    setStatusDraftDurationValue(defaultManualStatusDurationDraft.value);
    closeTraitEditor();
  }

  function addCustomTraitEntry() {
    if (!isCustomTraitDraftValid(customTraitDraft)) {
      return;
    }

    const customEffects = customTraitDraft.effects
      .map((effect) => parseCustomTraitEffectDraft(effect))
      .filter((effect): effect is CharacterCustomTraitEffect => effect !== null);

    if (customEffects.length === 0) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: [
          ...resolveCharacterStatusEntries(currentCharacter.statusEntries),
          createCharacterStatusEntry({
            group: STATUS_ENTRY_GROUP.EFFECTS,
            value: customTraitDraft.name.trim(),
            source: "Manual",
            sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
            duration: createManualStatusDuration(
              customTraitDraft.durationType,
              customTraitDraft.durationValue
            ),
            description: customTraitDraft.description.trim(),
            customEffects
          })
        ]
      })
    );

    closeTraitEditor();
  }

  function createTraitEntry() {
    if (traitEditorMode === "custom-trait") {
      addCustomTraitEntry();
      return;
    }

    addStatusEntry();
  }

  const traitCreateDisabled =
    traitEditorMode === "custom-trait"
      ? !isCustomTraitDraftValid(customTraitDraft)
      : !statusDraftValues[activeTraitEditorTab]?.trim();

  return {
    closeTraitEditor,
    isTraitModalOpen,
    openTraitEditor,
    resetTraitEditorState,
    traitEditorModalProps: {
      mode: traitEditorMode,
      activeTab: activeTraitEditorTab,
      values: statusDraftValues,
      durationType: statusDraftDurationType,
      durationValue: statusDraftDurationValue,
      customTraitDraft,
      createDisabled: traitCreateDisabled,
      onModeChange: setTraitEditorMode,
      onTabChange: setActiveTraitEditorTab,
      onValueChange: (tab: TraitEditorTab, value: string) => {
        setStatusDraftValues((current) => ({
          ...current,
          [tab]: value
        }));

        if (tab === "conditions" && isExhaustionConditionOptionValue(value)) {
          setStatusDraftDurationType(defaultManualStatusDurationDraft.type);
          setStatusDraftDurationValue(defaultManualStatusDurationDraft.value);
        }
      },
      onDurationTypeChange: setStatusDraftDurationType,
      onDurationValueChange: setStatusDraftDurationValue,
      onCustomTraitNameChange: (value: string) =>
        setCustomTraitDraft((current) => ({
          ...current,
          name: value
        })),
      onCustomTraitDescriptionChange: (value: string) =>
        setCustomTraitDraft((current) => ({
          ...current,
          description: value
        })),
      onCustomTraitDurationTypeChange: (value: typeof customTraitDraft.durationType) =>
        setCustomTraitDraft((current) => ({
          ...current,
          durationType: value
        })),
      onCustomTraitDurationValueChange: (value: number) =>
        setCustomTraitDraft((current) => ({
          ...current,
          durationValue: value
        })),
      onCustomTraitEffectTargetChange: (effectId: string, value: string) =>
        setCustomTraitDraft((current) => ({
          ...current,
          effects: current.effects.map((effect) =>
            effect.id === effectId
              ? {
                  ...effect,
                  target: value
                }
              : effect
          )
        })),
      onCustomTraitEffectValueChange: (effectId: string, value: string) =>
        setCustomTraitDraft((current) => ({
          ...current,
          effects: current.effects.map((effect) =>
            effect.id === effectId
              ? {
                  ...effect,
                  value
                }
              : effect
          )
        })),
      onAddCustomTraitEffect: () =>
        setCustomTraitDraft((current) => ({
          ...current,
          effects: [...current.effects, createCustomTraitEffectDraft()]
        })),
      onRemoveCustomTraitEffect: (effectId: string) =>
        setCustomTraitDraft((current) => ({
          ...current,
          effects:
            current.effects.length <= 1
              ? current.effects
              : current.effects.filter((effect) => effect.id !== effectId)
        })),
      onCreate: createTraitEntry,
      onClose: closeTraitEditor
    }
  };
}
