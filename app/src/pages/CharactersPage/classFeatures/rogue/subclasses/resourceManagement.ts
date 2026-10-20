import { classCounterResource } from "../../../resourceManagement";
import { getPhantomGhostWalkUsesRemaining, hasPhantomGhostWalk } from "./roguePhantomGhostWalk";
import {
  getPhantomVoiceOfDeathUsesRemaining,
  hasPhantomVoiceOfDeath
} from "./roguePhantomVoiceOfDeath";
import {
  getRogueSoulknifePsychicVeilUsesRemaining,
  getRogueSoulknifePsychicVeilUsesTotal,
  getRogueSoulknifePsychicWhispersUsesRemaining,
  getRogueSoulknifePsychicWhispersUsesTotal
} from "./rogueSoulknife";

export const rogueSubclassResources = {
  soulknifePsychicWhispersUsesExpended: classCounterResource(
    "rogue",
    "soulknifePsychicWhispersUsesExpended",
    "Soulknife Psychic Whispers",
    getRogueSoulknifePsychicWhispersUsesTotal,
    getRogueSoulknifePsychicWhispersUsesRemaining
  ),
  soulknifePsychicVeilUsesExpended: classCounterResource(
    "rogue",
    "soulknifePsychicVeilUsesExpended",
    "Soulknife Psychic Veil",
    getRogueSoulknifePsychicVeilUsesTotal,
    getRogueSoulknifePsychicVeilUsesRemaining
  ),
  phantomGhostWalkUsesExpended: classCounterResource(
    "rogue",
    "phantomGhostWalkUsesExpended",
    "Phantom Ghost Walk",
    (character) => Number(hasPhantomGhostWalk(character)),
    getPhantomGhostWalkUsesRemaining
  ),
  phantomVoiceOfDeathUsesExpended: classCounterResource(
    "rogue",
    "phantomVoiceOfDeathUsesExpended",
    "Phantom Voice of Death",
    (character) => Number(hasPhantomVoiceOfDeath(character)),
    getPhantomVoiceOfDeathUsesRemaining
  )
};
