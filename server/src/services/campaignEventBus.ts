import { EventEmitter } from "node:events";

export type CampaignEvent =
  | { type: "game-session.updated"; campaignId: string; gameSessionId: string; revision: number }
  | { type: "game-session.started"; campaignId: string; gameSessionId: string; revision: number }
  | { type: "game-session.ended"; campaignId: string; gameSessionId: string; revision: number }
  | { type: "live-encounter.updated"; campaignId: string; revision: number }
  // A party member's sheet (HP, AC, ...) or an encounter creature changed: clients refetch the tracker.
  | { type: "party-member.updated"; campaignId: string }
  | { type: "encounter-creature.updated"; campaignId: string };

// In-process bus: sufficient for a single server instance. Events are hints;
// clients refetch authoritative state over REST.
const bus = new EventEmitter();
bus.setMaxListeners(0);

export function publishCampaignEvent(event: CampaignEvent) {
  bus.emit(event.campaignId, event);
}

export function subscribeToCampaignEvents(
  campaignId: string,
  listener: (event: CampaignEvent) => void
) {
  bus.on(campaignId, listener);

  return () => {
    bus.off(campaignId, listener);
  };
}
