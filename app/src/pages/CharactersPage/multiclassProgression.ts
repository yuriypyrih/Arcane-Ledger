import { tagClassOwnedEffects, pruneClassOwnedEffects } from "./multiclassOwnership";
import type { Character, CharacterMulticlass } from "../../types";
import { getCastingProgression } from "../../codex/classes/multiclass";
import { getAutomaticMaxHitPointsForCharacter } from "./gameplay";
import {
  getHitDieMaximumForClass,
  getHitDiceRemainingForCharacter,
  getClassHitDiceExpended
} from "./hitDice";
import {
  getCharacterClasses,
  getCharacterLevel,
  projectStartingClass,
  readMulticlass
} from "./multiclass";
import { getClassFeatureModules } from "./classFeatures/modules";
import { reconcileClassFeatChoices } from "./multiclassFeatChoices";
import { getMinimumXpForLevel } from "./experience";
import { getEffectiveHitPointMaximumForCharacter } from "./traits";
import { normalizeCharacter } from "./storage";
import { createPortableCharacterSheet } from "./portableCharacterSheet";

export function createMulticlassDraft(character: Character): CharacterMulticlass {
  if (character.multiclass)
    return structuredClone({
      ...character.multiclass,
      hitDiceExpended: undefined,
      hitDiceExpendedByClass: getClassHitDiceExpended(character)
    });
  const starting = { ...getCharacterClasses(character)[0], id: `class-${character.id}-starting` };
  const casting = getCastingProgression(starting);
  const state: CharacterMulticlass = {
    classes: [starting],
    startingClassId: starting.id,
    hitDiceExpendedByClass: {
      [starting.id]: character.level - getHitDiceRemainingForCharacter(character)
    },
    ...(["pact", "manual"].includes(casting)
      ? { slotPoolsExpended: { [`${casting}:${starting.id}`]: character.spellSlotsExpended ?? [] } }
      : {})
  };
  // Old rolled/manual totals cannot be reconstructed. Preserve their difference.
  state.hitPointsAdjustment =
    character.hitPoints - getAutomaticMaxHitPointsForCharacter({ ...character, multiclass: state });
  return state;
}

export function applyClassProgression(
  character: Character,
  draft: CharacterMulticlass,
  xp = character.xp
): Character {
  const parsed = readMulticlass(draft);
  if (!parsed) throw new Error("Assign 1–100 total levels, with a distinct entry for each class.");
  const state: CharacterMulticlass = {
    ...parsed,
    ...(parsed.hitDiceExpendedByClass
      ? {
          hitDiceExpendedByClass: Object.fromEntries(
            Object.entries(parsed.hitDiceExpendedByClass).filter(([id]) =>
              parsed.classes.some((entry) => entry.id === id)
            )
          )
        }
      : {})
  };
  for (const entry of state.classes) {
    const maximum = getHitDieMaximumForClass(entry.className, entry.customClass, entry.classRules);
    if (entry.hitPointRolls?.some((roll) => roll !== null && roll > maximum)) {
      throw new Error(
        `${entry.customClass?.name || entry.className} HP rolls must be between 1 and ${maximum}.`
      );
    }
  }
  const ownedCharacter = tagClassOwnedEffects(
    character.multiclass
      ? character
      : { ...character, multiclass: createMulticlassDraft(character) }
  );
  const { classes, feats } = reconcileClassFeatChoices(character, state);
  state.classes = classes;
  const remainingIds = new Set(state.classes.map((entry) => entry.id));
  const removedClasses =
    character.multiclass?.classes.filter((entry) => !remainingIds.has(entry.id)) ?? [];
  const classFeatureState = { ...character.classFeatureState };
  for (const removed of removedClasses) {
    const module = getClassFeatureModules().find((item) => item.className === removed.className);
    if (module && removed.className !== "Custom") delete classFeatureState[module.stateKey];
  }
  if (state.slotPoolsExpended)
    state.slotPoolsExpended = Object.fromEntries(
      Object.entries(state.slotPoolsExpended).filter(([key]) =>
        state.classes.some((entry) => key === `pact:${entry.id}` || key === `manual:${entry.id}`)
      )
    );
  const total = state.classes.reduce((sum, entry) => sum + entry.level, 0);
  let next = projectStartingClass({
    ...ownedCharacter,
    multiclass: state,
    classFeatureState,
    feats,
    level: total,
    xp:
      total < getCharacterLevel(character)
        ? getMinimumXpForLevel(total)
        : Math.max(xp, getMinimumXpForLevel(total)),
    heroicInspiration: total > getCharacterLevel(character) ? true : character.heroicInspiration,
    ...(!character.multiclass &&
    ["pact", "manual"].includes(
      getCastingProgression(state.classes.find((entry) => entry.id === state.startingClassId)!)
    )
      ? { spellSlotsExpended: [] }
      : {})
  });
  if (next.maxHitPointsMode !== "custom")
    next = { ...next, hitPoints: getAutomaticMaxHitPointsForCharacter(next) };
  next = {
    ...next,
    currentHitPoints: Math.min(
      character.currentHitPoints,
      getEffectiveHitPointMaximumForCharacter(next)
    )
  };
  next = pruneClassOwnedEffects(next);
  return normalizeCharacter(next) ?? next;
}

/** Save the original before the first conversion; a quota failure aborts conversion. */
export function preservePreMulticlassCharacter(character: Character): void {
  if (character.multiclass || typeof window === "undefined") return;
  const key = `arcane-ledger.pre-multiclass.${character.storageMetadata?.sync?.clientId ?? character.id}`;
  if (window.localStorage.getItem(key) === null)
    window.localStorage.setItem(key, JSON.stringify(createPortableCharacterSheet(character)));
}
