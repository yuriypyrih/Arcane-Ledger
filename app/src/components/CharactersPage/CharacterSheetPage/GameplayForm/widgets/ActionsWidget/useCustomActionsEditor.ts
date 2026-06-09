import { useMemo, useState } from "react";
import type { Character, CharacterCustomAction } from "../../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeCharacterCustomActions } from "../../../../../../pages/CharactersPage/customActions";
import {
  createCustomActionDraftFromEntry,
  createDefaultCustomActionDraft,
  isCustomActionDraftValid,
  parseCustomActionDraft,
  removeCustomActionDraftEffect,
  updateCustomActionDraftEffectRollMode,
  updateCustomActionDraftEffectTarget,
  updateCustomActionDraftEffectValueMode,
  type CustomActionDraft
} from "./customActionDraft";
import { createCustomTraitEffectDraft } from "../TraitsConditionsWidget/customTraitDraft";

type UseCustomActionsEditorOptions = {
  character: Character;
  onEditorClose?: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

export function useCustomActionsEditor({
  character,
  onEditorClose,
  onPersistCharacter
}: UseCustomActionsEditorOptions) {
  const customActions = useMemo(
    () => normalizeCharacterCustomActions(character.customActions),
    [character.customActions]
  );
  const [draft, setDraft] = useState<CustomActionDraft | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  function closeEditor() {
    setDraft(null);
    setEditingActionId(null);
    onEditorClose?.();
  }

  function openCreator() {
    setDraft(createDefaultCustomActionDraft());
    setEditingActionId(null);
  }

  function openEditor(action: CharacterCustomAction) {
    setDraft(createCustomActionDraftFromEntry(action));
    setEditingActionId(action.id);
  }

  function deleteAction(actionId: string) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      customActions: normalizeCharacterCustomActions(currentCharacter.customActions).filter(
        (entry) => entry.id !== actionId
      )
    }));
  }

  function saveDraft() {
    if (!draft) {
      return;
    }

    const parsedAction = parseCustomActionDraft(draft);

    if (!parsedAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentActions = normalizeCharacterCustomActions(currentCharacter.customActions);

      return {
        ...currentCharacter,
        customActions: editingActionId
          ? currentActions.map((entry) => (entry.id === editingActionId ? parsedAction : entry))
          : [...currentActions, parsedAction]
      };
    });

    closeEditor();
  }

  return {
    customActions,
    editorDraft: draft,
    isEditing: editingActionId !== null,
    createDisabled: !draft || !isCustomActionDraftValid(draft),
    closeEditor,
    deleteAction,
    openCreator,
    openEditor,
    saveDraft,
    setDraft,
    editorProps: draft
      ? {
          draft,
          isEditing: editingActionId !== null,
          createDisabled: !isCustomActionDraftValid(draft),
          onNameChange: (value: string) =>
            setDraft((current) => (current ? { ...current, name: value } : current)),
          onDescriptionChange: (value: string) =>
            setDraft((current) => (current ? { ...current, description: value } : current)),
          onEconomyChange: (value: CustomActionDraft["economy"]) =>
            setDraft((current) => (current ? { ...current, economy: value } : current)),
          onHasEffectsChange: (value: boolean) =>
            setDraft((current) => (current ? { ...current, hasEffects: value } : current)),
          onDurationTypeChange: (value: CustomActionDraft["durationType"]) =>
            setDraft((current) => (current ? { ...current, durationType: value } : current)),
          onDurationValueChange: (value: number) =>
            setDraft((current) => (current ? { ...current, durationValue: value } : current)),
          onEffectTargetChange: (effectId: string, value: string) =>
            setDraft((current) =>
              current ? updateCustomActionDraftEffectTarget(current, effectId, value) : current
            ),
          onEffectValueChange: (effectId: string, value: string) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    effects: current.effects.map((effect) =>
                      effect.id === effectId ? { ...effect, value } : effect
                    )
                  }
                : current
            ),
          onEffectValueModeChange: (effectId: string, value: Parameters<
            typeof updateCustomActionDraftEffectValueMode
          >[2]) =>
            setDraft((current) =>
              current
                ? updateCustomActionDraftEffectValueMode(current, effectId, value)
                : current
            ),
          onEffectRollModeChange: (effectId: string, value: Parameters<
            typeof updateCustomActionDraftEffectRollMode
          >[2]) =>
            setDraft((current) =>
              current
                ? updateCustomActionDraftEffectRollMode(current, effectId, value)
                : current
            ),
          onAddEffect: () =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    effects: [...current.effects, createCustomTraitEffectDraft()]
                  }
                : current
            ),
          onRemoveEffect: (effectId: string) =>
            setDraft((current) =>
              current ? removeCustomActionDraftEffect(current, effectId) : current
            ),
          onHasChargesChange: (value: boolean) =>
            setDraft((current) => (current ? { ...current, hasCharges: value } : current)),
          onChargesCurrentChange: (value: number) =>
            setDraft((current) => (current ? { ...current, chargesCurrent: value } : current)),
          onChargesMaxChange: (value: number) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    chargesMax: value,
                    chargesCurrent: Math.min(current.chargesCurrent, value),
                    shortRestRecovery: Math.min(current.shortRestRecovery, value),
                    longRestRecovery: Math.min(current.longRestRecovery, value)
                  }
                : current
            ),
          onShortRestRecoveryChange: (value: number) =>
            setDraft((current) => (current ? { ...current, shortRestRecovery: value } : current)),
          onLongRestRecoveryChange: (value: number) =>
            setDraft((current) => (current ? { ...current, longRestRecovery: value } : current)),
          onCreate: saveDraft,
          onClose: closeEditor
        }
      : null
  };
}
