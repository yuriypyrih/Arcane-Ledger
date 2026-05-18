import { getSelectedSubclassForCharacter } from "../subclasses";
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
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter
} from "./subclassRuntime";
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

export function getSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  const cachedState = subclassDerivedFeatureStateCache.get(character);

  if (cachedState) {
    return cachedState;
  }

  const subclass = getSelectedSubclassForCharacter(character);

  if (!subclass) {
    return {};
  }

  const dispatcher = subclassRuntimeDispatchers[subclass.className];

  const derivedState = dispatcher ? dispatcher({ ...character, subclassId: subclass.id }) : {};

  subclassDerivedFeatureStateCache.set(character, derivedState);
  return derivedState;
}
