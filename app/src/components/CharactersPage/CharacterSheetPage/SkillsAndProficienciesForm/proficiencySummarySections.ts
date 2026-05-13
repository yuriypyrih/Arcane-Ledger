import type { CharacterProficiencyCollections } from "../../../../types";
import {
  getDisplayArmorProficiencyEntries,
  getDisplayLanguageProficiencyEntries,
  getDisplaySavingThrowProficiencyEntries,
  getDisplaySkillProficiencyEntries,
  getDisplayToolProficiencyEntries,
  getDisplayWeaponProficiencyEntries,
  isWeaponMasteryProficiency,
  type ProficiencyDisplayEntry
} from "../../../../pages/CharactersPage/proficiency";

export type ProficiencySummarySection = {
  title: string;
  entries: ProficiencyDisplayEntry[];
};

export function getProficiencySummarySections(
  collections: CharacterProficiencyCollections,
  className?: string
): ProficiencySummarySection[] {
  const displayedWeaponProficiencyEntries = getDisplayWeaponProficiencyEntries(
    collections.weaponProficiencies,
    className
  );
  const sections: ProficiencySummarySection[] = [
    {
      title: "Skill Proficiencies",
      entries: getDisplaySkillProficiencyEntries(collections.skillProficiencies)
    },
    {
      title: "Saving Throws",
      entries: getDisplaySavingThrowProficiencyEntries(collections.savingThrowProficiencies)
    },
    {
      title: "Weapon Proficiencies",
      entries: displayedWeaponProficiencyEntries.filter(
        (entry) => !isWeaponMasteryProficiency(entry.proficiency)
      )
    },
    {
      title: "Weapon Masteries",
      entries: displayedWeaponProficiencyEntries.filter((entry) =>
        isWeaponMasteryProficiency(entry.proficiency)
      )
    },
    {
      title: "Armor Training",
      entries: getDisplayArmorProficiencyEntries(collections.armorProficiencies)
    },
    {
      title: "Tool Proficiencies",
      entries: getDisplayToolProficiencyEntries(collections.toolProficiencies)
    },
    {
      title: "Languages",
      entries: getDisplayLanguageProficiencyEntries(collections.languageProficiencies)
    }
  ];

  return sections.filter((section) => section.entries.length > 0);
}
