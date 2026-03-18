import { useMemo } from "react";
import type { SpellEntry } from "../entries/types";
import { useBardSpellEntries } from "./bard";
import { useClericSpellEntries } from "./cleric";
import { useDruidSpellEntries } from "./druid";
import { usePaladinSpellEntries } from "./paladin";
import { useRangerSpellEntries } from "./ranger";
import { useSorcererSpellEntries } from "./sorcerer";
import { useWarlockSpellEntries } from "./warlock";
import { useWizardSpellEntries } from "./wizard";

const emptySpellEntries: SpellEntry[] = [];

export function useClassSpellEntries(className: string): SpellEntry[] {
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
