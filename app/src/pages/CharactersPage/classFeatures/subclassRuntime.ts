import {
  ACTION_TYPE,
  getSpellEntryByName,
  type ReactionEntry,
  type SpellEntry
} from "../../../codex/entries";
import type { AbilityKey, Character } from "../../../types";
import type { WeaponAction } from "../gameplay";
export { createDefaultFeatureActionDescription } from "./featureActionDescription";
import type {
  AbilityCheckIndicatorMap,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureEquipmentEntry,
  FeatureAbilityScoreBonus,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureInitiativeBonus,
  FeatureArmorProficiencyEntry,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureLanguageProficiencyEntry,
  MagicTemporaryHitPointsFeature,
  FeatureSavingThrowBonus,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  SpellFeatureContext,
  FeatureSpeedBonus,
  FeatureToolProficiencyEntry,
  FeatureUnarmedStrikeConfig,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";

export type SubclassDerivedFeatureState = {
  featureActions?: FeatureActionCard[];
  featureActionOptions?: Partial<Record<string, FeatureActionOptionCard[]>>;
  equipmentEntries?: FeatureEquipmentEntry[];
  weaponActions?: WeaponAction[];
  transformCommonAction?: (action: FeatureActionCard) => FeatureActionCard;
  transformFeatureAction?: (action: FeatureActionCard) => FeatureActionCard;
  transformWeaponAction?: (action: WeaponAction) => WeaponAction;
  getInitiativeBonuses?: () => FeatureInitiativeBonus[];
  getSavingThrowBonuses?: (ability: AbilityKey) => FeatureSavingThrowBonus[];
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  weaponAttackIndicators?: FeatureIndicator[];
  getWeaponDamageBonuses?: (context: WeaponFeatureContext) => FeatureDamageBonus[];
  getSpellDamageBonuses?: (context: SpellFeatureContext) => FeatureDamageBonus[];
  getArmorClassModes?: (context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
  }) => FeatureArmorClassMode[];
  getArmorClassBonuses?: (context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
  }) => FeatureArmorClassBonus[];
  speedBonuses?: FeatureSpeedBonus[];
  abilityScoreBonuses?: FeatureAbilityScoreBonus[];
  cantripLimitBonus?: number;
  cantripDamageBonus?: number;
  weaponProficiencyEntries?: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries?: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries?: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries?: FeatureArmorProficiencyEntry[];
  toolProficiencyEntries?: FeatureToolProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  alwaysPreparedSpellIds?: string[];
  alwaysSpellbookSpellIds?: string[];
  magicTemporaryHitPointsFeature?: MagicTemporaryHitPointsFeature | null;
  ritualOnlySpellIds?: string[];
  derivedStatusEntries?: DerivedFeatureStatusEntry[];
  reactionEntries?: ReactionEntry[];
  spellDamageFormulaOverrides?: Record<string, string>;
  getSpellDamageFormulaOverride?: (spell: Pick<SpellEntry, "id">) => string | null;
  transformSpellEntry?: (spell: SpellEntry) => SpellEntry;
  getUnarmedStrikeConfig?: () => FeatureUnarmedStrikeConfig | null;
};

export type SubclassRuntimeCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "level"
      | "subclassId"
      | "equipment"
      | "inventoryItems"
      | "customEquipment"
      | "abilities"
      | "classFeatureState"
      | "skillProficiencies"
      | "toolProficiencies"
      | "savingThrowProficiencies"
      | "feats"
      | "statusEntries"
      | "spellSlotsExpended"
      | "companions"
    >
  >;

export type SubclassRuntimeResolver = (
  character: SubclassRuntimeCharacter
) => SubclassDerivedFeatureState;

export type SubclassRuntimeRegistry = Record<string, SubclassRuntimeResolver>;

export function getPreparedSpellIdsByLevel<
  TSpellIdsByLevel extends Readonly<Record<number, readonly string[]>>
>(level: number, spellIdsByLevel: TSpellIdsByLevel): string[] {
  return Object.keys(spellIdsByLevel)
    .map((value) => Number(value))
    .filter((unlockLevel) => Number.isFinite(unlockLevel) && level >= unlockLevel)
    .sort((left, right) => left - right)
    .flatMap((unlockLevel) => spellIdsByLevel[unlockLevel] ?? []);
}

export function resolveSpellIdsByName(names: readonly string[]): string[] {
  return names.flatMap((name) => {
    const spell = getSpellEntryByName(name);
    return spell ? [spell.id] : [];
  });
}

export function transformSpellToBonusAction(spellId: string, spell: SpellEntry): SpellEntry {
  return spell.id === spellId
    ? {
        ...spell,
        castingTime: [ACTION_TYPE.BONUS_ACTION]
      }
    : spell;
}
