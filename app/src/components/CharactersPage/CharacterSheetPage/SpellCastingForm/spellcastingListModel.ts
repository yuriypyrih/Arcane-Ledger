import type { ComponentProps } from "react";
import type SpellListRow from "../../../SpellListRow";
import type { SpellEntry } from "../../../../codex/entries";
import { getSpellLevel } from "../../../../pages/CharactersPage/spellcasting";

export type SpellListRowActionShapes = ComponentProps<typeof SpellListRow>["actionShapes"];

export type SpellGroup<TSpell = SpellEntry> = {
  level: number;
  spells: TSpell[];
};

export type SpellRowModel = {
  spell: SpellEntry;
  valueSummary: string;
  detailNote?: string;
  detailNoteTone: "default" | "accent";
  alwaysPrepared: boolean;
  alwaysSpellbook: boolean;
  highlightTone: "default" | "spell-mastery";
  actionShapes: SpellListRowActionShapes;
};

export type SpellcastingListModel = {
  visibleSpellEntries: SpellEntry[];
  preparedSpellGroups: SpellGroup[];
  preparedSpellRowGroups: SpellGroup<SpellRowModel>[];
};

export function groupSpellsByLevel(spells: SpellEntry[]): SpellGroup[] {
  const spellsByLevel = spells.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());

  return [...spellsByLevel.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, levelSpells]) => ({
      level,
      spells: [...levelSpells].sort((left, right) => left.name.localeCompare(right.name))
    }));
}

export function createSpellRowModel({
  spell,
  actionShapes,
  alwaysPreparedSpellIdSet,
  alwaysPreparedCantripIdSet,
  alwaysSpellbookSpellIdSet,
  spellOutcomeSummariesById,
  wizardSignatureSpellIdSet,
  wizardSpellbookOnlyIdSet,
  wizardSpellbookOnlyRitualIdSet,
  wizardSpellMasterySpellIdSet
}: {
  spell: SpellEntry;
  actionShapes: SpellListRowActionShapes;
  alwaysPreparedSpellIdSet: ReadonlySet<string>;
  alwaysPreparedCantripIdSet: ReadonlySet<string>;
  alwaysSpellbookSpellIdSet: ReadonlySet<string>;
  spellOutcomeSummariesById: ReadonlyMap<string, string>;
  wizardSignatureSpellIdSet: ReadonlySet<string>;
  wizardSpellbookOnlyIdSet: ReadonlySet<string>;
  wizardSpellbookOnlyRitualIdSet: ReadonlySet<string>;
  wizardSpellMasterySpellIdSet: ReadonlySet<string>;
}): SpellRowModel {
  const isWizardSpellbookOnly = wizardSpellbookOnlyIdSet.has(spell.id);

  return {
    spell,
    valueSummary: isWizardSpellbookOnly ? "" : (spellOutcomeSummariesById.get(spell.id) ?? ""),
    detailNote: wizardSpellbookOnlyRitualIdSet.has(spell.id)
      ? "Ritual from spellbook"
      : isWizardSpellbookOnly
        ? "In Spellbook but not prepared"
        : undefined,
    detailNoteTone: isWizardSpellbookOnly ? "accent" : "default",
    alwaysPrepared:
      alwaysPreparedSpellIdSet.has(spell.id) || alwaysPreparedCantripIdSet.has(spell.id),
    alwaysSpellbook: alwaysSpellbookSpellIdSet.has(spell.id),
    highlightTone:
      wizardSpellMasterySpellIdSet.has(spell.id) || wizardSignatureSpellIdSet.has(spell.id)
        ? "spell-mastery"
        : "default",
    actionShapes
  };
}

export function createSpellRowGroups({
  preparedSpellGroups,
  spellActionShapesById,
  alwaysPreparedSpellIdSet,
  alwaysPreparedCantripIdSet,
  alwaysSpellbookSpellIdSet,
  spellOutcomeSummariesById,
  wizardSignatureSpellIdSet,
  wizardSpellbookOnlyIdSet,
  wizardSpellbookOnlyRitualIdSet,
  wizardSpellMasterySpellIdSet
}: {
  preparedSpellGroups: SpellGroup[];
  spellActionShapesById: ReadonlyMap<string, SpellListRowActionShapes>;
  alwaysPreparedSpellIdSet: ReadonlySet<string>;
  alwaysPreparedCantripIdSet: ReadonlySet<string>;
  alwaysSpellbookSpellIdSet: ReadonlySet<string>;
  spellOutcomeSummariesById: ReadonlyMap<string, string>;
  wizardSignatureSpellIdSet: ReadonlySet<string>;
  wizardSpellbookOnlyIdSet: ReadonlySet<string>;
  wizardSpellbookOnlyRitualIdSet: ReadonlySet<string>;
  wizardSpellMasterySpellIdSet: ReadonlySet<string>;
}): SpellGroup<SpellRowModel>[] {
  return preparedSpellGroups.map((group) => ({
    level: group.level,
    spells: group.spells.map((spell) =>
      createSpellRowModel({
        spell,
        actionShapes: spellActionShapesById.get(spell.id) ?? [],
        alwaysPreparedSpellIdSet,
        alwaysPreparedCantripIdSet,
        alwaysSpellbookSpellIdSet,
        spellOutcomeSummariesById,
        wizardSignatureSpellIdSet,
        wizardSpellbookOnlyIdSet,
        wizardSpellbookOnlyRitualIdSet,
        wizardSpellMasterySpellIdSet
      })
    )
  }));
}
