import type { Character } from "../../../types";
import { getCharacterClasses, getClassEditorCharacter } from "../multiclass";
import { mergeClassFeatureDerivedStates } from "./modules";
import { getSelectedSubclassForCharacter } from "../subclasses";
import { createDefaultAbilities } from "../constants";
import { getArtificerSubclassDerivedFeatureState } from "./artificer/subclasses";
import { getBarbarianSubclassDerivedFeatureState } from "./barbarian/subclasses";
import { getBardSubclassDerivedFeatureState } from "./bard/subclasses";
import { getClericSubclassDerivedFeatureState } from "./cleric/subclasses";
import { getDruidSubclassDerivedFeatureState } from "./druid/subclasses";
import {
  circleOfTheLandSpellIdsByLand,
  getDruidCircleOfTheLandSpellIdsForCharacter
} from "./druid/subclasses/druidCircleOfTheLand";
import {
  circleOfTheMoonSpellIdsByLevel,
  getDruidCircleOfTheMoonSpellIdsForCharacter
} from "./druid/subclasses/druidCircleOfTheMoon";
import { getFighterSubclassDerivedFeatureState } from "./fighter/subclasses";
import { getMonkSubclassDerivedFeatureState } from "./monk/subclasses";
import { getPaladinSubclassDerivedFeatureState } from "./paladin/subclasses";
import { getRangerSubclassDerivedFeatureState } from "./ranger/subclasses";
import { getRogueSubclassDerivedFeatureState } from "./rogue/subclasses";
import { getSorcererSubclassDerivedFeatureState } from "./sorcerer/subclasses";
import type { SubclassDerivedFeatureState, SubclassRuntimeCharacter } from "./subclassRuntime";
import { getWarlockSubclassDerivedFeatureState } from "./warlock/subclasses";
import { getWizardSubclassDerivedFeatureState } from "./wizard/subclasses";

export type { SubclassDerivedFeatureState, SubclassRuntimeCharacter } from "./subclassRuntime";
export {
  circleOfTheLandSpellIdsByLand,
  circleOfTheMoonSpellIdsByLevel,
  getDruidCircleOfTheLandSpellIdsForCharacter,
  getDruidCircleOfTheMoonSpellIdsForCharacter
};

const subclassRuntimeDispatchers: Record<
  string,
  (character: SubclassRuntimeCharacter) => SubclassDerivedFeatureState
> = {
  Artificer: getArtificerSubclassDerivedFeatureState,
  Barbarian: getBarbarianSubclassDerivedFeatureState,
  Bard: getBardSubclassDerivedFeatureState,
  Cleric: getClericSubclassDerivedFeatureState,
  Druid: getDruidSubclassDerivedFeatureState,
  Fighter: getFighterSubclassDerivedFeatureState,
  Monk: getMonkSubclassDerivedFeatureState,
  Paladin: getPaladinSubclassDerivedFeatureState,
  Ranger: getRangerSubclassDerivedFeatureState,
  Rogue: getRogueSubclassDerivedFeatureState,
  Sorcerer: getSorcererSubclassDerivedFeatureState,
  Warlock: getWarlockSubclassDerivedFeatureState,
  Wizard: getWizardSubclassDerivedFeatureState
};
const subclassDerivedFeatureStateCache = new WeakMap<object, SubclassDerivedFeatureState>();
const activeSubclassFeatureDerivations = new Set<string>();

function withSubclassRuntimeDefaults(
  character: SubclassRuntimeCharacter,
  subclassId: string
): SubclassRuntimeCharacter {
  return {
    ...character,
    level: character.level ?? 1,
    subclassId,
    equipment: character.equipment ?? [],
    inventoryItems: character.inventoryItems ?? [],
    customEquipment: character.customEquipment ?? [],
    abilities: character.abilities ?? createDefaultAbilities(),
    classFeatureState: character.classFeatureState ?? {},
    skillProficiencies: character.skillProficiencies ?? [],
    toolProficiencies: character.toolProficiencies ?? [],
    savingThrowProficiencies: character.savingThrowProficiencies ?? [],
    feats: character.feats ?? [],
    statusEntries: character.statusEntries ?? [],
    spellSlotsExpended: character.spellSlotsExpended ?? [],
    companions: character.companions ?? []
  };
}

export function getSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  const cachedState = subclassDerivedFeatureStateCache.get(character);

  if (cachedState) {
    return cachedState;
  }

  const progression = character as Partial<Character>;
  if (progression.multiclass && !progression.classEntryId) {
    const states = getCharacterClasses(character).map((entry) => {
      const state = getSubclassDerivedFeatureState(getClassEditorCharacter(character, entry));
      return {
        ...state,
        featureActions: state.featureActions?.map((action) => ({
          ...action,
          sourceClassEntryId: entry.id,
          actionSource: action.actionSource ?? {
            type: "class" as const,
            name: entry.customClass?.name || entry.className
          }
        }))
      };
    });
    const merged = states.reduce(
      (result, state) =>
        mergeClassFeatureDerivedStates(result, {
          ...state,
          actions: state.featureActions,
          actionOptions: state.featureActionOptions
        }),
      {} as import("./types").ClassFeatureDerivedState
    );
    const result: SubclassDerivedFeatureState = {
      ...merged,
      featureActions: merged.actions,
      featureActionOptions: merged.actionOptions,
      speedBonuses: states.flatMap((state) => state.speedBonuses ?? []),
      weaponAttackIndicators: states.flatMap((state) => state.weaponAttackIndicators ?? []),
      spellDamageFormulaOverrides: Object.assign(
        {},
        ...states.map((state) => state.spellDamageFormulaOverrides ?? {})
      ),
      getUnarmedStrikeConfig: () =>
        states.map((state) => state.getUnarmedStrikeConfig?.()).find(Boolean) ?? null
    };
    subclassDerivedFeatureStateCache.set(character, result);
    return result;
  }

  const subclass = getSelectedSubclassForCharacter(character);

  if (!subclass) {
    return {};
  }

  const dispatcher = subclassRuntimeDispatchers[subclass.className];
  const derivationKey = `${subclass.className}:${subclass.id}`;

  if (activeSubclassFeatureDerivations.has(derivationKey)) {
    return {};
  }

  activeSubclassFeatureDerivations.add(derivationKey);

  try {
    const safeCharacter = withSubclassRuntimeDefaults(character, subclass.id);
    const derivedState = dispatcher ? dispatcher(safeCharacter) : {};

    subclassDerivedFeatureStateCache.set(character, derivedState);
    subclassDerivedFeatureStateCache.set(safeCharacter, derivedState);
    return derivedState;
  } finally {
    activeSubclassFeatureDerivations.delete(derivationKey);
  }
}
