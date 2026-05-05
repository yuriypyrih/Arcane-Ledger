import { TRACKER } from "./enums";
import type { SpellEntry } from "./types";

export function getSpellTrackingState(spell: Pick<SpellEntry, "trackingState">): TRACKER {
  return spell.trackingState ?? TRACKER.NOT_TRACKED;
}
