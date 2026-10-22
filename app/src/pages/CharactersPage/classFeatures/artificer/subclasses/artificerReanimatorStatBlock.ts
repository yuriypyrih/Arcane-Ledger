import { SPELL_LIST_CLASS } from "../../../../../codex/entries/enums";
import { createReanimatedCompanionStatBlock } from "../../../../../codex/subclasses/artificerReanimatorCompanion";
import type { Character, MonsterRecord } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { getProficiencyBonus } from "../../../gameplay";
import { getClassLevel } from "../../../multiclassState";
import {
  getSpellAttackRollFormulaForCharacter,
  getSpellSaveFormulaCell
} from "../../../shared/spellFormulas";

export function getArtificerReanimatedCompanionStatBlock(character: Character): MonsterRecord {
  const intelligenceModifier = getAbilityModifierForCharacter(character, "INT");
  const proficiencyBonus = getProficiencyBonus(character);
  const spellContext = {
    isAttackSpell: true,
    isSavingThrowSpell: true,
    spellLists: [SPELL_LIST_CLASS.ARTIFICER]
  };

  return createReanimatedCompanionStatBlock({
    artificerLevel: getClassLevel(character, "Artificer"),
    intelligenceModifier,
    proficiencyBonus,
    spellAttackModifier:
      getSpellAttackRollFormulaForCharacter(spellContext, character, "INT")?.attackBonus ??
      proficiencyBonus + intelligenceModifier,
    spellSaveDc:
      getSpellSaveFormulaCell(spellContext, character, "INT")?.saveDc ??
      8 + proficiencyBonus + intelligenceModifier
  });
}
