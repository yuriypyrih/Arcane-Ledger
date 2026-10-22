import { classCounterResource } from "../../../resourceManagement";
import {
  getRangerFeyWandererFeyReinforcementsUsesRemaining,
  getRangerFeyWandererFeyReinforcementsUsesTotal,
  getRangerFeyWandererMistyWandererUsesRemaining,
  getRangerFeyWandererMistyWandererUsesTotal
} from "./rangerFeyWanderer";
import {
  getRangerGloomStalkerDreadAmbusherUsesRemaining,
  getRangerGloomStalkerDreadAmbusherUsesTotal
} from "./rangerGloomStalker";
import {
  getRangerWinterWalkerFortifyingSoulUsesRemaining,
  getRangerWinterWalkerFortifyingSoulUsesTotal,
  getRangerWinterWalkerFrozenHauntUsesRemaining,
  getRangerWinterWalkerFrozenHauntUsesTotal
} from "./rangerWinterWalker";

export const rangerSubclassResources = {
  feyReinforcementsUsesExpended: classCounterResource(
    "ranger",
    "feyReinforcementsUsesExpended",
    "Fey Reinforcements",
    getRangerFeyWandererFeyReinforcementsUsesTotal,
    getRangerFeyWandererFeyReinforcementsUsesRemaining
  ),
  mistyWandererUsesExpended: classCounterResource(
    "ranger",
    "mistyWandererUsesExpended",
    "Misty Wanderer",
    getRangerFeyWandererMistyWandererUsesTotal,
    getRangerFeyWandererMistyWandererUsesRemaining
  ),
  dreadAmbusherUsesExpended: classCounterResource(
    "ranger",
    "dreadAmbusherUsesExpended",
    "Dread Ambusher",
    getRangerGloomStalkerDreadAmbusherUsesTotal,
    getRangerGloomStalkerDreadAmbusherUsesRemaining
  ),
  fortifyingSoulUsesExpended: classCounterResource(
    "ranger",
    "fortifyingSoulUsesExpended",
    "Fortifying Soul",
    getRangerWinterWalkerFortifyingSoulUsesTotal,
    getRangerWinterWalkerFortifyingSoulUsesRemaining
  ),
  frozenHauntUsesExpended: classCounterResource(
    "ranger",
    "frozenHauntUsesExpended",
    "Frozen Haunt",
    getRangerWinterWalkerFrozenHauntUsesTotal,
    getRangerWinterWalkerFrozenHauntUsesRemaining
  )
};
