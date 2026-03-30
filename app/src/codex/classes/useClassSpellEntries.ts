import { useMemo } from "react";
import { SPELL_LIST_CLASS } from "../entries/enums";
import type { SpellEntry } from "../entries/types";
import { useArtificerSpellEntries } from "./artificer";
import { useBardSpellEntries } from "./bard";
import { useClericSpellEntries } from "./cleric";
import { useDruidSpellEntries } from "./druid";
import { usePaladinSpellEntries } from "./paladin";
import { useRangerSpellEntries } from "./ranger";
import { useSorcererSpellEntries } from "./sorcerer";
import { useWarlockSpellEntries } from "./warlock";
import { useWizardSpellEntries } from "./wizard";

const emptySpellEntries: SpellEntry[] = [];

function getPreparedSpellAccessListClasses(className: string, level: number): SPELL_LIST_CLASS[] {
  if (className === "Bard" && level >= 10) {
    return [
      SPELL_LIST_CLASS.BARD,
      SPELL_LIST_CLASS.CLERIC,
      SPELL_LIST_CLASS.DRUID,
      SPELL_LIST_CLASS.WIZARD
    ];
  }

  switch (className) {
    case "Artificer":
      return [SPELL_LIST_CLASS.ARTIFICER];
    case "Bard":
      return [SPELL_LIST_CLASS.BARD];
    case "Cleric":
      return [SPELL_LIST_CLASS.CLERIC];
    case "Druid":
      return [SPELL_LIST_CLASS.DRUID];
    case "Paladin":
      return [SPELL_LIST_CLASS.PALADIN];
    case "Ranger":
      return [SPELL_LIST_CLASS.RANGER];
    case "Sorcerer":
      return [SPELL_LIST_CLASS.SORCERER];
    case "Warlock":
      return [SPELL_LIST_CLASS.WARLOCK];
    case "Wizard":
      return [SPELL_LIST_CLASS.WIZARD];
    default:
      return [];
  }
}

export function useClassSpellEntries(className: string): SpellEntry[] {
  const artificerSpellEntries = useArtificerSpellEntries();
  const bardSpellEntries = useBardSpellEntries();
  const clericSpellEntries = useClericSpellEntries();
  const druidSpellEntries = useDruidSpellEntries();
  const paladinSpellEntries = usePaladinSpellEntries();
  const rangerSpellEntries = useRangerSpellEntries();
  const sorcererSpellEntries = useSorcererSpellEntries();
  const warlockSpellEntries = useWarlockSpellEntries();
  const wizardSpellEntries = useWizardSpellEntries();

  return useMemo(() => {
    switch (className) {
      case "Artificer":
        return artificerSpellEntries;
      case "Bard":
        return bardSpellEntries;
      case "Cleric":
        return clericSpellEntries;
      case "Druid":
        return druidSpellEntries;
      case "Paladin":
        return paladinSpellEntries;
      case "Ranger":
        return rangerSpellEntries;
      case "Sorcerer":
        return sorcererSpellEntries;
      case "Warlock":
        return warlockSpellEntries;
      case "Wizard":
        return wizardSpellEntries;
      default:
        return emptySpellEntries;
    }
  }, [
    artificerSpellEntries,
    bardSpellEntries,
    className,
    clericSpellEntries,
    druidSpellEntries,
    paladinSpellEntries,
    rangerSpellEntries,
    sorcererSpellEntries,
    warlockSpellEntries,
    wizardSpellEntries
  ]);
}

export function usePreparedSpellEntries(className: string, level: number): SpellEntry[] {
  const artificerSpellEntries = useArtificerSpellEntries();
  const bardSpellEntries = useBardSpellEntries();
  const clericSpellEntries = useClericSpellEntries();
  const druidSpellEntries = useDruidSpellEntries();
  const paladinSpellEntries = usePaladinSpellEntries();
  const rangerSpellEntries = useRangerSpellEntries();
  const sorcererSpellEntries = useSorcererSpellEntries();
  const warlockSpellEntries = useWarlockSpellEntries();
  const wizardSpellEntries = useWizardSpellEntries();

  return useMemo(() => {
    const spellEntriesByListClass = new Map<SPELL_LIST_CLASS, SpellEntry[]>([
      [SPELL_LIST_CLASS.ARTIFICER, artificerSpellEntries],
      [SPELL_LIST_CLASS.BARD, bardSpellEntries],
      [SPELL_LIST_CLASS.CLERIC, clericSpellEntries],
      [SPELL_LIST_CLASS.DRUID, druidSpellEntries],
      [SPELL_LIST_CLASS.PALADIN, paladinSpellEntries],
      [SPELL_LIST_CLASS.RANGER, rangerSpellEntries],
      [SPELL_LIST_CLASS.SORCERER, sorcererSpellEntries],
      [SPELL_LIST_CLASS.WARLOCK, warlockSpellEntries],
      [SPELL_LIST_CLASS.WIZARD, wizardSpellEntries]
    ]);
    const mergedEntries = new Map<string, SpellEntry>();

    getPreparedSpellAccessListClasses(className, level).forEach((spellListClass) => {
      (spellEntriesByListClass.get(spellListClass) ?? []).forEach((spell) => {
        mergedEntries.set(spell.id, spell);
      });
    });

    return [...mergedEntries.values()].sort((left, right) => {
      if (left.spellLevel !== right.spellLevel) {
        return left.spellLevel - right.spellLevel;
      }

      return left.name.localeCompare(right.name);
    });
  }, [
    artificerSpellEntries,
    bardSpellEntries,
    className,
    clericSpellEntries,
    druidSpellEntries,
    level,
    paladinSpellEntries,
    rangerSpellEntries,
    sorcererSpellEntries,
    warlockSpellEntries,
    wizardSpellEntries
  ]);
}
