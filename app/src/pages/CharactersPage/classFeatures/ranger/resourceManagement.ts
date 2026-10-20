import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource, spellSlotResource } from "../../resourceManagement";
import {
  getRangerFavoredEnemyUsesRemaining,
  getRangerFavoredEnemyUsesTotal,
  getRangerNaturesVeilUsesRemaining,
  getRangerNaturesVeilUsesTotal,
  getRangerTirelessUsesRemaining,
  getRangerTirelessUsesTotal
} from "./ranger";
import { rangerSubclassResources } from "./subclasses/resourceManagement";

export const rangerManagedResources = {
  ...rangerSubclassResources,
  favoredEnemyUsesExpended: classCounterResource(
    "ranger",
    "favoredEnemyUsesExpended",
    "Favored Enemy",
    getRangerFavoredEnemyUsesTotal,
    getRangerFavoredEnemyUsesRemaining
  ),
  tirelessUsesExpended: classCounterResource(
    "ranger",
    "tirelessUsesExpended",
    "Tireless",
    getRangerTirelessUsesTotal,
    getRangerTirelessUsesRemaining
  ),
  naturesVeilUsesExpended: classCounterResource(
    "ranger",
    "naturesVeilUsesExpended",
    "Natures Veil",
    getRangerNaturesVeilUsesTotal,
    getRangerNaturesVeilUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const rangerActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "ranger-favored-enemy": [rangerManagedResources.favoredEnemyUsesExpended],
  "ranger-tireless": [rangerManagedResources.tirelessUsesExpended],
  "ranger-natures-veil": [rangerManagedResources.naturesVeilUsesExpended],
  "ranger-winter-walker-fortifying-soul": [rangerManagedResources.fortifyingSoulUsesExpended],
  "ranger-hollow-warden-wrath-of-the-wild": [rangerManagedResources.favoredEnemyUsesExpended],
  "ranger-beast-master-revive-primal-companion": [spellSlotResource(1)]
};
