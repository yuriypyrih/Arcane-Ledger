import type {
  ArmorProficiencyEntry,
  Character,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";

export type ProficiencyEditorDraft = {
  armorProficiencies: ArmorProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  skillProficiencies: SkillProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
};

function areDraftListsEqual<T>(left: T[], right: T[]): boolean {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

export function createProficiencyEditorDraft(character: Character): ProficiencyEditorDraft {
  return {
    armorProficiencies: character.armorProficiencies,
    languageProficiencies: character.languageProficiencies,
    savingThrowProficiencies: character.savingThrowProficiencies,
    skillProficiencies: character.skillProficiencies,
    toolProficiencies: character.toolProficiencies,
    weaponProficiencies: character.weaponProficiencies
  };
}

export function createProficiencyDraftCharacter(
  character: Character,
  draft: ProficiencyEditorDraft
): Character {
  return {
    ...character,
    armorProficiencies: draft.armorProficiencies,
    languageProficiencies: draft.languageProficiencies,
    savingThrowProficiencies: draft.savingThrowProficiencies,
    skillProficiencies: draft.skillProficiencies,
    toolProficiencies: draft.toolProficiencies,
    weaponProficiencies: draft.weaponProficiencies
  };
}

export function applyProficiencyEditorDraftToCharacter(
  currentCharacter: Character,
  draft: ProficiencyEditorDraft
): Character {
  if (
    areDraftListsEqual(currentCharacter.armorProficiencies, draft.armorProficiencies) &&
    areDraftListsEqual(currentCharacter.languageProficiencies, draft.languageProficiencies) &&
    areDraftListsEqual(
      currentCharacter.savingThrowProficiencies,
      draft.savingThrowProficiencies
    ) &&
    areDraftListsEqual(currentCharacter.skillProficiencies, draft.skillProficiencies) &&
    areDraftListsEqual(currentCharacter.toolProficiencies, draft.toolProficiencies) &&
    areDraftListsEqual(currentCharacter.weaponProficiencies, draft.weaponProficiencies)
  ) {
    return currentCharacter;
  }

  return createProficiencyDraftCharacter(currentCharacter, draft);
}
