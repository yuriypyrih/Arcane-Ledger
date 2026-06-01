import { WEAPON_PROFICIENCY } from "../../../../../types";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import {
  createArtificerWeaponProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";
import {
  getArtificerArcaneJoltAction,
  transformArtificerBattleSmithArcaneJoltWeaponAction
} from "./artificerBattleSmithArcaneJolt";
import { transformArtificerBattleSmithBattleReadyWeaponAction } from "./artificerBattleSmithBattleReady";
import { getArtificerSteelDefenderAction } from "./artificerBattleSmithSteelDefender";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";

export const battleSmithSubclassId = "artificer-battle-smith";

export {
  artificerArcaneJoltActionKey,
  clearArtificerArcaneJoltForNewRound,
  consumeArtificerArcaneJoltUse,
  getArtificerArcaneJoltUsesRemaining,
  getArtificerArcaneJoltUsesTotal,
  getArtificerBattleSmithArcaneJoltSpecialAbility,
  hasArtificerBattleSmithArcaneJoltFeature,
  normalizeArtificerBattleSmithArcaneJoltState,
  restoreArtificerArcaneJoltOnLongRest
} from "./artificerBattleSmithArcaneJolt";

export {
  artificerSteelDefenderActionKey,
  createArtificerSteelDefenderForCharacter,
  getArtificerSteelDefenderSpellSlotOptions,
  hasActiveArtificerSteelDefender,
  hasArtificerSteelDefenderFeature,
  isArtificerSteelDefenderCompanion,
  type ArtificerSteelDefenderSpellSlotOption
} from "./artificerBattleSmithSteelDefender";

export {
  advanceArtificerBattleSmithFeaturesForNewRound,
  consumeArtificerBattleSmithWeaponAttack,
  getArtificerBattleSmithWeaponAttackMultiCount,
  hasArtificerBattleSmithExtraAttackFeature,
  normalizeArtificerBattleSmithState
} from "./artificerBattleSmithExtraAttack";

const battleSmithSpellIdsByLevel = {
  3: ["spell-heroism", "spell-shield"],
  5: ["spell-shining-smite", "spell-warding-bond"],
  9: ["spell-aura-of-vitality", "spell-conjure-barrage"],
  13: ["spell-aura-of-purity", "spell-fire-shield"],
  17: ["spell-banishing-smite", "spell-mass-cure-wounds"]
} as const;

const battleSmithBattleReadySource = "Battle Smith: Battle Ready";

export const getArtificerBattleSmithDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasArtificerSubclassFeature(character, battleSmithSubclassId, 3)) {
    return {};
  }

  const steelDefenderAction = getArtificerSteelDefenderAction(character);
  const arcaneJoltAction = getArtificerArcaneJoltAction(character);

  return {
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      battleSmithSpellIdsByLevel
    ),
    weaponProficiencyEntries: createArtificerWeaponProficiencyEntries(
      [WEAPON_PROFICIENCY.MARTIAL],
      battleSmithBattleReadySource
    ),
    toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character),
    featureActions: [steelDefenderAction, arcaneJoltAction].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    transformWeaponAction: (action) => {
      const battleReadyAction = transformArtificerBattleSmithBattleReadyWeaponAction(
        character,
        action
      );

      return transformArtificerBattleSmithArcaneJoltWeaponAction(character, battleReadyAction);
    }
  };
};
