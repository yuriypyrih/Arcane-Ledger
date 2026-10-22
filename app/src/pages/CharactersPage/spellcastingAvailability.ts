import { getCharacterClasses } from "./multiclassState";
import { getCastingProgression } from "../../codex/classes/multiclass";
import type { Character } from "../../types";
import { getCharacterRuntime } from "./characterRuntime/characterRuntime";
import { getClassRuntimeCharacter } from "./characterRuntime/classContexts";
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

export function getCharacterSpellcastingSources(character: Character) {
  const classes = getCharacterClasses(character);
  const sources = classes.filter((entry) => {
    if (getCastingProgression(entry) !== "none") return true;
    const runtime = getCharacterRuntime(getClassRuntimeCharacter(character, entry)).spellcasting;
    return (
      runtime.featureAlwaysPreparedSpellIds.length > 0 ||
      runtime.featureAlwaysSpellbookSpellIds.length > 0
    );
  });
  return sources.length > 0 ? sources : classes.slice(0, 1);
}

export function hasSpellcastingForCharacter(character: Character): boolean {
  const spellcastingRuntime = getCharacterRuntime(character).spellcasting;

  return (
    (Boolean(character.multiclass) &&
      getCharacterClasses(character).some((entry) => getCastingProgression(entry) !== "none")) ||
    isSpellcastingClass(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    ) ||
    getFeatGrantedCantripEntriesForCharacter(character).length > 0 ||
    getSpeciesGrantedCantripEntriesForCharacter(character).length > 0 ||
    getFeatAlwaysPreparedCantripEntriesForCharacter(character).length > 0 ||
    getSpeciesAlwaysPreparedCantripEntriesForCharacter(character).length > 0 ||
    getFeatAlwaysPreparedSpellEntriesForCharacter(character).length > 0 ||
    spellcastingRuntime.featureAlwaysPreparedSpellIds.length > 0 ||
    spellcastingRuntime.featureAlwaysSpellbookSpellIds.length > 0
  );
}
