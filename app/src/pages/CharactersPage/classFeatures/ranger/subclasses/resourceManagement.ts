import { classCounterResource } from "../../../resourceManagement";
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
