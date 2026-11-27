import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { Campaign } from "../models/Campaign.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import { PartyGroup } from "../models/PartyGroup.js";

export type CampaignRole = "owner" | "player";

export async function getCampaignPlayerUserIds(campaign: {
  selectedPartyId?: Types.ObjectId | null;
}): Promise<Types.ObjectId[]> {
  if (!campaign.selectedPartyId) {
    return [];
  }

  const party = await PartyGroup.findById(campaign.selectedPartyId)
    .select({ characterIds: 1 })
    .exec();

  if (!party || party.characterIds.length === 0) {
    return [];
  }

  const sheets = await CharacterSheet.find({
    _id: { $in: party.characterIds },
    deletedAt: null
  })
    .select({ ownerId: 1 })
    .exec();

  return [...new Map(sheets.map((sheet) => [sheet.ownerId.toString(), sheet.ownerId])).values()];
}

/** Resolves the user's role in a campaign: owner, a player (owns a character in the selected party), or 404. */
export async function resolveCampaignRole(options: {
  campaignId: string;
  userId: Types.ObjectId;
}): Promise<{ campaignId: Types.ObjectId; role: CampaignRole }> {
  if (!Types.ObjectId.isValid(options.campaignId)) {
    throw new AppError("Campaign id is invalid.", 400, "INVALID_CAMPAIGN_ID");
  }

  const campaign = await Campaign.findById(options.campaignId)
    .select({ ownerId: 1, selectedPartyId: 1 })
    .exec();

  if (campaign?.ownerId.equals(options.userId)) {
    return { campaignId: campaign._id, role: "owner" };
  }

  if (campaign) {
    const playerIds = await getCampaignPlayerUserIds(campaign);

    if (playerIds.some((playerId) => playerId.equals(options.userId))) {
      return { campaignId: campaign._id, role: "player" };
    }
  }

  // Same response for "missing" and "not a member" to avoid leaking campaign existence.
  throw new AppError("Campaign was not found.", 404, "CAMPAIGN_NOT_FOUND");
}

/** Campaign ids that use the party, for a user who owns a character in it (or owns/administers it). */
export async function resolvePartyMemberCampaignIds(options: {
  partyGroupId: string;
  userId: Types.ObjectId;
}): Promise<string[]> {
  if (!Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const party = await PartyGroup.findById(options.partyGroupId)
    .select({ ownerId: 1, adminUserIds: 1, characterIds: 1 })
    .exec();
  const isManager =
    party !== null &&
    (party.ownerId.equals(options.userId) ||
      party.adminUserIds.some((id) => id.equals(options.userId)));
  const ownsMember =
    party !== null &&
    !isManager &&
    (await CharacterSheet.exists({
      _id: { $in: party.characterIds },
      ownerId: options.userId,
      deletedAt: null
    })) !== null;

  if (!party || (!isManager && !ownsMember)) {
    throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
  }

  const campaigns = await Campaign.find({ selectedPartyId: party._id })
    .select({ _id: 1 })
    .lean()
    .exec();

  return campaigns.map((campaign) => campaign._id.toString());
}
