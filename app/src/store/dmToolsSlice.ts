import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PartyGroupDetailRecord,
  PartyGroupRecord,
  PartyMembershipRecord
} from "../api/partyGroups";

export type DmToolsLoadStatus = "idle" | "loading" | "ready" | "error";

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
  membershipsError: null
};

function upsertPartyGroup(partyGroups: PartyGroupRecord[], partyGroup: PartyGroupRecord) {
  const existingIndex = partyGroups.findIndex((entry) => entry.id === partyGroup.id);

  if (existingIndex >= 0) {
    partyGroups[existingIndex] = partyGroup;
    return;
  }

  partyGroups.unshift(partyGroup);
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
  setSelectedPartyGroup,
  setSelectedPartyGroupError,
  setSelectedPartyGroupLoading,
  removePartyMembership,
  upsertPartyGroupRecord,
  upsertPartyMembership
} = dmToolsSlice.actions;
export const dmToolsReducer = dmToolsSlice.reducer;
