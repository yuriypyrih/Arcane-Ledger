import { getApiBaseUrl } from "../api/baseUrl";

export type CampaignEventType =
  | "game-session.updated"
  | "game-session.started"
  | "game-session.ended"
  | "live-encounter.updated"
  | "party-member.updated"
  | "encounter-creature.updated";

export type CampaignEventHandler = (
  type: CampaignEventType | "connected",
  campaignId: string,
  revision?: number
) => void;

const CAMPAIGN_EVENT_TYPES: CampaignEventType[] = [
  "game-session.updated",
  "game-session.started",
  "game-session.ended",
  "live-encounter.updated",
  "party-member.updated",
  "encounter-creature.updated"
];

const STREAM_RETRY_MS = 10_000;

type Subscription = {
  campaignIds: Set<string>;
  handler: CampaignEventHandler;
  partyGroupIds: Set<string>;
};

type StreamEventData = { campaignId?: unknown; partyGroupIds?: unknown; revision?: unknown };

// One EventSource per browser tab, shared by every component that wants live updates. Browsers cap
// connections per site, so separate streams per component would starve ordinary requests.
const subscriptions = new Set<Subscription>();
let source: EventSource | null = null;
let activeKey = "";
let isReconcileScheduled = false;

function readData(event: Event): StreamEventData {
  try {
    return JSON.parse((event as MessageEvent<string>).data) as StreamEventData;
  } catch {
    return {};
  }
}

function dispatch(type: CampaignEventType, event: Event) {
  const data = readData(event);
  const campaignId = typeof data.campaignId === "string" ? data.campaignId : "";
  const partyGroupIds = Array.isArray(data.partyGroupIds) ? (data.partyGroupIds as string[]) : [];
  const revision = typeof data.revision === "number" ? data.revision : undefined;

  subscriptions.forEach((subscription) => {
    const matches =
      subscription.campaignIds.has(campaignId) ||
      partyGroupIds.some((partyGroupId) => subscription.partyGroupIds.has(partyGroupId));

    if (matches) {
      subscription.handler(type, campaignId, revision);
    }
  });
}

function closeSource() {
  source?.close();
  source = null;
  activeKey = "";
}

function reconcile() {
  isReconcileScheduled = false;

  const campaignIds = new Set<string>();
  const partyGroupIds = new Set<string>();

  subscriptions.forEach((subscription) => {
    subscription.campaignIds.forEach((id) => campaignIds.add(id));
    subscription.partyGroupIds.forEach((id) => partyGroupIds.add(id));
  });

  const campaigns = [...campaignIds].sort();
  const parties = [...partyGroupIds].sort();
  const key = `${campaigns.join(",")}|${parties.join(",")}`;
  const baseUrl = getApiBaseUrl();

  if (campaigns.length + parties.length === 0 || !baseUrl || typeof EventSource === "undefined") {
    closeSource();
    return;
  }

  if (source && key === activeKey) {
    return;
  }

  closeSource();

  const params = new URLSearchParams();

  campaigns.forEach((id) => params.append("campaignId", id));
  parties.forEach((id) => params.append("partyGroupId", id));

  const nextSource = new EventSource(
    new URL(`game-sessions/events?${params.toString()}`, baseUrl),
    {
      withCredentials: true
    }
  );

  source = nextSource;
  activeKey = key;

  // After every (re)connect, everyone refetches so anything missed while disconnected is recovered.
  nextSource.addEventListener("open", () => {
    subscriptions.forEach((subscription) => {
      [...subscription.campaignIds, ...subscription.partyGroupIds].forEach((id) =>
        subscription.handler("connected", id)
      );
    });
  });
  CAMPAIGN_EVENT_TYPES.forEach((type) => {
    nextSource.addEventListener(type, (event) => dispatch(type, event));
  });
  // Network drops reconnect on their own. A stream the browser gave up on (for example after an
  // auth error) is reopened later, as long as someone still wants updates.
  nextSource.addEventListener("error", () => {
    if (source === nextSource && nextSource.readyState === EventSource.CLOSED) {
      closeSource();
      window.setTimeout(scheduleReconcile, STREAM_RETRY_MS);
    }
  });
}

function scheduleReconcile() {
  if (isReconcileScheduled) {
    return;
  }

  // Components mount together; batching avoids opening a stream per hook.
  isReconcileScheduled = true;
  queueMicrotask(reconcile);
}

/** Follows campaigns and/or parties on the tab's shared stream. Returns the unsubscribe function. */
export function subscribeToCampaignStream(
  scope: { campaignIds?: string[]; partyGroupIds?: string[] },
  handler: CampaignEventHandler
) {
  const subscription: Subscription = {
    campaignIds: new Set(scope.campaignIds ?? []),
    handler,
    partyGroupIds: new Set(scope.partyGroupIds ?? [])
  };

  subscriptions.add(subscription);
  scheduleReconcile();

  return () => {
    subscriptions.delete(subscription);
    scheduleReconcile();
  };
}
