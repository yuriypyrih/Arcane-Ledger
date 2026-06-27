import type { CampaignLiveEncounterTrackerRecord } from "./campaigns";
import type {
  CharacterAvatarMetadata,
  CharacterCurrencies,
  CharacterInventoryItem,
  PortableCharacterSheetSummary
} from "../types";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type PartyGroupCharacterSummary = Omit<PortableCharacterSheetSummary, "localId"> & {
  localId?: number;
};

export type PartyGroupRecord = {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PartyGroupMemberRecord = {
  characterId: string;
  ownerId: string;
  user: {
    id: string;
    nickname: string;
  };
  summary: PartyGroupCharacterSummary;
  avatar: CharacterAvatarMetadata | null;
  updatedAt: string | null;
};

export type PartyGroupOwnerRecord = {
  id: string;
  nickname: string;
};

export type PartyGroupDetailRecord = PartyGroupRecord & {
  adminUserIds: string[];
  inviteToken: string;
  inviteUrl: string;
  characterIds: string[];
  maxMembers: number;
  owner: PartyGroupOwnerRecord;
  members: PartyGroupMemberRecord[];
};

export type PartyMembershipRecord = {
  characterId: string;
  partyGroupId: string;
  partyGroupName: string;
};

export type PartyGroupListEnvelope = {
  partyGroups: PartyGroupRecord[];
};

export type PartyGroupEnvelope = {
  partyGroup: PartyGroupRecord;
};

export type PartyGroupDetailEnvelope = {
  partyGroup: PartyGroupDetailRecord;
};

export type PartyGroupDeleteEnvelope = {
  partyGroupId: string;
};

export type PartyGroupJoinEnvelope = {
  partyGroup: PartyGroupRecord;
  membership: PartyMembershipRecord;
};

export type PartyMembershipEnvelope = {
  memberships: PartyMembershipRecord[];
};

export type PartyGroupLiveEncounterEnvelope = {
  partyGroupId: string;
  liveEncounterTracker: CampaignLiveEncounterTrackerRecord | null;
};

export type PartyGroupLiveEncounterTurnAction = "start" | "end";

export type PartyGroupLiveEncounterTurnEnvelope = PartyGroupLiveEncounterEnvelope & {
  turnUpdated: boolean;
};

export type PartyGroupLeaveEnvelope = {
  partyGroupId: string;
  characterId: string;
};

export type PartyGroupMasterChestRecord = {
  partyGroupId: string;
  revision: number;
  inventoryItems: CharacterInventoryItem[];
  currencies: CharacterCurrencies;
  history: string[];
};

export type PartyGroupMasterChestEnvelope = {
  masterChest: PartyGroupMasterChestRecord;
};

export type PartyGroupInventoryMemberRecord = PartyGroupMemberRecord & {
  currencies: CharacterCurrencies;
  inventoryItems: CharacterInventoryItem[];
};

export type PartyGroupInventoriesRecord = {
  partyGroupId: string;
  members: PartyGroupInventoryMemberRecord[];
};

export type PartyGroupInventoriesEnvelope = {
  partyInventories: PartyGroupInventoriesRecord;
};

export function listPartyGroups(options?: ApiRequestOptions) {
  return apiGet<PartyGroupListEnvelope>("/party-groups", options);
}

export function createPartyGroup(name: string, options?: ApiRequestOptions) {
  return apiPost<PartyGroupEnvelope>("/party-groups", { name }, options);
}

export function getPartyGroup(partyGroupId: string, options?: ApiRequestOptions) {
  return apiGet<PartyGroupDetailEnvelope>(`/party-groups/${partyGroupId}`, options);
}

export function getPartyGroupMemberView(partyGroupId: string, options?: ApiRequestOptions) {
  return apiGet<PartyGroupDetailEnvelope>(`/party-groups/${partyGroupId}/member-view`, options);
}

export function getPartyGroupLiveEncounter(partyGroupId: string, options?: ApiRequestOptions) {
  return apiGet<PartyGroupLiveEncounterEnvelope>(
    `/party-groups/${partyGroupId}/live-encounter`,
    options
  );
}

export function updatePartyGroupLiveEncounterTurn(
  partyGroupId: string,
  payload: {
    action: PartyGroupLiveEncounterTurnAction;
    characterId: string;
  },
  options?: ApiRequestOptions
) {
  return apiPatch<PartyGroupLiveEncounterTurnEnvelope>(
    `/party-groups/${partyGroupId}/live-encounter/turn`,
    payload,
    options
  );
}

export function getPartyGroupMasterChest(partyGroupId: string, options?: ApiRequestOptions) {
  return apiGet<PartyGroupMasterChestEnvelope>(
    `/party-groups/${partyGroupId}/master-chest`,
    options
  );
}

export function getPartyGroupInventories(partyGroupId: string, options?: ApiRequestOptions) {
  return apiGet<PartyGroupInventoriesEnvelope>(
    `/party-groups/${partyGroupId}/inventories`,
    options
  );
}

export function updatePartyGroupMasterChest(
  partyGroupId: string,
  payload: {
    actorCharacterId?: string;
    baseRevision: number;
    currencies: CharacterCurrencies;
    inventoryItems: CharacterInventoryItem[];
    transactionSummary?: string;
  },
  options?: ApiRequestOptions
) {
  return apiPut<PartyGroupMasterChestEnvelope>(
    `/party-groups/${partyGroupId}/master-chest`,
    payload,
    options
  );
}

export function updatePartyGroup(partyGroupId: string, name: string, options?: ApiRequestOptions) {
  return apiPatch<PartyGroupDetailEnvelope>(`/party-groups/${partyGroupId}`, { name }, options);
}

export function deletePartyGroup(partyGroupId: string, options?: ApiRequestOptions) {
  return apiDelete<PartyGroupDeleteEnvelope>(`/party-groups/${partyGroupId}`, options);
}

export function resetPartyGroupInviteToken(partyGroupId: string, options?: ApiRequestOptions) {
  return apiPost<PartyGroupDetailEnvelope>(
    `/party-groups/${partyGroupId}/invite-token/reset`,
    {},
    options
  );
}

export function removePartyGroupCharacter(
  partyGroupId: string,
  characterSheetId: string,
  options?: ApiRequestOptions
) {
  return apiDelete<PartyGroupDetailEnvelope>(
    `/party-groups/${partyGroupId}/characters/${characterSheetId}`,
    options
  );
}

export function leavePartyGroup(
  partyGroupId: string,
  characterSheetId: string,
  options?: ApiRequestOptions
) {
  return apiDelete<PartyGroupLeaveEnvelope>(
    `/party-groups/${partyGroupId}/memberships/${characterSheetId}`,
    options
  );
}

export function joinPartyGroup(
  invite: string,
  characterSheetId: string,
  options?: ApiRequestOptions
) {
  return apiPost<PartyGroupJoinEnvelope>(
    "/party-groups/join",
    {
      invite,
      characterSheetId
    },
    options
  );
}

export function listMyPartyMemberships(options?: ApiRequestOptions) {
  return apiGet<PartyMembershipEnvelope>("/party-groups/my-memberships", options);
}
