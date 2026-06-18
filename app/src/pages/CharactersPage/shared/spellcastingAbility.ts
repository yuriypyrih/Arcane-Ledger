import type { AbilityKey, Character } from "../../../types";
import {
  areCharacterClassRulesEnforced,
  getCharacterClassRulesSpellcastingAbility
} from "../customClass";
import { getFeatSpellcastingAbilityForCharacter } from "../feats/runtime/spellcasting";
import { getSpeciesSpellcastingAbilityForCharacter } from "../species";

const spellcastingAbilityByClassName: Record<string, AbilityKey> = {
  Artificer: "INT",
  Bard: "CHA",
  Cleric: "WIS",
  Druid: "WIS",
  Paladin: "CHA",
  Ranger: "WIS",
  Sorcerer: "CHA",
  Warlock: "CHA",
  Wizard: "INT"
};

const spellcastingAbilityBySubclassId: Record<string, AbilityKey> = {
  "fighter-eldritch-knight": "INT",
  "monk-warrior-of-the-elements": "WIS",
  "rogue-arcane-trickster": "INT"
};

export function getBuiltInSpellcastingAbilityForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId">>
): AbilityKey | null {
  if (character.subclassId) {
    const subclassAbility = spellcastingAbilityBySubclassId[character.subclassId];

    if (subclassAbility) {
      return subclassAbility;
    }
  }

  return spellcastingAbilityByClassName[character.className] ?? null;
}

export function getSpellcastingAbilityForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classRules" | "customClass" | "subclassId">>
): AbilityKey | null {
  if (!areCharacterClassRulesEnforced(character)) {
    return getCharacterClassRulesSpellcastingAbility(character);
  }

  return getBuiltInSpellcastingAbilityForCharacter(character);
}

export function getSpellcastingAbilityForCharacterSpell(
  character: Character,
  spellId: string
): AbilityKey | null {
  return (
    getSpeciesSpellcastingAbilityForCharacter(character, spellId) ??
    getFeatSpellcastingAbilityForCharacter(character, spellId) ??
    getSpellcastingAbilityForCharacter(character)
  );
}
