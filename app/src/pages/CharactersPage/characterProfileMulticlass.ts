import type { CharacterDraft, CharacterMulticlass } from "../../types";
import { getMinimumXpForLevel } from "./experience";
import { getAutomaticMaxHitPointsForCharacter } from "./gameplay";
import { getEffectiveHitPointMaximumForCharacter } from "./traits";
import { applyClassProgression } from "./multiclassProgression";
import { normalizeCharacter } from "./storage";

/** Profile edits preserve allocated class levels; the Level field shows the character total. */
export function getProfileClassProgression(draft: CharacterDraft): CharacterMulticlass {
  const existing = draft.multiclass;
  const startingClassId = existing?.startingClassId ?? "starting-class";
  const previous = existing?.classes.find((entry) => entry.id === startingClassId);
  const starting = {
    ...previous,
    id: startingClassId,
    className: draft.className,
    level: previous?.level ?? Math.max(1, Math.floor(draft.level || 1)),
    subclassId: draft.subclassId || undefined,
    customSubclass: draft.customSubclass,
    customClass: draft.customClass,
    classRules: draft.classRules,
    cantripIds: draft.cantripIds,
    spellbookSpellIds: draft.spellbookSpellIds,
    preparedSpellIds: draft.preparedSpellIds,
    ...(draft.className === "Custom" ? { customFeatureState: draft.classFeatureState } : {})
  };
  return {
    ...existing,
    startingClassId,
    hitPointsAdjustment: existing?.hitPointsAdjustment ?? 0,
    classes: existing
      ? existing.classes.map((entry) => (entry.id === startingClassId ? starting : entry))
      : [starting]
  };
}

export function applyProfileClassProgression(
  draft: CharacterDraft,
  options: { isEditing?: boolean; previous?: CharacterMulticlass } = {}
): CharacterDraft {
  if (!draft.multiclass) return draft;
  const progression = getProfileClassProgression(draft);
  if (progression.classes.some((entry) => !entry.className.trim())) {
    throw new Error("Every progression entry must have a class.");
  }
  const base = normalizeCharacter({
    ...draft,
    id: 0,
    multiclass: options.previous,
    xp: getMinimumXpForLevel(draft.level)
  });
  if (!base) throw new Error("Unable to read the saved class progression.");
  const updated = applyClassProgression(base, progression, draft.xp);
  const hitPoints =
    draft.maxHitPointsMode === "custom"
      ? draft.hitPoints
      : getAutomaticMaxHitPointsForCharacter(updated);
  const maximum = getEffectiveHitPointMaximumForCharacter({ ...updated, hitPoints });
  return {
    ...draft,
    multiclass: updated.multiclass,
    level: updated.level,
    xp: updated.xp,
    hitPoints,
    currentHitPoints: options.isEditing ? Math.min(draft.currentHitPoints, maximum) : maximum,
    classFeatureState: updated.classFeatureState,
    feats: updated.feats,
    cantripIds: updated.cantripIds,
    preparedSpellIds: updated.preparedSpellIds,
    spellbookSpellIds: updated.spellbookSpellIds,
    spellSlotsExpended: updated.spellSlotsExpended,
    statusEntries: updated.statusEntries,
    companions: updated.companions,
    heroicInspiration: options.isEditing ? updated.heroicInspiration : draft.heroicInspiration
  };
}
