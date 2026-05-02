import {
  FEATS,
  SPELL_LIST_CLASS,
  type BackgroundEntry
} from "../../codex/entries";
import { formatStarterPackStartingEquipmentSummary } from "../../codex/classes/starterPack";
import { getFeatLabel } from "../../pages/CharactersPage/feats";
import { getToolProficiencyLabel } from "../../pages/CharactersPage/proficiencyOptions";
import type { AbilityKey } from "../../types/characters";

const abilityLabels: Record<AbilityKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma"
};

const magicInitiateSpellListLabels: Record<
  SPELL_LIST_CLASS.CLERIC | SPELL_LIST_CLASS.DRUID | SPELL_LIST_CLASS.WIZARD,
  string
> = {
  [SPELL_LIST_CLASS.CLERIC]: "Cleric",
  [SPELL_LIST_CLASS.DRUID]: "Druid",
  [SPELL_LIST_CLASS.WIZARD]: "Wizard"
};

export function formatBackgroundAbilityScoreOptions(background: BackgroundEntry): string {
  return `${background.abilityScoreOptions.map((ability) => abilityLabels[ability]).join(", ")}. Choose +2/+1 or +1/+1/+1 among these abilities.`;
}

export function formatBackgroundOriginFeat(background: BackgroundEntry): string {
  const featLabel = getFeatLabel(background.originFeat);

  if (background.originFeat === FEATS.MAGIC_INITIATE && background.originFeatSpellList) {
    return `${featLabel} (${magicInitiateSpellListLabels[background.originFeatSpellList]})`;
  }

  return featLabel;
}

export function formatBackgroundProficiencies(background: BackgroundEntry): string {
  const skillLabel = background.grantedSkillProficiencies.join(", ") || "None";
  const toolLabel =
    background.toolProficiencyChoices && background.toolProficiencyChoices.length > 0
      ? `Choose one kind of ${background.toolProficiencyChoiceLabel ?? "Tool"}`
      : background.grantedToolProficiencies.map(getToolProficiencyLabel).join(", ") || "None";

  return `Skills: ${skillLabel}; Tools: ${toolLabel}.`;
}

export function formatBackgroundEquipmentOptions(background: BackgroundEntry): string {
  return formatStarterPackStartingEquipmentSummary(background.starterPack.startingEquipment);
}
