import type { EncounterTemplateCreatureRecord } from "./encounterTemplates";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type CampaignVisibilitySettings = {
  showVitalityStatus: boolean;
  showHpBar: boolean;
  showMonsterType: boolean;
  showBaseStatBlockDescription: boolean;
  showDmDescription: boolean;
  showArmorClass: boolean;
  showChallengeRating: boolean;
  showAbilityScoresAndSavingThrows: boolean;
  showResistancesAndImmunities: boolean;
  showSkills: boolean;
  showSenses: boolean;
  showLanguages: boolean;
  showActionsAndReactions: boolean;
};

export type PlayerVisibilitySettings = CampaignVisibilitySettings;

export type CampaignSelectedPartySummary = {
  id: string;
  name: string;
  memberCount: number;
};

export type CampaignSessionNoteRecord = {
  id: string;
  name?: string;
  description: string;
};

export type CampaignPreparedEncounterRecord = {
  id: string;
  name: string;
  visibilitySettings: PlayerVisibilitySettings | null;
  creatures: CampaignPreparedEncounterCreatureRecord[];
};

export type CampaignPreparedEncounterCreatureRecord = EncounterTemplateCreatureRecord & {
  visibilitySettings?: PlayerVisibilitySettings | null;
};

export type CampaignRecord = {
  id: string;
  name: string;
  ownerId: string;
  selectedPartyId: string | null;
  sessionNoteCount: number;
  preparedEncounterCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CampaignDetailRecord = CampaignRecord & {
  maxSessionNotes: number;
  visibilitySettings: CampaignVisibilitySettings;
  selectedParty: CampaignSelectedPartySummary | null;
  maxPreparedEncounters: number;
  sessionNotes: CampaignSessionNoteRecord[];
  preparedEncounters: CampaignPreparedEncounterRecord[];
};

export type CampaignListEnvelope = {
  campaigns: CampaignRecord[];
};

export type CampaignEnvelope = {
  campaign: CampaignRecord;
};

export type CampaignDetailEnvelope = {
  campaign: CampaignDetailRecord;
};

export type CampaignPatchRecord = Partial<
  Pick<
    CampaignDetailRecord,
    | "name"
    | "selectedPartyId"
    | "visibilitySettings"
    | "selectedParty"
    | "sessionNotes"
    | "sessionNoteCount"
    | "preparedEncounters"
    | "preparedEncounterCount"
    | "updatedAt"
  >
>;

export type CampaignPatchEnvelope = {
  campaignId: string;
  patch: CampaignPatchRecord;
};

export type CampaignSessionNoteInput = {
  name?: string;
  description: string;
};

export function listCampaigns(options?: ApiRequestOptions) {
  return apiGet<CampaignListEnvelope>("/campaigns", options);
}

export function createCampaign(name: string, options?: ApiRequestOptions) {
  return apiPost<CampaignEnvelope>("/campaigns", { name }, options);
}

export function getCampaign(campaignId: string, options?: ApiRequestOptions) {
  return apiGet<CampaignDetailEnvelope>(`/campaigns/${campaignId}`, options);
}

export function updateCampaign(campaignId: string, name: string, options?: ApiRequestOptions) {
  return apiPatch<CampaignPatchEnvelope>(`/campaigns/${campaignId}`, { name }, options);
}

export function updateCampaignVisibilitySettings(
  campaignId: string,
  visibilitySettings: CampaignVisibilitySettings,
  options?: ApiRequestOptions
) {
  return apiPatch<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/visibility-settings`,
    visibilitySettings,
    options
  );
}

export function updateCampaignSelectedParty(
  campaignId: string,
  partyGroupId: string | null,
  options?: ApiRequestOptions
) {
  return apiPatch<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/selected-party`,
    { partyGroupId },
    options
  );
}

export function createCampaignSessionNote(
  campaignId: string,
  sessionNote: CampaignSessionNoteInput,
  options?: ApiRequestOptions
) {
  return apiPost<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/session-notes`,
    sessionNote,
    options
  );
}

export function updateCampaignSessionNote(
  campaignId: string,
  sessionNoteId: string,
  sessionNote: CampaignSessionNoteInput,
  options?: ApiRequestOptions
) {
  return apiPut<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/session-notes/${sessionNoteId}`,
    sessionNote,
    options
  );
}

export function removeCampaignSessionNote(
  campaignId: string,
  sessionNoteId: string,
  options?: ApiRequestOptions
) {
  return apiDelete<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/session-notes/${sessionNoteId}`,
    options
  );
}

export function createCampaignPreparedEncounter(
  campaignId: string,
  name: string,
  options?: ApiRequestOptions
) {
  return apiPost<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters`,
    { name },
    options
  );
}

export function copyEncounterTemplateToCampaign(
  campaignId: string,
  encounterTemplateId: string,
  options?: ApiRequestOptions
) {
  return apiPost<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/from-template`,
    { encounterTemplateId },
    options
  );
}

export function updateCampaignPreparedEncounter(
  campaignId: string,
  preparedEncounterId: string,
  name: string,
  options?: ApiRequestOptions
) {
  return apiPatch<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}`,
    { name },
    options
  );
}

export function updateCampaignPreparedEncounterVisibilitySettings(
  campaignId: string,
  preparedEncounterId: string,
  visibilitySettings: PlayerVisibilitySettings | null,
  options?: ApiRequestOptions
) {
  return apiPatch<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}/visibility-settings`,
    visibilitySettings,
    options
  );
}

export function removeCampaignPreparedEncounter(
  campaignId: string,
  preparedEncounterId: string,
  options?: ApiRequestOptions
) {
  return apiDelete<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}`,
    options
  );
}

export function upsertCampaignPreparedEncounterCreature(
  campaignId: string,
  preparedEncounterId: string,
  creature: EncounterTemplateCreatureRecord,
  options?: ApiRequestOptions
) {
  return apiPut<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}/creatures/${creature.id}`,
    creature,
    options
  );
}

export function removeCampaignPreparedEncounterCreature(
  campaignId: string,
  preparedEncounterId: string,
  creatureId: string,
  options?: ApiRequestOptions
) {
  return apiDelete<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}/creatures/${creatureId}`,
    options
  );
}

export function updateCampaignPreparedEncounterCreatureVisibilitySettings(
  campaignId: string,
  preparedEncounterId: string,
  creatureId: string,
  visibilitySettings: PlayerVisibilitySettings | null,
  options?: ApiRequestOptions
) {
  return apiPatch<CampaignPatchEnvelope>(
    `/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}/creatures/${creatureId}/visibility-settings`,
    visibilitySettings,
    options
  );
}
