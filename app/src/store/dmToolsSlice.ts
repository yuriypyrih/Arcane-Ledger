import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CampaignDetailRecord, CampaignPatchRecord, CampaignRecord } from "../api/campaigns";
import type {
  EncounterTemplateDetailRecord,
  EncounterTemplateRecord
} from "../api/encounterTemplates";
import type {
  PartyGroupDetailRecord,
  PartyGroupRecord,
  PartyMembershipRecord
} from "../api/partyGroups";

export type DmToolsLoadStatus = "idle" | "loading" | "ready" | "error";
export type LiveEncounterTrackerSaveStatus = "synced" | "dirty" | "saving" | "error";

export type DmToolsState = {
  partyGroups: PartyGroupRecord[];
  partyGroupsStatus: DmToolsLoadStatus;
  partyGroupsError: string | null;
  selectedPartyGroupsById: Record<string, PartyGroupDetailRecord>;
  selectedPartyGroupStatusById: Record<string, DmToolsLoadStatus>;
  selectedPartyGroupErrorById: Record<string, string | null>;
  membershipsByCharacterId: Record<string, PartyMembershipRecord>;
  membershipsOwnerId: string | null;
  membershipsStatus: DmToolsLoadStatus;
  membershipsError: string | null;
  campaigns: CampaignRecord[];
  campaignsStatus: DmToolsLoadStatus;
  campaignsError: string | null;
  selectedCampaignsById: Record<string, CampaignDetailRecord>;
  selectedCampaignStatusById: Record<string, DmToolsLoadStatus>;
  selectedCampaignErrorById: Record<string, string | null>;
  liveEncounterTrackerSaveStatusByCampaignId: Record<string, LiveEncounterTrackerSaveStatus>;
  liveEncounterTrackerSaveErrorByCampaignId: Record<string, string | null>;
  encounterTemplates: EncounterTemplateRecord[];
  encounterTemplatesStatus: DmToolsLoadStatus;
  encounterTemplatesError: string | null;
  selectedEncounterTemplatesById: Record<string, EncounterTemplateDetailRecord>;
  selectedEncounterTemplateStatusById: Record<string, DmToolsLoadStatus>;
  selectedEncounterTemplateErrorById: Record<string, string | null>;
};

const initialState: DmToolsState = {
  partyGroups: [],
  partyGroupsStatus: "idle",
  partyGroupsError: null,
  selectedPartyGroupsById: {},
  selectedPartyGroupStatusById: {},
  selectedPartyGroupErrorById: {},
  membershipsByCharacterId: {},
  membershipsOwnerId: null,
  membershipsStatus: "idle",
  membershipsError: null,
  campaigns: [],
  campaignsStatus: "idle",
  campaignsError: null,
  selectedCampaignsById: {},
  selectedCampaignStatusById: {},
  selectedCampaignErrorById: {},
  liveEncounterTrackerSaveStatusByCampaignId: {},
  liveEncounterTrackerSaveErrorByCampaignId: {},
  encounterTemplates: [],
  encounterTemplatesStatus: "idle",
  encounterTemplatesError: null,
  selectedEncounterTemplatesById: {},
  selectedEncounterTemplateStatusById: {},
  selectedEncounterTemplateErrorById: {}
};

function upsertPartyGroup(partyGroups: PartyGroupRecord[], partyGroup: PartyGroupRecord) {
  const existingIndex = partyGroups.findIndex((entry) => entry.id === partyGroup.id);

  if (existingIndex >= 0) {
    partyGroups[existingIndex] = partyGroup;
    return;
  }

  partyGroups.unshift(partyGroup);
}

function upsertEncounterTemplate(
  encounterTemplates: EncounterTemplateRecord[],
  encounterTemplate: EncounterTemplateRecord
) {
  const existingIndex = encounterTemplates.findIndex((entry) => entry.id === encounterTemplate.id);

  if (existingIndex >= 0) {
    encounterTemplates[existingIndex] = encounterTemplate;
    return;
  }

  encounterTemplates.unshift(encounterTemplate);
}

function upsertCampaign(campaigns: CampaignRecord[], campaign: CampaignRecord) {
  const existingIndex = campaigns.findIndex((entry) => entry.id === campaign.id);

  if (existingIndex >= 0) {
    campaigns[existingIndex] = campaign;
    return;
  }

  campaigns.unshift(campaign);
}

function patchCampaignSummary(
  campaigns: CampaignRecord[],
  campaignId: string,
  patch: CampaignPatchRecord
) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);

  if (!campaign) {
    return;
  }

  if (patch.name !== undefined) {
    campaign.name = patch.name;
  }

  if (patch.sessionNoteCount !== undefined) {
    campaign.sessionNoteCount = patch.sessionNoteCount;
  }

  if (patch.selectedPartyId !== undefined) {
    campaign.selectedPartyId = patch.selectedPartyId;
  }

  if (patch.preparedEncounterCount !== undefined) {
    campaign.preparedEncounterCount = patch.preparedEncounterCount;
  }

  if (patch.updatedAt !== undefined) {
    campaign.updatedAt = patch.updatedAt;
  }
}

function clearPartyFromCampaign(
  campaign: CampaignRecord | CampaignDetailRecord,
  partyGroupId: string
) {
  if (campaign.selectedPartyId !== partyGroupId) {
    return;
  }

  campaign.selectedPartyId = null;

  if ("selectedParty" in campaign) {
    campaign.selectedParty = null;
  }
}

const dmToolsSlice = createSlice({
  name: "dmTools",
  initialState,
  reducers: {
    setPartyGroupsLoading(state) {
      state.partyGroupsStatus = "loading";
      state.partyGroupsError = null;
    },
    setPartyGroups(state, action: PayloadAction<PartyGroupRecord[]>) {
      state.partyGroups = action.payload;
      state.partyGroupsStatus = "ready";
      state.partyGroupsError = null;
    },
    setPartyGroupsError(state, action: PayloadAction<string>) {
      state.partyGroupsStatus = "error";
      state.partyGroupsError = action.payload;
    },
    upsertPartyGroupRecord(state, action: PayloadAction<PartyGroupRecord>) {
      upsertPartyGroup(state.partyGroups, action.payload);
      state.partyGroupsStatus = "ready";
      state.partyGroupsError = null;
    },
    removePartyGroupRecord(state, action: PayloadAction<string>) {
      const partyGroupId = action.payload;

      state.partyGroups = state.partyGroups.filter((partyGroup) => partyGroup.id !== partyGroupId);
      delete state.selectedPartyGroupsById[partyGroupId];
      delete state.selectedPartyGroupStatusById[partyGroupId];
      delete state.selectedPartyGroupErrorById[partyGroupId];

      Object.entries(state.membershipsByCharacterId).forEach(([characterId, membership]) => {
        if (membership.partyGroupId === partyGroupId) {
          delete state.membershipsByCharacterId[characterId];
        }
      });

      state.campaigns.forEach((campaign) => clearPartyFromCampaign(campaign, partyGroupId));
      Object.values(state.selectedCampaignsById).forEach((campaign) =>
        clearPartyFromCampaign(campaign, partyGroupId)
      );
    },
    setSelectedPartyGroupLoading(state, action: PayloadAction<string>) {
      state.selectedPartyGroupStatusById[action.payload] = "loading";
      state.selectedPartyGroupErrorById[action.payload] = null;
    },
    setSelectedPartyGroup(state, action: PayloadAction<PartyGroupDetailRecord>) {
      state.selectedPartyGroupsById[action.payload.id] = action.payload;
      state.selectedPartyGroupStatusById[action.payload.id] = "ready";
      state.selectedPartyGroupErrorById[action.payload.id] = null;
      upsertPartyGroup(state.partyGroups, action.payload);
    },
    setSelectedPartyGroupError(
      state,
      action: PayloadAction<{ partyGroupId: string; error: string }>
    ) {
      state.selectedPartyGroupStatusById[action.payload.partyGroupId] = "error";
      state.selectedPartyGroupErrorById[action.payload.partyGroupId] = action.payload.error;
    },
    setPartyMembershipsLoading(state) {
      state.membershipsStatus = "loading";
      state.membershipsError = null;
    },
    setPartyMemberships(
      state,
      action: PayloadAction<{ memberships: PartyMembershipRecord[]; ownerId: string | null }>
    ) {
      state.membershipsByCharacterId = Object.fromEntries(
        action.payload.memberships.map((membership) => [membership.characterId, membership])
      );
      state.membershipsOwnerId = action.payload.ownerId;
      state.membershipsStatus = "ready";
      state.membershipsError = null;
    },
    setPartyMembershipsError(state, action: PayloadAction<string>) {
      state.membershipsStatus = "error";
      state.membershipsError = action.payload;
    },
    upsertPartyMembership(state, action: PayloadAction<PartyMembershipRecord>) {
      state.membershipsByCharacterId[action.payload.characterId] = action.payload;
      state.membershipsStatus = "ready";
      state.membershipsError = null;
    },
    removePartyMembership(state, action: PayloadAction<string>) {
      delete state.membershipsByCharacterId[action.payload];
    },
    setCampaignsLoading(state) {
      state.campaignsStatus = "loading";
      state.campaignsError = null;
    },
    setCampaigns(state, action: PayloadAction<CampaignRecord[]>) {
      state.campaigns = action.payload;
      state.campaignsStatus = "ready";
      state.campaignsError = null;
    },
    setCampaignsError(state, action: PayloadAction<string>) {
      state.campaignsStatus = "error";
      state.campaignsError = action.payload;
    },
    upsertCampaignRecord(state, action: PayloadAction<CampaignRecord>) {
      upsertCampaign(state.campaigns, action.payload);
      state.campaignsStatus = "ready";
      state.campaignsError = null;
    },
    removeCampaignRecord(state, action: PayloadAction<string>) {
      const campaignId = action.payload;

      state.campaigns = state.campaigns.filter((campaign) => campaign.id !== campaignId);
      delete state.selectedCampaignsById[campaignId];
      delete state.selectedCampaignStatusById[campaignId];
      delete state.selectedCampaignErrorById[campaignId];
      delete state.liveEncounterTrackerSaveStatusByCampaignId[campaignId];
      delete state.liveEncounterTrackerSaveErrorByCampaignId[campaignId];
    },
    setSelectedCampaignLoading(state, action: PayloadAction<string>) {
      state.selectedCampaignStatusById[action.payload] = "loading";
      state.selectedCampaignErrorById[action.payload] = null;
    },
    setSelectedCampaign(state, action: PayloadAction<CampaignDetailRecord>) {
      state.selectedCampaignsById[action.payload.id] = action.payload;
      state.selectedCampaignStatusById[action.payload.id] = "ready";
      state.selectedCampaignErrorById[action.payload.id] = null;
      upsertCampaign(state.campaigns, action.payload);
    },
    patchSelectedCampaign(
      state,
      action: PayloadAction<{ campaignId: string; patch: CampaignPatchRecord }>
    ) {
      const selectedCampaign = state.selectedCampaignsById[action.payload.campaignId];

      if (selectedCampaign) {
        state.selectedCampaignsById[action.payload.campaignId] = {
          ...selectedCampaign,
          ...action.payload.patch
        };
        state.selectedCampaignStatusById[action.payload.campaignId] = "ready";
        state.selectedCampaignErrorById[action.payload.campaignId] = null;
      }

      patchCampaignSummary(state.campaigns, action.payload.campaignId, action.payload.patch);
    },
    setSelectedCampaignError(state, action: PayloadAction<{ campaignId: string; error: string }>) {
      state.selectedCampaignStatusById[action.payload.campaignId] = "error";
      state.selectedCampaignErrorById[action.payload.campaignId] = action.payload.error;
    },
    setLiveEncounterTrackerSaveStatus(
      state,
      action: PayloadAction<{
        campaignId: string;
        error?: string | null;
        status: LiveEncounterTrackerSaveStatus;
      }>
    ) {
      state.liveEncounterTrackerSaveStatusByCampaignId[action.payload.campaignId] =
        action.payload.status;
      state.liveEncounterTrackerSaveErrorByCampaignId[action.payload.campaignId] =
        action.payload.error ?? null;
    },
    clearLiveEncounterTrackerSaveStatus(state, action: PayloadAction<string>) {
      delete state.liveEncounterTrackerSaveStatusByCampaignId[action.payload];
      delete state.liveEncounterTrackerSaveErrorByCampaignId[action.payload];
    },
    setEncounterTemplatesLoading(state) {
      state.encounterTemplatesStatus = "loading";
      state.encounterTemplatesError = null;
    },
    setEncounterTemplates(state, action: PayloadAction<EncounterTemplateRecord[]>) {
      state.encounterTemplates = action.payload;
      state.encounterTemplatesStatus = "ready";
      state.encounterTemplatesError = null;
    },
    setEncounterTemplatesError(state, action: PayloadAction<string>) {
      state.encounterTemplatesStatus = "error";
      state.encounterTemplatesError = action.payload;
    },
    upsertEncounterTemplateRecord(state, action: PayloadAction<EncounterTemplateRecord>) {
      upsertEncounterTemplate(state.encounterTemplates, action.payload);
      state.encounterTemplatesStatus = "ready";
      state.encounterTemplatesError = null;
    },
    removeEncounterTemplateRecord(state, action: PayloadAction<string>) {
      const encounterTemplateId = action.payload;

      state.encounterTemplates = state.encounterTemplates.filter(
        (encounterTemplate) => encounterTemplate.id !== encounterTemplateId
      );
      delete state.selectedEncounterTemplatesById[encounterTemplateId];
      delete state.selectedEncounterTemplateStatusById[encounterTemplateId];
      delete state.selectedEncounterTemplateErrorById[encounterTemplateId];
    },
    setSelectedEncounterTemplateLoading(state, action: PayloadAction<string>) {
      state.selectedEncounterTemplateStatusById[action.payload] = "loading";
      state.selectedEncounterTemplateErrorById[action.payload] = null;
    },
    setSelectedEncounterTemplate(state, action: PayloadAction<EncounterTemplateDetailRecord>) {
      state.selectedEncounterTemplatesById[action.payload.id] = action.payload;
      state.selectedEncounterTemplateStatusById[action.payload.id] = "ready";
      state.selectedEncounterTemplateErrorById[action.payload.id] = null;
      upsertEncounterTemplate(state.encounterTemplates, action.payload);
    },
    setSelectedEncounterTemplateError(
      state,
      action: PayloadAction<{ encounterTemplateId: string; error: string }>
    ) {
      state.selectedEncounterTemplateStatusById[action.payload.encounterTemplateId] = "error";
      state.selectedEncounterTemplateErrorById[action.payload.encounterTemplateId] =
        action.payload.error;
    },
    clearDmToolsState() {
      return initialState;
    }
  }
});

export const {
  clearDmToolsState,
  setPartyGroups,
  setPartyGroupsError,
  setPartyGroupsLoading,
  setPartyMemberships,
  setPartyMembershipsError,
  setPartyMembershipsLoading,
  removeCampaignRecord,
  removeEncounterTemplateRecord,
  setSelectedPartyGroup,
  setSelectedPartyGroupError,
  setSelectedPartyGroupLoading,
  removePartyMembership,
  removePartyGroupRecord,
  setCampaigns,
  setCampaignsError,
  setCampaignsLoading,
  setSelectedCampaign,
  setSelectedCampaignError,
  setSelectedCampaignLoading,
  clearLiveEncounterTrackerSaveStatus,
  patchSelectedCampaign,
  setLiveEncounterTrackerSaveStatus,
  setEncounterTemplates,
  setEncounterTemplatesError,
  setEncounterTemplatesLoading,
  setSelectedEncounterTemplate,
  setSelectedEncounterTemplateError,
  setSelectedEncounterTemplateLoading,
  upsertPartyGroupRecord,
  upsertCampaignRecord,
  upsertEncounterTemplateRecord,
  upsertPartyMembership
} = dmToolsSlice.actions;
export const dmToolsReducer = dmToolsSlice.reducer;
