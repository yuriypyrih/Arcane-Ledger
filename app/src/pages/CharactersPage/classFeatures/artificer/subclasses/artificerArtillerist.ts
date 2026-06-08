import { CLASS_FEATURE } from "../../../../../codex/entries";
import { WEAPON_PROFICIENCY } from "../../../../../types";
import type { Character } from "../../../../../types";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import {
  artificerEldritchCannonActionKey,
  artilleristSubclassId,
  getArtificerEldritchCannonAction,
  getArtificerEldritchCannonOptions,
  getArtificerExplosiveCannonReactionEntries
} from "./artificerArtilleristEldritchCannon";
import {
  getArtificerArcaneFirearmAction,
  getArtificerArcaneFirearmSpellDamageBonuses
} from "./artificerArtilleristArcaneFirearm";
import {
  createArtificerWeaponProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";

export {
  artificerArcaneFirearmActionKey,
  getArtificerArcaneFirearmItemOptions,
  hasActiveArtificerArcaneFirearm,
  hasArtificerArcaneFirearmFeature,
  setArtificerArcaneFirearmForCharacter,
  type ArtificerArcaneFirearmItemOption
} from "./artificerArtilleristArcaneFirearm";

export {
  artificerEldritchCannonActionKey,
  artificerExplosiveCannonDetonateReactionEntryId,
  artilleristSubclassId,
  createArtificerEldritchCannonForCharacter,
  detonateArtificerEldritchCannon,
  getArtificerEldritchCannonCompanions,
  getArtificerExplosiveCannonReactionEntries,
  getArtificerEldritchCannonOptions,
  getArtificerEldritchCannonSpellSlotOptions,
  getArtificerEldritchCannonUsesRemaining,
  getArtificerEldritchCannonUsesTotal,
  hasActiveArtificerEldritchCannon,
  hasArtificerEldritchCannonFeature,
  hasArtificerExplosiveCannonFeature,
  hasArtificerFortifiedPositionFeature,
  isArtificerEldritchCannonCompanion,
  isArtificerEldritchCannonOptionKey,
  normalizeArtificerArtilleristState,
  restoreArtificerEldritchCannonOnLongRest,
  type ArtificerEldritchCannonOptionKey,
  type ArtificerEldritchCannonSpellSlotOption
} from "./artificerArtilleristEldritchCannon";

const artilleristSpellIdsByLevel = {
  3: ["spell-shield", "spell-thunderwave"],
  5: ["spell-scorching-ray", "spell-shatter"],
  9: ["spell-fireball", "spell-wind-wall"],
  13: ["spell-ice-storm", "spell-wall-of-fire"],
  17: ["spell-cone-of-cold", "spell-wall-of-force"]
} as const;

const artilleristToolsSource = "Artillerist: Tools of the Trade";

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

export function collectArtificerArtilleristContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasArtificerSubclassFeature(character, artilleristSubclassId, 3)) {
    return [];
  }

  const eldritchCannonAction = getArtificerEldritchCannonAction(character);
  const arcaneFirearmAction = getArtificerArcaneFirearmAction(character);
  const artilleristSpellIds = getPreparedSpellIdsByLevel(
    character.level ?? 0,
    artilleristSpellIdsByLevel
  );

  return [
    {
      source: createSubclassContributionSource({
        id: `${artilleristSubclassId}-tools-of-the-trade`,
        label: "Tools of the Trade",
        entryId: CLASS_FEATURE.TOOLS_OF_THE_TRADE
      }),
      weaponProficiencyEntries: createArtificerWeaponProficiencyEntries(
        [WEAPON_PROFICIENCY.MARTIAL_RANGED],
        artilleristToolsSource
      ),
      toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${artilleristSubclassId}-artillerist-spells`,
        label: "Artillerist Spells",
        entryId: CLASS_FEATURE.ARTILLERIST_SPELLS
      }),
      alwaysPreparedSpellIds: artilleristSpellIds
    },
    {
      source: createSubclassContributionSource({
        id: `${artilleristSubclassId}-eldritch-cannon`,
        label: "Eldritch Cannon",
        entryId: CLASS_FEATURE.ELDRITCH_CANNON
      }),
      actions: compactActions([eldritchCannonAction]),
      actionOptions: {
        [artificerEldritchCannonActionKey]: getArtificerEldritchCannonOptions()
      }
    },
    {
      source: createSubclassContributionSource({
        id: `${artilleristSubclassId}-arcane-firearm`,
        label: "Arcane Firearm",
        entryId: CLASS_FEATURE.ARCANE_FIREARM
      }),
      actions: compactActions([arcaneFirearmAction]),
      spellDamageBonuses: [
        {
          id: "artificer-artillerist-arcane-firearm-spell-damage",
          getBonuses: (context) =>
            getArtificerArcaneFirearmSpellDamageBonuses(character, context, artilleristSpellIds)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${artilleristSubclassId}-explosive-cannon`,
        label: "Explosive Cannon",
        entryId: CLASS_FEATURE.EXPLOSIVE_CANNON
      }),
      reactions: getArtificerExplosiveCannonReactionEntries(character)
    }
  ];
}

export const getArtificerArtilleristDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  return projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectArtificerArtilleristContributions(character)),
    {
      character: character as Character
    }
  );
};
