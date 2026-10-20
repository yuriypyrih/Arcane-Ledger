import type { Character, CharacterBardFeatureState } from "../../../../../types";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { getClassLevel, getClassSubclassId } from "../../../multiclassState";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export const collegeOfSpiritsSubclassId = "bard-college-of-spirits";
export const chooseSpiritActionKey = "bard-spirits-choose";

export function hasBardSpirits(character: SubclassRuntimeCharacter, level = 3): boolean {
  return (
    getClassSubclassId(character, "Bard") === collegeOfSpiritsSubclassId &&
    getClassLevel(character, "Bard") >= level
  );
}

export function getSpiritOptions(character: SubclassRuntimeCharacter) {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.SPIRITS_FROM_BEYOND).flatMap(
    (entry) => {
      if (typeof entry !== "string") return [];
      const match = entry.match(/^<strong>(\d+) — (.+?)\.<\/strong>/);
      return match ? [{ number: Number(match[1]), name: match[2], description: entry }] : [];
    }
  );
}

const validSpirit = (n: unknown): n is number =>
  Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 12;

export function normalizeBardSpiritsState(
  value: Partial<CharacterBardFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterBardFeatureState> {
  if (!hasBardSpirits(character)) return {};
  const ids = new Set<string>();
  const channeledSpirits = (Array.isArray(value.channeledSpirits) ? value.channeledSpirits : [])
    .filter((entry) => {
      if (
        !entry ||
        typeof entry.id !== "string" ||
        !entry.id ||
        ids.has(entry.id) ||
        !validSpirit(entry.spirit)
      )
        return false;
      ids.add(entry.id);
      return true;
    })
    .map(({ id, spirit }) => ({ id, spirit }));
  const pendingSpiritRolls = (
    Array.isArray(value.pendingSpiritRolls) ? value.pendingSpiritRolls : []
  )
    .filter((entry) => {
      if (
        !entry ||
        typeof entry.id !== "string" ||
        !entry.id ||
        ids.has(entry.id) ||
        ![6, 8, 10, 12].includes(entry.die) ||
        ![1, 2].includes(entry.count)
      )
        return false;
      ids.add(entry.id);
      return true;
    })
    .map(({ id, die, count, results }) => ({
      id,
      die,
      count,
      results:
        Array.isArray(results) &&
        results.length === count &&
        results.every((n) => validSpirit(n) && n <= die)
          ? results
          : undefined
    }));
  return {
    channeledSpirits,
    pendingSpiritRolls,
    spiritualManifestationUsesExpended: hasBardSpirits(character, 6)
      ? Number(value.spiritualManifestationUsesExpended) >= 1
        ? 1
        : 0
      : undefined,
    spiritualManifestationCoverUsesExpended: hasBardSpirits(character, 6)
      ? Number(value.spiritualManifestationCoverUsesExpended) >= 1
        ? 1
        : 0
      : undefined
  };
}

export function getBardSpiritsState(character: SubclassRuntimeCharacter) {
  return normalizeBardSpiritsState(character.classFeatureState?.bard ?? {}, character);
}

export function updateBardSpiritsState(
  character: Character,
  patch: Partial<CharacterBardFeatureState>
): Character {
  return replaceClassFeatureState(character, "bard", {
    ...character.classFeatureState?.bard,
    ...patch
  });
}

export function resolveSpiritRoll(character: Character, id: string, results: number[]): Character {
  const state = getBardSpiritsState(character);
  const pending = state.pendingSpiritRolls?.find((entry) => entry.id === id);
  if (
    !pending ||
    pending.results ||
    results.length !== pending.count ||
    !results.every((n) => validSpirit(n) && n <= pending.die)
  )
    return character;
  if (pending.count === 1)
    return updateBardSpiritsState(character, {
      pendingSpiritRolls: state.pendingSpiritRolls?.filter((entry) => entry.id !== id),
      channeledSpirits: [...(state.channeledSpirits ?? []), { id, spirit: results[0] }]
    });
  // Preserve resolution of paid two-roll channelings saved before Mystical Connection became manual.
  return updateBardSpiritsState(character, {
    pendingSpiritRolls: state.pendingSpiritRolls?.map((entry) =>
      entry.id === id ? { ...entry, results: [...results] } : entry
    )
  });
}

export function choosePendingSpirit(character: Character, id: string, spirit: number): Character {
  const state = getBardSpiritsState(character);
  const pending = state.pendingSpiritRolls?.find((entry) => entry.id === id);
  if (!pending?.results || !validSpirit(spirit)) return character;
  const [first, second] = pending.results;
  if (first !== second && !pending.results.includes(spirit)) return character;
  return updateBardSpiritsState(character, {
    pendingSpiritRolls: state.pendingSpiritRolls?.filter((entry) => entry.id !== id),
    channeledSpirits: [...(state.channeledSpirits ?? []), { id, spirit }]
  });
}

export function clearBardSpiritsOnRest(character: Character): Character {
  const state = getBardSpiritsState(character);
  return state.channeledSpirits?.length || state.pendingSpiritRolls?.length
    ? updateBardSpiritsState(character, { channeledSpirits: [], pendingSpiritRolls: [] })
    : character;
}
