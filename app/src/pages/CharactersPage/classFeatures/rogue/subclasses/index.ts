import { hasCharacterClass, getClassSubclassId } from "../../../multiclass";
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
  if (!hasCharacterClass(character, "Rogue") || !getClassSubclassId(character, "Rogue")) {
    return {};
  }

  return rogueSubclassRuntimeRegistry[getClassSubclassId(character, "Rogue")]?.(character) ?? {};
}

export function suppressesRogueSteadyAimSpeedReduction(
  character: Pick<SubclassRuntimeCharacter, "className" | "level" | "subclassId">
): boolean {
  if (!hasCharacterClass(character, "Rogue") || !getClassSubclassId(character, "Rogue")) {
    return false;
  }

  return getClassSubclassId(character, "Rogue") === assassinSubclassId
    ? hasRogueAssassinInfiltrationExpertise(character)
    : false;
}

export function getRogueSneakAttackEffectReferenceDescriptionAdditions(
  character: Pick<SubclassRuntimeCharacter, "className" | "level" | "subclassId">,
  effectKey: RogueSneakAttackEffectKey
): string[] {
  if (!hasCharacterClass(character, "Rogue") || !getClassSubclassId(character, "Rogue")) {
    return [];
  }

  return getClassSubclassId(character, "Rogue") === assassinSubclassId
    ? getRogueAssassinSneakAttackEffectDescriptionAdditions(character, effectKey)
    : [];
}

export function getRogueSubclassSneakAttackEffectDefinitions(
  character: Pick<SubclassRuntimeCharacter, "className" | "level" | "subclassId">
): RogueSneakAttackEffectDefinition[] {
  if (!hasCharacterClass(character, "Rogue") || !getClassSubclassId(character, "Rogue")) {
    return [];
  }

  return getClassSubclassId(character, "Rogue") === scionOfTheThreeSubclassId
    ? getRogueScionOfTheThreeSneakAttackEffectDefinitions(character)
    : getClassSubclassId(character, "Rogue") === thiefSubclassId
      ? getRogueThiefSneakAttackEffectDefinitions(character)
      : [];
}
