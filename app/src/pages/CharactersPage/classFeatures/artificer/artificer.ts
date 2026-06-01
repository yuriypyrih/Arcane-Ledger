import type { Character, CharacterArtificerFeatureState } from "../../../../types";
import type { FeatureActionCard, SpellSourceMap } from "../types";
import {
  getArtificerTinkersMagicAction,
  hasArtificerTinkersMagicFeature,
  normalizeArtificerTinkersMagicState,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";
import {
  getArtificerFlashOfGeniusReactionEntries,
  normalizeArtificerFlashOfGeniusState,
  restoreArtificerFlashOfGeniusOnLongRest
} from "./flashOfGenius";
import {
  getArtificerReplicateMagicItemAction,
  normalizeArtificerReplicateMagicItemPlanState
} from "./replicateMagicItem";
import {
  getArtificerMagicItemTinkerActions,
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
import type { ReactionEntry } from "../../../../codex/entries";

export {
  addArtificerTinkersMagicItemToInventory,
  artificerTinkersMagicActionKey,
  consumeArtificerTinkersMagicUse,
  getArtificerFeatureActionOptions,
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
  createArtificerAdventurersAtlasMapsForCharacter,
  getArtificerAdventurersAtlasAction,
  getArtificerAdventurersAtlasMapCount,
  hasArtificerAdventurersAtlasFeature
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
  getSoulOfArtificeLifeAndDeathDescriptionAdditions,
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

const mendingSpellId = "spell-mending";
const tinkersMagicSource = "Tinker's Magic";

type ArtificerRuntimeCharacter = Pick<Character, "className"> & Partial<Pick<Character, "level">>;

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
  return hasArtificerTinkersMagicFeature(character) ? [mendingSpellId] : [];
}

export function getArtificerAlwaysPreparedSpellSourceMap(
  character: ArtificerRuntimeCharacter
): SpellSourceMap {
  return hasArtificerTinkersMagicFeature(character)
    ? {
        [mendingSpellId]: [tinkersMagicSource]
      }
    : {};
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
  return [
    getArtificerTinkersMagicAction(character),
    getArtificerReplicateMagicItemAction(character),
    ...getArtificerMagicItemTinkerActions(character)
  ].filter((action): action is FeatureActionCard => Boolean(action));
}

export function getArtificerReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  return getArtificerFlashOfGeniusReactionEntries(character);
}

export function applyLongRestToArtificerFeatures(character: Character): Character {
  let nextCharacter = restoreArtificerTinkersMagicOnLongRest(character);
  nextCharacter = restoreArtificerEldritchCannonOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerFlashOfGeniusOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerMagicItemTinkerDrainOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerMagicItemTinkerTransmuteOnLongRest(nextCharacter);
  nextCharacter = restoreArtificerArcaneJoltOnLongRest(nextCharacter);
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
