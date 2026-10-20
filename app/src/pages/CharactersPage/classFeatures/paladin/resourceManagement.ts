import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource, spellSlotResource } from "../../resourceManagement";
import { paladinChannelDivinityResource } from "../channelDivinityResource";
import {
  getFaithfulSteedUsesRemaining,
  getFaithfulSteedUsesTotal,
  getPaladinHealingPoolRemaining,
  getPaladinHealingPoolTotal,
  getPaladinsSmiteUsesRemaining,
  getPaladinsSmiteUsesTotal
} from "./paladin";
import { paladinSubclassResources } from "./subclasses/resourceManagement";

export const paladinManagedResources = {
  ...paladinSubclassResources,
  channelDivinityUsesExpended: paladinChannelDivinityResource,
  paladinsSmiteUsesExpended: classCounterResource(
    "paladin",
    "paladinsSmiteUsesExpended",
    "Paladin's Smite",
    getPaladinsSmiteUsesTotal,
    getPaladinsSmiteUsesRemaining
  ),
  faithfulSteedUsesExpended: classCounterResource(
    "paladin",
    "faithfulSteedUsesExpended",
    "Faithful Steed",
    getFaithfulSteedUsesTotal,
    getFaithfulSteedUsesRemaining
  ),
  layOnHandsExpended: classCounterResource(
    "paladin",
    "layOnHandsExpended",
    "Lay on Hands",
    getPaladinHealingPoolTotal,
    getPaladinHealingPoolRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const paladinActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "paladin-channel-divinity": [paladinManagedResources.channelDivinityUsesExpended],
  "paladin-lay-on-hands": [paladinManagedResources.layOnHandsExpended],
  "paladin-paladins-smite": [paladinManagedResources.paladinsSmiteUsesExpended],
  "paladin-faithful-steed": [paladinManagedResources.faithfulSteedUsesExpended],
  "paladin-abjure-foes": [paladinManagedResources.channelDivinityUsesExpended],
  "paladin-peerless-athlete": [paladinManagedResources.channelDivinityUsesExpended],
  "paladin-natures-wrath": [paladinManagedResources.channelDivinityUsesExpended],
  "paladin-holy-nimbus": [paladinManagedResources.holyNimbusUsesExpended, spellSlotResource(5, 5)],
  "paladin-living-legend": [
    paladinManagedResources.livingLegendUsesExpended,
    spellSlotResource(5, 5)
  ],
  "paladin-elder-champion": [
    paladinManagedResources.elderChampionUsesExpended,
    spellSlotResource(5, 5)
  ],
  "paladin-noble-scion": [paladinManagedResources.nobleScionUsesExpended, spellSlotResource(5, 5)],
  "paladin-avenging-angel": [
    paladinManagedResources.avengingAngelUsesExpended,
    spellSlotResource(5, 5)
  ]
};
