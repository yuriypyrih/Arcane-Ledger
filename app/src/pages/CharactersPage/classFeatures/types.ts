import type { RoundTrackerResource } from "../combat";
import type {
  AbilityKey,
  ArmorProficiencyEntry,
  CharacterStatusEntry,
  CoreStats,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";

export type FeatureActionCard = {
  key: string;
  name: string;
  summary: string;
  detail: string;
  actionCost: RoundTrackerResource | null;
  interaction?: "activate" | "select";
  usesLabel?: string;
  isActive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export type FeatureActionOptionCard = {
  key: string;
  name: string;
  summary: string;
  detail: string;
  resultLabel?: string;
  rangeResultLabel?: string;
  breakdown?: string;
  rollFormula?: string;
  rollFormulaDisplay?: string;
  rollDescription?: string;
};

export type FeatureDamageBonus = {
  label: string;
  value?: number;
  formula?: string;
  displayLabel?: string;
};

export type FeatureSkillBonus = {
  label: string;
  value?: number;
  abilityModifierSource?: AbilityKey;
  minimumValue?: number;
};

export type WeaponFeatureContext = {
  name: string;
  ability: AbilityKey;
  attackKind: "weapon" | "unarmed";
};

export type FeatureIndicator = {
  label: string;
  tone: "advantage" | "disadvantage";
  source: string;
};

export type CoreStatIndicatorMap = Partial<Record<keyof CoreStats, FeatureIndicator[]>>;

export type SavingThrowIndicatorMap = Partial<Record<AbilityKey, FeatureIndicator[]>>;

export type SkillIndicatorMap = Partial<Record<SkillName, FeatureIndicator[]>>;

export type FeatureSpellcastingState = {
  blocked: boolean;
  reason: string | null;
};

export type DerivedFeatureStatusEntry = CharacterStatusEntry;

export type ArmorClassFeatureContext = {
  hasWornBodyArmor: boolean;
  hasShieldEquipped: boolean;
};

export type FeatureArmorClassMode = {
  key: string;
  label: string;
  baseValue: number;
  abilityModifiers: AbilityKey[];
  abilityModifierCaps?: Partial<Record<AbilityKey, number | null>>;
  shieldAllowed: boolean;
  detail?: string;
};

export type FeatureArmorClassBonus = {
  label: string;
  value: number;
};

export type SpeedFeatureContext = {
  wornBodyArmorType: "light" | "medium" | "heavy" | null;
};

export type FeatureSpeedBonus = {
  label: string;
  value: number;
};

export type FeatureAbilityScoreBonus = {
  ability: AbilityKey;
  label: string;
  value: number;
  maxScore?: number | null;
  order?: number;
};

export type FeatureSkillProficiencyEntry = SkillProficiencyEntry;
export type FeatureWeaponProficiencyEntry = WeaponProficiencyEntry;

export type FeatureArmorProficiencyEntry = ArmorProficiencyEntry;
export type FeatureLanguageProficiencyEntry = LanguageProficiencyEntry;
