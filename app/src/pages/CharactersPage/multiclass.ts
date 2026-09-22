import { tagClassOwnedEffects, pruneClassOwnedEffects } from "./multiclassOwnership";
import { multiclassRules } from "../../codex/classes/multiclass";
import type { Character, CharacterClassEntry, CharacterMulticlass } from "../../types";

type Progression = Partial<Pick<Character, "className" | "level" | "multiclass" | "classEntryId">>;

export function getCharacterLevel(character: object): number {
  const value = character as Progression;
  return value.multiclass
    ? value.multiclass.classes.reduce((total, entry) => total + entry.level, 0)
    : (value.level ?? 1);
}

/** All declared classes, including inactive level-zero entries. */
export function getDeclaredCharacterClasses(character: object): CharacterClassEntry[] {
  const value = character as Partial<Character>;
  return (
    value.multiclass?.classes ?? [
      {
        id: "single",
        className: value.className ?? "",
        level: value.level ?? 1,
        subclassId: value.subclassId,
        customSubclass: value.customSubclass,
        classRules: value.classRules,
        customClass: value.customClass,
        cantripIds: value.cantripIds,
        spellbookSpellIds: value.spellbookSpellIds,
        preparedSpellIds: value.preparedSpellIds,
        ...(value.className === "Custom" ? { customFeatureState: value.classFeatureState } : {})
      }
    ]
  );
}

/** Only active classes participate in gameplay and Build/casting selectors. */
export function getCharacterClasses(character: object): CharacterClassEntry[] {
  return getDeclaredCharacterClasses(character).filter((entry) => entry.level > 0);
}

export function getClassEntry(
  character: object,
  className: string
): CharacterClassEntry | undefined {
  const value = character as Progression;
  const entries = getCharacterClasses(character);
  return (
    entries.find((entry) => entry.className === className && entry.id === value.classEntryId) ??
    entries.find((entry) => entry.className === className)
  );
}

/** Class rules use this; proficiency, species, feats and cantrip scaling use total level. */
export function getClassLevel(character: object, className: string): number {
  const value = character as Progression;
  if (!value.multiclass && !value.className) return value.level ?? 1;
  return getClassEntry(character, className)?.level ?? 0;
}

export function hasCharacterClass(character: object, className: string): boolean {
  return getClassLevel(character, className) > 0;
}

export function getClassSubclassId(character: object, className: string): string {
  return getClassEntry(character, className)?.subclassId ?? "";
}

export function getClassCantripIds(character: object, className: string): string[] {
  return getClassEntry(character, className)?.cantripIds ?? [];
}

export function getClassSpellbookIds(character: object, className: string): string[] {
  return getClassEntry(character, className)?.spellbookSpellIds ?? [];
}

const scopedKeys = [
  "className",
  "subclassId",
  "customSubclass",
  "classRules",
  "customClass",
  "cantripIds",
  "spellbookSpellIds",
  "preparedSpellIds"
] as const;

/** A view for the existing class editor. It is never saved as a whole character. */
export function getClassEditorCharacter<T extends object>(
  character: T,
  entry: CharacterClassEntry
): T & Character {
  const value = character as T & Character;
  return {
    ...value,
    ...Object.fromEntries(scopedKeys.map((key) => [key, entry[key]])),
    level: entry.level,
    classEntryId: entry.id,
    ...(entry.className === "Custom" ? { classFeatureState: entry.customFeatureState ?? {} } : {})
  };
}

export function applyClassEditorChange(
  character: Character,
  entryId: string,
  update: (view: Character) => Character
): Character {
  if (!character.multiclass) return update(character);
  const entry = character.multiclass.classes.find((candidate) => candidate.id === entryId);
  if (!entry) return character;
  const before = getClassEditorCharacter(tagClassOwnedEffects(character), entry);
  const after = update(before);
  if (after === before) return character;
  const updatedEntry = {
    ...entry,
    ...Object.fromEntries(scopedKeys.map((key) => [key, after[key]])),
    ...(entry.className === "Custom" ? { customFeatureState: after.classFeatureState } : {})
  };
  const next: Character = {
    ...after,
    feats: after.feats?.map((feat) =>
      (feat.source.type === "class-feature" || feat.source.type === "eldritch-invocation") &&
      !feat.source.classEntryId
        ? { ...feat, source: { ...feat.source, classEntryId: entry.id } }
        : feat
    ),
    statusEntries: (after.statusEntries ?? []).map((item) =>
      item.sourceClassEntryId ||
      (before.statusEntries ?? []).some((previous) => previous.id === item.id)
        ? item
        : { ...item, sourceClassEntryId: entry.id }
    ),
    companions: after.companions?.map((item) =>
      item.sourceClassEntryId || before.companions?.some((previous) => previous.id === item.id)
        ? item
        : { ...item, sourceClassEntryId: entry.id }
    ),
    classEntryId: undefined,
    classFeatureState:
      entry.className === "Custom" ? character.classFeatureState : after.classFeatureState,
    multiclass: {
      ...character.multiclass,
      ...after.multiclass,
      classes: character.multiclass.classes.map((item) =>
        item.id === entryId ? updatedEntry : item
      )
    }
  };
  return pruneClassOwnedEffects(tagClassOwnedEffects(projectStartingClass(next)));
}

/** Legacy fields are a compatibility projection, never a second progression authority. */
export function projectStartingClass(character: Character): Character {
  const state = character.multiclass;
  if (!state) return character;
  const starting = state.classes.find((entry) => entry.id === state.startingClassId)!;
  return {
    ...character,
    ...Object.fromEntries(scopedKeys.map((key) => [key, starting[key]])),
    level: getCharacterLevel(character),
    classEntryId: undefined,
    slotPoolId: undefined,
    spellSourceClassEntryId: undefined
  };
}

export function readMulticlass(value: unknown): CharacterMulticlass | null {
  if (!value || typeof value !== "object") return null;
  const state = value as CharacterMulticlass;
  if (!Array.isArray(state.classes) || state.classes.length === 0 || state.classes.length > 100)
    return null;
  const ids = new Set<string>();
  const identities = new Set<string>();
  let total = 0;
  for (const entry of state.classes) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !entry.id.trim() ||
      typeof entry.className !== "string" ||
      !Object.prototype.hasOwnProperty.call(multiclassRules, entry.className) ||
      !Number.isInteger(entry.level) ||
      entry.level < (entry.id === state.startingClassId ? 1 : 0) ||
      entry.level > 100
    )
      return null;
    if (
      [
        entry.cantripIds,
        entry.spellbookSpellIds,
        entry.preparedSpellIds,
        entry.skillChoices,
        entry.toolChoices
      ].some(
        (list) =>
          list !== undefined &&
          (!Array.isArray(list) || list.some((item) => typeof item !== "string"))
      )
    )
      return null;
    if (
      entry.inactiveFeats !== undefined &&
      (!Array.isArray(entry.inactiveFeats) ||
        entry.inactiveFeats.some((feat) => !feat || typeof feat !== "object"))
    )
      return null;
    if (
      entry.hitPointRolls !== undefined &&
      (!Array.isArray(entry.hitPointRolls) ||
        entry.hitPointRolls.length > 100 ||
        entry.hitPointRolls.some(
          (roll) => roll !== null && (!Number.isInteger(roll) || roll < 1 || roll > 12)
        ))
    )
      return null;
    const identity =
      entry.className === "Custom"
        ? `Custom:${entry.customClass?.id ?? entry.id}`
        : entry.className;
    if (ids.has(entry.id) || identities.has(identity)) return null;
    ids.add(entry.id);
    identities.add(identity);
    total += entry.level;
  }
  if (state.hitPointsAdjustment !== undefined && !Number.isFinite(state.hitPointsAdjustment))
    return null;
  if (
    state.hitDiceExpendedByClass !== undefined &&
    (!state.hitDiceExpendedByClass ||
      typeof state.hitDiceExpendedByClass !== "object" ||
      Array.isArray(state.hitDiceExpendedByClass) ||
      Object.values(state.hitDiceExpendedByClass).some((n) => !Number.isInteger(n) || n < 0))
  )
    return null;
  if (
    state.hitDiceExpended &&
    (typeof state.hitDiceExpended !== "object" ||
      Object.values(state.hitDiceExpended).some((n) => !Number.isInteger(n) || n < 0))
  )
    return null;
  if (
    state.slotPoolsExpended &&
    (typeof state.slotPoolsExpended !== "object" ||
      Object.values(state.slotPoolsExpended).some(
        (list) =>
          !Array.isArray(list) || list.length > 9 || list.some((n) => !Number.isInteger(n) || n < 0)
      ))
  )
    return null;
  if (total < 1 || total > 100 || !ids.has(state.startingClassId)) return null;
  return state;
}

export function getClassSummary(character: object): string {
  return getCharacterClasses(character)
    .map((entry) => `${entry.customClass?.name || entry.className} ${entry.level}`)
    .join(" / ");
}

/** Spell modifiers can come from any class, while source-limited rules retain the casting class. */
export function getSpellFeatureCharacter<T extends object>(character: T): T {
  const value = character as T & Character;
  return value.multiclass && value.classEntryId
    ? {
        ...value,
        classEntryId: undefined,
        spellSourceClassEntryId: value.spellSourceClassEntryId ?? value.classEntryId
      }
    : character;
}

export function isSpellFromClass(character: object, className: string): boolean {
  const value = character as Character;
  if (!value.multiclass || !value.spellSourceClassEntryId) return value.className === className;
  return getClassEntry(value, className)?.id === value.spellSourceClassEntryId;
}
