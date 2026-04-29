import {
  ACTION_TYPE,
  CLASS_FEATURE,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  getSkillProficiencyForSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  WEAPON_PROFICIENCY,
  type AbilityKey,
  type Character,
  type CharacterWizardFeatureState,
  type SkillProficiencyEntry,
  type WeaponProficiencyEntry,
  type WizardBladesingerTrainingInWarAndSongSkill
} from "../../../../../types";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityModifierForCharacter
} from "../../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../../combat";
import type { WeaponAction } from "../../../gameplay";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import { appendWeaponActionCardBonusLabel } from "../../../weaponActionCardBreakdown";
import type {
  FeatureActionCard,
  FeatureArmorClassBonus,
  FeatureIndicator,
  FeatureSpeedBonus,
  FeatureSkillProficiencyEntry,
  FeatureWeaponProficiencyEntry,
  SkillIndicatorMap,
  WeaponAttackConsumptionContext
} from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const bladesingerSubclassId = "wizard-bladesinger";
export const wizardBladesongActionKey = "wizard-bladesinger-bladesong";
export const wizardBladesongStatusSourceId = "feature-wizard-bladesinger-bladesong";
export const wizardBladesingerSongOfDefenseReactionId = "reaction-wizard-song-of-defense";
export const wizardBladesingerTrainingInWarAndSongSkillOptions: WizardBladesingerTrainingInWarAndSongSkill[] =
  [SKILL.ACROBATICS, SKILL.ATHLETICS, SKILL.PERFORMANCE, SKILL.PERSUASION];

const bladesongName = "Bladesong";
const bladeworkName = "Bladework";
const songOfDefenseName = "Song of Defense";
const trainingInWarAndSongName = "Training in War and Song";
const bladesongDurationRounds = 10;
const bladesongSpeedBonus = 10;
const bladesingerSubclassEntry = getSubclassEntryById(bladesingerSubclassId);
const bladesingerTrainingInWarAndSongSkillOptionSet = new Set(
  wizardBladesingerTrainingInWarAndSongSkillOptions
);
const bladesingerTrainingInWarAndSongWeaponProficiencies: WEAPON_PROFICIENCY[] = [
  WEAPON_PROFICIENCY.MARTIAL_MELEE_NO_HEAVY_OR_TWO_HANDED
];
const bladesongAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: bladesongName
};

function getWizardBladesingerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = bladesingerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

export const wizardBladesingerBladesongDescription = getWizardBladesingerFeatureDescriptionEntries(
  CLASS_FEATURE.BLADESONG
);
const wizardBladesingerBladeworkDescription = wizardBladesingerBladesongDescription.filter(
  (entry) => entry.includes("<strong>Bladework.</strong>")
);
const wizardBladesingerFocusDescription = wizardBladesingerBladesongDescription.filter((entry) =>
  entry.includes("<strong>Focus.</strong>")
);
const wizardBladesingerSongOfDefenseDescription = getWizardBladesingerFeatureDescriptionEntries(
  CLASS_FEATURE.SONG_OF_DEFENSE
);
const wizardBladesingerSongOfVictoryDescription = getWizardBladesingerFeatureDescriptionEntries(
  CLASS_FEATURE.SONG_OF_VICTORY
);
const wizardBladesingerSongOfDefenseReactionEntry: ReactionEntry = {
  id: wizardBladesingerSongOfDefenseReactionId,
  reaction: REACTION.SONG_OF_DEFENSE,
  name: songOfDefenseName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.SONG_OF_DEFENSE,
  sourceLabel: bladesongName,
  description: wizardBladesingerSongOfDefenseDescription
};

function hasWizardBladesongFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === bladesingerSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWizardTrainingInWarAndSongFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasWizardBladesongFeature(character);
}

function hasWizardBladesingerExtraAttackFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === bladesingerSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWizardBladesingerSongOfDefenseFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === bladesingerSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasWizardBladesingerSpellcastWeaponBonusActionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === bladesingerSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getWizardBladesingerAdditionalAttackCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasWizardBladesingerExtraAttackFeature(character) ? 1 : 0;
}

function getWizardBladesongIntelligenceModifier(
  character: Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "className" | "feats" | "level" | "statusEntries"
    >
  >
): number {
  return getAbilityModifierForCharacter(character, "INT");
}

function getWizardBladesongBonusValue(
  character: Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "className" | "feats" | "level" | "statusEntries"
    >
  >
): number {
  return Math.max(1, getWizardBladesongIntelligenceModifier(character));
}

function createSignedFormula(baseFormula: string, modifier: number, spaced: boolean): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return spaced
    ? `${baseFormula} ${modifier >= 0 ? "+" : ""}${modifier}`
    : `${baseFormula}${modifier >= 0 ? "+" : ""}${modifier}`;
}

function stripTrailingModifier(formula: string, modifier: number): string {
  if (modifier === 0) {
    return formula;
  }

  const suffix = `${modifier >= 0 ? "+" : ""}${modifier}`;
  return formula.endsWith(suffix) ? formula.slice(0, -suffix.length) : formula;
}

function getWeaponDamageBonusSum(action: Pick<WeaponAction, "damageBonusEntries">): number {
  return action.damageBonusEntries.reduce((total, entry) => total + (entry.value ?? 0), 0);
}

function clearWizardBladesongStatuses(value: unknown) {
  return normalizeCharacterStatusEntries(value).filter(
    (entry) => entry.sourceId !== wizardBladesongStatusSourceId
  );
}

export function normalizeWizardBladesingerTrainingInWarAndSongSkillSelection(
  value: unknown
): WizardBladesingerTrainingInWarAndSongSkill | undefined {
  return typeof value === "string" &&
    bladesingerTrainingInWarAndSongSkillOptionSet.has(
      value as WizardBladesingerTrainingInWarAndSongSkill
    )
    ? (value as WizardBladesingerTrainingInWarAndSongSkill)
    : undefined;
}

export function normalizeWizardBladesingerFeatureState(
  value: Partial<CharacterWizardFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterWizardFeatureState,
  | "trainingInWarAndSongSkill"
  | "extraAttacksRemainingThisTurn"
  | "bladesingerCantripReplacementUsedThisTurn"
  | "spellcastWeaponBonusActionAvailable"
> {
  const rawExtraAttacksRemaining = Number(value.extraAttacksRemainingThisTurn);
  const additionalAttackCount = getWizardBladesingerAdditionalAttackCount(character);

  return {
    trainingInWarAndSongSkill: hasWizardTrainingInWarAndSongFeature(character)
      ? normalizeWizardBladesingerTrainingInWarAndSongSkillSelection(
          value.trainingInWarAndSongSkill
        )
      : undefined,
    extraAttacksRemainingThisTurn:
      additionalAttackCount > 0 && Number.isFinite(rawExtraAttacksRemaining)
        ? Math.max(0, Math.min(additionalAttackCount, Math.floor(rawExtraAttacksRemaining)))
        : additionalAttackCount > 0
          ? 0
          : undefined,
    bladesingerCantripReplacementUsedThisTurn:
      additionalAttackCount > 0
        ? Boolean(value.bladesingerCantripReplacementUsedThisTurn)
        : undefined,
    spellcastWeaponBonusActionAvailable: hasWizardBladesingerSpellcastWeaponBonusActionFeature(
      character
    )
      ? value.spellcastWeaponBonusActionAvailable === true
      : undefined
  };
}

function getWizardBladesingerFeatureState(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return normalizeWizardBladesingerFeatureState(
    character.classFeatureState?.wizard ?? {},
    character
  );
}

export function getWizardBladesingerTrainingInWarAndSongSkillSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): WizardBladesingerTrainingInWarAndSongSkill | null {
  if (!hasWizardTrainingInWarAndSongFeature(character)) {
    return null;
  }

  return (
    normalizeWizardBladesingerTrainingInWarAndSongSkillSelection(
      character.classFeatureState?.wizard?.trainingInWarAndSongSkill
    ) ?? null
  );
}

export function setWizardBladesingerTrainingInWarAndSongSkillSelection(
  character: Character,
  selection: WizardBladesingerTrainingInWarAndSongSkill | null
): Character {
  if (!hasWizardTrainingInWarAndSongFeature(character)) {
    return character;
  }

  const normalizedSelection =
    selection === null
      ? undefined
      : normalizeWizardBladesingerTrainingInWarAndSongSkillSelection(selection);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...character.classFeatureState?.wizard,
        trainingInWarAndSongSkill: normalizedSelection
      }
    }
  };
}

function getWizardBladesingerTrainingInWarAndSongWeaponProficiencyEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): FeatureWeaponProficiencyEntry[] {
  if (!hasWizardTrainingInWarAndSongFeature(character)) {
    return [];
  }

  return bladesingerTrainingInWarAndSongWeaponProficiencies.map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: trainingInWarAndSongName,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

function getWizardBladesingerTrainingInWarAndSongSkillProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): FeatureSkillProficiencyEntry[] {
  const selection = getWizardBladesingerTrainingInWarAndSongSkillSelection(character);

  if (selection === null) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: trainingInWarAndSongName,
      proficiency: getSkillProficiencyForSkillName(selection)!,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies SkillProficiencyEntry
  ];
}

function isWizardBladesingerActionCantrip(
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return spell.spellLevel === 0 && spell.castingTime.includes(ACTION_TYPE.ACTION);
}

export function getWizardBladesingerWeaponAttackMultiCount(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  return getWizardBladesingerFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function canUseWizardBladesingerActionCantripReplacement(
  character: Pick<Character, "className" | "roundTracker"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  if (
    !hasWizardBladesingerExtraAttackFeature(character) ||
    !isWizardBladesingerActionCantrip(spell)
  ) {
    return false;
  }

  const wizardState = getWizardBladesingerFeatureState(character);

  if (wizardState.bladesingerCantripReplacementUsedThisTurn) {
    return false;
  }

  return (
    isRoundTrackerResourceAvailable(character.roundTracker, "action") ||
    (wizardState.extraAttacksRemainingThisTurn ?? 0) > 0
  );
}

export function hasWizardBladesingerSpellcastWeaponBonusActionAvailable(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): boolean {
  return (
    hasWizardBladesingerSpellcastWeaponBonusActionFeature(character) &&
    getWizardBladesingerFeatureState(character).spellcastWeaponBonusActionAvailable === true
  );
}

function canGainWizardBladesingerSpellcastWeaponBonusActionFromSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return (
    hasWizardBladesingerSpellcastWeaponBonusActionFeature(character) &&
    spell.spellLevel > 0 &&
    spell.castingTime.includes(ACTION_TYPE.ACTION)
  );
}

export function applyWizardBladesingerFeaturesAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): Character {
  if (!canGainWizardBladesingerSpellcastWeaponBonusActionFromSpell(character, spell)) {
    return character;
  }

  const wizardState = getWizardBladesingerFeatureState(character);

  if (wizardState.spellcastWeaponBonusActionAvailable === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...character.classFeatureState?.wizard,
        spellcastWeaponBonusActionAvailable: true
      }
    }
  };
}

export function consumeWizardBladesingerWeaponAttack(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  if (!hasWizardBladesingerExtraAttackFeature(character)) {
    return character;
  }

  const additionalAttackCount = getWizardBladesingerAdditionalAttackCount(character);
  const wizardState = getWizardBladesingerFeatureState(character);
  const rawWizardState = character.classFeatureState?.wizard ?? {};
  const extraAttacksRemaining = wizardState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");
  const canUseSpellcastWeaponBonusAction =
    action.attackKind === "weapon" &&
    wizardState.spellcastWeaponBonusActionAvailable === true &&
    isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction");

  if (action.economyType === ECONOMY_TYPE.BONUS_ACTION) {
    if (!canUseSpellcastWeaponBonusAction) {
      return character;
    }

    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "bonusAction"),
      classFeatureState: {
        ...character.classFeatureState,
        wizard: {
          ...rawWizardState,
          spellcastWeaponBonusActionAvailable: false
        }
      }
    };
  }

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        wizard: {
          ...rawWizardState,
          extraAttacksRemainingThisTurn: additionalAttackCount
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...rawWizardState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function consumeWizardBladesingerActionCantrip(character: Character): Character {
  if (!hasWizardBladesingerExtraAttackFeature(character)) {
    return character;
  }

  const additionalAttackCount = getWizardBladesingerAdditionalAttackCount(character);
  const wizardState = getWizardBladesingerFeatureState(character);
  const rawWizardState = character.classFeatureState?.wizard ?? {};

  if (wizardState.bladesingerCantripReplacementUsedThisTurn) {
    return character;
  }

  const extraAttacksRemaining = wizardState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        wizard: {
          ...rawWizardState,
          extraAttacksRemainingThisTurn: additionalAttackCount,
          bladesingerCantripReplacementUsedThisTurn: true
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...rawWizardState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1,
        bladesingerCantripReplacementUsedThisTurn: true
      }
    }
  };
}

export function advanceWizardBladesingerFeaturesForNewRound(character: Character): Character {
  if (!hasWizardBladesingerExtraAttackFeature(character)) {
    return character;
  }

  const wizardState = getWizardBladesingerFeatureState(character);

  if (
    (wizardState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    wizardState.bladesingerCantripReplacementUsedThisTurn !== true &&
    wizardState.spellcastWeaponBonusActionAvailable !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...character.classFeatureState?.wizard,
        extraAttacksRemainingThisTurn: 0,
        bladesingerCantripReplacementUsedThisTurn: false,
        spellcastWeaponBonusActionAvailable: false
      }
    }
  };
}

export function hasActiveWizardBladesong(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasWizardBladesongFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === bladesongName &&
      entry.sourceId === wizardBladesongStatusSourceId
  );
}

export function getWizardBladesongUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return hasWizardBladesongFeature(character) ? getWizardBladesongBonusValue(character) : 0;
}

export function getWizardBladesongUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  const usesTotal = getWizardBladesongUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  return Math.max(0, usesTotal - (character.classFeatureState?.wizard?.bladesongUsesExpended ?? 0));
}

export function getWizardBladesingerBladeworkWeaponActionDescriptionAdditions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>,
  action: Pick<WeaponAction, "attackKind" | "proficiencyBonus">
): SpellDescriptionEntry[][] {
  if (
    action.attackKind !== "weapon" ||
    action.proficiencyBonus <= 0 ||
    !hasActiveWizardBladesong(character) ||
    wizardBladesingerBladeworkDescription.length <= 0
  ) {
    return [];
  }

  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.BLADESONG,
      wizardBladesingerBladeworkDescription,
      bladesongName
    )
  ];
}

export function getWizardBladesingerFocusSavingThrowDescriptionAdditions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (
    ability !== "CON" ||
    !hasActiveWizardBladesong(character) ||
    wizardBladesingerFocusDescription.length <= 0
  ) {
    return [];
  }

  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.BLADESONG,
      wizardBladesingerFocusDescription,
      bladesongName
    )
  ];
}

export function getWizardBladesingerSongOfVictoryWeaponActionDescriptionAdditions(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  action: Pick<WeaponAction, "attackKind">
): SpellDescriptionEntry[][] {
  if (
    action.attackKind !== "weapon" ||
    !hasWizardBladesingerSpellcastWeaponBonusActionFeature(character) ||
    wizardBladesingerSongOfVictoryDescription.length <= 0
  ) {
    return [];
  }

  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.SONG_OF_VICTORY,
      wizardBladesingerSongOfVictoryDescription,
      "Song of Victory"
    )
  ];
}

export function getWizardBladesongFeatureAction(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
    >
): FeatureActionCard | null {
  if (!hasWizardBladesongFeature(character)) {
    return null;
  }

  const usesTotal = getWizardBladesongUsesTotal(character);
  const usesRemaining = getWizardBladesongUsesRemaining(character);
  const isActive = hasActiveWizardBladesong(character);
  const disabledReason = isActive
    ? "Bladesong is already active."
    : usesRemaining <= 0
      ? "Bladesong recharges on a Long Rest, and you regain one use when you use Arcane Recovery."
      : undefined;

  return {
    key: wizardBladesongActionKey,
    name: bladesongName,
    summary: "Enter your Bladesong for 10 turns.",
    detail:
      "Gain AC, speed, Acrobatics, and weapon attack benefits while your Bladesong trait is active.",
    breakdown: "Start 10-turn song",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    isActive,
    description:
      wizardBladesingerBladesongDescription.length > 0
        ? wizardBladesingerBladesongDescription
        : undefined,
    drawer: {
      kind: "confirm",
      eyebrow: "Bladesinger"
    },
    execute: {
      kind: "activate"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function activateWizardBladesong(character: Character): Character {
  if (!hasWizardBladesongFeature(character) || hasActiveWizardBladesong(character)) {
    return character;
  }

  const usesRemaining = getWizardBladesongUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const wizardState = character.classFeatureState?.wizard ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        bladesongUsesExpended: (wizardState.bladesongUsesExpended ?? 0) + 1
      }
    },
    statusEntries: [
      ...clearWizardBladesongStatuses(character.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: bladesongName,
        source: bladesongName,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: bladesongDurationRounds,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: wizardBladesongStatusSourceId
      })
    ]
  };
}

export function restoreWizardBladesongOnLongRest(character: Character): Character {
  if (!hasWizardBladesongFeature(character)) {
    return character;
  }

  const wizardState = character.classFeatureState?.wizard ?? {};

  if ((wizardState.bladesongUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        bladesongUsesExpended: 0
      }
    }
  };
}

export function restoreWizardBladesongUseOnArcaneRecovery(character: Character): Character {
  if (!hasWizardBladesongFeature(character)) {
    return character;
  }

  const wizardState = character.classFeatureState?.wizard ?? {};
  const expendedUses = wizardState.bladesongUsesExpended ?? 0;

  if (expendedUses <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        bladesongUsesExpended: expendedUses - 1
      }
    }
  };
}

function getWizardBladesongArmorClassBonuses(
  character: Partial<Pick<Character, "abilities">>
): FeatureArmorClassBonus[] {
  return [
    {
      label: bladesongName,
      value: getWizardBladesongBonusValue(character)
    }
  ];
}

function getWizardBladesongSpeedBonuses(): FeatureSpeedBonus[] {
  return [
    {
      label: bladesongName,
      value: bladesongSpeedBonus,
      movementType: "walk"
    }
  ];
}

function getWizardBladesongSkillIndicators(): SkillIndicatorMap {
  return {
    [SKILL.ACROBATICS]: [bladesongAdvantageIndicator]
  };
}

function transformWizardBladesongWeaponAction(
  character: Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "className" | "feats" | "level" | "statusEntries"
    >
  >,
  action: WeaponAction
): WeaponAction {
  if (action.attackKind !== "weapon" || action.proficiencyBonus <= 0) {
    return action;
  }

  const intelligenceModifierBreakdown = getAbilityModifierBreakdownForCharacter(character, "INT");
  const intelligenceModifier = intelligenceModifierBreakdown.total;
  const currentDamageModifier = action.damageAbilityModifier ?? action.abilityModifier;

  if (
    intelligenceModifier <= action.abilityModifier &&
    intelligenceModifier <= currentDamageModifier
  ) {
    return action;
  }

  const damageBonusTotal = getWeaponDamageBonusSum(action);
  const nextTotalModifier = intelligenceModifier + damageBonusTotal;
  const rollFormulaBase = stripTrailingModifier(action.rollFormula, action.totalModifier);

  return appendWeaponActionCardBonusLabel(
    {
      ...action,
      ability: "INT" as const,
      abilityFormulaLabel: "INT (Bladework)",
      abilityModifierBaseValue: intelligenceModifierBreakdown.baseValue,
      abilityModifier: intelligenceModifier,
      abilityModifierBonusEntries: intelligenceModifierBreakdown.bonusEntries,
      damageAbility: "INT" as const,
      damageAbilityFormulaLabel: "INT (Bladework)",
      damageAbilityModifierBaseValue: intelligenceModifierBreakdown.baseValue,
      damageAbilityModifier: intelligenceModifier,
      damageAbilityModifierBonusEntries: intelligenceModifierBreakdown.bonusEntries,
      totalModifier: nextTotalModifier,
      rollDisplay: createSignedFormula(action.damageFormula, nextTotalModifier, true),
      rollFormulaDisplay: createSignedFormula(action.damageFormula, nextTotalModifier, false),
      rollFormula: createSignedFormula(rollFormulaBase, nextTotalModifier, false)
    },
    bladeworkName
  );
}

export const getWizardBladesingerDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  const bladesongAction = getWizardBladesongFeatureAction(character);
  const bladesongActive = hasActiveWizardBladesong(character);

  return {
    featureActions: bladesongAction ? [bladesongAction] : [],
    reactionEntries: hasWizardBladesingerSongOfDefenseFeature(character)
      ? [wizardBladesingerSongOfDefenseReactionEntry]
      : [],
    weaponProficiencyEntries:
      getWizardBladesingerTrainingInWarAndSongWeaponProficiencyEntries(character),
    skillProficiencyEntries:
      getWizardBladesingerTrainingInWarAndSongSkillProficiencyEntries(character),
    getArmorClassBonuses: bladesongActive
      ? () => getWizardBladesongArmorClassBonuses(character)
      : undefined,
    speedBonuses: bladesongActive ? getWizardBladesongSpeedBonuses() : [],
    skillIndicators: bladesongActive ? getWizardBladesongSkillIndicators() : {},
    transformWeaponAction: bladesongActive
      ? (action) => transformWizardBladesongWeaponAction(character, action)
      : undefined
  };
};
