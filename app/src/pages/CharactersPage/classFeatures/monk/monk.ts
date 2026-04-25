import { monkFeatures, type MonkFeatureClassObj } from "../../../../codex/classes";
import {
  ARMOR_TYPES,
  CLASS_FEATURE,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  WEAPON_COMBAT_TYPE,
  getReactionEntryById,
  type ReactionEntry,
  type ArmorEntry,
  type WeaponEntry
} from "../../../../codex/entries";
import { getArmorEntries, getWeaponEntries } from "../../../../codex/selectors";
import type { Character, CharacterMonkFeatureState } from "../../../../types";
import {
  CONDITION_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY
} from "../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../actionEconomy";
import { formatFormulaCell } from "../../shared/formulas";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable
} from "../../combat";
import type { WeaponAction } from "../../gameplay";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomArmorEntry,
  type ResolvedCustomWeaponEntry
} from "../../customEquipment";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount
} from "../../inventory";
import {
  createHeldDescriptorForInventoryItem,
  getItemWeaponProperties,
  getItemWeaponType,
  isItemShieldRecord
} from "../../inventoryItems";
import { isMonkWeapon } from "../../monkWeapons";
import {
  createCharacterStatusEntry,
  hasStatusCondition,
  normalizeCharacterStatusEntries
} from "../../statusEntries";
import {
  activateMonkWarriorOfMercyHandOfHealing,
  getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn,
  activateMonkWarriorOfMercyHandOfUltimateJustice,
  getMonkWarriorOfMercyHandOfHarmUsedThisTurn,
  getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining,
  getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal,
  getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal,
  monkHandOfHealingActionKey as warriorOfMercyHandOfHealingActionKey,
  monkHandOfUltimateJusticeActionKey as warriorOfMercyHandOfUltimateJusticeActionKey,
  normalizeMonkWarriorOfMercyFeatureState,
  restoreMonkWarriorOfMercyFlurryOfHealingAndHarmOnLongRest,
  restoreMonkWarriorOfMercyHandOfUltimateMercyOnLongRest
} from "./subclasses/monkWarriorOfMercy";
import {
  activateMonkWarriorOfShadowStep,
  activateMonkWarriorOfShadowCloakOfShadow,
  consumeMonkWarriorOfShadowStepAttackAdvantage,
  getMonkWarriorOfShadowImprovedShadowStepUnarmedStrikeMultiCount,
  isMonkWarriorOfShadowCloakOfShadowActive,
  monkShadowStepActionKey,
  monkCloakOfShadowActionKey,
  normalizeMonkWarriorOfShadowFeatureState
} from "./subclasses/monkWarriorOfShadow";
import {
  activateMonkWarriorOfTheOpenHandWholenessOfBody,
  getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining,
  getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal,
  grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse,
  monkWholenessOfBodyActionKey,
  normalizeMonkWarriorOfTheOpenHandFeatureState,
  restoreMonkWarriorOfTheOpenHandWholenessOfBodyOnLongRest
} from "./subclasses/monkWarriorOfTheOpenHand";
import {
  activateMonkWarriorOfTheElementsElementalAttunement,
  activateMonkWarriorOfTheElementsElementalBurst,
  normalizeMonkWarriorOfTheElementsFeatureState,
  monkElementalBurstActionKey,
  monkElementalAttunementActionKey
} from "./subclasses/monkWarriorOfTheElements";
import {
  appendMonkCommonActionDescriptionSections,
  appendMonkWeaponDescriptionSections,
  getMonkFlurryOfBlowsBaseDescription,
  getMonkFlurryOfBlowsDescriptionAdditions,
  getMonkPatientDefenseBaseDescription,
  getMonkPatientDefenseDescriptionAdditions,
  getMonkStepOfTheWindBaseDescription,
  getMonkStepOfTheWindDescriptionAdditions
} from "./monkDescriptionSections";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import {
  createFeatureActionCardCost,
  createFreeCardUsage,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../cardUsage";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import type {
  ArmorClassFeatureContext,
  DerivedFeatureStatusEntry,
  FeatureAbilityScoreBonus,
  FeatureActionCard,
  FeatureActionFact,
  FeatureArmorClassMode,
  FeatureSavingThrowProficiencyEntry,
  FeatureSpeedBonus,
  SpeedFeatureContext
} from "../types";

export const monkFlurryOfBlowsActionKey = "monk-flurry-of-blows";
export const monkPatientDefenseActionKey = "monk-patient-defense";
export const monkStepOfTheWindActionKey = "monk-step-of-the-wind";
export const monkSuperiorDefenseActionKey = "monk-superior-defense";
export const monkHandOfHealingActionKey = warriorOfMercyHandOfHealingActionKey;
export const monkHandOfUltimateJusticeActionKey = warriorOfMercyHandOfUltimateJusticeActionKey;
export { monkCloakOfShadowActionKey };
export { monkShadowStepActionKey };
export { monkWholenessOfBodyActionKey };
export { monkElementalAttunementActionKey };
export { monkElementalBurstActionKey };

type MonkMartialArtsContext = {
  hasWornBodyArmor: boolean;
  hasShieldEquipped: boolean;
  wieldsOnlyMonkWeaponsOrUnarmed: boolean;
};

type MonkWeaponAttackContext = {
  key: string;
  economyType: EconomyType;
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type MonkCombatState = MonkMartialArtsContext & {
  hasFreeHand: boolean;
  martialArtsActive: boolean;
};

const codexWeaponEntriesByName = new Map<string, WeaponEntry>(
  getWeaponEntries().map((entry) => [entry.name, entry])
);

const codexArmorEntriesByName = new Map<string, ArmorEntry>(
  getArmorEntries().map((entry) => [entry.name, entry])
);

const superiorDefenseDurationRounds = 10;
const deflectEnergySource = "Deflect Energy";
const selfRestorationStatusSourceId = "feature-monk-self-restoration";
const superiorDefenseStatusSourceId = "feature-monk-superior-defense";
const monkFocusCommonActionBonusPathKeys = new Set(["common-action-dash", "common-action-disengage"]);
const nonForceDamageTypes = (Object.values(DAMAGE_TYPE) as DAMAGE_TYPE[]).filter(
  (damageType) => damageType !== DAMAGE_TYPE.FORCE
);

function getMonkFeatureRow(level: number): MonkFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getUnlockedMonkFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function getMonkFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CharacterMonkFeatureState {
  return normalizeMonkFeatureState(character.classFeatureState?.monk, character);
}

function hasMonkSuperiorDefenseStatus(
  character: Pick<Character, "statusEntries">
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === superiorDefenseStatusSourceId
  );
}

function getResolvedHeldCustomWeapons(
  character: Pick<Character, "customEquipment">
): ResolvedCustomWeaponEntry[] {
  return getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomWeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
  );
}

function getResolvedWornCustomArmor(
  character: Pick<Character, "customEquipment">
): ResolvedCustomArmorEntry[] {
  return getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomArmorEntry =>
      entry.category === ENTRY_CATEGORIES.ARMOR && entry.worn
  );
}

function getMonkCombatState(
  character: Pick<
    Character,
    "className" | "level" | "equipment" | "inventoryItems" | "customEquipment"
  >
): MonkCombatState {
  const heldCodexEquipment = character.equipment.filter((item) => item.onHand);
  const heldInventoryItems = character.inventoryItems.filter((item) => item.onHand);
  const heldCodexWeapons = heldCodexEquipment.reduce<WeaponEntry[]>((entries, item) => {
    const weaponEntry = codexWeaponEntriesByName.get(item.name);
    return weaponEntry ? [...entries, weaponEntry] : entries;
  }, []);
  const heldInventoryWeapons = heldInventoryItems
    .map((entry) => {
      const type = getItemWeaponType(entry.item);

      if (!type) {
        return null;
      }

      return {
        type,
        properties: getItemWeaponProperties(entry.item)
      };
    })
    .filter((entry): entry is Pick<WeaponEntry, "type" | "properties"> => entry !== null);
  const heldCodexDescriptors = heldCodexEquipment.reduce<
    ReturnType<typeof createHeldWeaponDescriptor>[]
  >((descriptors, item) => {
    const weaponEntry = codexWeaponEntriesByName.get(item.name);

    if (weaponEntry) {
      return [...descriptors, createHeldWeaponDescriptor(`codex-${item.name}`, weaponEntry)];
    }

    const armorEntry = codexArmorEntriesByName.get(item.name);

    if (armorEntry?.tags.includes(ARMOR_TYPES.SHIELD)) {
      return [...descriptors, createHeldShieldDescriptor(`codex-${item.name}`)];
    }

    return descriptors;
  }, []);
  const heldInventoryDescriptors = heldInventoryItems.flatMap((entry) => {
    const descriptor = createHeldDescriptorForInventoryItem(`inventory-${entry.id}`, entry.item);
    return descriptor ? [descriptor] : [];
  });
  const heldCustomWeapons = getResolvedHeldCustomWeapons(character);
  const wornCustomArmor = getResolvedWornCustomArmor(character);
  const heldCustomDescriptors = heldCustomWeapons.map((entry) =>
    createHeldWeaponDescriptor(`custom-${entry.customEquipmentId}`, entry)
  );
  const shieldDescriptors = wornCustomArmor
    .filter((entry) => entry.tags.includes(ARMOR_TYPES.SHIELD))
    .map((entry) => createHeldShieldDescriptor(`custom-${entry.customEquipmentId}`));
  const heldDescriptors = [
    ...heldCodexDescriptors,
    ...heldInventoryDescriptors,
    ...heldCustomDescriptors,
    ...shieldDescriptors
  ];
  const hasFreeHand = getHeldWeaponSlotCount(heldDescriptors) < 2;
  const hasShieldEquipped =
    heldCodexEquipment.some((item) =>
      codexArmorEntriesByName.get(item.name)?.tags.includes(ARMOR_TYPES.SHIELD)
    ) ||
    heldInventoryItems.some((entry) => isItemShieldRecord(entry.item)) ||
    wornCustomArmor.some((entry) => entry.tags.includes(ARMOR_TYPES.SHIELD));
  const hasWornBodyArmor =
    character.equipment.some((item) => {
      if (!item.worn) {
        return false;
      }

      const armorEntry = codexArmorEntriesByName.get(item.name);
      return Boolean(armorEntry && !armorEntry.tags.includes(ARMOR_TYPES.SHIELD));
    }) ||
    character.inventoryItems.some((entry) => entry.worn && !isItemShieldRecord(entry.item)) ||
    wornCustomArmor.some((entry) => !entry.tags.includes(ARMOR_TYPES.SHIELD));
  const martialArtsContext = {
    hasWornBodyArmor,
    hasShieldEquipped,
    wieldsOnlyMonkWeaponsOrUnarmed: [
      ...heldCodexWeapons,
      ...heldInventoryWeapons,
      ...heldCustomWeapons
    ].every((weapon) => isMonkWeapon(weapon))
  } satisfies MonkMartialArtsContext;

  return {
    ...martialArtsContext,
    hasFreeHand,
    martialArtsActive: canUseMonkMartialArts(character, martialArtsContext)
  };
}

function getMonkFlurryOfBlowsMartialArtsDisabledReason(
  context: MonkMartialArtsContext
): string | null {
  const reasons: string[] = [];

  if (context.hasWornBodyArmor) {
    reasons.push("wearing armor");
  }

  if (context.hasShieldEquipped) {
    reasons.push("wielding a shield");
  }

  if (!context.wieldsOnlyMonkWeaponsOrUnarmed) {
    reasons.push("wielding a non-Monk weapon");
  }

  if (reasons.length === 0) {
    return null;
  }

  const formattedReasons =
    reasons.length === 1
      ? reasons[0]
      : `${reasons.slice(0, -1).join(", ")}, or ${reasons[reasons.length - 1]}`;

  return `Flurry of Blows requires Martial Arts to be active. You're ${formattedReasons}.`;
}

function canUseFlurryOfBlows(
  character: Pick<
    Character,
    "className" | "level" | "equipment" | "inventoryItems" | "customEquipment"
  >
): boolean {
  const combatState = getMonkCombatState(character);
  return combatState.martialArtsActive;
}

export function hasMonkFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Monk") {
    return false;
  }

  return getUnlockedMonkFeatures(character.level).has(feature);
}

export function normalizeMonkFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): CharacterMonkFeatureState {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return {};
  }

  const totalFocusPoints = getMonkFeatureRow(character.level)?.focusPoints ?? 0;
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterMonkFeatureState>) : {};
  const focusPointsExpended = Number(record.focusPointsExpended);
  const uncannyMetabolismUsesExpended = Number(record.uncannyMetabolismUsesExpended);
  const flurryOfBlowsAttacksRemainingThisTurn = Number(
    record.flurryOfBlowsAttacksRemainingThisTurn
  );
  const extraAttacksRemainingThisTurn = Number(record.extraAttacksRemainingThisTurn);
  const stunningStrikeUsedThisTurn = record.stunningStrikeUsedThisTurn === true;
  const warriorOfMercyHandOfHarmState = normalizeMonkWarriorOfMercyFeatureState(record, character);
  const warriorOfShadowFeatureState = normalizeMonkWarriorOfShadowFeatureState(record, character);
  const warriorOfTheElementsFeatureState = normalizeMonkWarriorOfTheElementsFeatureState(
    record,
    character
  );
  const warriorOfTheOpenHandFeatureState = normalizeMonkWarriorOfTheOpenHandFeatureState(
    record,
    character
  );
  const superiorDefenseRoundsRemaining = Number(record.superiorDefenseRoundsRemaining);
  const superiorDefenseUsedThisTurn = record.superiorDefenseUsedThisTurn === true;

  return {
    focusPointsExpended: Number.isFinite(focusPointsExpended)
      ? Math.max(0, Math.min(totalFocusPoints, Math.floor(focusPointsExpended)))
      : 0,
    uncannyMetabolismUsesExpended:
      hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM) &&
      Number.isFinite(uncannyMetabolismUsesExpended)
        ? Math.max(0, Math.min(1, Math.floor(uncannyMetabolismUsesExpended)))
        : 0,
    flurryOfBlowsAttacksRemainingThisTurn: Number.isFinite(flurryOfBlowsAttacksRemainingThisTurn)
      ? Math.max(0, Math.floor(flurryOfBlowsAttacksRemainingThisTurn))
      : 0,
    extraAttacksRemainingThisTurn:
      hasMonkFeature(character, CLASS_FEATURE.EXTRA_ATTACK) &&
      Number.isFinite(extraAttacksRemainingThisTurn)
        ? Math.max(0, Math.min(1, Math.floor(extraAttacksRemainingThisTurn)))
        : 0,
    stunningStrikeUsedThisTurn: hasMonkFeature(character, CLASS_FEATURE.STUNNING_STRIKE)
      ? stunningStrikeUsedThisTurn
      : false,
    ...warriorOfMercyHandOfHarmState,
    ...warriorOfShadowFeatureState,
    ...warriorOfTheElementsFeatureState,
    ...warriorOfTheOpenHandFeatureState,
    superiorDefenseRoundsRemaining:
      hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE) &&
      Number.isFinite(superiorDefenseRoundsRemaining)
        ? Math.max(
            0,
            Math.min(superiorDefenseDurationRounds, Math.floor(superiorDefenseRoundsRemaining))
          )
        : 0,
    superiorDefenseUsedThisTurn: hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)
      ? superiorDefenseUsedThisTurn
      : false
  };
}

export function getMonkMartialArtsDie(
  character: Pick<Character, "className" | "level">
): DICE | null {
  if (!hasMonkFeature(character, CLASS_FEATURE.MARTIAL_ARTS)) {
    return null;
  }

  return getMonkFeatureRow(character.level)?.martialArts ?? null;
}

export function getMonkFocusPointsTotal(character: Pick<Character, "className" | "level">): number {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return 0;
  }

  return getMonkFeatureRow(character.level)?.focusPoints ?? 0;
}

export function getMonkFocusPointsRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const focusPointsExpended = getMonkFeatureState(character).focusPointsExpended ?? 0;

  return Math.max(0, totalFocusPoints - focusPointsExpended);
}

export function hasMonkUncannyMetabolism(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM);
}

export function getMonkUncannyMetabolismUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasMonkUncannyMetabolism(character) ? 1 : 0;
}

export function getMonkUncannyMetabolismUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return Math.max(
    0,
    getMonkUncannyMetabolismUsesTotal(character) -
      (getMonkFeatureState(character).uncannyMetabolismUsesExpended ?? 0)
  );
}

export function hasMonkPerfectFocus(character: Pick<Character, "className" | "level">): boolean {
  return hasMonkFeature(character, CLASS_FEATURE.PERFECT_FOCUS);
}

export function getMonkFlurryOfBlowsAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFeatureState(character).flurryOfBlowsAttacksRemainingThisTurn ?? 0;
}

export function getMonkUnarmedStrikeMultiCount(
  character: Pick<Character, "className" | "level" | "subclassId" | "classFeatureState">
): number {
  return (
    getMonkFlurryOfBlowsAttackMultiCount(character) +
    getMonkWarriorOfShadowImprovedShadowStepUnarmedStrikeMultiCount(character)
  );
}

export function getMonkExtraAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (!hasMonkFeature(character, CLASS_FEATURE.EXTRA_ATTACK)) {
    return 0;
  }

  return getMonkFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function getMonkFlurryOfBlowsStrikeCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasMonkFeature(character, CLASS_FEATURE.HEIGHTENED_FOCUS) ? 3 : 2;
}

function getMonkFlurryOfBlowsFacts(
  character: Pick<Character, "className" | "level">
): FeatureActionFact[] {
  const strikeCount = getMonkFlurryOfBlowsStrikeCount(character);
  const hasHeightenedFocus = hasMonkFeature(character, CLASS_FEATURE.HEIGHTENED_FOCUS);

  return [
    {
      label: "Total Unarmed Strikes",
      value: hasHeightenedFocus ? `${strikeCount} (Heightened Focus)` : String(strikeCount)
    }
  ];
}

function getMonkMartialArtsDieLabel(
  character: Pick<Character, "className" | "level">
): string | null {
  const martialArtsDie = getMonkMartialArtsDie(character);

  return martialArtsDie ? `1${String(martialArtsDie).toLowerCase()}` : null;
}

function formatFormulaValue(formula: string, terms: string[]): string {
  return formatFormulaCell({
    formula,
    displayTerms: terms,
    resultLabel: "Temp HP"
  }).value;
}

export function getMonkPatientDefenseTemporaryHitPointsFormula(
  character: Pick<Character, "className" | "level">
): string | null {
  if (!hasMonkFeature(character, CLASS_FEATURE.HEIGHTENED_FOCUS)) {
    return null;
  }

  const martialArtsDie = getMonkMartialArtsDie(character);

  return martialArtsDie ? `2${String(martialArtsDie).toLowerCase()}` : null;
}

function getMonkPatientDefenseTemporaryHitPointsFacts(
  character: Pick<Character, "className" | "level">
): FeatureActionFact[] {
  const temporaryHitPointsFormula = getMonkPatientDefenseTemporaryHitPointsFormula(character);
  const martialArtsDie = getMonkMartialArtsDieLabel(character);

  if (!temporaryHitPointsFormula || !martialArtsDie) {
    return [];
  }

  return [
    {
      label: "Temporary HP Formula",
      value: formatFormulaValue(temporaryHitPointsFormula, ["2 *", martialArtsDie]),
      fullWidth: true
    }
  ];
}

export function getMonkUnarmedDamageTypeLabel(
  character: Pick<Character, "className" | "level">
): string {
  return hasMonkFeature(character, CLASS_FEATURE.EMPOWERED_STRIKES)
    ? "Bludgeoning/Force"
    : "Bludgeoning";
}

export function getMonkUnarmoredMovementBonus(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasMonkFeature(character, CLASS_FEATURE.UNARMORED_MOVEMENT)) {
    return 0;
  }

  return getMonkFeatureRow(character.level)?.unarmoredMovement ?? 0;
}

export function canUseMonkMartialArts(
  character: Pick<Character, "className" | "level">,
  context: MonkMartialArtsContext
): boolean {
  if (!hasMonkFeature(character, CLASS_FEATURE.MARTIAL_ARTS)) {
    return false;
  }

  return (
    !context.hasWornBodyArmor &&
    !context.hasShieldEquipped &&
    context.wieldsOnlyMonkWeaponsOrUnarmed
  );
}

export function getMonkFeatureActions(
  character: Pick<
    Character,
    | "className"
    | "level"
    | "classFeatureState"
    | "equipment"
    | "inventoryItems"
    | "customEquipment"
    | "statusEntries"
    | "subclassId"
  >
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    const focusRemaining = getMonkFocusPointsRemaining(character);
    const focusTotal = getMonkFocusPointsTotal(character);
    const combatState = getMonkCombatState(character);
    const focusPointCost = createFeatureActionCardCost({
      amountText: "1",
      icon: "brain"
    });
    const focusCardUsage = createNamedResourceCardUsage(focusPointCost);
    const focusHeaderTags = createNamedUsageHeaderTags(
      focusPointCost,
      focusRemaining,
      focusTotal,
      {
        icon: "brain"
      }
    );
    const flurryStrikeCount = getMonkFlurryOfBlowsStrikeCount(character);
    const flurryFacts = getMonkFlurryOfBlowsFacts(character);
    const shadowFlurryActive = isMonkWarriorOfShadowCloakOfShadowActive(character);
    const flurryDescription = getMonkFlurryOfBlowsBaseDescription(character);
    const patientDefenseDescription = getMonkPatientDefenseBaseDescription(character);
    const patientDefenseDescriptionAdditions = getMonkPatientDefenseDescriptionAdditions(character);
    const patientDefenseFacts = getMonkPatientDefenseTemporaryHitPointsFacts(character);
    const stepOfTheWindDescription = getMonkStepOfTheWindBaseDescription(character);
    const stepOfTheWindDescriptionAdditions = getMonkStepOfTheWindDescriptionAdditions(character);
    const stepOfTheWindAdditionalUseCount =
      getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining(character);
    const martialArtsDisabledReason = !combatState.martialArtsActive
      ? getMonkFlurryOfBlowsMartialArtsDisabledReason(combatState)
      : null;
    const disabledReason =
      !shadowFlurryActive && focusRemaining <= 0
        ? "No Focus Points remaining."
        : martialArtsDisabledReason
          ? martialArtsDisabledReason
        : undefined;

    actions.push({
      key: monkFlurryOfBlowsActionKey,
      name: "Flurry of Blows",
      summary: `Grant ${flurryStrikeCount} Unarmed Strikes.`,
      detail: shadowFlurryActive
        ? `Make ${flurryStrikeCount} Unarmed Strikes as a Bonus Action without expending Focus Points.`
        : `Expend 1 Focus Point to make ${flurryStrikeCount} Unarmed Strikes as a Bonus Action.`,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: shadowFlurryActive
        ? createFreeCardUsage()
        : focusCardUsage,
      headerTags: shadowFlurryActive
        ? undefined
        : focusHeaderTags,
      usesLabel: shadowFlurryActive ? undefined : "1",
      usesIcon: shadowFlurryActive ? undefined : "brain",
      usesTone: !shadowFlurryActive && focusRemaining <= 0 ? "danger" : "default",
      description: flurryDescription,
      descriptionAdditions: getMonkFlurryOfBlowsDescriptionAdditions(character),
      facts: flurryFacts,
      drawer: {
        kind: "confirm",
        description: flurryDescription,
        facts: flurryFacts
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    });

    actions.push({
      key: monkPatientDefenseActionKey,
      name: "Patient Defense",
      sourceFeature: CLASS_FEATURE.MONKS_FOCUS,
      summary: "Take Disengage and Dodge as a Bonus Action.",
      detail: "Expend 1 Focus Point to take both the Disengage and Dodge actions as a Bonus Action.",
      breakdown: "Bonus Disengage + Dodge",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: focusCardUsage,
      headerTags: focusHeaderTags,
      usesLabel: "1",
      usesIcon: "brain",
      usesTone: focusRemaining <= 0 ? "danger" : "default",
      description: patientDefenseDescription,
      descriptionAdditions: patientDefenseDescriptionAdditions,
      facts: patientDefenseFacts,
      drawer: {
        kind: "confirm",
        description: patientDefenseDescription,
        factsSectionTitle: null
      },
      execute: {
        kind: "activate"
      },
      disabled: focusRemaining <= 0,
      disabledReason: focusRemaining <= 0 ? "No Focus Points remaining." : undefined
    });

    actions.push({
      key: monkStepOfTheWindActionKey,
      name: "Step of the Wind",
      sourceFeature: CLASS_FEATURE.MONKS_FOCUS,
      summary: "Take Disengage and Dash as a Bonus Action.",
      detail:
        "Expend 1 Focus Point to take both the Disengage and Dash actions as a Bonus Action, and double your jump distance for the turn.",
      breakdown: "Bonus Disengage + Dash",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      economyMultiCount: stepOfTheWindAdditionalUseCount,
      cardUsage: focusCardUsage,
      headerTags: focusHeaderTags,
      usesLabel: "1",
      usesIcon: "brain",
      usesTone: focusRemaining <= 0 ? "danger" : "default",
      description: stepOfTheWindDescription,
      descriptionAdditions: stepOfTheWindDescriptionAdditions,
      drawer: {
        kind: "confirm",
        description: stepOfTheWindDescription
      },
      execute: {
        kind: "activate"
      },
      disabled: focusRemaining <= 0,
      disabledReason: focusRemaining <= 0 ? "No Focus Points remaining." : undefined
    });
  }

  if (hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    const focusRemaining = getMonkFocusPointsRemaining(character);
    const focusTotal = getMonkFocusPointsTotal(character);
    const monkState = getMonkFeatureState(character);
    const disabledReason =
      focusRemaining < 3
        ? "You need 3 Focus Points to use Superior Defense."
        : monkState.superiorDefenseUsedThisTurn === true
          ? "Superior Defense has already been used this turn."
          : undefined;

    actions.push({
      key: monkSuperiorDefenseActionKey,
      name: "Superior Defense",
      sourceFeature: CLASS_FEATURE.SUPERIOR_DEFENSE,
      summary: "Once at the start of a turn.",
      detail: "Once at the start of a turn.",
      breakdown: "Turn-start defense",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: createNamedResourceCardUsage(
        createFeatureActionCardCost({
          amountText: "3",
          icon: "brain"
        })
      ),
      headerTags: createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          amountText: "3",
          icon: "brain"
        }),
        focusRemaining,
        focusTotal,
        {
          icon: "brain"
        }
      ),
      usesLabel: "3",
      usesIcon: "brain",
      usesTone: focusRemaining < 3 ? "danger" : "default",
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  return actions;
}

export function getMonkReactionEntries(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  const reactionEntries: ReactionEntry[] = [];

  if (hasMonkFeature(character, CLASS_FEATURE.DEFLECT_ATTACKS)) {
    const deflectAttacks = getReactionEntryById("reaction-deflect-attacks");

    if (deflectAttacks) {
      const deflectEnergyDescription = hasMonkFeature(character, CLASS_FEATURE.DEFLECT_ENERGY)
        ? getFeatureDescriptionForCharacter(character, CLASS_FEATURE.DEFLECT_ENERGY)
        : [];

      reactionEntries.push(
        deflectEnergyDescription.length > 0
          ? appendSourcedDescriptionAddition(
              deflectAttacks,
              deflectEnergySource,
              deflectEnergyDescription
            )
          : deflectAttacks
      );
    }
  }

  if (hasMonkFeature(character, CLASS_FEATURE.SLOW_FALL)) {
    const slowFall = getReactionEntryById("reaction-slow-fall");

    if (slowFall) {
      reactionEntries.push(slowFall);
    }
  }

  return reactionEntries;
}

export function getMonkWeaponAction(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  action: WeaponAction
): WeaponAction {
  return appendMonkWeaponDescriptionSections(action, character);
}

export function hasMonkFocusCommonActionBonusPath(
  character: Pick<Character, "className" | "level">,
  actionKey: string
): boolean {
  return (
    hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS) &&
    monkFocusCommonActionBonusPathKeys.has(actionKey)
  );
}

export function getMonkCommonActionBonusPathAdditionalUseCount(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  actionKey: string
): number {
  return actionKey === "common-action-dash"
    ? getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining(character)
    : 0;
}

export function getMonkCommonAction(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  action: FeatureActionCard
): FeatureActionCard {
  return hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)
    ? appendMonkCommonActionDescriptionSections(action)
    : action;
}

export function getMonkSavingThrowProficiencyEntries(
  character: Pick<Character, "className" | "level">
): FeatureSavingThrowProficiencyEntry[] {
  if (!hasMonkFeature(character, CLASS_FEATURE.DISCIPLINED_SURVIVOR)) {
    return [];
  }

  return (Object.values(SAVING_THROW_PROFICIENCY) as SAVING_THROW_PROFICIENCY[]).map(
    (proficiency) => ({
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: "Disciplined Survivor",
      proficiency,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    })
  );
}

export function getMonkDerivedStatusEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): DerivedFeatureStatusEntry[] {
  const derivedEntries: DerivedFeatureStatusEntry[] = [];
  const superiorDefenseRoundsRemaining =
    getMonkFeatureState(character).superiorDefenseRoundsRemaining ?? 0;
  const superiorDefenseActive = hasMonkSuperiorDefenseStatus(character);

  if (hasMonkFeature(character, CLASS_FEATURE.SELF_RESTORATION)) {
    derivedEntries.push({
      id: selfRestorationStatusSourceId,
      sourceId: selfRestorationStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Self Restoration",
      source: "Self Restoration",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    });
  }

  if (!hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    return derivedEntries;
  }

  if (!superiorDefenseActive && superiorDefenseRoundsRemaining <= 0) {
    return derivedEntries;
  }

  if (hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)) {
    return derivedEntries;
  }

  derivedEntries.push(
    ...nonForceDamageTypes.map<DerivedFeatureStatusEntry>((damageType) => ({
      id: `feature-monk-superior-defense-resistance-${damageType.toLowerCase()}`,
      sourceId: `feature-monk-superior-defense-resistance-${damageType.toLowerCase()}`,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: "Superior Defense",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: superiorDefenseActive
        ? {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: "Superior Defense"
          }
        : {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: superiorDefenseRoundsRemaining
          }
    }))
  );

  return derivedEntries;
}

export function activateMonkFlurryOfBlows(
  character: Character,
  options: { useFlurryOfHealingAndHarm?: boolean } = {}
): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS) || !canUseFlurryOfBlows(character)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const focusRemaining = getMonkFocusPointsRemaining(character);
  const flurryStrikeCount = getMonkFlurryOfBlowsStrikeCount(character);
  const shadowFlurryActive = isMonkWarriorOfShadowCloakOfShadowActive(character);

  if (!shadowFlurryActive && focusRemaining <= 0) {
    return character;
  }

  const shouldUseFlurryOfHealingAndHarm = options.useFlurryOfHealingAndHarm === true;
  const flurryOfHealingAndHarmUsesRemaining = shouldUseFlurryOfHealingAndHarm
    ? getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining(character)
    : 0;

  if (shouldUseFlurryOfHealingAndHarm && flurryOfHealingAndHarmUsesRemaining <= 0) {
    return character;
  }

  const flurryOfHealingAndHarmUsesExpended =
    monkState.warriorOfMercyFlurryOfHealingAndHarmUsesExpended ?? 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: shadowFlurryActive
          ? (monkState.focusPointsExpended ?? 0)
          : (monkState.focusPointsExpended ?? 0) + 1,
        flurryOfBlowsAttacksRemainingThisTurn:
          (monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0) + flurryStrikeCount,
        warriorOfMercyHandOfHealingFlurryUsesThisTurn: 0,
        warriorOfMercyFlurryOfHealingAndHarmUsesExpended: shouldUseFlurryOfHealingAndHarm
          ? flurryOfHealingAndHarmUsesExpended + 1
          : flurryOfHealingAndHarmUsesExpended,
        warriorOfMercyFlurryOfHealingAndHarmActive: shouldUseFlurryOfHealingAndHarm
      }
    }
  };
}

export function applyMonkUncannyMetabolismOnInitiative(character: Character): Character {
  if (!hasMonkUncannyMetabolism(character)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);

  if ((monkState.uncannyMetabolismUsesExpended ?? 0) >= 1) {
    return character;
  }

  const nextCharacter = restoreAllMonkFocusPoints(character);
  const nextMonkState = getMonkFeatureState(nextCharacter);

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      monk: {
        ...nextMonkState,
        uncannyMetabolismUsesExpended: 1
      }
    }
  };
}

export function applyPerfectFocusOnInitiative(character: Character): Character {
  if (!hasMonkPerfectFocus(character)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const targetFocusPoints = Math.min(totalFocusPoints, 4);
  const currentRemaining = getMonkFocusPointsRemaining(character);

  if (currentRemaining >= targetFocusPoints) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.max(0, totalFocusPoints - targetFocusPoints)
      }
    }
  };
}

export function activateMonkSuperiorDefense(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const focusRemaining = getMonkFocusPointsRemaining(character);

  if (focusRemaining < 3 || monkState.superiorDefenseUsedThisTurn === true) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== superiorDefenseStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Superior Defense",
        source: "Superior Defense",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: superiorDefenseDurationRounds
        },
        sourceId: superiorDefenseStatusSourceId
      })
    ],
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: (monkState.focusPointsExpended ?? 0) + 3,
        superiorDefenseRoundsRemaining: 0,
        superiorDefenseUsedThisTurn: true
      }
    }
  };
}

export function activateMonkPatientDefense(character: Character): Character {
  return expendMonkFocusPoint(character);
}

export function activateMonkStepOfTheWind(character: Character): Character {
  return expendMonkFocusPoint(character);
}

export function activateMonkHandOfHealing(character: Character): Character {
  return activateMonkWarriorOfMercyHandOfHealing(character);
}

export function activateMonkCloakOfShadow(character: Character): Character {
  return activateMonkWarriorOfShadowCloakOfShadow(character);
}

export function activateMonkShadowStep(character: Character): Character {
  return activateMonkWarriorOfShadowStep(character);
}

export function activateMonkElementalAttunement(character: Character): Character {
  return activateMonkWarriorOfTheElementsElementalAttunement(character);
}

export function activateMonkElementalBurst(character: Character): Character {
  return activateMonkWarriorOfTheElementsElementalBurst(character);
}

export function activateMonkWholenessOfBody(character: Character): Character {
  return activateMonkWarriorOfTheOpenHandWholenessOfBody(character);
}

export function expendMonkFocusPoint(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const focusRemaining = getMonkFocusPointsRemaining(character);

  if (focusRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: (monkState.focusPointsExpended ?? 0) + 1
      }
    }
  };
}

export function restoreOneMonkFocusPoint(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const focusPointsExpended = monkState.focusPointsExpended ?? 0;

  if (focusPointsExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: focusPointsExpended - 1
      }
    }
  };
}

export function restoreAllMonkFocusPoints(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);

  if (
    (monkState.focusPointsExpended ?? 0) === 0 &&
    (monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0) === 0 &&
    (monkState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    monkState.warriorOfShadowShadowStepAdvantageActive !== true &&
    (monkState.warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn ?? 0) === 0 &&
    monkState.stunningStrikeUsedThisTurn !== true &&
    monkState.warriorOfTheElementsEmpoweredStrikesUsedThisTurn !== true &&
    (monkState.warriorOfTheOpenHandFleetStepFollowUpUsesRemainingThisTurn ?? 0) === 0 &&
    !getMonkWarriorOfMercyHandOfHarmUsedThisTurn(character) &&
    getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn(character) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: 0,
        flurryOfBlowsAttacksRemainingThisTurn: 0,
        extraAttacksRemainingThisTurn: 0,
        warriorOfShadowShadowStepAdvantageActive: false,
        warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn: 0,
        stunningStrikeUsedThisTurn: false,
        warriorOfTheElementsEmpoweredStrikesUsedThisTurn: false,
        warriorOfTheOpenHandFleetStepFollowUpUsesRemainingThisTurn: 0,
        warriorOfMercyHandOfHarmUsedThisTurn: false,
        warriorOfMercyHandOfHealingFlurryUsesThisTurn: 0
      }
    }
  };
}

function deactivateMonkSuperiorDefense(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const currentStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = currentStatusEntries.filter(
    (entry) => entry.sourceId !== superiorDefenseStatusSourceId
  );

  if (
    (monkState.superiorDefenseRoundsRemaining ?? 0) === 0 &&
    monkState.superiorDefenseUsedThisTurn !== true &&
    nextStatusEntries.length === currentStatusEntries.length
  ) {
    return character;
  }

  return {
    ...character,
    statusEntries: nextStatusEntries,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        superiorDefenseRoundsRemaining: 0,
        superiorDefenseUsedThisTurn: false
      }
    }
  };
}

export function restoreMonkUncannyMetabolismOnLongRest(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);

  if ((monkState.uncannyMetabolismUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        uncannyMetabolismUsesExpended: 0
      }
    }
  };
}

export function restoreMonkHandOfUltimateJusticeOnLongRest(character: Character): Character {
  return restoreMonkWarriorOfMercyHandOfUltimateMercyOnLongRest(character);
}

export function restoreMonkFlurryOfHealingAndHarmOnLongRest(character: Character): Character {
  return restoreMonkWarriorOfMercyFlurryOfHealingAndHarmOnLongRest(character);
}

export function restoreMonkWholenessOfBodyOnLongRest(character: Character): Character {
  return restoreMonkWarriorOfTheOpenHandWholenessOfBodyOnLongRest(character);
}

export function getMonkHandOfUltimateJusticeUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getMonkWarriorOfMercyHandOfUltimateMercyUsesTotal(character);
}

export function getMonkFlurryOfHealingAndHarmUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal(character);
}

export function getMonkWholenessOfBodyUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal(character);
}

export function consumeMonkWeaponAttack(
  character: Character,
  action: MonkWeaponAttackContext
): Character {
  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  if (!roundTrackerResource) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const consumeShadowStepAdvantage = (nextCharacter: Character): Character =>
    nextCharacter === character
      ? character
      : consumeMonkWarriorOfShadowStepAttackAdvantage(nextCharacter, {
          attackKind: action.attackKind,
          combatType: action.combatType ?? null
        });
  const grantFleetStepFollowUp = (nextCharacter: Character): Character =>
    action.economyType === ECONOMY_TYPE.BONUS_ACTION
      ? grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse(nextCharacter)
      : nextCharacter;
  const isBonusActionUnarmedStrike =
    action.key === "unarmed-strike" &&
    action.attackKind === "unarmed" &&
    action.economyType === ECONOMY_TYPE.BONUS_ACTION;

  if (isBonusActionUnarmedStrike) {
    const flurryAttacksRemaining = monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0;

    if (flurryAttacksRemaining > 0) {
      return consumeShadowStepAdvantage({
        ...character,
        classFeatureState: {
          ...character.classFeatureState,
          monk: {
            ...monkState,
            flurryOfBlowsAttacksRemainingThisTurn: flurryAttacksRemaining - 1
          }
        }
      });
    }

    const improvedShadowStepAttacksRemaining =
      monkState.warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn ?? 0;

    if (improvedShadowStepAttacksRemaining > 0) {
      return consumeShadowStepAdvantage({
        ...character,
        classFeatureState: {
          ...character.classFeatureState,
          monk: {
            ...monkState,
            warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn:
              improvedShadowStepAttacksRemaining - 1
          }
        }
      });
    }

    return isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)
      ? consumeShadowStepAdvantage({
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
        })
      : character;
  }

  if (action.economyType === ECONOMY_TYPE.ACTION) {
    const extraAttacksRemaining = monkState.extraAttacksRemainingThisTurn ?? 0;

    if (extraAttacksRemaining > 0) {
      return consumeShadowStepAdvantage({
        ...character,
        classFeatureState: {
          ...character.classFeatureState,
          monk: {
            ...monkState,
            extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
          }
        }
      });
    }
  }

  if (!isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)) {
    return character;
  }

  if (action.economyType !== ECONOMY_TYPE.ACTION) {
    return grantFleetStepFollowUp(
      consumeShadowStepAdvantage({
        ...character,
        roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
      })
    );
  }

  return consumeShadowStepAdvantage({
    ...character,
    roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource),
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        extraAttacksRemainingThisTurn: hasMonkFeature(character, CLASS_FEATURE.EXTRA_ATTACK) ? 1 : 0
      }
    }
  });
}

export function applyShortRestToMonkFeatures(character: Character): Character {
  return deactivateMonkSuperiorDefense(restoreAllMonkFocusPoints(character));
}

export function applyLongRestToMonkFeatures(character: Character): Character {
  return restoreMonkHandOfUltimateJusticeOnLongRest(
    restoreMonkWholenessOfBodyOnLongRest(
      restoreMonkFlurryOfHealingAndHarmOnLongRest(
        restoreMonkUncannyMetabolismOnLongRest(
          deactivateMonkSuperiorDefense(restoreAllMonkFocusPoints(character))
        )
      )
    )
  );
}

export function restoreMonkFocusPointsOnShortRest(character: Character): Character {
  return restoreAllMonkFocusPoints(character);
}

export function restoreMonkFocusPointsOnLongRest(character: Character): Character {
  return deactivateMonkSuperiorDefense(restoreAllMonkFocusPoints(character));
}

export function advanceMonkFeaturesForNewRound(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const superiorDefenseRoundsRemaining = monkState.superiorDefenseRoundsRemaining ?? 0;
  const superiorDefenseActive = hasMonkSuperiorDefenseStatus(character);

  if (
    (monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0) === 0 &&
    (monkState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    monkState.warriorOfShadowShadowStepAdvantageActive !== true &&
    (monkState.warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn ?? 0) === 0 &&
    monkState.stunningStrikeUsedThisTurn !== true &&
    monkState.warriorOfTheElementsEmpoweredStrikesUsedThisTurn !== true &&
    (monkState.warriorOfTheOpenHandFleetStepFollowUpUsesRemainingThisTurn ?? 0) === 0 &&
    !getMonkWarriorOfMercyHandOfHarmUsedThisTurn(character) &&
    getMonkWarriorOfMercyHandOfHealingFlurryUsesThisTurn(character) <= 0 &&
    monkState.warriorOfMercyFlurryOfHealingAndHarmActive !== true &&
    superiorDefenseRoundsRemaining === 0 &&
    monkState.superiorDefenseUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        flurryOfBlowsAttacksRemainingThisTurn: 0,
        extraAttacksRemainingThisTurn: 0,
        warriorOfShadowShadowStepAdvantageActive: false,
        warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn: 0,
        stunningStrikeUsedThisTurn: false,
        warriorOfTheElementsEmpoweredStrikesUsedThisTurn: false,
        warriorOfTheOpenHandFleetStepFollowUpUsesRemainingThisTurn: 0,
        warriorOfMercyHandOfHarmUsedThisTurn: false,
        warriorOfMercyHandOfHealingFlurryUsesThisTurn: 0,
        warriorOfMercyFlurryOfHealingAndHarmActive: false,
        superiorDefenseRoundsRemaining: superiorDefenseActive
          ? 0
          : Math.max(0, superiorDefenseRoundsRemaining - 1),
        superiorDefenseUsedThisTurn: false
      }
    }
  };
}

export function activateMonkHandOfUltimateJustice(character: Character): Character {
  return activateMonkWarriorOfMercyHandOfUltimateJustice(character);
}

export function getMonkSpeedBonuses(
  character: Pick<
    Character,
    "className" | "level" | "equipment" | "inventoryItems" | "customEquipment"
  >,
  _context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  const movementBonus = getMonkUnarmoredMovementBonus(character);
  const combatState = getMonkCombatState(character);

  if (movementBonus <= 0 || combatState.hasWornBodyArmor || combatState.hasShieldEquipped) {
    return [];
  }

  return [
    {
      label: "Unarmored Movement",
      value: movementBonus
    }
  ];
}

export function getMonkArmorClassModes(
  character: Pick<Character, "className" | "level">,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (!hasMonkFeature(character, CLASS_FEATURE.UNARMORED_DEFENSE)) {
    return [];
  }

  const isApplicable = !context.hasWornBodyArmor && !context.hasShieldEquipped;
  const unavailableReason = context.hasWornBodyArmor
    ? context.hasShieldEquipped
      ? "Requires you to wear no body armor and wield no shield."
      : "Requires you to wear no body armor."
    : context.hasShieldEquipped
      ? "Requires you to wield no shield."
      : undefined;

  return [
    {
      key: "monk-unarmored-defense",
      label: "Unarmored Defense",
      unlockedAtLevel: 1,
      baseValue: 10,
      abilityModifiers: ["DEX", "WIS"],
      shieldAllowed: false,
      isApplicable,
      unavailableReason,
      detail: "Monk feature"
    }
  ];
}

export function getMonkAbilityScoreBonuses(
  character: Pick<Character, "className" | "level">
): FeatureAbilityScoreBonus[] {
  if (!hasMonkFeature(character, CLASS_FEATURE.BODY_AND_MIND)) {
    return [];
  }

  return [
    {
      ability: "DEX",
      label: "Body and Mind",
      value: 4,
      maxScore: 25,
      order: 20
    },
    {
      ability: "WIS",
      label: "Body and Mind",
      value: 4,
      maxScore: 25,
      order: 20
    }
  ];
}
