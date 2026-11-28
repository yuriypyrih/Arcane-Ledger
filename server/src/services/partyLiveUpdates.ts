import { Types } from "mongoose";
import { Campaign } from "../models/Campaign.js";
import { captureServerError } from "../sentry.js";
import { publishCampaignEvent } from "./campaignEventBus.js";

/**
 * Tells everyone watching a live encounter for this party that a member's sheet changed.
 * Fire-and-forget: a failed notification must never fail the character save.
 */
export function notifyPartyMemberUpdated(partyGroupId: Types.ObjectId | null | undefined) {
  if (!partyGroupId) {
    return;
  }

  void Campaign.find({ "liveEncounterTracker.partyGroupId": partyGroupId })
    .select({ _id: 1 })
    .lean()
    .exec()
    .then((campaigns) => {
      campaigns.forEach((campaign) =>
        publishCampaignEvent({ type: "party-member.updated", campaignId: campaign._id.toString() })
      );
    })
    .catch((error: unknown) => {
      captureServerError(error, { area: "live-encounter", action: "notify-party-member-updated" });
    });
}
