import { rogueFeatureMap, rogueFeatures } from "../../../codex/classes";
import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  RARITY_TYPES,
  getReactionEntryById,
  type ReactionEntry,
  type WeaponEntry,
  hardcodedCodexEntries
} from "../../../codex/entries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type {
  Character,
  CharacterRogueFeatureState,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import {
  ALL_SKILLS,
  CONDITION_NAME,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY,
  languageEntries
} from "../../../types";
import { normalizeRoundTracker } from "../combat";
import { hasStatusCondition } from "../traits";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureLanguageProficiencyEntry,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry
} from "./types";

export const rogueSneakAttackActionKey = "rogue-sneak-attack";
export const rogueSteadyAimActionKey = "rogue-steady-aim";
export const rogueStrokeOfLuckActionKey = "rogue-stroke-of-luck";
const rogueLevel1ExpertiseSource = "Level 1: Expertise";
const rogueLevel6ExpertiseSource = "Level 6: Expertise";
const rogueThievesCantSource = "Thieves' Cant";
const rogueWeaponMasterySource = "Weapon Mastery";
const rogueWeaponMasterySelectionCount = 2;
const rogueSlipperyMindSource = "Slippery Mind";
const rogueSteadyAimSource = "Steady Aim";
const rogueEvasionSourceId = "feature-rogue-evasion";
const rogueElusiveSourceId = "feature-rogue-elusive";
const rogueDisabledByIncapacitatedReason = "Disabled by Incapacitated";

export type RogueSneakAttackEffectKey =
  | "poison"
  | "trip"
  | "withdraw"
  | "daze"
  | "knock-out"
  | "obscure";

export type RogueSneakAttackEffectDefinition = {
  key: RogueSneakAttackEffectKey;
  name: string;
  costDice: number;
  referenceTitle: string;
  referenceDescription: string[];
};

type RogueExpertiseTier = "level1" | "level6";

const rogueSkillProficiencyBySkillName = new Map<SkillName, SKILL_PROFICIENCY>([
  ["Acrobatics", SKILL_PROFICIENCY.ACROBATICS],
  ["Animal Handling", SKILL_PROFICIENCY.ANIMAL_HANDLING],
  ["Arcana", SKILL_PROFICIENCY.ARCANA],
  ["Athletics", SKILL_PROFICIENCY.ATHLETICS],
  ["Deception", SKILL_PROFICIENCY.DECEPTION],
  ["History", SKILL_PROFICIENCY.HISTORY],
  ["Insight", SKILL_PROFICIENCY.INSIGHT],
  ["Intimidation", SKILL_PROFICIENCY.INTIMIDATION],
  ["Investigation", SKILL_PROFICIENCY.INVESTIGATION],
  ["Medicine", SKILL_PROFICIENCY.MEDICINE],
  ["Nature", SKILL_PROFICIENCY.NATURE],
  ["Perception", SKILL_PROFICIENCY.PERCEPTION],
  ["Performance", SKILL_PROFICIENCY.PERFORMANCE],
  ["Persuasion", SKILL_PROFICIENCY.PERSUASION],
  ["Religion", SKILL_PROFICIENCY.RELIGION],
  ["Sleight of Hand", SKILL_PROFICIENCY.SLEIGHT_OF_HAND],
  ["Stealth", SKILL_PROFICIENCY.STEALTH],
  ["Survival", SKILL_PROFICIENCY.SURVIVAL]
]);

const rogueLanguageOptions = languageEntries.map((entry) => entry.proficiency);

const rogueWeaponMasteryOptions = hardcodedCodexEntries
  .filter(
    (entry): entry is WeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS &&
      entry.rarity === RARITY_TYPES.COMMON &&
      typeof entry.baseWeapon === "string"
  )
  .sort((left, right) => left.name.localeCompare(right.name))
  .reduce<WEAPON_PROFICIENCY[]>((options, entry) => {
    const proficiency = entry.baseWeapon as unknown as WEAPON_PROFICIENCY;

    if (!options.includes(proficiency)) {
      options.push(proficiency);
    }

    return options;
  }, []);

function getRogueFeatureDescriptionLines(feature: CLASS_FEATURE): string[] {
  return (rogueFeatureMap[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const rogueCunningStrikeDescriptionLines = getRogueFeatureDescriptionLines(
  CLASS_FEATURE.CUNNING_STRIKE
);
const rogueDeviousStrikesDescriptionLines = getRogueFeatureDescriptionLines(
  CLASS_FEATURE.DEVIOUS_STRIKES
);
const rogueCunningStrikeSavingThrowDescription = rogueCunningStrikeDescriptionLines[2];

const rogueSneakAttackEffectDefinitions: Array<
  RogueSneakAttackEffectDefinition & {
    requiredFeature: CLASS_FEATURE;
  }
> = [
  {
    key: "poison",
    name: "Poison",
    costDice: 1,
    requiredFeature: CLASS_FEATURE.CUNNING_STRIKE,
    referenceTitle: "Poison",
    referenceDescription: [
      rogueCunningStrikeSavingThrowDescription,
      rogueCunningStrikeDescriptionLines[3],
      rogueCunningStrikeDescriptionLines[4]
    ].filter((entry): entry is string => Boolean(entry))
  },
  {
    key: "trip",
    name: "Trip",
    costDice: 1,
    requiredFeature: CLASS_FEATURE.CUNNING_STRIKE,
    referenceTitle: "Trip",
    referenceDescription: [
      rogueCunningStrikeSavingThrowDescription,
      rogueCunningStrikeDescriptionLines[5]
    ].filter((entry): entry is string => Boolean(entry))
  },
  {
    key: "withdraw",
    name: "Withdraw",
    costDice: 1,
    requiredFeature: CLASS_FEATURE.CUNNING_STRIKE,
    referenceTitle: "Withdraw",
    referenceDescription: [rogueCunningStrikeDescriptionLines[6]].filter(
      (entry): entry is string => Boolean(entry)
    )
  },
  {
    key: "daze",
    name: "Daze",
    costDice: 2,
    requiredFeature: CLASS_FEATURE.DEVIOUS_STRIKES,
    referenceTitle: "Daze",
    referenceDescription: [
      rogueCunningStrikeSavingThrowDescription,
      rogueDeviousStrikesDescriptionLines[1]
    ].filter((entry): entry is string => Boolean(entry))
  },
  {
    key: "knock-out",
    name: "Knock Out",
    costDice: 6,
    requiredFeature: CLASS_FEATURE.DEVIOUS_STRIKES,
    referenceTitle: "Knock Out",
    referenceDescription: [
      rogueCunningStrikeSavingThrowDescription,
      rogueDeviousStrikesDescriptionLines[2]
    ].filter((entry): entry is string => Boolean(entry))
  },
  {
    key: "obscure",
    name: "Obscure",
    costDice: 3,
    requiredFeature: CLASS_FEATURE.DEVIOUS_STRIKES,
    referenceTitle: "Obscure",
    referenceDescription: [
      rogueCunningStrikeSavingThrowDescription,
      rogueDeviousStrikesDescriptionLines[3]
    ].filter((entry): entry is string => Boolean(entry))
  }
];

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getRogueFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = rogueFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedRogueFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return rogueFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function isSkillName(value: string): value is SkillName {
  return (ALL_SKILLS as readonly string[]).includes(value);
}

export function hasRogueFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Rogue") {
    return false;
  }

  return getUnlockedRogueFeatures(character.level).has(feature);
}

function hasRogueLevel1Expertise(
  character: Pick<Character, "className" | "level">
): boolean {
  return character.className === "Rogue" && character.level >= 1;
}

function hasRogueLevel6Expertise(
  character: Pick<Character, "className" | "level">
): boolean {
  return character.className === "Rogue" && character.level >= 6;
}

function normalizeRogueExpertiseSelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return dedupe(
    value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry))
  ).slice(0, 2);
}

function normalizeRogueLanguageSelection(value: unknown): LANGUAGE_PROFICIENCY | undefined {
  return typeof value === "string" &&
    rogueLanguageOptions.includes(value as LANGUAGE_PROFICIENCY)
    ? (value as LANGUAGE_PROFICIENCY)
    : undefined;
}

function normalizeRogueWeaponMasteries(selections: unknown): WEAPON_PROFICIENCY[] {
  if (!Array.isArray(selections)) {
    return [];
  }

  const optionSet = new Set<WEAPON_PROFICIENCY>(rogueWeaponMasteryOptions);

  return dedupe(
    selections.filter(
      (selection): selection is WEAPON_PROFICIENCY =>
        typeof selection === "string" && optionSet.has(selection as WEAPON_PROFICIENCY)
    )
  ).slice(0, rogueWeaponMasterySelectionCount);
}

function createRogueExpertiseEntry(
  skill: SkillName,
  sourceLabel: string
): SkillProficiencyEntry | null {
  const proficiency = rogueSkillProficiencyBySkillName.get(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: sourceLabel,
    proficiency,
    proficiencyLevel: PROF_LEVEL.EXPERT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

function getRogueFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CharacterRogueFeatureState {
  return normalizeRogueFeatureState(character.classFeatureState?.rogue, character);
}

function hasRogueSneakAttackTriggerWindow(character: Pick<Character, "roundTracker">): boolean {
  const roundTracker = normalizeRoundTracker(character.roundTracker);

  return !roundTracker.actionAvailable || !roundTracker.bonusActionAvailable;
}

export function normalizeRogueFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterRogueFeatureState {
  const hasLevel1Expertise = hasRogueLevel1Expertise(character);
  const hasLevel6Expertise = hasRogueLevel6Expertise(character);
  const hasThievesCant = hasRogueFeature(character, CLASS_FEATURE.THIEVES_CANT);
  const hasWeaponMastery = hasRogueFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const hasSneakAttack = hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK);
  const hasSteadyAim = hasRogueFeature(character, CLASS_FEATURE.STEADY_AIM);
  const hasStrokeOfLuck = hasRogueFeature(character, CLASS_FEATURE.STROKE_OF_LUCK);

  if (
    !hasLevel1Expertise &&
    !hasLevel6Expertise &&
    !hasThievesCant &&
    !hasWeaponMastery &&
    !hasSneakAttack &&
    !hasSteadyAim &&
    !hasStrokeOfLuck
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterRogueFeatureState>) : {};
  const expertiseRecord =
    record.expertise && typeof record.expertise === "object" ? record.expertise : undefined;
  const level1Selections = hasLevel1Expertise
    ? normalizeRogueExpertiseSelections(expertiseRecord?.level1)
    : [];
  const level6Selections = hasLevel6Expertise
    ? normalizeRogueExpertiseSelections(expertiseRecord?.level6).filter(
        (skill) => !level1Selections.includes(skill)
      )
    : [];

  return {
    expertise:
      hasLevel1Expertise || hasLevel6Expertise
        ? {
            level1: hasLevel1Expertise ? level1Selections : undefined,
            level6: hasLevel6Expertise ? level6Selections : undefined
          }
        : undefined,
    sneakAttackUsedThisTurn: hasSneakAttack ? Boolean(record.sneakAttackUsedThisTurn) : undefined,
    steadyAimActive: hasSteadyAim ? Boolean(record.steadyAimActive) : undefined,
    strokeOfLuckUsesExpended: hasStrokeOfLuck
      ? Math.max(
          0,
          Math.min(
            1,
            Number.isFinite(Number(record.strokeOfLuckUsesExpended))
              ? Math.floor(Number(record.strokeOfLuckUsesExpended))
              : 0
          )
        )
      : undefined,
    thievesCantLanguage: hasThievesCant
      ? normalizeRogueLanguageSelection(record.thievesCantLanguage)
      : undefined,
    weaponMasteries: hasWeaponMastery ? normalizeRogueWeaponMasteries(record.weaponMasteries) : undefined
  };
}

export function getRogueFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "roundTracker">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK)) {
    const diceCount = getRogueSneakAttackDiceCount(character);
    const formula = getRogueSneakAttackFormula(character);
    const valueLabel = getRogueSneakAttackValueLabel(character);
    const rogueState = getRogueFeatureState(character);
    const sneakAttackUsedThisTurn = rogueState.sneakAttackUsedThisTurn === true;
    const canActivate = !sneakAttackUsedThisTurn && hasRogueSneakAttackTriggerWindow(character);
    const disabledReason = sneakAttackUsedThisTurn
      ? "Sneak Attack has already been used this turn."
      : !canActivate
        ? "Use an attack or magic action first."
        : undefined;

    if (formula && valueLabel && diceCount > 0) {
      actions.push({
        key: rogueSneakAttackActionKey,
        name: "Sneak Attack",
        summary: valueLabel,
        detail: "Once per turn after a hit",
        valueLabel,
        breakdown: "Once per turn after a hit",
        economyType: ECONOMY_TYPE.FREE,
        actionCategory: ACTION_CATEGORY.FEATURE,
        disabled: Boolean(disabledReason),
        disabledReason
      });
    }
  }

  if (hasRogueFeature(character, CLASS_FEATURE.STEADY_AIM)) {
    const rogueState = getRogueFeatureState(character);
    const steadyAimActive = rogueState.steadyAimActive === true;

    actions.push({
      key: rogueSteadyAimActionKey,
      name: "Steady Aim",
      summary: "Set your Speed to 0 until the next round.",
      detail: "Set your Speed to 0 until the next round.",
      breakdown: "Set your Speed to 0 until the next round.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      isActive: steadyAimActive,
      disabled: steadyAimActive,
      disabledReason: steadyAimActive ? "Steady Aim is already active this turn." : undefined
    });
  }

  if (hasRogueFeature(character, CLASS_FEATURE.STROKE_OF_LUCK)) {
    const totalUses = getRogueStrokeOfLuckUsesTotal(character);
    const usesRemaining = getRogueStrokeOfLuckUsesRemaining(character);

    actions.push({
      key: rogueStrokeOfLuckActionKey,
      name: "Stroke of Luck",
      summary: "You can turn Failure into Success",
      detail: "You can turn Failure into Success",
      breakdown: "You can turn Failure into Success",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal: totalUses,
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Stroke of Luck recharges on a Short or Long Rest." : undefined
    });
  }

  return actions;
}

export function getRogueReactionEntries(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  if (!hasRogueFeature(character, CLASS_FEATURE.UNCANNY_DODGE)) {
    return [];
  }

  const uncannyDodge = getReactionEntryById("reaction-uncanny-dodge");

  return uncannyDodge ? [uncannyDodge] : [];
}

export function getRogueStrokeOfLuckUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasRogueFeature(character, CLASS_FEATURE.STROKE_OF_LUCK) ? 1 : 0;
}

export function getRogueStrokeOfLuckUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getRogueStrokeOfLuckUsesTotal(character);
  const usesExpended = getRogueFeatureState(character).strokeOfLuckUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRogueDerivedStatusEntries(
  character: Pick<Character, "className" | "level" | "statusEntries">
): DerivedFeatureStatusEntry[] {
  const disabled = hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED);
  const derivedEntries: DerivedFeatureStatusEntry[] = [];

  if (hasRogueFeature(character, CLASS_FEATURE.EVASION)) {
    derivedEntries.push({
      id: rogueEvasionSourceId,
      sourceId: rogueEvasionSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Evasion",
      source: "Evasion",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      disabled,
      disabledReason: disabled ? rogueDisabledByIncapacitatedReason : undefined
    });
  }

  if (hasRogueFeature(character, CLASS_FEATURE.ELUSIVE)) {
    derivedEntries.push({
      id: rogueElusiveSourceId,
      sourceId: rogueElusiveSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Elusive",
      source: "Elusive",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      disabled,
      disabledReason: disabled ? rogueDisabledByIncapacitatedReason : undefined
    });
  }

  return derivedEntries;
}

export function getRogueSavingThrowProficiencyEntries(
  character: Pick<Character, "className" | "level">
): FeatureSavingThrowProficiencyEntry[] {
  if (!hasRogueFeature(character, CLASS_FEATURE.SLIPPERY_MIND)) {
    return [];
  }

  return [SAVING_THROW_PROFICIENCY.WIS, SAVING_THROW_PROFICIENCY.CHA].map((proficiency) => ({
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: rogueSlipperyMindSource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  }));
}

export function getRogueSpeedBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpeedBonus[] {
  if (!hasRogueFeature(character, CLASS_FEATURE.STEADY_AIM)) {
    return [];
  }

  return getRogueFeatureState(character).steadyAimActive === true
    ? [
        {
          label: rogueSteadyAimSource,
          value: 0,
          setTotal: 0
        }
      ]
    : [];
}

export function getRogueSneakAttackDiceCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK)) {
    return 0;
  }

  return getRogueFeatureRow(character.level)?.sneakAttack ?? 0;
}

export function getRogueSneakAttackEffectDefinitions(
  character: Pick<Character, "className" | "level">
): RogueSneakAttackEffectDefinition[] {
  return rogueSneakAttackEffectDefinitions
    .filter((definition) => hasRogueFeature(character, definition.requiredFeature))
    .map(({ requiredFeature: _requiredFeature, ...definition }) => definition);
}

export function getRogueSneakAttackMaxEffects(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasRogueFeature(character, CLASS_FEATURE.CUNNING_STRIKE)) {
    return 0;
  }

  return hasRogueFeature(character, CLASS_FEATURE.IMPROVED_CUNNING_STRIKE) ? 2 : 1;
}

export function getRogueSneakAttackEffectDiceCost(
  effectKeys: RogueSneakAttackEffectKey[]
): number {
  const selectedEffects = new Set(effectKeys);

  return rogueSneakAttackEffectDefinitions.reduce(
    (totalCost, definition) =>
      totalCost + (selectedEffects.has(definition.key) ? definition.costDice : 0),
    0
  );
}

export function getRogueSneakAttackRemainingDiceCount(
  character: Pick<Character, "className" | "level">,
  effectKeys: RogueSneakAttackEffectKey[] = []
): number {
  return Math.max(
    0,
    getRogueSneakAttackDiceCount(character) - getRogueSneakAttackEffectDiceCost(effectKeys)
  );
}

export function getRogueSneakAttackFormula(
  character: Pick<Character, "className" | "level">,
  effectKeys: RogueSneakAttackEffectKey[] = []
): string | null {
  if (!hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK)) {
    return null;
  }

  const diceCount = getRogueSneakAttackRemainingDiceCount(character, effectKeys);

  return diceCount > 0 ? `${diceCount}d6` : "0";
}

export function getRogueSneakAttackValueLabel(
  character: Pick<Character, "className" | "level">,
  effectKeys: RogueSneakAttackEffectKey[] = []
): string | null {
  const formula = getRogueSneakAttackFormula(character, effectKeys);

  if (!formula) {
    return null;
  }

  const diceCount = getRogueSneakAttackRemainingDiceCount(character, effectKeys);

  return diceCount > 0
    ? `${diceCount}~${diceCount * 6} Damage (${formula})`
    : "0 Damage (0)";
}

export function getRogueExpertiseSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  tier: RogueExpertiseTier
): SkillName[] {
  const rogueState = getRogueFeatureState(character);

  return tier === "level6" ? rogueState.expertise?.level6 ?? [] : rogueState.expertise?.level1 ?? [];
}

export function setRogueExpertiseSelections(
  character: Character,
  tier: RogueExpertiseTier,
  selections: SkillName[]
): Character {
  const hasTier = tier === "level6" ? hasRogueLevel6Expertise(character) : hasRogueLevel1Expertise(character);

  if (!hasTier) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);
  const normalizedSelections = normalizeRogueExpertiseSelections(selections);
  const level1Selections = rogueState.expertise?.level1 ?? [];
  const level6Selections = rogueState.expertise?.level6 ?? [];

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        expertise: {
          level1:
            tier === "level1"
              ? normalizedSelections.filter((skill) => !level6Selections.includes(skill))
              : level1Selections,
          level6:
            tier === "level6"
              ? normalizedSelections.filter((skill) => !level1Selections.includes(skill))
              : level6Selections
        }
      }
    }
  };
}

export function getRogueThievesCantLanguageSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): LANGUAGE_PROFICIENCY | null {
  const selection = getRogueFeatureState(character).thievesCantLanguage;

  return selection && rogueLanguageOptions.includes(selection as LANGUAGE_PROFICIENCY)
    ? (selection as LANGUAGE_PROFICIENCY)
    : null;
}

export function setRogueThievesCantLanguageSelection(
  character: Character,
  selection: LANGUAGE_PROFICIENCY | null
): Character {
  if (!hasRogueFeature(character, CLASS_FEATURE.THIEVES_CANT)) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        thievesCantLanguage: selection ?? undefined
      }
    }
  };
}

export function getRogueWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasRogueFeature(character, CLASS_FEATURE.WEAPON_MASTERY)
    ? rogueWeaponMasterySelectionCount
    : 0;
}

export function getRogueWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return rogueWeaponMasteryOptions;
}

export function getRogueWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return getRogueFeatureState(character).weaponMasteries ?? [];
}

export function setRogueWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasRogueFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        weaponMasteries: normalizeRogueWeaponMasteries(selections)
      }
    }
  };
}

export function getRogueWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getRogueWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: rogueWeaponMasterySource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

export function getRogueSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  const entries: FeatureSkillProficiencyEntry[] = [];

  getRogueExpertiseSelections(character, "level1").forEach((skill) => {
    const entry = createRogueExpertiseEntry(skill, rogueLevel1ExpertiseSource);

    if (entry) {
      entries.push(entry);
    }
  });

  getRogueExpertiseSelections(character, "level6").forEach((skill) => {
    const entry = createRogueExpertiseEntry(skill, rogueLevel6ExpertiseSource);

    if (entry) {
      entries.push(entry);
    }
  });

  return entries;
}

export function getRogueLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureLanguageProficiencyEntry[] {
  if (!hasRogueFeature(character, CLASS_FEATURE.THIEVES_CANT)) {
    return [];
  }

  const entries: FeatureLanguageProficiencyEntry[] = [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: rogueThievesCantSource,
      proficiency: LANGUAGE_PROFICIENCY.THIEVES_CANT,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies LanguageProficiencyEntry
  ];
  const bonusLanguage = getRogueThievesCantLanguageSelection(character);

  if (bonusLanguage) {
    entries.push({
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: rogueThievesCantSource,
      proficiency: bonusLanguage,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies LanguageProficiencyEntry);
  }

  return entries;
}

export function activateRogueSneakAttack(character: Character): Character {
  if (
    !hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK) ||
    !hasRogueSneakAttackTriggerWindow(character)
  ) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);

  if (rogueState.sneakAttackUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        sneakAttackUsedThisTurn: true
      }
    }
  };
}

export function activateRogueSteadyAim(character: Character): Character {
  if (!hasRogueFeature(character, CLASS_FEATURE.STEADY_AIM)) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);

  if (rogueState.steadyAimActive === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        steadyAimActive: true
      }
    }
  };
}

export function consumeRogueStrokeOfLuckUse(character: Character): Character {
  if (!hasRogueFeature(character, CLASS_FEATURE.STROKE_OF_LUCK)) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);
  const usesExpended = rogueState.strokeOfLuckUsesExpended ?? 0;

  if (usesExpended >= 1) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        strokeOfLuckUsesExpended: usesExpended + 1
      }
    }
  };
}

export function advanceRogueFeaturesForNewRound(character: Character): Character {
  if (
    !hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK) &&
    !hasRogueFeature(character, CLASS_FEATURE.STEADY_AIM)
  ) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);

  if (
    rogueState.sneakAttackUsedThisTurn !== true &&
    rogueState.steadyAimActive !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        sneakAttackUsedThisTurn: false,
        steadyAimActive: false
      }
    }
  };
}

export function restoreRogueStrokeOfLuckOnShortRest(character: Character): Character {
  if (!hasRogueFeature(character, CLASS_FEATURE.STROKE_OF_LUCK)) {
    return character;
  }

  const rogueState = getRogueFeatureState(character);

  if ((rogueState.strokeOfLuckUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rogue: {
        ...rogueState,
        strokeOfLuckUsesExpended: 0
      }
    }
  };
}

export function restoreRogueStrokeOfLuckOnLongRest(character: Character): Character {
  return restoreRogueStrokeOfLuckOnShortRest(character);
}

export function applyShortRestToRogueFeatures(character: Character): Character {
  const restoredCharacter = restoreRogueStrokeOfLuckOnShortRest(character);

  if (getRogueFeatureState(restoredCharacter).steadyAimActive !== true) {
    return restoredCharacter;
  }

  return {
    ...restoredCharacter,
    classFeatureState: {
      ...restoredCharacter.classFeatureState,
      rogue: {
        ...getRogueFeatureState(restoredCharacter),
        steadyAimActive: false
      }
    }
  };
}

export function applyLongRestToRogueFeatures(character: Character): Character {
  const restoredCharacter = applyShortRestToRogueFeatures(restoreRogueStrokeOfLuckOnLongRest(character));

  if (!hasRogueFeature(restoredCharacter, CLASS_FEATURE.SNEAK_ATTACK)) {
    return restoredCharacter;
  }

  const rogueState = getRogueFeatureState(restoredCharacter);

  if (rogueState.sneakAttackUsedThisTurn !== true) {
    return restoredCharacter;
  }

  return {
    ...restoredCharacter,
    classFeatureState: {
      ...restoredCharacter.classFeatureState,
      rogue: {
        ...rogueState,
        sneakAttackUsedThisTurn: false
      }
    }
  };
}
