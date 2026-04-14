import {
  formatStarterPackEquipmentChoice as formatStarterPackEquipmentChoiceValue,
  getClassStarterPack,
  getLevelOneWeaponMasteryCountForClass,
  type ClassStarterPack,
  type StarterPackEquipmentChoice,
  type StarterPackSelection
} from "../../../codex/classes/starterPack";
import { type CharacterCurrencies, type SkillName } from "../../../types";
import { createDefaultCurrencies } from "../../../pages/CharactersPage/constants";
import {
  type ArmorType,
  getArmorProficiencyForType,
  getPrimaryAbilityForClass,
  getClassProficiencyProfile,
  getSavingThrowAbilityKeysForClass,
  getSkillProficiencyOptionsForClass,
  getSkillSelectionLimitForClass
} from "../../../pages/CharactersPage/proficiencyClassData";
import {
  getToolProficiencyLabel,
  type ToolProficiency
} from "../../../pages/CharactersPage/proficiencyOptions";
import { formatCodexLabel } from "../../../utils/codex";

const currencyKeyByCurrencyType = {
  CP: "copper",
  SP: "silver",
  EP: "electrum",
  GP: "gold",
  PP: "platinum"
} as const satisfies Record<string, keyof CharacterCurrencies>;

export type ResolvedStarterPack = {
  primaryAbility: string | null;
  hitPointDieLabel: string | null;
  savingThrowProficiencies: string[];
  skillProficiencies: SkillName[];
  skillProficiencySelectionCount: number;
  recommendedSkillProficiencies: SkillName[];
  grantedToolProficiencies: string[];
  toolProficiencyChoices: string[];
  toolProficiencyChoiceCount: number;
  recommendedToolProficiencies: string[];
  weaponProficiencies: string[];
  armorTrainingProficiencies: string[];
  weaponMasteryCount: number;
  startingEquipment: StarterPackEquipmentChoice[];
  startingEquipmentSelections: StarterPackSelection[];
  recommendedStartingEquipmentIndex: number | null;
  recommendedAbilityScores: ClassStarterPack["recommendedAbilityScores"] | null;
  hasConfiguredStarterPack: boolean;
};

function mapArmorTrainingTypesToLabels(armorTypes: ArmorType[]): string[] {
  return armorTypes.map((armorType) => formatCodexLabel(getArmorProficiencyForType(armorType)));
}

function formatAbilityKeyLabel(value: string | null): string | null {
  return value ? formatCodexLabel(value) : null;
}

export function getResolvedStarterPack(className: string): ResolvedStarterPack {
  const configuredStarterPack = getClassStarterPack(className);

  if (configuredStarterPack) {
    return {
      primaryAbility:
        configuredStarterPack.primaryAbilityLabel ??
        formatAbilityKeyLabel(configuredStarterPack.primaryAbility),
      hitPointDieLabel: configuredStarterPack.hitPointDieLabel,
      savingThrowProficiencies: configuredStarterPack.savingThrowProficiencies.map((entry) =>
        formatCodexLabel(entry)
      ),
      skillProficiencies: configuredStarterPack.skillProficiencies,
      skillProficiencySelectionCount: configuredStarterPack.skillProficiencySelectionCount,
      recommendedSkillProficiencies: configuredStarterPack.recommendedSkillProficiencies,
      grantedToolProficiencies: (configuredStarterPack.grantedToolProficiencies ?? []).map((entry) =>
        getToolProficiencyLabel(entry as ToolProficiency)
      ),
      toolProficiencyChoices: (configuredStarterPack.toolProficiencyChoices ?? []).map((entry) =>
        getToolProficiencyLabel(entry as ToolProficiency)
      ),
      toolProficiencyChoiceCount: configuredStarterPack.toolProficiencyChoiceCount ?? 0,
      recommendedToolProficiencies: (configuredStarterPack.recommendedToolProficiencies ?? []).map(
        (entry) => getToolProficiencyLabel(entry as ToolProficiency)
      ),
      weaponProficiencies: configuredStarterPack.weaponProficiencies.map((entry) =>
        formatCodexLabel(entry)
      ),
      armorTrainingProficiencies: configuredStarterPack.armorTrainingProficiencies.map((entry) =>
        formatCodexLabel(entry)
      ),
      weaponMasteryCount:
        configuredStarterPack.weaponMasteryCount ??
        getLevelOneWeaponMasteryCountForClass(className),
      startingEquipment: configuredStarterPack.startingEquipment,
      startingEquipmentSelections: configuredStarterPack.startingEquipmentSelections ?? [],
      recommendedStartingEquipmentIndex: configuredStarterPack.recommendedStartingEquipmentIndex,
      recommendedAbilityScores: configuredStarterPack.recommendedAbilityScores,
      hasConfiguredStarterPack: true
    };
  }

  const classProfile = getClassProficiencyProfile(className);

  return {
    primaryAbility: formatAbilityKeyLabel(getPrimaryAbilityForClass(className)),
    hitPointDieLabel: null,
    savingThrowProficiencies: getSavingThrowAbilityKeysForClass(className).map((entry) =>
      formatCodexLabel(entry)
    ),
    skillProficiencies: getSkillProficiencyOptionsForClass(className),
    skillProficiencySelectionCount: getSkillSelectionLimitForClass(className),
    recommendedSkillProficiencies: [],
    grantedToolProficiencies: [],
    toolProficiencyChoices: [],
    toolProficiencyChoiceCount: 0,
    recommendedToolProficiencies: [],
    weaponProficiencies: (classProfile?.weaponProficiencies ?? []).map((entry) =>
      formatCodexLabel(entry)
    ),
    armorTrainingProficiencies: classProfile
      ? mapArmorTrainingTypesToLabels(classProfile.armorProficiencies)
      : [],
    weaponMasteryCount: getLevelOneWeaponMasteryCountForClass(className),
    startingEquipment: [],
    startingEquipmentSelections: [],
    recommendedStartingEquipmentIndex: null,
    recommendedAbilityScores: null,
    hasConfiguredStarterPack: false
  };
}

export function formatStarterPackEquipmentChoice(
  choice: StarterPackEquipmentChoice,
  choiceIndex: number,
  options?: {
    includeOptionLabel?: boolean;
    selectionLabels?: Record<string, string>;
  }
): string {
  return formatStarterPackEquipmentChoiceValue(choice, choiceIndex, options);
}

export function resolveStarterPackChoiceCurrencies(
  choice: StarterPackEquipmentChoice | null
): CharacterCurrencies {
  const currencies = createDefaultCurrencies();

  choice?.forEach((reference) => {
    if (reference.type !== "currency") {
      return;
    }

    const currencyKey = currencyKeyByCurrencyType[reference.currency];

    if (currencyKey) {
      currencies[currencyKey] += reference.amount;
    }
  });

  return currencies;
}

export function getStarterPackSelectionOptions(
  selection: StarterPackSelection,
  selectedToolProficiencies: string[]
): Array<{ value: string; label: string }> {
  if (selection.source !== "selectedToolProficiencies") {
    return [];
  }

  return [...new Set(selectedToolProficiencies)]
    .filter((tool) => selection.filter !== "musical-instrument" || tool.startsWith("MUSICAL_"))
    .map((tool) => ({
      value: tool,
      label: getToolProficiencyLabel(tool as ToolProficiency)
    }));
}

export function normalizeStarterPackSelectionValues(
  starterPack: ClassStarterPack | null,
  selectedToolProficiencies: string[],
  selectionValues: Record<string, string>
): Record<string, string> {
  if (!starterPack?.startingEquipmentSelections?.length) {
    return {};
  }

  return starterPack.startingEquipmentSelections.reduce<Record<string, string>>((nextValues, selection) => {
    const options = getStarterPackSelectionOptions(selection, selectedToolProficiencies);

    if (options.length === 0) {
      return nextValues;
    }

    const optionValues = new Set(options.map((option) => option.value));
    const recommendedValue =
      selection.recommendedValue && optionValues.has(selection.recommendedValue)
        ? selection.recommendedValue
        : null;
    const currentValue = selectionValues[selection.id];
    nextValues[selection.id] =
      currentValue && optionValues.has(currentValue)
        ? currentValue
        : (recommendedValue ?? options[0]?.value ?? "");
    return nextValues;
  }, {});
}

export function getStarterPackSelectionLabels(
  starterPack: ClassStarterPack | null,
  selectedToolProficiencies: string[],
  selectionValues: Record<string, string>
): Record<string, string> {
  if (!starterPack?.startingEquipmentSelections?.length) {
    return {};
  }

  return starterPack.startingEquipmentSelections.reduce<Record<string, string>>((labels, selection) => {
    const options = getStarterPackSelectionOptions(selection, selectedToolProficiencies);
    const selectionValue = selectionValues[selection.id];
    const selectedOption = options.find((option) => option.value === selectionValue);

    if (selectedOption) {
      labels[selection.id] = selectedOption.label;
    }

    return labels;
  }, {});
}
