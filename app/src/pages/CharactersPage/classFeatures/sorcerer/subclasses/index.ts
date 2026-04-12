import type { Character } from "../../../../../types";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  activateSorcererAberrantRevelationInFlesh,
  activateSorcererAberrantTelepathicSpeech,
  activateSorcererAberrantWarpingImplosion,
  aberrantSorcerySubclassId,
  canUseSorcererAberrantPsionicSorceryForSpell,
  getSorcererAberrantWarpingImplosionUsesTotal,
  getSorcererAberrantSorceryDerivedFeatureState,
  restoreSorcererAberrantWarpingImplosionOnLongRest,
  sorcererRevelationInFleshActionKey,
  sorcererTelepathicSpeechActionKey,
  sorcererWarpingImplosionActionKey
} from "./sorcererAberrantSorcery";
import {
  activateSorcererClockworkBastionOfLaw,
  activateSorcererClockworkCavalcade,
  activateSorcererClockworkTranceOfOrder,
  clockworkSorcerySubclassId,
  consumeSorcererClockworkRestoreBalanceUse,
  getSorcererClockworkCavalcadeUsesTotal,
  getSorcererClockworkRestoreBalanceUsesRemaining,
  getSorcererClockworkRestoreBalanceUsesTotal,
  getSorcererClockworkTranceOfOrderUsesTotal,
  getSorcererClockworkSorceryDerivedFeatureState,
  restoreSorcererClockworkFeaturesOnLongRest,
  sorcererBastionOfLawActionKey,
  sorcererClockworkCavalcadeActionKey,
  sorcererClockworkRestoreBalanceReactionId,
  sorcererTranceOfOrderActionKey
} from "./sorcererClockworkSorcery";
import {
  activateSorcererDragonWings,
  draconicSorcerySubclassId,
  getSorcererDraconicDragonWingsUsesTotal,
  getSorcererDraconicElementalAffinityDamageTypeSelection,
  getSorcererDraconicSorceryDerivedFeatureState,
  hasSorcererDraconicElementalAffinityFeature,
  normalizeSorcererDraconicElementalAffinityDamageType,
  restoreSorcererDragonWingsOnLongRest,
  setSorcererDraconicElementalAffinityDamageTypeSelection,
  sorcererDragonWingsActionKey,
  sorcererDraconicElementalAffinityDamageTypeOptions
} from "./sorcererDraconicSorcery";
import {
  activateSorcererSpellfireCrownOfSpellfire,
  getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCost,
  getSorcererSpellfireCrownOfSpellfireUsesRemaining,
  getSorcererSpellfireCrownOfSpellfireUsesTotal,
  getSorcererSpellfireSorceryDerivedFeatureState,
  restoreSorcererSpellfireCrownOfSpellfireOnLongRest,
  spellfireSorcerySubclassId
} from "./sorcererSpellfireSorcery";
import {
  sorcererBendLuckReactionId,
  activateSorcererWildMagicTamedSurge,
  activateSorcererWildMagicTidesOfChaos,
  getSorcererWildMagicSorceryDerivedFeatureState,
  getSorcererWildMagicTamedSurgeUsesTotal,
  getSorcererWildMagicTidesOfChaosUsesTotal,
  restoreSorcererWildMagicFeaturesOnLongRest,
  restoreSorcererWildMagicTidesOfChaosOnSpellSlotCast,
  sorcererTamedSurgeActionKey,
  sorcererTidesOfChaosActionKey,
  wildMagicSorcerySubclassId
} from "./sorcererWildMagicSorcery";

const sorcererSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [aberrantSorcerySubclassId]: getSorcererAberrantSorceryDerivedFeatureState,
  [clockworkSorcerySubclassId]: getSorcererClockworkSorceryDerivedFeatureState,
  [draconicSorcerySubclassId]: getSorcererDraconicSorceryDerivedFeatureState,
  [spellfireSorcerySubclassId]: getSorcererSpellfireSorceryDerivedFeatureState,
  [wildMagicSorcerySubclassId]: getSorcererWildMagicSorceryDerivedFeatureState
};

export {
  getSorcererDraconicDragonWingsUsesTotal,
  getSorcererDraconicElementalAffinityDamageTypeSelection,
  hasSorcererDraconicElementalAffinityFeature,
  normalizeSorcererDraconicElementalAffinityDamageType,
  setSorcererDraconicElementalAffinityDamageTypeSelection,
  sorcererDraconicElementalAffinityDamageTypeOptions
};

export function getSorcererSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return {};
  }

  return sorcererSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}

export function activateSorcererSubclassFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return null;
  }

  if (
    character.subclassId === aberrantSorcerySubclassId &&
    actionKey === sorcererTelepathicSpeechActionKey
  ) {
    return activateSorcererAberrantTelepathicSpeech(character);
  }

  if (
    character.subclassId === aberrantSorcerySubclassId &&
    actionKey === sorcererWarpingImplosionActionKey
  ) {
    return activateSorcererAberrantWarpingImplosion(character);
  }

  if (
    character.subclassId === draconicSorcerySubclassId &&
    actionKey === sorcererDragonWingsActionKey
  ) {
    return activateSorcererDragonWings(character);
  }

  if (
    character.subclassId === clockworkSorcerySubclassId &&
    actionKey === sorcererTranceOfOrderActionKey
  ) {
    return activateSorcererClockworkTranceOfOrder(character);
  }

  if (
    character.subclassId === clockworkSorcerySubclassId &&
    actionKey === sorcererClockworkCavalcadeActionKey
  ) {
    return activateSorcererClockworkCavalcade(character);
  }

  if (
    character.subclassId === wildMagicSorcerySubclassId &&
    actionKey === sorcererTidesOfChaosActionKey
  ) {
    return activateSorcererWildMagicTidesOfChaos(character);
  }

  if (
    character.subclassId === wildMagicSorcerySubclassId &&
    actionKey === sorcererTamedSurgeActionKey
  ) {
    return activateSorcererWildMagicTamedSurge(character);
  }

  return null;
}

export function activateSorcererSubclassFeatureActionOptions(
  character: Character,
  actionKey: string,
  optionKeys: string[]
): Character | null {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return null;
  }

  if (
    character.subclassId === aberrantSorcerySubclassId &&
    actionKey === sorcererRevelationInFleshActionKey
  ) {
    return activateSorcererAberrantRevelationInFlesh(character, optionKeys);
  }

  return null;
}

export function activateSorcererSubclassFeatureActionOption(
  character: Character,
  actionKey: string,
  optionKey: string
): Character | null {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return null;
  }

  if (
    character.subclassId === clockworkSorcerySubclassId &&
    actionKey === sorcererBastionOfLawActionKey
  ) {
    return activateSorcererClockworkBastionOfLaw(character, optionKey);
  }

  return null;
}

export function canUseSorcererSubclassPsionicSorceryForSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spellId: string
): boolean {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return false;
  }

  return character.subclassId === aberrantSorcerySubclassId
    ? canUseSorcererAberrantPsionicSorceryForSpell(character, spellId)
    : false;
}

export function getSorcererSubclassWarpingImplosionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === aberrantSorcerySubclassId
    ? getSorcererAberrantWarpingImplosionUsesTotal(character)
    : 0;
}

export function getSorcererSubclassTranceOfOrderUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === clockworkSorcerySubclassId
    ? getSorcererClockworkTranceOfOrderUsesTotal(character)
    : 0;
}

export function getSorcererSubclassClockworkCavalcadeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === clockworkSorcerySubclassId
    ? getSorcererClockworkCavalcadeUsesTotal(character)
    : 0;
}

export function getSorcererSubclassDragonWingsUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === draconicSorcerySubclassId
    ? getSorcererDraconicDragonWingsUsesTotal(character)
    : 0;
}

export function getSorcererSubclassCrownOfSpellfireUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === spellfireSorcerySubclassId
    ? getSorcererSpellfireCrownOfSpellfireUsesTotal(character)
    : 0;
}

export function getSorcererSubclassCrownOfSpellfireUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === spellfireSorcerySubclassId
    ? getSorcererSpellfireCrownOfSpellfireUsesRemaining(character)
    : 0;
}

export function getSorcererSubclassCrownOfSpellfireFallbackSorceryPointCost(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === spellfireSorcerySubclassId
    ? getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCost(character)
    : 0;
}

export function getSorcererSubclassTidesOfChaosUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === wildMagicSorcerySubclassId
    ? getSorcererWildMagicTidesOfChaosUsesTotal(character)
    : 0;
}

export function getSorcererSubclassTamedSurgeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === wildMagicSorcerySubclassId
    ? getSorcererWildMagicTamedSurgeUsesTotal(character)
    : 0;
}

export const sorcererRestoreBalanceReactionId = sorcererClockworkRestoreBalanceReactionId;
export const sorcererBendLuckReactionEntryId = sorcererBendLuckReactionId;

export function getSorcererSubclassRestoreBalanceUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === clockworkSorcerySubclassId
    ? getSorcererClockworkRestoreBalanceUsesTotal(character)
    : 0;
}

export function getSorcererSubclassRestoreBalanceUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return 0;
  }

  return character.subclassId === clockworkSorcerySubclassId
    ? getSorcererClockworkRestoreBalanceUsesRemaining(character)
    : 0;
}

export function consumeSorcererSubclassRestoreBalanceUse(character: Character): Character {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return character;
  }

  return character.subclassId === clockworkSorcerySubclassId
    ? consumeSorcererClockworkRestoreBalanceUse(character)
    : character;
}

export function restoreSorcererSubclassFeaturesOnLongRest(character: Character): Character {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return character;
  }

  if (character.subclassId === clockworkSorcerySubclassId) {
    return restoreSorcererClockworkFeaturesOnLongRest(character);
  }

  if (character.subclassId === draconicSorcerySubclassId) {
    return restoreSorcererDragonWingsOnLongRest(character);
  }

  return character.subclassId === aberrantSorcerySubclassId
    ? restoreSorcererAberrantWarpingImplosionOnLongRest(character)
    : character.subclassId === spellfireSorcerySubclassId
      ? restoreSorcererSpellfireCrownOfSpellfireOnLongRest(character)
      : character.subclassId === wildMagicSorcerySubclassId
        ? restoreSorcererWildMagicFeaturesOnLongRest(character)
        : character;
}

export function restoreSorcererSubclassFeaturesOnSpellSlotCast(character: Character): Character {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return character;
  }

  return character.subclassId === wildMagicSorcerySubclassId
    ? restoreSorcererWildMagicTidesOfChaosOnSpellSlotCast(character)
    : character;
}

export function activateSorcererSubclassCrownOfSpellfire(character: Character): Character {
  if (character.className !== "Sorcerer" || character.subclassId !== spellfireSorcerySubclassId) {
    return character;
  }

  return activateSorcererSpellfireCrownOfSpellfire(character);
}
