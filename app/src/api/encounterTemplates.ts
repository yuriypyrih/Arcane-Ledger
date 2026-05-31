import type { CharacterCompanion } from "../types";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type EncounterTemplateCreatureRecord = Omit<CharacterCompanion, "role">;

export type EncounterTemplateRecord = {
  id: string;
  name: string;
  ownerId: string;
  creatureCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type EncounterTemplateDetailRecord = EncounterTemplateRecord & {
  maxCreatures: number;
  creatures: EncounterTemplateCreatureRecord[];
};

export type EncounterTemplateListEnvelope = {
  encounterTemplates: EncounterTemplateRecord[];
};

export type EncounterTemplateEnvelope = {
  encounterTemplate: EncounterTemplateRecord;
};

export type EncounterTemplateDetailEnvelope = {
  encounterTemplate: EncounterTemplateDetailRecord;
};

export type EncounterTemplateDeleteEnvelope = {
  encounterTemplateId: string;
};

export function listEncounterTemplates(options?: ApiRequestOptions) {
  return apiGet<EncounterTemplateListEnvelope>("/encounter-templates", options);
}

export function createEncounterTemplate(name: string, options?: ApiRequestOptions) {
  return apiPost<EncounterTemplateEnvelope>("/encounter-templates", { name }, options);
}

export function getEncounterTemplate(encounterTemplateId: string, options?: ApiRequestOptions) {
  return apiGet<EncounterTemplateDetailEnvelope>(
    `/encounter-templates/${encounterTemplateId}`,
    options
  );
}

export function updateEncounterTemplate(
  encounterTemplateId: string,
  name: string,
  options?: ApiRequestOptions
) {
  return apiPatch<EncounterTemplateDetailEnvelope>(
    `/encounter-templates/${encounterTemplateId}`,
    { name },
    options
  );
}

export function deleteEncounterTemplate(encounterTemplateId: string, options?: ApiRequestOptions) {
  return apiDelete<EncounterTemplateDeleteEnvelope>(
    `/encounter-templates/${encounterTemplateId}`,
    options
  );
}

export function upsertEncounterTemplateCreature(
  encounterTemplateId: string,
  creature: EncounterTemplateCreatureRecord,
  options?: ApiRequestOptions
) {
  return apiPut<EncounterTemplateDetailEnvelope>(
    `/encounter-templates/${encounterTemplateId}/creatures/${creature.id}`,
    creature,
    options
  );
}

export function removeEncounterTemplateCreature(
  encounterTemplateId: string,
  creatureId: string,
  options?: ApiRequestOptions
) {
  return apiDelete<EncounterTemplateDetailEnvelope>(
    `/encounter-templates/${encounterTemplateId}/creatures/${creatureId}`,
    options
  );
}
