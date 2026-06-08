import type { Character, CharacterArtificerFeatureState } from "../../../../types";
import type {
  ClassFeatureDerivedState,
  FeatureActionCard,
  FeatureActionOptionCard,
  SpellSourceMap
} from "../types";
import {
  normalizeArtificerTinkersMagicState,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";
import {
  normalizeArtificerFlashOfGeniusState,
  restoreArtificerFlashOfGeniusOnLongRest
} from "./flashOfGenius";
import { normalizeArtificerReplicateMagicItemPlanState } from "./replicateMagicItem";
import {
  normalizeArtificerMagicItemTinkerState,
  restoreArtificerMagicItemTinkerDrainOnLongRest,
  restoreArtificerMagicItemTinkerTransmuteOnLongRest
} from "./magicItemTinker";
import { normalizeArtificerToolsOfTheTradeState } from "./toolsOfTheTrade";
import {
  normalizeArtificerRestorativeReagentsState,
  restoreArtificerRestorativeReagentsOnLongRest
} from "./subclasses/artificerAlchemistRestorativeReagents";
import {
  normalizeArtificerIlluminatedCartographyState,
  normalizeArtificerUnerringPathState,
  restoreArtificerIlluminatedCartographyOnLongRest,
  restoreArtificerUnerringPathOnLongRest
} from "./subclasses/artificerCartographer";
import {
  normalizeArtificerConjuredCauldronState,
  restoreArtificerConjuredCauldronOnLongRest
} from "./subclasses/artificerAlchemistChemicalMastery";
import {
  advanceArtificerArmorerFeaturesForNewRound,
  consumeArtificerArmorerWeaponAttack,
  getArtificerArmorerWeaponAttackMultiCount,
  hasArtificerArmorerExtraAttackFeature,
  normalizeArtificerArmorerState,
  restoreArtificerArmorerGiantStatureOnLongRest,
  restoreArtificerArmorerInfiltratorsFlightOnLongRest,
  restoreArtificerArmorerPerfectedArmorGuardianOnLongRest
} from "./subclasses/artificerArmorer";
import {
  normalizeArtificerArtilleristState,
  restoreArtificerEldritchCannonOnLongRest
} from "./subclasses/artificerArtillerist";
import {
  advanceArtificerBattleSmithFeaturesForNewRound,
  clearArtificerArcaneJoltForNewRound,
  consumeArtificerBattleSmithWeaponAttack,
  getArtificerBattleSmithWeaponAttackMultiCount,
  hasArtificerBattleSmithExtraAttackFeature,
  normalizeArtificerBattleSmithArcaneJoltState,
  normalizeArtificerBattleSmithState,
  restoreArtificerArcaneJoltOnLongRest
} from "./subclasses/artificerBattleSmith";
import type { ReactionEntry, SpellDescriptionEntry } from "../../../../codex/entries";
import {
  artificerSoulOfArtificeLifeAndDeathLedgerDescriptionTargetKey,
  getArtificerClassFeatureDerivedState,
  getArtificerFeatureDescriptionAdditions as getArtificerContributionDescriptionAdditions
} from "./contributions";

export {
  artificerSoulOfArtificeLifeAndDeathLedgerDescriptionTargetKey,
  getArtificerFeatureDescriptionAdditions
} from "./contributions";

export {
  addArtificerTinkersMagicItemToInventory,
  artificerTinkersMagicActionKey,
  consumeArtificerTinkersMagicUse,
  getArtificerTinkersMagicUsesRemaining,
  getArtificerTinkersMagicUsesTotal,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";

export {
  artificerFlashOfGeniusReactionEntryId,
  consumeArtificerFlashOfGeniusUse,
  hasArtificerFlashOfGeniusFullShortRestRecovery,
  hasArtificerFlashOfGeniusShortRestRecoveryFeature,
  getArtificerFlashOfGeniusUsesRemaining,
  getArtificerFlashOfGeniusUsesTotal,
  restoreArtificerFlashOfGeniusOnLongRest,
  restoreArtificerFlashOfGeniusOnShortRest
} from "./flashOfGenius";

export {
  addArtificerExperimentalElixirToInventory,
  artificerExperimentalElixirActionKey,
  getArtificerExperimentalElixirOptionsForCharacter,
  getArtificerExperimentalElixirSpellSlotOptions,
  type ArtificerExperimentalElixirOption,
  type ArtificerExperimentalElixirOptionKey,
  type ArtificerExperimentalElixirSpellSlotOption
} from "./subclasses/artificerAlchemistExperimentalElixir";

export {
  activateArtificerArmorerArcaneArmor,
  activateArtificerArmorerArcaneArmorOption,
  activateArtificerArmorerDefensiveField,
  activateArtificerArmorerGiantStature,
  activateArtificerArmorerInfiltratorsFlight,
  artificerArmorerArcaneArmorActionKey,
  artificerArmorerDefensiveFieldActionKey,
  artificerArmorerGiantStatureActionKey,
  artificerArmorerInfiltratorsFlightActionKey,
  artificerArmorerPerfectedArmorGuardianReactionEntryId,
  consumeArtificerArmorerPerfectedArmorGuardianUse,
  consumeArtificerArmorerWeaponAttack,
  getArtificerArmorerArcaneArmorTagLabelsForArmorKey,
  getArtificerArmorerGiantStatureUsesRemaining,
  getArtificerArmorerGiantStatureUsesTotal,
  getArtificerArmorerInfiltratorsFlightUsesRemaining,
  getArtificerArmorerInfiltratorsFlightUsesTotal,
  getArtificerArmorerPerfectedArmorGuardianUsesRemaining,
  getArtificerArmorerPerfectedArmorGuardianUsesTotal,
  getArtificerArmorerWeaponAttackMultiCount,
  hasArtificerArmorerExtraAttackFeature,
  hasArtificerArmorerImprovedArmorerFeature,
  hasArtificerArmorerPerfectedArmorFeature,
  restoreArtificerArmorerGiantStatureOnLongRest,
  restoreArtificerArmorerInfiltratorsFlightOnLongRest,
  restoreArtificerArmorerPerfectedArmorGuardianOnLongRest
} from "./subclasses/artificerArmorer";

export {
  artificerArcaneFirearmActionKey,
  artificerEldritchCannonActionKey,
  artificerExplosiveCannonDetonateReactionEntryId,
  createArtificerEldritchCannonForCharacter,
  detonateArtificerEldritchCannon,
  getArtificerArcaneFirearmItemOptions,
  getArtificerEldritchCannonCompanions,
  getArtificerEldritchCannonOptions,
  getArtificerEldritchCannonSpellSlotOptions,
  getArtificerEldritchCannonUsesRemaining,
  getArtificerEldritchCannonUsesTotal,
  hasActiveArtificerEldritchCannon,
  hasArtificerFortifiedPositionFeature,
  isArtificerEldritchCannonOptionKey,
  restoreArtificerEldritchCannonOnLongRest,
  setArtificerArcaneFirearmForCharacter,
  type ArtificerArcaneFirearmItemOption,
  type ArtificerEldritchCannonOptionKey,
  type ArtificerEldritchCannonSpellSlotOption
} from "./subclasses/artificerArtillerist";

export {
  artificerArcaneJoltActionKey,
  artificerSteelDefenderActionKey,
  advanceArtificerBattleSmithFeaturesForNewRound,
  clearArtificerArcaneJoltForNewRound,
  consumeArtificerArcaneJoltUse,
  consumeArtificerBattleSmithWeaponAttack,
  createArtificerSteelDefenderForCharacter,
  getArtificerArcaneJoltUsesRemaining,
  getArtificerArcaneJoltUsesTotal,
  getArtificerBattleSmithWeaponAttackMultiCount,
  getArtificerSteelDefenderSpellSlotOptions,
  hasActiveArtificerSteelDefender,
  hasArtificerBattleSmithArcaneJoltFeature,
  hasArtificerBattleSmithExtraAttackFeature,
  hasArtificerSteelDefenderFeature,
  isArtificerSteelDefenderCompanion,
  normalizeArtificerBattleSmithArcaneJoltState,
  normalizeArtificerBattleSmithState,
  restoreArtificerArcaneJoltOnLongRest,
  type ArtificerSteelDefenderSpellSlotOption
} from "./subclasses/artificerBattleSmith";

export {
  artificerAdventurersAtlasActionKey,
  artificerIlluminatedCartographyActionKey,
  artificerUnerringPathActionKey,
  consumeArtificerAdventurersAtlasMapForCharacter,
  consumeArtificerIlluminatedCartographyUse,
  consumeArtificerUnerringPathUse,
  createArtificerAdventurersAtlasMapsForCharacter,
  getArtificerAdventurersAtlasAction,
  getArtificerAdventurersAtlasInventoryMapCount,
  getArtificerAdventurersAtlasMapCount,
  getArtificerCartographerSafeHavenDescriptionAdditions,
  getArtificerCartographerPortalJumpSpeedDescriptionAdditions,
  getArtificerIlluminatedCartographyAction,
  getArtificerIlluminatedCartographyUsesRemaining,
  getArtificerIlluminatedCartographyUsesTotal,
  getArtificerUnerringPathAction,
  getArtificerUnerringPathUsesRemaining,
  getArtificerUnerringPathUsesTotal,
  hasArtificerAdventurersAtlasFeature,
  hasArtificerMappingMagicFeature,
  hasArtificerSuperiorAtlasFeature,
  normalizeArtificerIlluminatedCartographyState,
  normalizeArtificerUnerringPathState,
  restoreArtificerIlluminatedCartographyOnLongRest,
  restoreArtificerUnerringPathOnLongRest
} from "./subclasses/artificerCartographer";

export {
  artificerConjuredCauldronActionKey,
  consumeArtificerConjuredCauldronUse,
  getArtificerConjuredCauldronUsesRemaining,
  getArtificerConjuredCauldronUsesTotal,
  restoreArtificerConjuredCauldronOnLongRest
} from "./subclasses/artificerAlchemistChemicalMastery";

export {
  artificerRestorativeReagentsActionKey,
  consumeArtificerRestorativeReagentsUse,
  getArtificerRestorativeReagentsUsesRemaining,
  getArtificerRestorativeReagentsUsesTotal,
  restoreArtificerRestorativeReagentsOnLongRest
} from "./subclasses/artificerAlchemistRestorativeReagents";

export {
  addArtificerReplicateMagicItemToInventory,
  artificerReplicateMagicItemActionKey,
  getArtificerImprovedArmorerArmorReplicationPlanGroups,
  getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter,
  getArtificerReplicateMagicItemCreatablePlanKeysForCharacter,
  getArtificerReplicateMagicItemCount,
  getArtificerReplicateMagicItemLimit,
  getArtificerReplicateMagicItemPlansKnown,
  getArtificerReplicateMagicItemAvailablePlanGroups,
  getArtificerReplicateMagicItemPlanKeysForCharacter,
  isArtificerReplicateMagicItemPlanSelectionInputRequired,
  setArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter,
  setArtificerReplicateMagicItemPlanKeysForCharacter
} from "./replicateMagicItem";

export {
  artificerChargeMagicItemActionKey,
  artificerDrainMagicItemActionKey,
  artificerTransmuteMagicItemActionKey,
  chargeArtificerMagicItemForCharacter,
  drainArtificerMagicItemForCharacter,
  getArtificerMagicItemTinkerAvailableSpellSlotOptions,
  getArtificerMagicItemTinkerChargeItemOptions,
  getArtificerMagicItemTinkerDrainItemOptions,
  getArtificerMagicItemTinkerDrainUsesRemaining,
  getArtificerMagicItemTinkerDrainUsesTotal,
  getArtificerMagicItemTinkerTransmuteItemOptions,
  getArtificerMagicItemTinkerTransmuteUsesRemaining,
  getArtificerMagicItemTinkerTransmuteUsesTotal,
  restoreArtificerMagicItemTinkerDrainOnLongRest,
  restoreArtificerMagicItemTinkerTransmuteOnLongRest,
  transmuteArtificerMagicItemForCharacter,
  type MagicItemTinkerInventoryOption,
  type MagicItemTinkerSpellSlotOption
} from "./magicItemTinker";

export {
  applySoulOfArtificeCheatDeathForCharacter,
  getSoulOfArtificeCheatDeathItemOptions,
  hasArtificerSoulOfArtificeFeature,
  isArtificerSoulOfArtificeCheatDeathAvailable,
  type SoulOfArtificeCheatDeathItemOption
} from "./soulOfArtifice";

export {
  getArtificerToolsOfTheTradeAvailableToolSelectionsForCharacter,
  getArtificerToolsOfTheTradeChoiceCountForCharacter,
  getArtificerToolsOfTheTradeChoiceSelectionsForCharacter,
  getArtificerToolsOfTheTradeLockedSelectionsForCharacter,
  isArtificerToolsOfTheTradeInputRequired,
  setArtificerToolsOfTheTradeToolSelectionsForCharacter
} from "./toolsOfTheTrade";

type ArtificerRuntimeCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "cantripIds"
      | "classFeatureState"
      | "customEquipment"
      | "equipment"
      | "feats"
      | "inventoryItems"
      | "level"
      | "roundTracker"
      | "savingThrowProficiencies"
      | "skillProficiencies"
      | "spellSlotsExpended"
      | "spellbookSpellIds"
      | "statusEntries"
      | "subclassId"
      | "toolProficiencies"
    >
  >;

function getArtificerProjectedDerivedState(
  character: ArtificerRuntimeCharacter
): ClassFeatureDerivedState {
  return getArtificerClassFeatureDerivedState({
    ...character,
    level: character.level ?? 0
  } as Parameters<typeof getArtificerClassFeatureDerivedState>[0]);
}

export function normalizeArtificerFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "statusEntries" | "subclassId">>
): CharacterArtificerFeatureState {
  return {
    ...normalizeArtificerTinkersMagicState(value, character),
    ...normalizeArtificerFlashOfGeniusState(value, character),
    ...normalizeArtificerReplicateMagicItemPlanState(value, character),
    ...normalizeArtificerMagicItemTinkerState(value, character),
    ...normalizeArtificerToolsOfTheTradeState(value, character),
    ...normalizeArtificerIlluminatedCartographyState(value, character),
    ...normalizeArtificerUnerringPathState(value, character),
    ...normalizeArtificerRestorativeReagentsState(value, character),
    ...normalizeArtificerConjuredCauldronState(value, character),
    ...normalizeArtificerArtilleristState(value, character),
    ...normalizeArtificerArmorerState(value, character),
    ...normalizeArtificerBattleSmithState(value, character),
    ...normalizeArtificerBattleSmithArcaneJoltState(value, character)
  };
}

export function hasArtificerExtraAttackFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    hasArtificerArmorerExtraAttackFeature(character) ||
    hasArtificerBattleSmithExtraAttackFeature(character)
  );
}

export function getArtificerWeaponAttackMultiCount(
  character: Pick<Character, "className" | "classFeatureState" | "level"> &
    Partial<Pick<Character, "subclassId">>
): number {
  if (hasArtificerBattleSmithExtraAttackFeature(character)) {
    return getArtificerBattleSmithWeaponAttackMultiCount(character);
  }

  return getArtificerArmorerWeaponAttackMultiCount(character);
}

export function consumeArtificerWeaponAttack(character: Character): Character {
  if (hasArtificerBattleSmithExtraAttackFeature(character)) {
    return consumeArtificerBattleSmithWeaponAttack(character);
  }

  return consumeArtificerArmorerWeaponAttack(character);
}

export function getArtificerAlwaysPreparedSpellIds(character: ArtificerRuntimeCharacter): string[] {
  return getArtificerProjectedDerivedState(character).alwaysPreparedSpellIds ?? [];
}

export function getArtificerAlwaysPreparedSpellSourceMap(
  character: ArtificerRuntimeCharacter
): SpellSourceMap {
  return getArtificerProjectedDerivedState(character).alwaysPreparedSpellSources ?? {};
}

export function getArtificerFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        "abilities" | "classFeatureState" | "inventoryItems" | "level" | "statusEntries"
      >
    >
): FeatureActionCard[] {
  return getArtificerProjectedDerivedState(character).actions ?? [];
}

export function getArtificerFeatureActionOptions(
  character: ArtificerRuntimeCharacter
): Partial<Record<string, FeatureActionOptionCard[]>> {
  return getArtificerProjectedDerivedState(character).actionOptions ?? {};
}

export function getArtificerReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  return getArtificerProjectedDerivedState(character).reactionEntries ?? [];
}

export function getSoulOfArtificeLifeAndDeathDescriptionAdditions(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[][] {
  return getArtificerContributionDescriptionAdditions(
    {
      ...character,
      level: character.level ?? 0
    } as Parameters<typeof getArtificerContributionDescriptionAdditions>[0],
    "custom",
    artificerSoulOfArtificeLifeAndDeathLedgerDescriptionTargetKey
  );
}

export function applyLongRestToArtificerFeatures(character: Character): Character {
  let nextCharacter = restoreArtificerTinkersMagicOnLongRest(character);
  nextCharacter = restoreArtificerEldritchCannonOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerFlashOfGeniusOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerMagicItemTinkerDrainOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerMagicItemTinkerTransmuteOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerArcaneJoltOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerIlluminatedCartographyOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerUnerringPathOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerRestorativeReagentsOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerConjuredCauldronOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerArmorerGiantStatureOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerArmorerPerfectedArmorGuardianOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerArmorerInfiltratorsFlightOnLongRest(nextCharacter);
  nextCharacter = advanceArtificerArmorerFeaturesForNewRound(nextCharacter);
  nextCharacter = advanceArtificerBattleSmithFeaturesForNewRound(nextCharacter);
  nextCharacter = clearArtificerArcaneJoltForNewRound(nextCharacter);

  return nextCharacter;
}

export function advanceArtificerFeaturesForNewRound(character: Character): Character {
  return clearArtificerArcaneJoltForNewRound(
    advanceArtificerBattleSmithFeaturesForNewRound(
      advanceArtificerArmorerFeaturesForNewRound(character)
    )
  );
}
