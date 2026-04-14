import type { Open5eItemRecord } from "../types/item.js";
import type { Open5eListEnvelope } from "../types/open5e.js";

const OPEN5E_SHIELD_CATEGORY_REFERENCE = {
  name: "Shield",
  key: "shield",
  url: "https://api.open5e.com/v2/itemcategories/shield/"
} as const;

function hasShieldItemName(record: Pick<Open5eItemRecord, "name">) {
  return typeof record.name === "string" && /\bshield\b/i.test(record.name);
}

export function isMisclassifiedOpen5e2024Shield(record: Open5eItemRecord) {
  return (
    record.document?.key === "srd-2024" &&
    record.category?.key === "armor" &&
    hasShieldItemName(record)
  );
}

export function normalizeOpen5eItemRecord(record: Open5eItemRecord): Open5eItemRecord {
  if (!isMisclassifiedOpen5e2024Shield(record)) {
    return record;
  }

  return {
    ...record,
    category: OPEN5E_SHIELD_CATEGORY_REFERENCE,
    armor: null
  };
}

export function normalizeOpen5eItemSnapshotPayload(
  payload: Open5eListEnvelope<Record<string, unknown>>
): Open5eListEnvelope<Record<string, unknown>> {
  if (!Array.isArray(payload.results)) {
    return payload;
  }

  return {
    ...payload,
    results: payload.results.map((result) =>
      typeof result === "object" && result !== null && !Array.isArray(result)
        ? normalizeOpen5eItemRecord(result as Open5eItemRecord)
        : result
    )
  };
}
