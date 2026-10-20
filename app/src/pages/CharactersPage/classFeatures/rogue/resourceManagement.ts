import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource } from "../../resourceManagement";
import { getRogueStrokeOfLuckUsesRemaining, getRogueStrokeOfLuckUsesTotal } from "./rogue";
import { rogueSubclassResources } from "./subclasses/resourceManagement";

export const rogueManagedResources = {
  ...rogueSubclassResources,
  strokeOfLuckUsesExpended: classCounterResource(
    "rogue",
    "strokeOfLuckUsesExpended",
    "Stroke of Luck",
    getRogueStrokeOfLuckUsesTotal,
    getRogueStrokeOfLuckUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const rogueActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "rogue-stroke-of-luck": [rogueManagedResources.strokeOfLuckUsesExpended],
  "rogue-phantom-ghost-walk": [
    rogueManagedResources.phantomGhostWalkUsesExpended,
    namedResources["soul-trinkets"]
  ],
  "rogue-phantom-voice-of-death": [rogueManagedResources.phantomVoiceOfDeathUsesExpended],
  "rogue-soulknife-psychic-whispers": [
    rogueManagedResources.soulknifePsychicWhispersUsesExpended,
    namedResources["psionic-dice"]
  ],
  "rogue-soulknife-psychic-teleportation": [namedResources["psionic-dice"]],
  "rogue-soulknife-psychic-veil": [
    rogueManagedResources.soulknifePsychicVeilUsesExpended,
    namedResources["psionic-dice"]
  ]
};
