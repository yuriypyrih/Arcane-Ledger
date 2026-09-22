import { apiGet, type ApiRequestOptions } from "./client";
import type { CharacterSheetEnvelope, CharacterSheetRosterDocument } from "./characters";

export type CharacterInspectionTarget =
  | { kind: "party"; partyGroupId: string; characterId: string }
  | { kind: "admin"; userId: string; characterId: string };

export function getCharacterInspection(
  target: CharacterInspectionTarget,
  options?: ApiRequestOptions
) {
  const parent =
    target.kind === "party"
      ? `/party-groups/${encodeURIComponent(target.partyGroupId)}`
      : `/administration/users/${encodeURIComponent(target.userId)}`;
  return apiGet<CharacterSheetEnvelope>(
    `${parent}/characters/${encodeURIComponent(target.characterId)}`,
    options
  );
}

export function listUserCharactersForInspection(userId: string, options?: ApiRequestOptions) {
  return apiGet<{ characters: CharacterSheetRosterDocument[]; count: number }>(
    `/administration/users/${encodeURIComponent(userId)}/characters`,
    options
  );
}
