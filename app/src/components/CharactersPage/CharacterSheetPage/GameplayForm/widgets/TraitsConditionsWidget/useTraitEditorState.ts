import { useState } from "react";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  CharacterCustomTraitEffect,
  CharacterStatusDuration,
  CharacterStatusEntry,
  CharacterStatusValue
} from "../../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../../types";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
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
  createCustomTraitDraftFromStatusEntry,
  createDefaultCustomTraitDraft,
  isCustomTraitDraftValid,
  parseCustomTraitEffectDraft,
  type CustomTraitDraft,
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
import { sanitizeUserInput } from "../../../../../../utils/userInputSanitization";

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
  const [editingCustomTraitEntryId, setEditingCustomTraitEntryId] = useState<string | null>(null);

  function resetTraitEditorState() {
    setTraitEditorMode("quick-add");
    setActiveTraitEditorTab("conditions");
    setStatusDraftValues(createDefaultStatusDraftValues());
    setStatusDraftDurationType(defaultManualStatusDurationDraft.type);
    setStatusDraftDurationValue(defaultManualStatusDurationDraft.value);
    setCustomTraitDraft(createDefaultCustomTraitDraft());
    setEditingCustomTraitEntryId(null);
  }

  function closeTraitEditor() {
    resetTraitEditorState();
    setIsTraitModalOpen(false);
  }

  function openTraitEditor() {
    resetTraitEditorState();
    setIsTraitModalOpen(true);
  }

  function openCustomTraitEditor(
    entry: CharacterStatusEntry & { customEffects: CharacterCustomTraitEffect[] }
  ) {
    setTraitEditorMode("custom-trait");
    setActiveTraitEditorTab("conditions");
    setStatusDraftValues(createDefaultStatusDraftValues());
    setStatusDraftDurationType(defaultManualStatusDurationDraft.type);
    setStatusDraftDurationValue(defaultManualStatusDurationDraft.value);
    setCustomTraitDraft(createCustomTraitDraftFromStatusEntry(entry));
    setEditingCustomTraitEntryId(entry.id);
    setIsTraitModalOpen(true);
  }

  function getCustomTraitSavePayload(draft: CustomTraitDraft): {
    name: string;
    description: string;
    customEffects: CharacterCustomTraitEffect[];
  } | null {
    if (!isCustomTraitDraftValid(draft)) {
      return null;
    }

    const sanitizedName = sanitizeUserInput(draft.name);
    const sanitizedDescription = sanitizeUserInput(draft.description, {
      multiline: true
    });

    if (!sanitizedName || !sanitizedDescription) {
      return null;
    }

    const customEffects = draft.effects
      .map((effect) => parseCustomTraitEffectDraft(effect))
      .filter((effect): effect is CharacterCustomTraitEffect => effect !== null);

    return customEffects.length > 0
      ? {
          name: sanitizedName,
          description: sanitizedDescription,
          customEffects
        }
      : null;
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
    const payload = getCustomTraitSavePayload(customTraitDraft);

    if (!payload) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: [
          ...resolveCharacterStatusEntries(currentCharacter.statusEntries),
          createCharacterStatusEntry({
            group: STATUS_ENTRY_GROUP.EFFECTS,
            value: payload.name,
            source: "Manual",
            sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
            duration: createManualStatusDuration(
              customTraitDraft.durationType,
              customTraitDraft.durationValue
            ),
            description: payload.description,
            customEffects: payload.customEffects
          })
        ]
      })
    );

    closeTraitEditor();
  }

  function updateCustomTraitEntry() {
    const payload = getCustomTraitSavePayload(customTraitDraft);

    if (!payload || !editingCustomTraitEntryId) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      reconcileCharacterStatusConsequences({
        ...currentCharacter,
        statusEntries: normalizeCharacterStatusEntries(currentCharacter.statusEntries).map(
          (entry) =>
            entry.id === editingCustomTraitEntryId
              ? {
                  ...entry,
                  group: STATUS_ENTRY_GROUP.EFFECTS,
                  value: payload.name,
                  source: "Manual",
                  sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
                  duration: createManualStatusDuration(
                    customTraitDraft.durationType,
                    customTraitDraft.durationValue
                  ),
                  description: payload.description,
                  customEffects: payload.customEffects
                }
              : entry
        )
      })
    );

    closeTraitEditor();
  }

  function createTraitEntry() {
    if (traitEditorMode === "custom-trait") {
      if (editingCustomTraitEntryId) {
        updateCustomTraitEntry();
        return;
      }

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
    openCustomTraitEditor,
    openTraitEditor,
    resetTraitEditorState,
    traitEditorModalProps: {
      mode: traitEditorMode,
      isEditingCustomTrait: editingCustomTraitEntryId !== null,
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
