import { getClassEntryByName } from "../../codex/selectors";
import type {
  AbilityKey,
  Character,
  CharacterClassRulesConfig,
  CharacterCustomHitDie
} from "../../types";
import {
  defaultCharacterClassRulesConfig,
  normalizeCustomClassHitDie
} from "./customClass";
import { getPrimaryAbilityForClass } from "./proficiencyClassData";
import { getBuiltInSpellcastingAbilityForCharacter } from "./shared/spellFormulas";

export function getDefaultClassRulesHitDie(className: string): CharacterCustomHitDie {
  const classEntry = getClassEntryByName(className);
  const rawHitDie = typeof classEntry?.hitPointDie === "string" ? classEntry.hitPointDie : "";

  return normalizeCustomClassHitDie(rawHitDie.toLowerCase());
}

export function getDefaultClassRulesSpellcastingAbility(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId">>
): AbilityKey {
  return (
    getBuiltInSpellcastingAbilityForCharacter(character) ??
    getPrimaryAbilityForClass(character.className) ??
    defaultCharacterClassRulesConfig.spellcastingAbility
  );
}

export function seedClassRulesDefaultsForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId">>,
  classRules: CharacterClassRulesConfig
): CharacterClassRulesConfig {
  return {
    ...classRules,
    hitDie: getDefaultClassRulesHitDie(character.className),
    spellcastingAbility: getDefaultClassRulesSpellcastingAbility(character)
  };
}
