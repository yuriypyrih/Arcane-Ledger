import { getSpellEntriesForSpellListClass } from "../../../codex/classes/spellAccess";
import { FEATS, SPELL_LIST_CLASS } from "../../../codex/entries/enums";

type CantripChoice = { cantripIds: [string, string] };

function defineCantripChoice(
  label: string,
  classLabel: string,
  spellList: SPELL_LIST_CLASS,
  preferredNames: [string, string]
) {
  const options = getSpellEntriesForSpellListClass(spellList).filter(
    (spell) => spell.spellLevel === 0
  );
  const byId = new Map(options.map((spell) => [spell.id, spell]));

  function read(value: unknown, trim: boolean): CantripChoice | undefined {
    if (!value || typeof value !== "object" || !("cantripIds" in value)) return undefined;
    if (!Array.isArray(value.cantripIds) || value.cantripIds.length !== 2) return undefined;
    const ids = [
      ...new Set(
        value.cantripIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => (trim ? id.trim() : id))
      )
    ];
    return ids.length === 2 && ids.every((id) => byId.has(id))
      ? { cantripIds: ids as [string, string] }
      : undefined;
  }

  return {
    label,
    cancelLabel: `Cancel ${label.toLowerCase()} selection`,
    validationMessage: `Choose two different ${classLabel} cantrips.`,
    options,
    preferredNames,
    getEntries: (choice: CantripChoice) =>
      choice.cantripIds.flatMap((id) => {
        const spell = byId.get(id);
        return spell ? [spell] : [];
      }),
    normalize: (value: unknown) => read(value, true),
    decodeDraft: (value: CantripChoice) => read(value, false) ?? null,
    getSummary: (choice?: CantripChoice | null) => {
      const names = choice?.cantripIds.map((id) => byId.get(id)?.name).filter(Boolean) ?? [];
      return names.length > 0 ? names.join(", ") : null;
    }
  };
}

export const cantripChoices = {
  [FEATS.BLESSED_WARRIOR]: defineCantripChoice(
    "Blessed Warrior",
    "Cleric",
    SPELL_LIST_CLASS.CLERIC,
    ["Guidance", "Sacred Flame"]
  ),
  [FEATS.DRUIDIC_WARRIOR]: defineCantripChoice("Druidic Warrior", "Druid", SPELL_LIST_CLASS.DRUID, [
    "Guidance",
    "Starry Wisp"
  ])
};
