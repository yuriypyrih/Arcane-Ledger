import {
  getSpellEntriesForAllSpellListClasses,
  getSpellEntriesForSpellListClasses
} from "../../codex/classes/spellAccess";
import { getPreparedSpellListClassesForCharacter } from "../../codex/classes/subclassSpellcasting";
import type { SpellEntry } from "../../codex/entries";
import type { CharacterClassRulesConfig, CharacterCustomClassConfig } from "../../types";
import { getSpellLevel } from "./spellLevels";
import { getSpellSlotTotalsForCharacter } from "./spellSlots";
import {
  getHighestSlotLevel,
  usesFlexibleSpellcastingRulesForCharacter,
  usesPreparedSpellsForCharacter
} from "./spellcastingRules";

export function getPreparedSpellSelectionOptionsForCharacter(
  className: string,
  level: number,
  subclassId?: string,
  customClass?: CharacterCustomClassConfig,
  classRules?: CharacterClassRulesConfig
): SpellEntry[] {
  if (
    usesFlexibleSpellcastingRulesForCharacter(
      className,
      level,
      subclassId,
      customClass,
      classRules
    )
  ) {
    return getSpellEntriesForAllSpellListClasses().filter((spell) => getSpellLevel(spell) > 0);
  }

  if (!usesPreparedSpellsForCharacter(className, level, subclassId, customClass, classRules)) {
    return [];
  }

  const highestSlotLevel = getHighestSlotLevel(
    getSpellSlotTotalsForCharacter(className, level, subclassId, customClass, classRules)
  );
  const preparedSpellEntries = getSpellEntriesForSpellListClasses(
    getPreparedSpellListClassesForCharacter(className, level, subclassId)
  );

  return preparedSpellEntries.filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel > 0 && spellLevel <= highestSlotLevel;
  });
}
