import { WEAPON_PROFICIENCY } from "../../../../../types";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
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

export const getArtificerArtilleristDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasArtificerSubclassFeature(character, artilleristSubclassId, 3)) {
    return {};
  }

  const eldritchCannonAction = getArtificerEldritchCannonAction(character);
  const arcaneFirearmAction = getArtificerArcaneFirearmAction(character);
  const artilleristSpellIds = getPreparedSpellIdsByLevel(
    character.level ?? 0,
    artilleristSpellIdsByLevel
  );

  return {
    alwaysPreparedSpellIds: artilleristSpellIds,
    weaponProficiencyEntries: createArtificerWeaponProficiencyEntries(
      [WEAPON_PROFICIENCY.MARTIAL_RANGED],
      artilleristToolsSource
    ),
    toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character),
    featureActions: [eldritchCannonAction, arcaneFirearmAction].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    featureActionOptions: {
      [artificerEldritchCannonActionKey]: getArtificerEldritchCannonOptions()
    },
    reactionEntries: getArtificerExplosiveCannonReactionEntries(character),
    getSpellDamageBonuses: (context) =>
      getArtificerArcaneFirearmSpellDamageBonuses(character, context, artilleristSpellIds)
  };
};
