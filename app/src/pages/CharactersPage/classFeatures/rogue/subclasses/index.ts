import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import type { RogueSneakAttackEffectDefinition, RogueSneakAttackEffectKey } from "../types";
import {
  arcaneTricksterSubclassId,
  getRogueArcaneTricksterDerivedFeatureState
} from "./rogueArcaneTrickster";
import {
  assassinSubclassId,
  getRogueAssassinDerivedFeatureState,
  getRogueAssassinSneakAttackEffectDescriptionAdditions,
  hasRogueAssassinInfiltrationExpertise
} from "./rogueAssassin";
import {
  getRogueScionOfTheThreeDerivedFeatureState,
  getRogueScionOfTheThreeSneakAttackEffectDefinitions,
  scionOfTheThreeSubclassId
} from "./rogueScionOfTheThree";
import { getRogueSoulknifeDerivedFeatureState, soulknifeSubclassId } from "./rogueSoulknife";
import {
  getRogueThiefDerivedFeatureState,
  getRogueThiefSneakAttackEffectDefinitions,
  thiefSubclassId
} from "./rogueThief";

const rogueSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [arcaneTricksterSubclassId]: getRogueArcaneTricksterDerivedFeatureState,
  [assassinSubclassId]: getRogueAssassinDerivedFeatureState,
  [scionOfTheThreeSubclassId]: getRogueScionOfTheThreeDerivedFeatureState,
  [soulknifeSubclassId]: getRogueSoulknifeDerivedFeatureState,
  [thiefSubclassId]: getRogueThiefDerivedFeatureState
};

export function getRogueSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Rogue" || !character.subclassId) {
    return {};
  }

  return rogueSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}

export function suppressesRogueSteadyAimSpeedReduction(
  character: Pick<SubclassRuntimeCharacter, "className" | "level" | "subclassId">
): boolean {
  if (character.className !== "Rogue" || !character.subclassId) {
    return false;
  }

  return character.subclassId === assassinSubclassId
    ? hasRogueAssassinInfiltrationExpertise(character)
    : false;
}

export function getRogueSneakAttackEffectReferenceDescriptionAdditions(
  character: Pick<SubclassRuntimeCharacter, "className" | "level" | "subclassId">,
  effectKey: RogueSneakAttackEffectKey
): string[] {
  if (character.className !== "Rogue" || !character.subclassId) {
    return [];
  }

  return character.subclassId === assassinSubclassId
    ? getRogueAssassinSneakAttackEffectDescriptionAdditions(character, effectKey)
    : [];
}

export function getRogueSubclassSneakAttackEffectDefinitions(
  character: Pick<SubclassRuntimeCharacter, "className" | "level" | "subclassId">
): RogueSneakAttackEffectDefinition[] {
  if (character.className !== "Rogue" || !character.subclassId) {
    return [];
  }

  return character.subclassId === scionOfTheThreeSubclassId
    ? getRogueScionOfTheThreeSneakAttackEffectDefinitions(character)
    : character.subclassId === thiefSubclassId
      ? getRogueThiefSneakAttackEffectDefinitions(character)
    : [];
}
