import type { PortableCharacterSheet } from "../../types";
import {
  stripPortableCharacterSheetLocalSyncMetadata,
  withPortableCharacterSheetLocalId
} from "./portableCharacterSheet";

const DUPLICATE_CHARACTER_NAME_SUFFIX = " Coppied";
const FALLBACK_CHARACTER_NAME = "Unnamed Character";

function getPortableCharacterSheetName(record: PortableCharacterSheet) {
  const name = record.summary.name || record.identity.name;

  return typeof name === "string" && name.trim().length > 0 ? name : FALLBACK_CHARACTER_NAME;
}

function withPortableCharacterSheetName(
  record: PortableCharacterSheet,
  name: string
): PortableCharacterSheet {
  return {
    ...record,
    identity: {
      ...record.identity,
      name
    },
    summary: {
      ...record.summary,
      name
    }
  };
}

export function createDuplicatePortableCharacterSheet(
  record: PortableCharacterSheet,
  localId: number
) {
  return withPortableCharacterSheetLocalId(
    withPortableCharacterSheetName(
      stripPortableCharacterSheetLocalSyncMetadata(record),
      `${getPortableCharacterSheetName(record)}${DUPLICATE_CHARACTER_NAME_SUFFIX}`
    ),
    localId
  );
}
