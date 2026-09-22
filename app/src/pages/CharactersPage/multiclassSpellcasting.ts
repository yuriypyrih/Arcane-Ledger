import type { Character, CharacterClassEntry } from "../../types";
import { getCastingProgression } from "../../codex/classes/multiclass";
import {
  projectStartingClass,
  getCharacterClasses,
  getClassEditorCharacter,
  applyClassEditorChange
} from "./multiclass";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "./spellSlots";

export type CharacterSpellSlotPool = {
  id: string;
  label: string;
  recovery: "short-rest" | "long-rest";
  totals: number[];
  expended: number[];
};

export function getCasterLevelContribution(entry: CharacterClassEntry): number {
  const level = Math.min(20, entry.level);
  switch (getCastingProgression(entry)) {
    case "full":
      return level;
    case "half":
      return Math.ceil(level / 2);
    case "third":
      return Math.floor(level / 3);
    default:
      return 0;
  }
}

export function getClassSpellSlotTotals(entry: CharacterClassEntry): number[] {
  return getSpellSlotTotalsForCharacter(
    entry.className,
    entry.level,
    entry.subclassId,
    entry.customClass,
    entry.classRules
  );
}

export function getCharacterSpellSlotPools(character: object): CharacterSpellSlotPool[] {
  const value = character as Character;
  const classes = getCharacterClasses(character);
  if (!value.multiclass) {
    const entry = classes[0];
    const totals = getClassSpellSlotTotals(entry);
    return [
      {
        id: "standard",
        label: entry.className === "Warlock" ? "Pact Magic" : "Spellcasting",
        recovery: entry.className === "Warlock" ? "short-rest" : "long-rest",
        totals,
        expended: normalizeSpellSlotsExpended(value.spellSlotsExpended, totals)
      }
    ];
  }
  const casters = classes.filter((entry) =>
    ["full", "half", "third"].includes(getCastingProgression(entry))
  );
  const totals =
    casters.length === 1
      ? getClassSpellSlotTotals(casters[0])
      : casters.length > 1
        ? getSpellSlotTotalsForCharacter(
            "Wizard",
            Math.min(
              20,
              casters.reduce((sum, entry) => sum + getCasterLevelContribution(entry), 0)
            )
          )
        : Array(9).fill(0);
  const pools: CharacterSpellSlotPool[] = [
    {
      id: "standard",
      label: "Shared spell slots",
      recovery: "long-rest",
      totals,
      expended: normalizeSpellSlotsExpended(value.spellSlotsExpended, totals)
    }
  ];
  for (const entry of classes) {
    const casting = getCastingProgression(entry);
    if (casting !== "pact" && casting !== "manual") continue;
    const id = `${casting}:${entry.id}`;
    const entryTotals = getClassSpellSlotTotals(entry);
    pools.push({
      id,
      label: `${entry.customClass?.name || entry.className} ${casting === "pact" ? "Pact Magic" : "manual slots"}`,
      recovery: casting === "pact" ? "short-rest" : "long-rest",
      totals: entryTotals,
      expended: normalizeSpellSlotsExpended(value.multiclass.slotPoolsExpended?.[id], entryTotals)
    });
  }
  return pools;
}

export function getSheetSpellSlotTotals(character: object): number[] {
  const value = character as Character;
  const pools = getCharacterSpellSlotPools(character);
  return (pools.find((pool) => pool.id === (value.slotPoolId ?? "standard")) ?? pools[0]).totals;
}

export function setSlotPoolExpended(
  character: Character,
  poolId: string,
  expended: number[]
): Character {
  const pool = getCharacterSpellSlotPools(character).find((candidate) => candidate.id === poolId);
  if (!pool) return character;
  const normalized = normalizeSpellSlotsExpended(expended, pool.totals);
  if (poolId === "standard" || !character.multiclass)
    return { ...character, spellSlotsExpended: normalized };
  return {
    ...character,
    ...(character.slotPoolId === poolId ? { spellSlotsExpended: normalized } : {}),
    multiclass: {
      ...character.multiclass,
      slotPoolsExpended: { ...character.multiclass.slotPoolsExpended, [poolId]: normalized }
    }
  };
}

export function recoverSlotPools(
  character: Character,
  rest: "short-rest" | "long-rest"
): Character {
  return getCharacterSpellSlotPools(character).reduce(
    (current, pool) =>
      pool.totals.some((total) => total > 0) && (rest === "long-rest" || pool.recovery === rest)
        ? setSlotPoolExpended(current, pool.id, Array(9).fill(0))
        : current,
    character
  );
}

export function getSpellcastingClassView(
  character: Character,
  entryId: string,
  poolId: string
): Character {
  const entry = getCharacterClasses(character).find((item) => item.id === entryId);
  if (!entry || !character.multiclass) return character;
  const pool = getCharacterSpellSlotPools(character).find((item) => item.id === poolId);
  return {
    ...getClassEditorCharacter(character, entry),
    spellSourceClassEntryId: entry.id,
    slotPoolId: pool?.id ?? "standard",
    spellSlotsExpended: pool?.expended ?? []
  };
}

/** Redirect the legacy slot editor/casting transaction to the explicitly selected payment pool. */
export function applySpellcastingClassChange(
  character: Character,
  entryId: string,
  poolId: string,
  update: (view: Character) => Character
): Character {
  if (!character.multiclass) return update(character);
  const before = getSpellcastingClassView(character, entryId, poolId);
  const after = update(before);
  if (before === after) return character;
  const result = applyClassEditorChange(character, entryId, () => ({
    ...after,
    spellSlotsExpended: character.spellSlotsExpended,
    slotPoolId: undefined
  }));
  return setSlotPoolExpended(result, poolId, after.spellSlotsExpended ?? []);
}

/** Gameplay keeps every class active while a feature selects its casting source and payment pool. */
export function getGameplayClassContext(
  character: Character,
  entryId: string | undefined,
  poolId: string
): Character {
  if (!character.multiclass) return character;
  const entry = character.multiclass.classes.find((item) => item.id === entryId);
  const pool = getCharacterSpellSlotPools(character).find((item) => item.id === poolId);
  return {
    ...(entry ? getClassEditorCharacter(character, entry) : character),
    classFeatureState: character.classFeatureState,
    classEntryId: undefined,
    level: character.level,
    spellSourceClassEntryId: entry?.id,
    slotPoolId: pool?.id ?? "standard",
    spellSlotsExpended: pool?.expended ?? character.spellSlotsExpended
  };
}

export function applyGameplayClassChange(
  character: Character,
  entryId: string | undefined,
  poolId: string,
  update: (view: Character) => Character
): Character {
  if (!character.multiclass) return update(character);
  const view = getGameplayClassContext(character, entryId, poolId);
  const after = update(view);
  if (view === after) return character;
  return setSlotPoolExpended(
    projectStartingClass({ ...after, spellSlotsExpended: character.spellSlotsExpended }),
    poolId,
    after.spellSlotsExpended ?? []
  );
}
