import type {
  SpellDescriptionEntry,
  WeaponDamage,
  WeaponRange,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "../../../codex/entries";
import type { AbilityKey, Character, CharacterStatusEntry } from "../../../types";
import type { EconomyType } from "../actionEconomy";
import type { FeatureActionFact, FeatureDamageBonus } from "../classFeatures";
import type { WeaponAction } from "../gameplay";

export type EphemeralWeaponCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "background"
      | "backgroundChoices"
      | "classFeatureState"
      | "classRules"
      | "customClass"
      | "customEquipment"
      | "equipment"
      | "feats"
      | "inventoryItems"
      | "level"
      | "roundTracker"
      | "species"
      | "speciesChoices"
      | "speciesFeatureState"
      | "statusEntries"
      | "subclassId"
      | "temporaryHitPoints"
      | "temporaryHitPointsSource"
    >
  >;

export type EphemeralWeaponActionContext = {
  key?: string;
  sourceStatusEntry?: CharacterStatusEntry;
  sourceSpellSlotLevel?: number | null;
  damage?: WeaponDamage;
  economyType?: EconomyType;
  economyMultiCount?: number;
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  details?: WeaponAction["details"];
};

export type EphemeralWeaponAbilityResolver = (
  character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
) => AbilityKey | null;

export type EphemeralWeaponDamageResolver = (
  character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
) => WeaponDamage | null;

export type EphemeralWeaponDescriptionResolver = (
  character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
) => SpellDescriptionEntry[];

export type EphemeralWeaponDetailsResolver = (
  character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext & { damage: WeaponDamage }
) => WeaponAction["details"];

export type EphemeralWeaponAvailabilityResolver = (
  character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
) => boolean;

export type EphemeralWeaponActivation =
  | {
      kind: "feature";
      sourceId: string;
    }
  | {
      kind: "spell-status";
      spellId: string;
    };

export type EphemeralWeaponDamageAbility =
  | AbilityKey
  | "attack"
  | "none"
  | EphemeralWeaponAbilityResolver;

export type EphemeralWeaponDefinition = {
  id: string;
  key: string;
  name: string;
  sourceLabel: string;
  drawerEyebrow?: string;
  activation: EphemeralWeaponActivation;
  attackKind: "weapon";
  baseWeapon?: WEAPON_BASE | null;
  combatType?: WEAPON_COMBAT_TYPE | null;
  weaponTraining?: WEAPON_TRAINING | null;
  properties?: WEAPON_PROPERTY[];
  range?: WeaponRange;
  mastery?: WEAPON_MASTERY | null;
  damage?: WeaponDamage;
  getDamage?: EphemeralWeaponDamageResolver;
  ability: AbilityKey | "finesse" | "spellcasting" | EphemeralWeaponAbilityResolver;
  damageAbility?: EphemeralWeaponDamageAbility;
  proficiencyLabel: string;
  isProficient?: boolean;
  economyType: EconomyType;
  economyMultiCount?: number;
  description?: SpellDescriptionEntry[];
  getDescription?: EphemeralWeaponDescriptionResolver;
  descriptionAdditions?: SpellDescriptionEntry[][];
  getDetails?: EphemeralWeaponDetailsResolver;
  details?: WeaponAction["details"];
  isAvailable?: EphemeralWeaponAvailabilityResolver;
  facts?: FeatureActionFact[];
  damageBonusEntries?: FeatureDamageBonus[];
  cardBonusLabels?: string[];
  hasActiveMastery?: boolean;
  skipFeatureDerivedLookups?: boolean;
};

export type EphemeralWeaponStatusEntryOptions = {
  definition: EphemeralWeaponDefinition;
  duration: CharacterStatusEntry["duration"];
  source?: string;
  sourceId?: string;
  description?: string;
  descriptionAdditions?: SpellDescriptionEntry[][];
};
