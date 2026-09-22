import { tagClassOwnedEffects, pruneClassOwnedEffects } from "./multiclassOwnership";
import { normalizeCharacterStatusEntries } from "./statusEntries";
import { normalizeCharacterCompanions } from "./companions";
import type { Character, CharacterClassEntry, CharacterMulticlass } from "../../types";
import { normalizeCharacterProficiencies } from "./proficiency";
import { normalizeCharacterClassFeatureState } from "./classFeatures/state";
import { normalizeArmorClassFormulaSelection } from "./armor";
import { getClassFeatureModules } from "./classFeatures/modules";
import { reconcileClassFeatChoices } from "./multiclassFeatChoices";
import {
  getCharacterLevel,
  getClassEditorCharacter,
  projectStartingClass,
  readMulticlass
} from "./multiclass";

/** Normalize each class with its own progression, without rewriting legacy characters. */
export function normalizeMulticlassCharacter(
  record: Partial<Character>,
  normalizeSingle: (value: unknown) => Character | null
): Character | null {
  const state = readMulticlass(record.multiclass);
  if (!state) return null;
  const total = getCharacterLevel(record);
  const starting = state.classes.find((entry) => entry.id === state.startingClassId)!;
  const base = normalizeSingle({
    ...getClassEditorCharacter(record, starting),
    id: record.id,
    level: total,
    multiclass: undefined,
    classEntryId: undefined
  });
  if (!base) return null;
  const classFeatureState = { ...base.classFeatureState };
  const classes: CharacterClassEntry[] = [];
  for (const entry of state.classes) {
    if (entry.level === 0) {
      // Keep declarations and their spent resources intact without invoking level-one defaults.
      classes.push({ ...entry });
      const module = getClassFeatureModules().find(
        (candidate) => candidate.className === entry.className
      );
      if (module && record.classFeatureState?.[module.stateKey]) {
        Object.assign(classFeatureState, {
          [module.stateKey]: record.classFeatureState[module.stateKey]
        });
      }
      continue;
    }
    const normalized = normalizeSingle({
      ...getClassEditorCharacter(record, entry),
      id: record.id,
      multiclass: undefined,
      classEntryId: undefined,
      level: entry.level,
      xp: 0,
      classFeatureState:
        entry.className === "Custom" ? (entry.customFeatureState ?? {}) : record.classFeatureState
    });
    if (!normalized) return null;
    const module = getClassFeatureModules().find(
      (candidate) => candidate.className === entry.className
    );
    if (module && entry.className !== "Custom" && normalized.classFeatureState) {
      Object.assign(classFeatureState, {
        [module.stateKey]: normalizeCharacterClassFeatureState(
          record.classFeatureState,
          getClassEditorCharacter({ ...base, multiclass: state }, entry)
        )[module.stateKey]
      });
    }
    classes.push({
      ...entry,
      subclassId: normalized.subclassId,
      customSubclass: normalized.customSubclass,
      classRules: normalized.classRules,
      customClass: normalized.customClass,
      cantripIds: normalized.cantripIds,
      spellbookSpellIds: normalized.spellbookSpellIds,
      preparedSpellIds: normalized.preparedSpellIds,
      ...(entry.className === "Custom" ? { customFeatureState: normalized.classFeatureState } : {})
    });
  }
  const multiclass: CharacterMulticlass = { ...state, classes };
  const result = projectStartingClass({
    ...base,
    multiclass,
    level: total,
    classFeatureState,
    customSpellSnapshots: record.customSpellSnapshots ?? base.customSpellSnapshots,
    // The legacy normalizer only knows one slot table and would truncate the shared pool.
    spellSlotsExpended: record.spellSlotsExpended ?? [],
    // Class-owned conditions/companions must not be removed by the starting-class pass.
    statusEntries: normalizeCharacterStatusEntries(record.statusEntries ?? base.statusEntries),
    companions: normalizeCharacterCompanions(record.companions ?? base.companions),
    currentHitPoints: record.currentHitPoints ?? base.currentHitPoints
  });
  const choices = reconcileClassFeatChoices(result, multiclass);
  result.multiclass = { ...multiclass, classes: choices.classes };
  result.feats = choices.feats.filter((feat) => {
    if (feat.source.type !== "eldritch-invocation" || !feat.source.classEntryId) return true;
    const source = feat.source;
    const owner = classes.find((entry) => entry.id === source.classEntryId);
    const selections =
      owner?.className === "Warlock"
        ? result.classFeatureState?.warlock?.eldritchInvocationIds
        : owner?.classRules?.mechanics.eldritchInvocations.selectionIds;
    return owner && owner.level > 0 && selections?.includes(source.selectionId);
  });
  return pruneClassOwnedEffects(
    tagClassOwnedEffects({
      ...result,
      ...normalizeCharacterProficiencies(result),
      armorClassFormulaSelection: normalizeArmorClassFormulaSelection(
        record.armorClassFormulaSelection,
        result
      )
    })
  );
}
