import { classCounterResource } from "../../../resourceManagement";
import {
  getSorcererAberrantWarpingImplosionUsesRemaining,
  getSorcererAberrantWarpingImplosionUsesTotal
} from "./sorcererAberrantSorcery";
import {
  getSorcererClockworkCavalcadeUsesRemaining,
  getSorcererClockworkCavalcadeUsesTotal,
  getSorcererClockworkTranceOfOrderUsesRemaining,
  getSorcererClockworkTranceOfOrderUsesTotal
} from "./sorcererClockworkSorcery";
import {
  getSorcererDraconicDragonCompanionUsesRemaining,
  getSorcererDraconicDragonCompanionUsesTotal,
  getSorcererDraconicDragonWingsUsesRemaining,
  getSorcererDraconicDragonWingsUsesTotal
} from "./sorcererDraconicSorcery";
import {
  getSorcererWildMagicTamedSurgeUsesRemaining,
  getSorcererWildMagicTamedSurgeUsesTotal,
  getSorcererWildMagicTidesOfChaosUsesRemaining,
  getSorcererWildMagicTidesOfChaosUsesTotal
} from "./sorcererWildMagicSorcery";

export const sorcererSubclassResources = {
  warpingImplosionUsesExpended: classCounterResource(
    "sorcerer",
    "warpingImplosionUsesExpended",
    "Warping Implosion",
    getSorcererAberrantWarpingImplosionUsesTotal,
    getSorcererAberrantWarpingImplosionUsesRemaining
  ),
  dragonCompanionUsesExpended: classCounterResource(
    "sorcerer",
    "dragonCompanionUsesExpended",
    "Dragon Companion",
    getSorcererDraconicDragonCompanionUsesTotal,
    getSorcererDraconicDragonCompanionUsesRemaining
  ),
  tamedSurgeUsesExpended: classCounterResource(
    "sorcerer",
    "tamedSurgeUsesExpended",
    "Tamed Surge",
    getSorcererWildMagicTamedSurgeUsesTotal,
    getSorcererWildMagicTamedSurgeUsesRemaining
  ),
  dragonWingsUsesExpended: classCounterResource(
    "sorcerer",
    "dragonWingsUsesExpended",
    "Dragon Wings",
    getSorcererDraconicDragonWingsUsesTotal,
    getSorcererDraconicDragonWingsUsesRemaining
  ),
  tranceOfOrderUsesExpended: classCounterResource(
    "sorcerer",
    "tranceOfOrderUsesExpended",
    "Trance of Order",
    getSorcererClockworkTranceOfOrderUsesTotal,
    getSorcererClockworkTranceOfOrderUsesRemaining
  ),
  clockworkCavalcadeUsesExpended: classCounterResource(
    "sorcerer",
    "clockworkCavalcadeUsesExpended",
    "Clockwork Cavalcade",
    getSorcererClockworkCavalcadeUsesTotal,
    getSorcererClockworkCavalcadeUsesRemaining
  ),
  tidesOfChaosUsesExpended: classCounterResource(
    "sorcerer",
    "tidesOfChaosUsesExpended",
    "Tides of Chaos",
    getSorcererWildMagicTidesOfChaosUsesTotal,
    getSorcererWildMagicTidesOfChaosUsesRemaining
  )
};
