import {
  ACTION_TYPE,
  getReactionEntryById,
  type ReactionEntry,
  type SpellEntry
} from "../../../codex/entries";
import {
  mantleOfInspirationDescription,
  mantleOfMajestyDescription
} from "../../../codex/subclasses/bard";
import { getSelectedSubclassForCharacter } from "../subclasses";
import { SKILL, type Character } from "../../../types";
import { getEquipmentByName } from "../proficiency";
import {
  getBardicInspirationDie,
  getBardicInspirationUsesRemaining,
  getBardicInspirationUsesTotal,
  getMantleOfMajestyFallbackSlotLevel,
  getMantleOfMajestyFallbackSlotSummary,
  getMantleOfMajestyUsesRemaining,
  getMantleOfMajestyUsesTotal,
  hasActiveMantleOfMajesty,
  mantleOfInspirationActionKey,
  mantleOfMajestyActionKey
} from "./bard";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type {
  AbilityCheckIndicatorMap,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureLanguageProficiencyEntry,
  FeatureUnarmedStrikeConfig,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  WeaponFeatureContext,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SkillIndicatorMap
} from "./types";

export type SubclassDerivedFeatureState = {
  featureActions?: FeatureActionCard[];
  featureActionOptions?: Partial<Record<string, FeatureActionOptionCard[]>>;
  transformFeatureAction?: (action: FeatureActionCard) => FeatureActionCard;
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  weaponAttackIndicators?: FeatureIndicator[];
  getWeaponDamageBonuses?: (context: WeaponFeatureContext) => FeatureDamageBonus[];
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
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  alwaysPreparedSpellIds?: string[];
  derivedStatusEntries?: DerivedFeatureStatusEntry[];
  reactionEntries?: ReactionEntry[];
  spellDamageFormulaOverrides?: Record<string, string>;
  transformSpellEntry?: (spell: SpellEntry) => SpellEntry;
  getUnarmedStrikeConfig?: () => FeatureUnarmedStrikeConfig | null;
};

type SubclassRuntimeResolver = (
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "subclassId"
        | "equipment"
        | "customEquipment"
        | "abilities"
        | "classFeatureState"
        | "feats"
        | "statusEntries"
        | "spellSlotsExpended"
      >
    >
) => SubclassDerivedFeatureState;

const pathOfTheBerserkerSubclassId = "barbarian-path-of-the-berserker";
const pathOfTheWildHeartSubclassId = "barbarian-path-of-the-wild-heart";
const pathOfTheWorldTreeSubclassId = "barbarian-path-of-the-world-tree";
const collegeOfDanceSubclassId = "bard-college-of-dance";
const collegeOfGlamourSubclassId = "bard-college-of-glamour";
const wildHeartAnimalSpeakerSpellIds = ["spell-beast-sense", "spell-speak-with-animals"] as const;
const wildHeartNatureSpeakerSpellId = "spell-commune-with-nature";
const glamourBeguilingMagicSpellIds = ["spell-charm-person", "spell-mirror-image"] as const;
const glamourCommandSpellId = "spell-command";
const agileStrikesDescription =
  "Agile Strikes: You can make one Unarmed Strike as part of this action.";
const dazzlingFootworkPerformanceIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Dazzling Footwork"
};

function hasCollegeOfDanceDazzlingFootwork(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfDanceSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWornBodyArmor(
  character: Partial<Pick<Character, "equipment" | "customEquipment">>
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield";
    }) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType !== "shield" && entry.worn
    )
  );
}

function hasShieldEquipped(
  character: Partial<Pick<Character, "equipment" | "customEquipment">>
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.onHand && !item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield";
    }) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType === "shield" && entry.worn
    )
  );
}

function hasActiveCollegeOfDanceCombatBenefits(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "equipment" | "customEquipment">>
): boolean {
  return (
    hasCollegeOfDanceDazzlingFootwork(character) &&
    !hasWornBodyArmor(character) &&
    !hasShieldEquipped(character)
  );
}

function createDefaultFeatureActionDescription(action: FeatureActionCard): string[] {
  const description: string[] = [];
  const normalizedDetail = action.detail.trim();
  const normalizedSummary = action.summary.trim();

  if (normalizedDetail) {
    description.push(normalizedDetail);
  }

  if (normalizedSummary && normalizedSummary !== normalizedDetail) {
    description.push(`<strong>${normalizedSummary}</strong>`);
  }

  return description;
}

function shouldAppendAgileStrikesDescription(action: FeatureActionCard): boolean {
  if (action.key === "bard-bardic-inspiration") {
    return true;
  }

  const searchableText = [
    action.name,
    action.summary,
    action.detail,
    ...(action.description ?? [])
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes("bardic inspiration") && searchableText.includes("expend");
}

function appendAgileStrikesDescription(action: FeatureActionCard): FeatureActionCard {
  if (!shouldAppendAgileStrikesDescription(action)) {
    return action;
  }

  const description = action.description?.length
    ? [...action.description]
    : createDefaultFeatureActionDescription(action);

  if (description.includes(agileStrikesDescription)) {
    return action;
  }

  return {
    ...action,
    description: [...description, agileStrikesDescription]
  };
}

function getBerserkerReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheBerserkerSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const retaliation = getReactionEntryById("reaction-berserker-retaliation");

  return retaliation ? [retaliation] : [];
}

function getWorldTreeReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheWorldTreeSubclassId ||
    (character.level ?? 0) < 6
  ) {
    return [];
  }

  const branchesOfTheTree = getReactionEntryById("reaction-world-tree-branches-of-the-tree");

  return branchesOfTheTree ? [branchesOfTheTree] : [];
}

function getCollegeOfDanceReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (!hasCollegeOfDanceDazzlingFootwork(character) || (character.level ?? 0) < 6) {
    return [];
  }

  const inspiringMovement = getReactionEntryById("reaction-inspiring-movement");

  return inspiringMovement ? [inspiringMovement] : [];
}

function hasCollegeOfGlamourMantleOfInspiration(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfGlamourMantleOfMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function getCollegeOfGlamourFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "classFeatureState"
        | "subclassId"
        | "abilities"
        | "feats"
        | "statusEntries"
        | "spellSlotsExpended"
      >
    >
): FeatureActionCard[] {
  if (character.level === undefined || !character.abilities || !character.feats) {
    return [];
  }

  const actions: FeatureActionCard[] = [];
  const bardResourceCharacter = {
    className: character.className,
    level: character.level,
    abilities: character.abilities,
    classFeatureState: character.classFeatureState,
    feats: character.feats
  };
  const glamourCharacter = {
    className: character.className,
    level: character.level,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState,
    spellSlotsExpended: character.spellSlotsExpended
  };
  const mantleActive = hasActiveMantleOfMajesty(character);

  if (hasCollegeOfGlamourMantleOfInspiration(character)) {
    const usesRemaining = getBardicInspirationUsesRemaining(bardResourceCharacter);
    const usesTotal = getBardicInspirationUsesTotal(bardResourceCharacter);

    actions.push({
      key: mantleOfInspirationActionKey,
      name: "Mantle of Inspiration",
      summary: "Grant Temporary Hit Points and movement.",
      detail: "Expend a Bardic Inspiration die to empower nearby allies.",
      breakdown: "Grant TempHP to creatures",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "music",
      description: [...mantleOfInspirationDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "College of Glamour",
        confirmLabel: "Roll Bardic Dice",
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal,
            icon: "music",
            cost: 1
          }
        ]
      },
      execute: {
        kind: "activate",
        effectKind: "bardic-inspiration-roll"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Bardic Inspiration uses remaining." : undefined
    });
  }

  if (
    hasCollegeOfGlamourMantleOfMajesty(character) &&
    character.spellSlotsExpended !== undefined
  ) {
    const usesRemaining = getMantleOfMajestyUsesRemaining(glamourCharacter);
    const usesTotal = getMantleOfMajestyUsesTotal(glamourCharacter);
    const fallbackSlotLevel = getMantleOfMajestyFallbackSlotLevel({
      className: character.className,
      level: character.level,
      spellSlotsExpended: character.spellSlotsExpended
    });
    const fallbackSlotSummary = getMantleOfMajestyFallbackSlotSummary({
      className: character.className,
      level: character.level,
      spellSlotsExpended: character.spellSlotsExpended
    });
    const hasFallbackSlot = fallbackSlotLevel !== null;

    actions.push({
      key: mantleOfMajestyActionKey,
      name: "Mantle of Majesty",
      summary: "Cast Command and assume your unearthly majesty.",
      detail: "Open Command and cast it through Mantle of Majesty.",
      breakdown: "Command as the Majesty you are.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      isActive: mantleActive,
      description: [...mantleOfMajestyDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: usesTotal
        },
        ...(usesRemaining <= 0 && hasFallbackSlot
          ? [
              {
                kind: "text" as const,
                label: "Level 3+ Slots",
                value: `${fallbackSlotSummary.remaining}/${fallbackSlotSummary.total}`
              }
            ]
          : [])
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "College of Glamour",
        confirmLabel: "Open Command"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "mantle-of-majesty",
        spellId: glamourCommandSpellId,
        spellLevel: 1,
        label: "Open Command",
        actionContextText: "Using Mantle of Majesty"
      },
      disabled: mantleActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: mantleActive
        ? "Mantle of Majesty is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Mantle of Majesty use or level 3+ spell slots remaining."
          : undefined
    });
  }

  return actions;
}

const subclassRuntimeResolvers: Record<string, SubclassRuntimeResolver> = {
  [pathOfTheBerserkerSubclassId]: (character) => ({
    reactionEntries: getBerserkerReactionEntries(character)
  }),
  [pathOfTheWildHeartSubclassId]: (character) => ({
    alwaysPreparedSpellIds:
      character.className === "Barbarian" &&
      character.subclassId === pathOfTheWildHeartSubclassId &&
      (character.level ?? 0) >= 3
        ? [
            ...wildHeartAnimalSpeakerSpellIds,
            ...((character.level ?? 0) >= 10 ? [wildHeartNatureSpeakerSpellId] : [])
          ]
        : []
  }),
  [pathOfTheWorldTreeSubclassId]: (character) => ({
    reactionEntries: getWorldTreeReactionEntries(character)
  }),
  [collegeOfDanceSubclassId]: (character) => ({
    reactionEntries: getCollegeOfDanceReactionEntries(character),
    skillIndicators: hasCollegeOfDanceDazzlingFootwork(character)
      ? {
          [SKILL.PERFORMANCE]: [dazzlingFootworkPerformanceIndicator]
        }
      : {},
    transformFeatureAction: hasActiveCollegeOfDanceCombatBenefits(character)
      ? appendAgileStrikesDescription
      : undefined,
    getArmorClassModes: (context) =>
      hasCollegeOfDanceDazzlingFootwork(character) &&
      !context.hasWornBodyArmor &&
      !context.hasShieldEquipped
        ? [
            {
              key: "bard-dance-unarmored-defense",
              label: "Unarmored Defense",
              baseValue: 10,
              abilityModifiers: ["DEX", "CHA"],
              shieldAllowed: false,
              detail: "College of Dance feature"
            }
          ]
        : [],
    getUnarmedStrikeConfig: () => {
      if (!hasActiveCollegeOfDanceCombatBenefits(character)) {
        return null;
      }

      const bardicDie = getBardicInspirationDie({
        className: character.className,
        level: character.level ?? 0
      });

      return {
        attackAbility: "finesse",
        damageAbility: "DEX",
        damageFormula: bardicDie ? `1${String(bardicDie).toLowerCase()}` : undefined,
        damageTypeLabel: "Bludgeoning"
      };
    }
  }),
  [collegeOfGlamourSubclassId]: (character) => ({
    featureActions: getCollegeOfGlamourFeatureActions(character),
    alwaysPreparedSpellIds:
      character.className === "Bard" &&
      character.subclassId === collegeOfGlamourSubclassId &&
      (character.level ?? 0) >= 3
        ? [
            ...glamourBeguilingMagicSpellIds,
            ...((character.level ?? 0) >= 6 ? [glamourCommandSpellId] : [])
          ]
        : [],
    transformSpellEntry: (spell) =>
      hasActiveMantleOfMajesty(character) && spell.id === glamourCommandSpellId
        ? {
            ...spell,
            castingTime: [ACTION_TYPE.BONUS_ACTION]
          }
        : spell
  })
};

export function getSubclassDerivedFeatureState(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "subclassId"
        | "equipment"
        | "customEquipment"
        | "abilities"
        | "classFeatureState"
        | "feats"
        | "statusEntries"
        | "spellSlotsExpended"
      >
    >
): SubclassDerivedFeatureState {
  const subclass = getSelectedSubclassForCharacter(character);

  if (!subclass) {
    return {};
  }

  const runtimeResolver =
    subclassRuntimeResolvers[subclass.runtimeHookId ?? subclass.id] ??
    subclassRuntimeResolvers[subclass.id];

  return runtimeResolver ? runtimeResolver(character) : {};
}
