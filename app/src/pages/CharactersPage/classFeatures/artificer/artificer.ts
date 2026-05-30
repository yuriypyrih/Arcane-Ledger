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
  getArtificerReplicateMagicItemCount,
  getArtificerReplicateMagicItemLimit,
  getArtificerReplicateMagicItemPlansKnown,
  getArtificerReplicateMagicItemAvailablePlanGroups,
  getArtificerReplicateMagicItemPlanKeysForCharacter,
  isArtificerReplicateMagicItemPlanSelectionInputRequired,
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
    ...normalizeArtificerConjuredCauldronState(value, character)
  };
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
  return restoreArtificerConjuredCauldronOnLongRest(
    restoreArtificerRestorativeReagentsOnLongRest(
      restoreArtificerMagicItemTinkerTransmuteOnLongRest(
        restoreArtificerMagicItemTinkerDrainOnLongRest(
          restoreArtificerFlashOfGeniusOnLongRest(restoreArtificerTinkersMagicOnLongRest(character))
        )
      )
    )
  );
}
