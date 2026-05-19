import { useState } from "react";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  CharacterCustomTraitEffect,
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode,
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
  doesCustomTraitTargetAllowAbilityValue,
  isCustomTraitAbilityValue,
  isCustomTraitDraftValid,
  isCustomTraitEffectDraftEmpty,
  isCustomTraitRollModeDisabledTarget,
  parseCustomTraitEffectDraft,
  type CustomTraitDraft
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

type TraitEditorModalKind = "quick-add" | "custom-trait";

export function useTraitEditorState({ onPersistCharacter }: UseTraitEditorStateOptions) {
  const [activeTraitEditorModal, setActiveTraitEditorModal] = useState<TraitEditorModalKind | null>(
    null
  );
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

  function resetStatusDraftState() {
    setActiveTraitEditorTab("conditions");
    setStatusDraftValues(createDefaultStatusDraftValues());
    setStatusDraftDurationType(defaultManualStatusDurationDraft.type);
    setStatusDraftDurationValue(defaultManualStatusDurationDraft.value);
  }

  function resetCustomTraitDraftState() {
    setCustomTraitDraft(createDefaultCustomTraitDraft());
    setEditingCustomTraitEntryId(null);
  }

  function resetTraitEditorState() {
    resetStatusDraftState();
    resetCustomTraitDraftState();
  }

  function closeTraitEditor() {
    resetTraitEditorState();
    setActiveTraitEditorModal(null);
  }

  function openTraitEditor() {
    resetTraitEditorState();
    setActiveTraitEditorModal("quick-add");
  }

  function openCustomTraitCreator() {
    resetStatusDraftState();
    resetCustomTraitDraftState();
    setActiveTraitEditorModal("custom-trait");
  }

  function openCustomTraitEditor(
    entry: CharacterStatusEntry & { customEffects: CharacterCustomTraitEffect[] }
  ) {
    resetStatusDraftState();
    setCustomTraitDraft(createCustomTraitDraftFromStatusEntry(entry));
    setEditingCustomTraitEntryId(entry.id);
    setActiveTraitEditorModal("custom-trait");
  }

  function getCustomTraitSavePayload(draft: CustomTraitDraft): {
    name: string;
    description?: string;
    customEffects: CharacterCustomTraitEffect[];
  } | null {
    if (!isCustomTraitDraftValid(draft)) {
      return null;
    }

    const sanitizedName = sanitizeUserInput(draft.name);
    const sanitizedDescription = sanitizeUserInput(draft.description, {
      multiline: true
    });

    if (!sanitizedName) {
      return null;
    }

    const customEffects = draft.effects
      .filter((effect) => !isCustomTraitEffectDraftEmpty(effect))
      .map((effect) => parseCustomTraitEffectDraft(effect))
      .filter((effect): effect is CharacterCustomTraitEffect => effect !== null);

    return {
      name: sanitizedName,
      description: sanitizedDescription || undefined,
      customEffects
    };
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

  function saveCustomTraitEntry() {
    if (editingCustomTraitEntryId) {
      updateCustomTraitEntry();
      return;
    }

    addCustomTraitEntry();
  }

  const statusCreateDisabled = !statusDraftValues[activeTraitEditorTab]?.trim();
  const customTraitCreateDisabled = !isCustomTraitDraftValid(customTraitDraft);

  return {
    activeTraitEditorModal,
    closeTraitEditor,
    isTraitModalOpen: activeTraitEditorModal !== null,
    openCustomTraitCreator,
    openCustomTraitEditor,
    openTraitEditor,
    resetTraitEditorState,
    customTraitEditorModalProps: {
      isEditingCustomTrait: editingCustomTraitEntryId !== null,
      customTraitDraft,
      createDisabled: customTraitCreateDisabled,
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
                  target: value,
                  value:
                    isCustomTraitAbilityValue(effect.value) &&
                    !doesCustomTraitTargetAllowAbilityValue(value)
                      ? "0"
                      : effect.value,
                  rollMode: isCustomTraitRollModeDisabledTarget(value)
                    ? "normal"
                    : effect.rollMode
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
      onCustomTraitEffectValueModeChange: (
        effectId: string,
        value: CharacterCustomTraitValueMode
      ) =>
        setCustomTraitDraft((current) => ({
          ...current,
          effects: current.effects.map((effect) =>
            effect.id === effectId
              ? {
                  ...effect,
                  valueMode: value
                }
              : effect
          )
        })),
      onCustomTraitEffectRollModeChange: (
        effectId: string,
        value: CharacterCustomTraitRollMode
      ) =>
        setCustomTraitDraft((current) => ({
          ...current,
          effects: current.effects.map((effect) =>
            effect.id === effectId
              ? {
                  ...effect,
                  rollMode: isCustomTraitRollModeDisabledTarget(effect.target) ? "normal" : value
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
              ? current.effects.map((effect) =>
                  effect.id === effectId
                    ? {
                        ...effect,
                        target: "",
                        value: "0",
                        valueMode: "buff",
                        rollMode: "normal"
                      }
                    : effect
                )
              : current.effects.filter((effect) => effect.id !== effectId)
        })),
      onCreate: saveCustomTraitEntry,
      onClose: closeTraitEditor
    },
    traitEditorModalProps: {
      activeTab: activeTraitEditorTab,
      values: statusDraftValues,
      durationType: statusDraftDurationType,
      durationValue: statusDraftDurationValue,
      createDisabled: statusCreateDisabled,
      onCreateCustomTrait: openCustomTraitCreator,
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
      onCreate: addStatusEntry,
      onClose: closeTraitEditor
    }
  };
}
