import { CLASS_FEATURE } from "../../../../../codex/entries";
import { WEAPON_PROFICIENCY } from "../../../../../types";
import type { Character } from "../../../../../types";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { WeaponAction } from "../../../gameplay";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
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

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

export function collectArtificerBattleSmithContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasArtificerSubclassFeature(character, battleSmithSubclassId, 3)) {
    return [];
  }

  const steelDefenderAction = getArtificerSteelDefenderAction(character);
  const arcaneJoltAction = getArtificerArcaneJoltAction(character);

  return [
    {
      source: createSubclassContributionSource({
        id: `${battleSmithSubclassId}-tools-of-the-trade`,
        label: "Tools of the Trade",
        entryId: CLASS_FEATURE.TOOLS_OF_THE_TRADE
      }),
      toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${battleSmithSubclassId}-battle-smith-spells`,
        label: "Battle Smith Spells",
        entryId: CLASS_FEATURE.BATTLE_SMITH_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        battleSmithSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: `${battleSmithSubclassId}-battle-ready`,
        label: "Battle Ready",
        entryId: CLASS_FEATURE.BATTLE_READY
      }),
      weaponProficiencyEntries: createArtificerWeaponProficiencyEntries(
        [WEAPON_PROFICIENCY.MARTIAL],
        battleSmithBattleReadySource
      ),
      weaponActionTransforms: [
        {
          id: "artificer-battle-smith-battle-ready-weapon-action",
          transform: (_runtimeCharacter, action) =>
            transformArtificerBattleSmithBattleReadyWeaponAction(
              character,
              action as WeaponAction
            )
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${battleSmithSubclassId}-steel-defender`,
        label: "Steel Defender",
        entryId: CLASS_FEATURE.STEEL_DEFENDER
      }),
      actions: compactActions([steelDefenderAction])
    },
    {
      source: createSubclassContributionSource({
        id: `${battleSmithSubclassId}-arcane-jolt`,
        label: "Arcane Jolt",
        entryId: CLASS_FEATURE.ARCANE_JOLT
      }),
      actions: compactActions([arcaneJoltAction]),
      weaponActionTransforms: [
        {
          id: "artificer-battle-smith-arcane-jolt-weapon-action",
          transform: (_runtimeCharacter, action) =>
            transformArtificerBattleSmithArcaneJoltWeaponAction(
              character,
              action as WeaponAction
            )
        }
      ]
    }
  ];
}

export const getArtificerBattleSmithDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  return projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectArtificerBattleSmithContributions(character)),
    {
      character: character as Character
    }
  );
};
