import type { RoundTrackerResource } from "../combat";
import type { AbilityKey, CharacterCondition, SkillName } from "../../../types";

export type FeatureActionCard = {
  key: string;
  name: string;
  summary: string;
  detail: string;
  actionCost: RoundTrackerResource | null;
  usesLabel?: string;
  isActive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export type FeatureDamageBonus = {
  label: string;
  value: number;
};

export type WeaponFeatureContext = {
  name: string;
  ability: AbilityKey;
  attackKind: "weapon" | "unarmed";
};

export type FeatureIndicator = {
  label: string;
  tone: "advantage" | "disadvantage";
};

export type SavingThrowIndicatorMap = Partial<Record<AbilityKey, FeatureIndicator[]>>;

export type SkillIndicatorMap = Partial<Record<SkillName, FeatureIndicator[]>>;

export type FeatureSpellcastingState = {
  blocked: boolean;
  reason: string | null;
};

export type DerivedFeatureCondition = CharacterCondition & {
  source: "feature";
};

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
