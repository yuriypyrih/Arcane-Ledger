import { useEffect, useRef } from "react";
import { subscribeToCampaignStream, type CampaignEventHandler } from "./campaignEventStream";

export type { CampaignEventHandler, CampaignEventType } from "./campaignEventStream";

function useLatest(handler: CampaignEventHandler) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  return handlerRef;
}

/**
 * Subscribes to a campaign's server-sent events on the tab's shared stream. Events are hints:
 * `onChange` should refetch authoritative state. It also fires after every (re)connect so missed
 * events are recovered.
 */
export function useCampaignEvents(campaignIds: string[], onChange: CampaignEventHandler) {
  const handlerRef = useLatest(onChange);
  const campaignKey = [...new Set(campaignIds)].sort().join(",");

  useEffect(() => {
    if (!campaignKey) {
      return undefined;
    }

    return subscribeToCampaignStream(
      { campaignIds: campaignKey.split(",") },
      (type, id, revision) => handlerRef.current(type, id, revision)
    );
  }, [campaignKey, handlerRef]);
}

/** Same, scoped to every campaign that uses the party; for players who only know their party. */
export function usePartyEvents(partyGroupId: string | null, onChange: CampaignEventHandler) {
  const handlerRef = useLatest(onChange);

  useEffect(() => {
    if (!partyGroupId) {
      return undefined;
    }

    return subscribeToCampaignStream({ partyGroupIds: [partyGroupId] }, (type, id, revision) =>
      handlerRef.current(type, id, revision)
    );
  }, [handlerRef, partyGroupId]);
}
