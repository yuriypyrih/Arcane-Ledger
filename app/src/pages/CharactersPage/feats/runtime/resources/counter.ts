import type { FEATS } from "../../../../../codex/entries/enums";
import type { Character, CharacterFeatEntry } from "../../../../../types";
import type { CounterResourceTarget, ResourceAdjustment } from "../../../resourceManagement";
import { collectFeatDerivedState } from "../state";

type Usage = { usesTotal: number; usesRemaining: number } | null;

/** Adjust only the resource field on eligible feat records, preserving their choices and other casts. */
export function featResource<K extends keyof CharacterFeatEntry>(
  feat: FEATS,
  stateKey: K,
  field: keyof NonNullable<CharacterFeatEntry[K]>,
  label: string,
  state: (character: Character) => Usage,
  mode: "number" | "boolean" | "spell" = "boolean",
  spellId?: string,
  matches: (entry: CharacterFeatEntry) => boolean = () => true
): CounterResourceTarget {
  function update(character: Character, adjustment: ResourceAdjustment): Character {
    const usage = state(character);
    if (!usage || usage.usesTotal <= 0 || (adjustment === "use" && usage.usesRemaining <= 0))
      return character;
    let changed = false;
    const eligibleIds = new Set(
      collectFeatDerivedState(character)
        .normalizedFeats.filter((entry) => entry.feat === feat && matches(entry))
        .map((entry) => entry.id)
    );
    const feats = (character.feats ?? []).map((entry) => {
      if (!eligibleIds.has(entry.id) || (changed && adjustment !== "reset")) return entry;
      const record = (entry[stateKey] ?? {}) as Record<string, unknown>;
      const raw = record[String(field)];
      const spellIds = Array.isArray(raw)
        ? raw.filter((value): value is string => typeof value === "string")
        : [];
      const expended =
        mode === "spell"
          ? Number(spellIds.includes(spellId!))
          : mode === "boolean"
            ? Number(raw === true)
            : Math.max(0, Number(raw) || 0);
      if (
        adjustment === "use" ? expended >= (mode === "number" ? usage.usesTotal : 1) : expended <= 0
      )
        return entry;
      const next = adjustment === "reset" ? 0 : expended + (adjustment === "use" ? 1 : -1);
      const value =
        mode === "spell"
          ? next > 0
            ? [...new Set([...spellIds, spellId!])]
            : spellIds.filter((id) => id !== spellId)
          : mode === "boolean"
            ? next > 0
            : next;
      changed = true;
      return { ...entry, [stateKey]: { ...record, [field]: value } };
    });
    return changed ? { ...character, feats } : character;
  }
  return {
    kind: "counter",
    id: `feat:${feat}:${String(field)}:${spellId ?? ""}`,
    label,
    total: (character) => state(character)?.usesTotal ?? 0,
    remaining: (character) => state(character)?.usesRemaining ?? 0,
    spendOne: (character) => update(character, "use"),
    restoreOne: (character) => update(character, "restore"),
    restoreAll: (character) => update(character, "reset")
  };
}
