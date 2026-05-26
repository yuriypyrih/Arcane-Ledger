import type {
  CharacterAvatarMetadata,
  PortableCharacterSheet,
  PortableCharacterSheetSummary
} from "../types";
import { apiDelete, apiGet, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type CharacterSheetCloudDocument = {
  id: string;
  ownerId: string;
  clientId: string;
  localId?: number;
  schemaVersion: 2;
  revision: number;
  summary: PortableCharacterSheetSummary;
  avatar: CharacterAvatarMetadata | null;
  sheet: PortableCharacterSheet;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CharacterSheetRosterDocument = Omit<CharacterSheetCloudDocument, "sheet">;

export type CharacterSheetRosterEnvelope = {
  characters: CharacterSheetRosterDocument[];
  count: number;
  limit: number;
};

export type CharacterSheetFullEnvelope = {
  characters: CharacterSheetCloudDocument[];
  count: number;
  limit: number;
};

export type CharacterSheetEnvelope = {
  character: CharacterSheetCloudDocument;
};

export type CharacterSheetImportEnvelope = {
  characters: CharacterSheetCloudDocument[];
  count: number;
  limit: number;
};

export type SharedCharacterLinkEnvelope = {
  link: string;
};

export type SharedCharacterImportEnvelope =
  | {
      mode: "local";
      sheet: PortableCharacterSheet;
    }
  | {
      mode: "cloud";
      character: CharacterSheetCloudDocument;
      count: number;
      limit: number;
    };

export type CharacterSheetSyncPayload = {
  clientId: string;
  force?: boolean;
  localId?: number;
  baseRevision?: number;
  sheet: PortableCharacterSheet;
};

export function listCharacterSheets(options?: ApiRequestOptions) {
  return apiGet<CharacterSheetRosterEnvelope>("/characters", options);
}

export function listFullCharacterSheets(options?: ApiRequestOptions) {
  return apiGet<CharacterSheetFullEnvelope>("/characters/full", options);
}

export function getCharacterSheet(characterSheetId: string, options?: ApiRequestOptions) {
  return apiGet<CharacterSheetEnvelope>(`/characters/${characterSheetId}`, options);
}

export function importCharacterSheets(
  records: CharacterSheetSyncPayload[],
  options?: ApiRequestOptions
) {
  return apiPost<CharacterSheetImportEnvelope>("/characters/import", { records }, options);
}

export function shareCharacterSheet(characterSheetId: string, options?: ApiRequestOptions) {
  return apiPost<SharedCharacterLinkEnvelope>(`/characters/${characterSheetId}/share`, {}, options);
}

export function importSharedCharacter(
  link: string,
  localId: number,
  options?: ApiRequestOptions
) {
  return apiPost<SharedCharacterImportEnvelope>(
    "/characters/shared/import",
    { link, localId },
    options
  );
}

export function saveCharacterSheet(
  characterSheetId: string,
  payload: CharacterSheetSyncPayload,
  options?: ApiRequestOptions
) {
  return apiPut<CharacterSheetEnvelope>(`/characters/${characterSheetId}`, payload, options);
}

export function deleteCharacterSheet(characterSheetId: string, options?: ApiRequestOptions) {
  return apiDelete<CharacterSheetEnvelope>(`/characters/${characterSheetId}`, options);
}
