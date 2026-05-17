import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeCharacterProficiencies } from "../../../../../pages/CharactersPage/proficiency";
import type { Character } from "../../../../../types";

export type ClassFeatureChoiceModelArgs = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

export function recomputeCharacterFeatureProficiencies(nextCharacter: Character): Character {
  return {
    ...nextCharacter,
    ...normalizeCharacterProficiencies({
      className: nextCharacter.className,
      level: nextCharacter.level,
      species: nextCharacter.species,
      speciesChoices: nextCharacter.speciesChoices,
      background: nextCharacter.background,
      backgroundChoices: nextCharacter.backgroundChoices,
      subclassId: nextCharacter.subclassId,
      classFeatureState: nextCharacter.classFeatureState,
      skillProficiencies: nextCharacter.skillProficiencies,
      savingThrowProficiencies: nextCharacter.savingThrowProficiencies,
      weaponProficiencies: nextCharacter.weaponProficiencies,
      armorProficiencies: nextCharacter.armorProficiencies,
      toolProficiencies: nextCharacter.toolProficiencies,
      languageProficiencies: nextCharacter.languageProficiencies,
      feats: nextCharacter.feats ?? []
    })
  };
}
