import type { Character } from "../../types";
import { getCharacterRuntime } from "./characterRuntime/characterRuntime";
import {
  getFeatAlwaysPreparedCantripEntriesForCharacter,
  getFeatAlwaysPreparedSpellEntriesForCharacter,
  getFeatGrantedCantripEntriesForCharacter
} from "./feats/runtime";
import {
  getSpeciesAlwaysPreparedCantripEntriesForCharacter,
  getSpeciesGrantedCantripEntriesForCharacter
} from "./species";
import { isSpellcastingClass } from "./spellcasting";

export function hasSpellcastingForCharacter(character: Character): boolean {
  const spellcastingRuntime = getCharacterRuntime(character).spellcasting;

  return (
    isSpellcastingClass(character.className, character.level, character.subclassId) ||
    getFeatGrantedCantripEntriesForCharacter(character).length > 0 ||
    getSpeciesGrantedCantripEntriesForCharacter(character).length > 0 ||
    getFeatAlwaysPreparedCantripEntriesForCharacter(character).length > 0 ||
    getSpeciesAlwaysPreparedCantripEntriesForCharacter(character).length > 0 ||
    getFeatAlwaysPreparedSpellEntriesForCharacter(character).length > 0 ||
    spellcastingRuntime.featureAlwaysPreparedSpellIds.length > 0 ||
    spellcastingRuntime.featureAlwaysSpellbookSpellIds.length > 0
  );
}
