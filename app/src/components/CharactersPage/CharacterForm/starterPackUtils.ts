import { getClassStarterPack } from "../../../codex/classes";
import type {
  ClassStarterPack,
  StarterPackEquipmentChoice
} from "../../../codex/classes";
import { getCodexEntryById } from "../../../codex/selectors";
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
} from "../../../pages/CharactersPage/proficiency";
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
  savingThrowProficiencies: string[];
  skillProficiencies: SkillName[];
  skillProficiencySelectionCount: number;
  recommendedSkillProficiencies: SkillName[];
  weaponProficiencies: string[];
  armorTrainingProficiencies: string[];
  startingEquipment: StarterPackEquipmentChoice[];
  recommendedStartingEquipmentIndex: number | null;
  recommendedAbilityScores: ClassStarterPack["recommendedAbilityScores"] | null;
  hasConfiguredStarterPack: boolean;
};

function mapArmorTrainingTypesToLabels(armorTypes: ArmorType[]): string[] {
  return armorTypes.map((armorType) => formatCodexLabel(getArmorProficiencyForType(armorType)));
}

export function getResolvedStarterPack(className: string): ResolvedStarterPack {
  const configuredStarterPack = getClassStarterPack(className);

  if (configuredStarterPack) {
    return {
      primaryAbility: configuredStarterPack.primaryAbility,
      savingThrowProficiencies: configuredStarterPack.savingThrowProficiencies.map((entry) =>
        formatCodexLabel(entry)
      ),
      skillProficiencies: configuredStarterPack.skillProficiencies,
      skillProficiencySelectionCount: configuredStarterPack.skillProficiencySelectionCount,
      recommendedSkillProficiencies: configuredStarterPack.recommendedSkillProficiencies,
      weaponProficiencies: configuredStarterPack.weaponProficiencies.map((entry) =>
        formatCodexLabel(entry)
      ),
      armorTrainingProficiencies: configuredStarterPack.armorTrainingProficiencies.map((entry) =>
        formatCodexLabel(entry)
      ),
      startingEquipment: configuredStarterPack.startingEquipment,
      recommendedStartingEquipmentIndex: configuredStarterPack.recommendedStartingEquipmentIndex,
      recommendedAbilityScores: configuredStarterPack.recommendedAbilityScores,
      hasConfiguredStarterPack: true
    };
  }

  const classProfile = getClassProficiencyProfile(className);

  return {
    primaryAbility: getPrimaryAbilityForClass(className),
    savingThrowProficiencies: getSavingThrowAbilityKeysForClass(className).map((entry) =>
      formatCodexLabel(entry)
    ),
    skillProficiencies: getSkillProficiencyOptionsForClass(className),
    skillProficiencySelectionCount: getSkillSelectionLimitForClass(className),
    recommendedSkillProficiencies: [],
    weaponProficiencies: (classProfile?.weaponProficiencies ?? []).map((entry) =>
      formatCodexLabel(entry)
    ),
    armorTrainingProficiencies: classProfile
      ? mapArmorTrainingTypesToLabels(classProfile.armorProficiencies)
      : [],
    startingEquipment: [],
    recommendedStartingEquipmentIndex: null,
    recommendedAbilityScores: null,
    hasConfiguredStarterPack: false
  };
}

export function formatStarterPackEquipmentChoice(
  choice: StarterPackEquipmentChoice,
  choiceIndex: number
): string {
  const entries = choice.map((reference) => {
    if (reference.type === "currency") {
      return `${reference.amount} ${reference.currency}`;
    }

    const entry = getCodexEntryById(reference.entryId);
    const quantityPrefix =
      typeof reference.quantity === "number" && reference.quantity > 1
        ? `${reference.quantity} `
        : "";

    return `${quantityPrefix}${entry?.name ?? reference.entryId}`;
  });

  return `Option ${String.fromCharCode(65 + choiceIndex)}: ${entries.join(", ")}`;
}

export function materializeStarterPackEquipmentChoice(
  choice: StarterPackEquipmentChoice | null
): { equipment: string[]; currencies: CharacterCurrencies } {
  const equipment = new Set<string>();
  const currencies = createDefaultCurrencies();

  choice?.forEach((reference) => {
    if (reference.type === "currency") {
      const currencyKey = currencyKeyByCurrencyType[reference.currency];

      if (currencyKey) {
        currencies[currencyKey] += reference.amount;
      }

      return;
    }

    const entry = getCodexEntryById(reference.entryId);

    if (entry?.name) {
      equipment.add(entry.name);
    }
  });

  return {
    equipment: [...equipment],
    currencies
  };
}
