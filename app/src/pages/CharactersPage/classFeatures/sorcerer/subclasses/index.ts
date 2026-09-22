import { isSpellFromClass, hasCharacterClass, getClassSubclassId } from "../../../multiclass";
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
  canUseSorcererDraconicDragonCompanionForSpell,
  consumeSorcererDragonCompanionUse,
  draconicSorcerySubclassId,
  getSorcererDraconicDragonCompanionUsesRemaining,
  getSorcererDraconicDragonCompanionUsesTotal,
  getSorcererDraconicDragonWingsUsesTotal,
  getSorcererDraconicElementalAffinityDamageTypeSelection,
  getSorcererDraconicSorceryDerivedFeatureState,
  hasSorcererDraconicElementalAffinityFeature,
  normalizeSorcererDraconicElementalAffinityDamageType,
  restoreSorcererDragonCompanionOnLongRest,
  restoreSorcererDragonWingsOnLongRest,
  setSorcererDraconicElementalAffinityDamageTypeSelection,
  sorcererDragonWingsActionKey,
  sorcererDraconicElementalAffinityDamageTypeOptions
} from "./sorcererDraconicSorcery";
import {
  activateSorcererSpellfireBurst,
  activateSorcererSpellfireCrownOfSpellfire,
  getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCost,
  getSorcererSpellfireCrownOfSpellfireUsesRemaining,
  getSorcererSpellfireCrownOfSpellfireUsesTotal,
  getSorcererSpellfireSorceryDerivedFeatureState,
  hasSorcererSpellfireBurstFeatureForCharacter,
  restoreSorcererSpellfireCrownOfSpellfireOnLongRest,
  sorcererSpellfireBurstActionKey,
  spellfireSorcerySubclassId
} from "./sorcererSpellfireSorcery";
import {
  sorcererBendLuckReactionId,
  activateSorcererWildMagicSurge,
  activateSorcererWildMagicTidesOfChaos,
  canUseSorcererWildMagicTamedSurgeForSpell,
  consumeSorcererWildMagicTamedSurgeUse,
  getSorcererWildMagicSorceryDerivedFeatureState,
  getSorcererWildMagicTamedSurgeUsesRemaining,
  getSorcererWildMagicTamedSurgeUsesTotal,
  getSorcererWildMagicTidesOfChaosUsesTotal,
  hasSorcererWildMagicSurgeFeatureForCharacter,
  restoreSorcererWildMagicFeaturesOnLongRest,
  restoreSorcererWildMagicTidesOfChaosOnSpellCast,
  sorcererTidesOfChaosActionKey,
  sorcererWildMagicSurgeActionKey,
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
  canUseSorcererDraconicDragonCompanionForSpell,
  getSorcererDraconicDragonCompanionUsesRemaining,
  getSorcererDraconicDragonCompanionUsesTotal,
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
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return {};
  }

  return (
    sorcererSubclassRuntimeRegistry[getClassSubclassId(character, "Sorcerer")]?.(character) ?? {}
  );
}

export function activateSorcererSubclassFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return null;
  }

  if (
    getClassSubclassId(character, "Sorcerer") === aberrantSorcerySubclassId &&
    actionKey === sorcererTelepathicSpeechActionKey
  ) {
    return activateSorcererAberrantTelepathicSpeech(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === aberrantSorcerySubclassId &&
    actionKey === sorcererWarpingImplosionActionKey
  ) {
    return activateSorcererAberrantWarpingImplosion(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId &&
    actionKey === sorcererDragonWingsActionKey
  ) {
    return activateSorcererDragonWings(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId &&
    actionKey === sorcererTranceOfOrderActionKey
  ) {
    return activateSorcererClockworkTranceOfOrder(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId &&
    actionKey === sorcererClockworkCavalcadeActionKey
  ) {
    return activateSorcererClockworkCavalcade(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === spellfireSorcerySubclassId &&
    actionKey === sorcererSpellfireBurstActionKey
  ) {
    return activateSorcererSpellfireBurst(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId &&
    actionKey === sorcererWildMagicSurgeActionKey
  ) {
    return activateSorcererWildMagicSurge(character);
  }

  if (
    getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId &&
    actionKey === sorcererTidesOfChaosActionKey
  ) {
    return activateSorcererWildMagicTidesOfChaos(character);
  }

  return null;
}

export function activateSorcererSubclassFeatureActionOptions(
  character: Character,
  actionKey: string,
  optionKeys: string[]
): Character | null {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return null;
  }

  if (
    getClassSubclassId(character, "Sorcerer") === aberrantSorcerySubclassId &&
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
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return null;
  }

  if (
    getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId &&
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
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return false;
  }

  return getClassSubclassId(character, "Sorcerer") === aberrantSorcerySubclassId
    ? canUseSorcererAberrantPsionicSorceryForSpell(character, spellId)
    : false;
}

export function getSorcererSubclassWarpingImplosionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === aberrantSorcerySubclassId
    ? getSorcererAberrantWarpingImplosionUsesTotal(character)
    : 0;
}

export function hasSorcererSubclassSpellfireBurstFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasCharacterClass(character, "Sorcerer") &&
    getClassSubclassId(character, "Sorcerer") === spellfireSorcerySubclassId
    ? hasSorcererSpellfireBurstFeatureForCharacter(character)
    : false;
}

export function hasSorcererSubclassWildMagicSurgeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasCharacterClass(character, "Sorcerer") &&
    getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? hasSorcererWildMagicSurgeFeatureForCharacter(character)
    : false;
}

export function getSorcererSubclassTranceOfOrderUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId
    ? getSorcererClockworkTranceOfOrderUsesTotal(character)
    : 0;
}

export function getSorcererSubclassClockworkCavalcadeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId
    ? getSorcererClockworkCavalcadeUsesTotal(character)
    : 0;
}

export function getSorcererSubclassDragonWingsUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId
    ? getSorcererDraconicDragonWingsUsesTotal(character)
    : 0;
}

export function getSorcererSubclassDragonCompanionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId
    ? getSorcererDraconicDragonCompanionUsesTotal(character)
    : 0;
}

export function getSorcererSubclassDragonCompanionUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId
    ? getSorcererDraconicDragonCompanionUsesRemaining(character)
    : 0;
}

export function canUseSorcererSubclassDragonCompanionForSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spellId: string
): boolean {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return false;
  }

  return getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId
    ? canUseSorcererDraconicDragonCompanionForSpell(character, spellId)
    : false;
}

export function consumeSorcererSubclassDragonCompanionUseForCharacter(
  character: Character
): Character {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return character;
  }

  return getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId
    ? consumeSorcererDragonCompanionUse(character)
    : character;
}

export function getSorcererSubclassCrownOfSpellfireUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === spellfireSorcerySubclassId
    ? getSorcererSpellfireCrownOfSpellfireUsesTotal(character)
    : 0;
}

export function getSorcererSubclassCrownOfSpellfireUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === spellfireSorcerySubclassId
    ? getSorcererSpellfireCrownOfSpellfireUsesRemaining(character)
    : 0;
}

export function getSorcererSubclassCrownOfSpellfireFallbackSorceryPointCost(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === spellfireSorcerySubclassId
    ? getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCost(character)
    : 0;
}

export function getSorcererSubclassTidesOfChaosUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? getSorcererWildMagicTidesOfChaosUsesTotal(character)
    : 0;
}

export function getSorcererSubclassTamedSurgeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? getSorcererWildMagicTamedSurgeUsesTotal(character)
    : 0;
}

export function getSorcererSubclassTamedSurgeUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? getSorcererWildMagicTamedSurgeUsesRemaining(character)
    : 0;
}

export function canUseSorcererSubclassTamedSurgeForSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Parameters<typeof canUseSorcererWildMagicTamedSurgeForSpell>[1]
): boolean {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return false;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? canUseSorcererWildMagicTamedSurgeForSpell(character, spell)
    : false;
}

export function consumeSorcererSubclassTamedSurgeUseForCharacter(character: Character): Character {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return character;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? consumeSorcererWildMagicTamedSurgeUse(character)
    : character;
}

export {
  sorcererClockworkRestoreBalanceReactionId as sorcererRestoreBalanceReactionId,
  sorcererBendLuckReactionId as sorcererBendLuckReactionEntryId
};

export function getSorcererSubclassRestoreBalanceUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId
    ? getSorcererClockworkRestoreBalanceUsesTotal(character)
    : 0;
}

export function getSorcererSubclassRestoreBalanceUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return 0;
  }

  return getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId
    ? getSorcererClockworkRestoreBalanceUsesRemaining(character)
    : 0;
}

export function consumeSorcererSubclassRestoreBalanceUse(character: Character): Character {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return character;
  }

  return getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId
    ? consumeSorcererClockworkRestoreBalanceUse(character)
    : character;
}

export function restoreSorcererSubclassFeaturesOnLongRest(character: Character): Character {
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return character;
  }

  if (getClassSubclassId(character, "Sorcerer") === clockworkSorcerySubclassId) {
    return restoreSorcererClockworkFeaturesOnLongRest(character);
  }

  if (getClassSubclassId(character, "Sorcerer") === draconicSorcerySubclassId) {
    return restoreSorcererDragonCompanionOnLongRest(
      restoreSorcererDragonWingsOnLongRest(character)
    );
  }

  return getClassSubclassId(character, "Sorcerer") === aberrantSorcerySubclassId
    ? restoreSorcererAberrantWarpingImplosionOnLongRest(character)
    : getClassSubclassId(character, "Sorcerer") === spellfireSorcerySubclassId
      ? restoreSorcererSpellfireCrownOfSpellfireOnLongRest(character)
      : getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
        ? restoreSorcererWildMagicFeaturesOnLongRest(character)
        : character;
}

export function restoreSorcererSubclassFeaturesOnSpellSlotCast(character: Character): Character {
  if (character.multiclass && !isSpellFromClass(character, "Sorcerer")) return character;
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return character;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? restoreSorcererWildMagicTidesOfChaosOnSpellCast(character)
    : character;
}

export function restoreSorcererSubclassFeaturesOnSpellCast(character: Character): Character {
  if (character.multiclass && !isSpellFromClass(character, "Sorcerer")) return character;
  if (!hasCharacterClass(character, "Sorcerer") || !getClassSubclassId(character, "Sorcerer")) {
    return character;
  }

  return getClassSubclassId(character, "Sorcerer") === wildMagicSorcerySubclassId
    ? restoreSorcererWildMagicTidesOfChaosOnSpellCast(character)
    : character;
}

export function activateSorcererSubclassCrownOfSpellfire(character: Character): Character {
  if (
    !hasCharacterClass(character, "Sorcerer") ||
    getClassSubclassId(character, "Sorcerer") !== spellfireSorcerySubclassId
  ) {
    return character;
  }

  return activateSorcererSpellfireCrownOfSpellfire(character);
}
