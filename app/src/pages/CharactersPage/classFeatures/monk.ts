import {
  getMonkDeflectAttacksDescription,
  monkFeatures,
  type MonkFeatureClassObj
} from "../../../codex/classes";
import {
  ARMOR_TYPES,
  CLASS_FEATURE,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  getReactionEntryById,
  hardcodedCodexEntries,
  type ReactionEntry,
  type ArmorEntry,
  type WeaponEntry
} from "../../../codex/entries";
import type { Character, CharacterMonkFeatureState } from "../../../types";
import {
  CONDITION_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY
} from "../../../types";
import { STATUS_DURATION_KIND, STATUS_ENTRY_GROUP, STATUS_ENTRY_SOURCE_TYPE } from "../../../types";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../actionEconomy";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker
} from "../combat";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomArmorEntry,
  type ResolvedCustomWeaponEntry
} from "../customEquipment";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount
} from "../inventory";
import { isMonkWeapon } from "../monkWeapons";
import { hasStatusCondition } from "../traits";
import type {
  ArmorClassFeatureContext,
  DerivedFeatureStatusEntry,
  FeatureAbilityScoreBonus,
  FeatureActionCard,
  FeatureArmorClassMode,
  FeatureSavingThrowProficiencyEntry,
  FeatureSpeedBonus,
  SpeedFeatureContext
} from "./types";

export const monkFlurryOfBlowsActionKey = "monk-flurry-of-blows";
export const monkUncannyMetabolismActionKey = "monk-uncanny-metabolism";
export const monkStunningStrikeActionKey = "monk-stunning-strike";
export const monkSuperiorDefenseActionKey = "monk-superior-defense";

type MonkMartialArtsContext = {
  hasWornBodyArmor: boolean;
  hasShieldEquipped: boolean;
  wieldsOnlyMonkWeaponsOrUnarmed: boolean;
};

type MonkWeaponAttackContext = {
  key: string;
  economyType: EconomyType;
  attackKind: "weapon" | "unarmed";
};

type MonkCombatState = MonkMartialArtsContext & {
  hasFreeHand: boolean;
  martialArtsActive: boolean;
};

const codexWeaponEntriesByName = new Map<string, WeaponEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is WeaponEntry => entry.category === ENTRY_CATEGORIES.WEAPONS)
    .map((entry) => [entry.name, entry])
);

const codexArmorEntriesByName = new Map<string, ArmorEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is ArmorEntry => entry.category === ENTRY_CATEGORIES.ARMOR)
    .map((entry) => [entry.name, entry])
);

const superiorDefenseDurationRounds = 10;
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
  character: Pick<Character, "className" | "level" | "equipment" | "customEquipment">
): MonkCombatState {
  const heldCodexEquipment = character.equipment.filter((item) => item.onHand);
  const heldCodexWeapons = heldCodexEquipment.reduce<WeaponEntry[]>((entries, item) => {
    const weaponEntry = codexWeaponEntriesByName.get(item.name);
    return weaponEntry ? [...entries, weaponEntry] : entries;
  }, []);
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
  const heldCustomWeapons = getResolvedHeldCustomWeapons(character);
  const wornCustomArmor = getResolvedWornCustomArmor(character);
  const heldCustomDescriptors = heldCustomWeapons.map((entry) =>
    createHeldWeaponDescriptor(`custom-${entry.customEquipmentId}`, entry)
  );
  const shieldDescriptors = wornCustomArmor
    .filter((entry) => entry.tags.includes(ARMOR_TYPES.SHIELD))
    .map((entry) => createHeldShieldDescriptor(`custom-${entry.customEquipmentId}`));
  const heldDescriptors = [...heldCodexDescriptors, ...heldCustomDescriptors, ...shieldDescriptors];
  const hasFreeHand = getHeldWeaponSlotCount(heldDescriptors) < 2;
  const hasShieldEquipped =
    heldCodexEquipment.some((item) =>
      codexArmorEntriesByName.get(item.name)?.tags.includes(ARMOR_TYPES.SHIELD)
    ) || wornCustomArmor.some((entry) => entry.tags.includes(ARMOR_TYPES.SHIELD));
  const hasWornBodyArmor =
    character.equipment.some((item) => {
      if (!item.worn) {
        return false;
      }

      const armorEntry = codexArmorEntriesByName.get(item.name);
      return Boolean(armorEntry && !armorEntry.tags.includes(ARMOR_TYPES.SHIELD));
    }) || wornCustomArmor.some((entry) => !entry.tags.includes(ARMOR_TYPES.SHIELD));
  const martialArtsContext = {
    hasWornBodyArmor,
    hasShieldEquipped,
    wieldsOnlyMonkWeaponsOrUnarmed: [...heldCodexWeapons, ...heldCustomWeapons].every((weapon) =>
      isMonkWeapon(weapon)
    )
  } satisfies MonkMartialArtsContext;

  return {
    ...martialArtsContext,
    hasFreeHand,
    martialArtsActive: canUseMonkMartialArts(character, martialArtsContext)
  };
}

function canUseFlurryOfBlows(
  character: Pick<Character, "className" | "level" | "equipment" | "customEquipment">
): boolean {
  const combatState = getMonkCombatState(character);
  return combatState.martialArtsActive && combatState.hasFreeHand;
}

function isMonkTurnFresh(character: Pick<Character, "roundTracker">): boolean {
  const roundTracker = normalizeRoundTracker(character.roundTracker);

  return (
    roundTracker.actionAvailable &&
    roundTracker.bonusActionAvailable &&
    roundTracker.reactionAvailable
  );
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
  character: Pick<Character, "className" | "level">
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

export function hasMonkPerfectFocus(character: Pick<Character, "className" | "level">): boolean {
  return hasMonkFeature(character, CLASS_FEATURE.PERFECT_FOCUS);
}

export function getMonkFlurryOfBlowsAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFeatureState(character).flurryOfBlowsAttacksRemainingThisTurn ?? 0;
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
    "className" | "level" | "classFeatureState" | "equipment" | "customEquipment" | "roundTracker"
  >
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    const focusRemaining = getMonkFocusPointsRemaining(character);
    const combatState = getMonkCombatState(character);
    const flurryStrikeCount = getMonkFlurryOfBlowsStrikeCount(character);
    const disabledReason =
      focusRemaining <= 0
        ? "No Focus Points remaining."
        : !combatState.hasFreeHand
          ? "Unarmed Strike isn't available while your hands are full."
          : !combatState.martialArtsActive
            ? "Flurry of Blows requires Martial Arts to be active."
            : undefined;

    actions.push({
      key: monkFlurryOfBlowsActionKey,
      name: "Flurry of Blows",
      summary: `Grant ${flurryStrikeCount} Unarmed Strikes.`,
      detail: `Expend 1 Focus Point to make ${flurryStrikeCount} Unarmed Strikes as a Bonus Action.`,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: "1",
      usesIcon: "brain",
      usesTone: focusRemaining <= 0 ? "danger" : "default",
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  if (hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM)) {
    const uncannyRemaining = Math.max(
      0,
      1 - (getMonkFeatureState(character).uncannyMetabolismUsesExpended ?? 0)
    );

    actions.push({
      key: monkUncannyMetabolismActionKey,
      name: "Uncanny Metabolism",
      summary: "Recharge focus and health.",
      detail: "Recharge focus and health.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining: uncannyRemaining,
      usesTotal: 1,
      disabled: uncannyRemaining <= 0,
      disabledReason: uncannyRemaining <= 0 ? "No charges remaining." : undefined
    });
  }

  if (hasMonkFeature(character, CLASS_FEATURE.STUNNING_STRIKE)) {
    const focusRemaining = getMonkFocusPointsRemaining(character);
    const monkState = getMonkFeatureState(character);

    actions.push({
      key: monkStunningStrikeActionKey,
      name: "Stunning Strike",
      summary: "Once per turn only after a hit.",
      detail:
        "Once per turn only after a hit, expend 1 Focus Point to use Stunning Strike. The usage is tracked, but resolving the effect is up to the player.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: "1",
      usesIcon: "brain",
      usesTone: focusRemaining <= 0 ? "danger" : "default",
      disabled: focusRemaining <= 0 || monkState.stunningStrikeUsedThisTurn === true,
      disabledReason:
        focusRemaining <= 0
          ? "No Focus Points remaining."
          : monkState.stunningStrikeUsedThisTurn === true
            ? "Stunning Strike has already been used this turn."
            : undefined
    });
  }

  if (hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    const focusRemaining = getMonkFocusPointsRemaining(character);
    const monkState = getMonkFeatureState(character);
    const disabledReason =
      focusRemaining < 3
        ? "You need 3 Focus Points to use Superior Defense."
        : monkState.superiorDefenseUsedThisTurn === true
          ? "Superior Defense has already been used this turn."
          : !isMonkTurnFresh(character)
            ? "Superior Defense can only be activated at the start of your turn."
            : undefined;

    actions.push({
      key: monkSuperiorDefenseActionKey,
      name: "Superior Defense",
      summary: "Once at the start of a turn.",
      detail: "Once at the start of a turn.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
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
  const hasDeflectEnergy = hasMonkFeature(character, CLASS_FEATURE.DEFLECT_ENERGY);

  if (hasMonkFeature(character, CLASS_FEATURE.DEFLECT_ATTACKS)) {
    const deflectAttacks = getReactionEntryById("reaction-deflect-attacks");

    if (deflectAttacks) {
      reactionEntries.push({
        ...deflectAttacks,
        description: getMonkDeflectAttacksDescription(hasDeflectEnergy)
      });
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
  if (!hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    return [];
  }

  const superiorDefenseRoundsRemaining =
    getMonkFeatureState(character).superiorDefenseRoundsRemaining ?? 0;

  if (superiorDefenseRoundsRemaining <= 0) {
    return [];
  }

  if (hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)) {
    return [];
  }

  return nonForceDamageTypes.map<DerivedFeatureStatusEntry>((damageType) => ({
    id: `feature-monk-superior-defense-resistance-${damageType.toLowerCase()}`,
    sourceId: `feature-monk-superior-defense-resistance-${damageType.toLowerCase()}`,
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    value: damageType,
    source: "Superior Defense",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
    duration: {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: superiorDefenseRoundsRemaining
    }
  }));
}

export function activateMonkFlurryOfBlows(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS) || !canUseFlurryOfBlows(character)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const focusRemaining = getMonkFocusPointsRemaining(character);
  const flurryStrikeCount = getMonkFlurryOfBlowsStrikeCount(character);

  if (focusRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: (monkState.focusPointsExpended ?? 0) + 1,
        flurryOfBlowsAttacksRemainingThisTurn:
          (monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0) + flurryStrikeCount
      }
    }
  };
}

export function activateMonkStunningStrike(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.STUNNING_STRIKE)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const focusRemaining = getMonkFocusPointsRemaining(character);

  if (focusRemaining <= 0 || monkState.stunningStrikeUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: (monkState.focusPointsExpended ?? 0) + 1,
        stunningStrikeUsedThisTurn: true
      }
    }
  };
}

export function activateMonkUncannyMetabolism(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);

  if ((monkState.uncannyMetabolismUsesExpended ?? 0) >= 1) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
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

  if (
    focusRemaining < 3 ||
    !isMonkTurnFresh(character) ||
    monkState.superiorDefenseUsedThisTurn === true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: (monkState.focusPointsExpended ?? 0) + 3,
        superiorDefenseRoundsRemaining: superiorDefenseDurationRounds,
        superiorDefenseUsedThisTurn: true
      }
    }
  };
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
    monkState.stunningStrikeUsedThisTurn !== true
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
        stunningStrikeUsedThisTurn: false
      }
    }
  };
}

function deactivateMonkSuperiorDefense(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);

  if ((monkState.superiorDefenseRoundsRemaining ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
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

export function consumeMonkWeaponAttack(
  character: Character,
  action: MonkWeaponAttackContext
): Character {
  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  if (!roundTrackerResource) {
    return character;
  }

  const monkState = getMonkFeatureState(character);

  if (
    action.key === "unarmed-strike" &&
    action.attackKind === "unarmed" &&
    action.economyType === ECONOMY_TYPE.BONUS_ACTION
  ) {
    const flurryAttacksRemaining = monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0;

    if (flurryAttacksRemaining > 0) {
      return {
        ...character,
        classFeatureState: {
          ...character.classFeatureState,
          monk: {
            ...monkState,
            flurryOfBlowsAttacksRemainingThisTurn: flurryAttacksRemaining - 1
          }
        }
      };
    }
  }

  const extraAttacksRemaining = monkState.extraAttacksRemainingThisTurn ?? 0;

  if (extraAttacksRemaining > 0) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        monk: {
          ...monkState,
          extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
        }
      }
    };
  }

  if (!isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)) {
    return character;
  }

  return {
    ...character,
    roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource),
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        extraAttacksRemainingThisTurn: hasMonkFeature(character, CLASS_FEATURE.EXTRA_ATTACK) ? 1 : 0
      }
    }
  };
}

export function applyShortRestToMonkFeatures(character: Character): Character {
  return deactivateMonkSuperiorDefense(restoreAllMonkFocusPoints(character));
}

export function applyLongRestToMonkFeatures(character: Character): Character {
  const nextCharacter = deactivateMonkSuperiorDefense(restoreAllMonkFocusPoints(character));
  const monkState = getMonkFeatureState(nextCharacter);

  if ((monkState.uncannyMetabolismUsesExpended ?? 0) === 0) {
    return nextCharacter;
  }

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      monk: {
        ...monkState,
        uncannyMetabolismUsesExpended: 0
      }
    }
  };
}

export function restoreMonkFocusPointsOnShortRest(character: Character): Character {
  return restoreAllMonkFocusPoints(character);
}

export function restoreMonkFocusPointsOnLongRest(character: Character): Character {
  return applyLongRestToMonkFeatures(character);
}

export function advanceMonkFeaturesForNewRound(character: Character): Character {
  if (!hasMonkFeature(character, CLASS_FEATURE.MONKS_FOCUS)) {
    return character;
  }

  const monkState = getMonkFeatureState(character);
  const superiorDefenseRoundsRemaining = monkState.superiorDefenseRoundsRemaining ?? 0;

  if (
    (monkState.flurryOfBlowsAttacksRemainingThisTurn ?? 0) === 0 &&
    (monkState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    monkState.stunningStrikeUsedThisTurn !== true &&
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
        stunningStrikeUsedThisTurn: false,
        superiorDefenseRoundsRemaining: Math.max(0, superiorDefenseRoundsRemaining - 1),
        superiorDefenseUsedThisTurn: false
      }
    }
  };
}

export function getMonkSpeedBonuses(
  character: Pick<Character, "className" | "level" | "equipment" | "customEquipment">,
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
  if (
    !hasMonkFeature(character, CLASS_FEATURE.UNARMORED_DEFENSE) ||
    context.hasWornBodyArmor ||
    context.hasShieldEquipped
  ) {
    return [];
  }

  return [
    {
      key: "monk-unarmored-defense",
      label: "Unarmored Defense",
      baseValue: 10,
      abilityModifiers: ["DEX", "WIS"],
      shieldAllowed: false,
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
