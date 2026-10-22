import { classCounterResource } from "../../../resourceManagement";
import {
  getArtificerJoltToLifeUsesRemaining,
  getArtificerJoltToLifeUsesTotal
} from "./artificerReanimatorSkillSet";
import {
  getArtificerConjuredCauldronUsesRemaining,
  getArtificerConjuredCauldronUsesTotal
} from "./artificerAlchemistChemicalMastery";
import {
  getArtificerRestorativeReagentsUsesRemaining,
  getArtificerRestorativeReagentsUsesTotal
} from "./artificerAlchemistRestorativeReagents";
import {
  getArtificerArmorerGiantStatureUsesRemaining,
  getArtificerArmorerGiantStatureUsesTotal,
  getArtificerArmorerInfiltratorsFlightUsesRemaining,
  getArtificerArmorerInfiltratorsFlightUsesTotal
} from "./artificerArmorer";
import {
  getArtificerEldritchCannonUsesRemaining,
  getArtificerEldritchCannonUsesTotal
} from "./artificerArtilleristEldritchCannon";
import {
  getArtificerArcaneJoltUsesRemaining,
  getArtificerArcaneJoltUsesTotal
} from "./artificerBattleSmithArcaneJolt";
import {
  getArtificerIlluminatedCartographyUsesRemaining,
  getArtificerIlluminatedCartographyUsesTotal,
  getArtificerUnerringPathUsesRemaining,
  getArtificerUnerringPathUsesTotal
} from "./artificerCartographer";
import {
  getArtificerReanimatedCompanionUsesRemaining,
  getArtificerReanimatedCompanionUsesTotal
} from "./artificerReanimatorCompanion";
import {
  getArtificerFacilitatedRevivalUsesRemaining,
  getArtificerFacilitatedRevivalUsesTotal
} from "./artificerReanimatorRefinedReanimation";

export const artificerSubclassResources = {
  reanimatorJoltToLifeUsesExpended: classCounterResource(
    "artificer",
    "reanimatorJoltToLifeUsesExpended",
    "Jolt to Life",
    getArtificerJoltToLifeUsesTotal,
    getArtificerJoltToLifeUsesRemaining
  ),
  conjuredCauldronUsesExpended: classCounterResource(
    "artificer",
    "conjuredCauldronUsesExpended",
    "Conjured Cauldron",
    getArtificerConjuredCauldronUsesTotal,
    getArtificerConjuredCauldronUsesRemaining
  ),
  restorativeReagentsUsesExpended: classCounterResource(
    "artificer",
    "restorativeReagentsUsesExpended",
    "Restorative Reagents",
    getArtificerRestorativeReagentsUsesTotal,
    getArtificerRestorativeReagentsUsesRemaining
  ),
  armorerGiantStatureUsesExpended: classCounterResource(
    "artificer",
    "armorerGiantStatureUsesExpended",
    "Armorer Giant Stature",
    getArtificerArmorerGiantStatureUsesTotal,
    getArtificerArmorerGiantStatureUsesRemaining
  ),
  armorerInfiltratorsFlightUsesExpended: classCounterResource(
    "artificer",
    "armorerInfiltratorsFlightUsesExpended",
    "Armorer Infiltrators Flight",
    getArtificerArmorerInfiltratorsFlightUsesTotal,
    getArtificerArmorerInfiltratorsFlightUsesRemaining
  ),
  artilleristEldritchCannonUsesExpended: classCounterResource(
    "artificer",
    "artilleristEldritchCannonUsesExpended",
    "Artillerist Eldritch Cannon",
    getArtificerEldritchCannonUsesTotal,
    getArtificerEldritchCannonUsesRemaining
  ),
  battleSmithArcaneJoltUsesExpended: classCounterResource(
    "artificer",
    "battleSmithArcaneJoltUsesExpended",
    "Battle Smith Arcane Jolt",
    getArtificerArcaneJoltUsesTotal,
    getArtificerArcaneJoltUsesRemaining
  ),
  illuminatedCartographyUsesExpended: classCounterResource(
    "artificer",
    "illuminatedCartographyUsesExpended",
    "Illuminated Cartography",
    getArtificerIlluminatedCartographyUsesTotal,
    getArtificerIlluminatedCartographyUsesRemaining
  ),
  unerringPathUsesExpended: classCounterResource(
    "artificer",
    "unerringPathUsesExpended",
    "Unerring Path",
    getArtificerUnerringPathUsesTotal,
    getArtificerUnerringPathUsesRemaining
  ),
  reanimatorCompanionUsesExpended: classCounterResource(
    "artificer",
    "reanimatorCompanionUsesExpended",
    "Reanimator Companion",
    getArtificerReanimatedCompanionUsesTotal,
    getArtificerReanimatedCompanionUsesRemaining
  ),
  facilitatedRevivalUsesExpended: classCounterResource(
    "artificer",
    "facilitatedRevivalUsesExpended",
    "Facilitated Revival",
    getArtificerFacilitatedRevivalUsesTotal,
    getArtificerFacilitatedRevivalUsesRemaining
  )
};
