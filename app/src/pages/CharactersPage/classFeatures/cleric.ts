import { clericFeatures, getSpellEntriesForClassName } from "../../../codex/classes";
import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  DICE,
  getDivinityEntryById,
  getResolvedDivinityValue,
  type DivinityEntry,
  type DivinityValue,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../codex/entries";
import { getSpellEntryById } from "../../../codex/selectors";
import type { ClericFeatureClassObj } from "../../../types";
import type {
  AbilityKey,
  Character,
  ClericBlessedStrikesChoice,
  CharacterClericFeatureState,
  ClericDivineOrderChoice
} from "../../../types";
import {
  ARMOR_PROFICIENCY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  SKILL_PROFICIENCY,
  WEAPON_PROFICIENCY,
  type ArmorProficiencyEntry,
  type SkillName,
  type WeaponProficiencyEntry
} from "../../../types";
import { formatDivinityValue, formatDivinityValueFormula } from "../../../utils/codex";
import { getFeatAbilityScoreBonusesForCharacter } from "../feats";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type {
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureArmorProficiencyEntry,
  FeatureDamageBonus,
  FeatureWeaponProficiencyEntry,
  FeatureSkillBonus,
  WeaponFeatureContext
} from "./types";

const divineOrderProtectorSource = "Divine Order";
const blessedStrikesSource = "Blessed Strikes";
const channelDivinityActionKey = "cleric-channel-divinity";
export const divineInterventionActionKey = "cleric-divine-intervention";
const greaterDivineInterventionWishSpellId = "spell-wish";

function getClericFeatureRow(level: number): ClericFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = clericFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedClericFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return clericFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasClericFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Cleric") {
    return false;
  }

  return getUnlockedClericFeatures(character.level).has(feature);
}

function getAppliedAbilityScoreBonus(
  currentScore: number,
  value: number,
  maxScore?: number | null
): number {
  const normalizedValue = Math.floor(value);

  if (!Number.isFinite(normalizedValue) || normalizedValue === 0) {
    return 0;
  }

  if (maxScore === null || maxScore === undefined) {
    return normalizedValue;
  }

  if (normalizedValue > 0) {
    return Math.max(0, Math.min(normalizedValue, maxScore - currentScore));
  }

  return normalizedValue;
}

function getFeatAdjustedAbilityScore(
  character: Pick<Character, "abilities" | "level" | "feats">,
  ability: AbilityKey
): number {
  let total = Math.max(1, Math.floor(character.abilities[ability]));

  getFeatAbilityScoreBonusesForCharacter(character)
    .filter((bonus) => bonus.ability === ability)
    .sort((left, right) => {
      const leftHasCap = left.maxScore !== null && left.maxScore !== undefined;
      const rightHasCap = right.maxScore !== null && right.maxScore !== undefined;

      if (leftHasCap !== rightHasCap) {
        return leftHasCap ? -1 : 1;
      }

      if (leftHasCap && rightHasCap && left.maxScore !== right.maxScore) {
        return (
          (left.maxScore ?? Number.POSITIVE_INFINITY) - (right.maxScore ?? Number.POSITIVE_INFINITY)
        );
      }

      return (left.order ?? 0) - (right.order ?? 0);
    })
    .forEach((bonus) => {
      total += getAppliedAbilityScoreBonus(total, bonus.value, bonus.maxScore);
    });

  return total;
}

function getClericWisdomModifier(
  character: Pick<Character, "abilities" | "level" | "feats">
): number {
  return Math.floor((getFeatAdjustedAbilityScore(character, "WIS") - 10) / 2);
}

function getClericProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function getClericSpellSaveDc(character: Pick<Character, "level" | "abilities" | "feats">): number {
  return 8 + getClericProficiencyBonus(character.level) + getClericWisdomModifier(character);
}

function formatAbilityContribution(value: number, ability: AbilityKey): string {
  return `${value >= 0 ? "+" : "-"} ${Math.abs(value)} ${ability}`;
}

function hasClericSearUndead(character: Pick<Character, "className" | "level">): boolean {
  return hasClericFeature(character, CLASS_FEATURE.SEAR_UNDEAD);
}

function hasClericGreaterDivineIntervention(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasClericFeature(character, CLASS_FEATURE.GREATER_DIVINE_INTERVENTION);
}

export function hasClericDivineInterventionFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION);
}

function getDivinityDescriptionLine(
  entry: ReturnType<typeof getDivinityEntryById>,
  index: number
): string {
  const line = entry?.description[index];
  return typeof line === "string" ? line : "";
}

export function getClericResolvedDivinityDisplay(
  character: Pick<Character, "className" | "level" | "abilities" | "feats">,
  divinity: DivinityEntry
): {
  damage: DivinityValue | null;
  healing: DivinityValue | null;
  description: SpellDescriptionEntry[];
} {
  const baseDamage = getResolvedDivinityValue(divinity, "damage", character.level);
  const baseHealing = getResolvedDivinityValue(divinity, "healing", character.level);

  if (divinity.id !== "divinity-turn-undead" || !hasClericSearUndead(character)) {
    return {
      damage: baseDamage,
      healing: baseHealing,
      description: divinity.description
    };
  }

  const wisdomModifier = getClericWisdomModifier(character);
  const searUndeadDamage: DivinityValue = {
    amounts: Array.from({ length: Math.max(1, wisdomModifier) }, () => DICE.D8),
    damageTypes: [DAMAGE_TYPE.RADIANT]
  };

  return {
    damage: searUndeadDamage,
    healing: null,
    description: [
      ...divinity.description,
      "Whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier, minimum of 1d8, and add the rolls together.",
      "Each Undead that fails its saving throw against that use of Turn Undead takes Radiant damage equal to the roll's total. This damage doesn't end the turn effect."
    ]
  };
}

export function normalizeClericFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterClericFeatureState {
  const hasDivineOrder = hasClericFeature(character, CLASS_FEATURE.DIVINE_ORDER);
  const hasBlessedStrikes = hasClericFeature(character, CLASS_FEATURE.BLESSED_STRIKES);
  const hasChannelDivinity = hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY);
  const hasDivineIntervention = hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION);

  if (!hasDivineOrder && !hasBlessedStrikes && !hasChannelDivinity && !hasDivineIntervention) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClericFeatureState>) : {};
  const channelDivinityTotal = hasChannelDivinity
    ? (getClericFeatureRow(character.level)?.channelDivinity ?? 0)
    : 0;

  return {
    divineOrderChoice:
      hasDivineOrder &&
      (record.divineOrderChoice === "protector" || record.divineOrderChoice === "thaumaturge")
        ? record.divineOrderChoice
        : hasDivineOrder
          ? "protector"
          : undefined,
    blessedStrikesChoice:
      hasBlessedStrikes &&
      (record.blessedStrikesChoice === "blessed-strike" ||
        record.blessedStrikesChoice === "potent-spellcasting")
        ? record.blessedStrikesChoice
        : undefined,
    blessedStrikeUsedThisTurn: hasBlessedStrikes
      ? Boolean(record.blessedStrikeUsedThisTurn)
      : undefined,
    channelDivinityUsesExpended: hasChannelDivinity
      ? Math.max(
          0,
          Math.min(
            channelDivinityTotal,
            Number.isFinite(Number(record.channelDivinityUsesExpended))
              ? Math.floor(Number(record.channelDivinityUsesExpended))
              : 0
          )
        )
      : undefined,
    divineInterventionUsed: hasDivineIntervention
      ? Boolean(record.divineInterventionUsed)
      : undefined
  };
}

export function getClericDivineOrderChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): ClericDivineOrderChoice | null {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_ORDER)) {
    return null;
  }

  return (
    normalizeClericFeatureState(character.classFeatureState?.cleric, character).divineOrderChoice ??
    "protector"
  );
}

export function setClericDivineOrderChoice(
  character: Character,
  divineOrderChoice: ClericDivineOrderChoice
): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_ORDER)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...normalizeClericFeatureState(character.classFeatureState?.cleric, character),
        divineOrderChoice
      }
    }
  };
}

export function getClericBlessedStrikesChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): ClericBlessedStrikesChoice | null {
  if (!hasClericFeature(character, CLASS_FEATURE.BLESSED_STRIKES)) {
    return null;
  }

  return (
    normalizeClericFeatureState(character.classFeatureState?.cleric, character)
      .blessedStrikesChoice ?? null
  );
}

export function setClericBlessedStrikesChoice(
  character: Character,
  blessedStrikesChoice: ClericBlessedStrikesChoice
): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.BLESSED_STRIKES)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...normalizeClericFeatureState(character.classFeatureState?.cleric, character),
        blessedStrikesChoice,
        blessedStrikeUsedThisTurn: false
      }
    }
  };
}

export function markClericBlessedStrikeUsed(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.BLESSED_STRIKES)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  if (
    getClericBlessedStrikesChoice(character) !== "blessed-strike" ||
    clericState.blessedStrikeUsedThisTurn
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        blessedStrikeUsedThisTurn: true
      }
    }
  };
}

export function advanceClericFeaturesForNewRound(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.BLESSED_STRIKES)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  if (!clericState.blessedStrikeUsedThisTurn) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        blessedStrikeUsedThisTurn: false
      }
    }
  };
}

export function getClericCantripBonus(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getClericDivineOrderChoice(character) === "thaumaturge" ? 1 : 0;
}

export function getClericCantripDamageBonus(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">
): number {
  if (getClericBlessedStrikesChoice(character) !== "potent-spellcasting") {
    return 0;
  }

  return getClericWisdomModifier(character);
}

export function getClericSkillBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  skill: SkillName
): FeatureSkillBonus[] {
  if (getClericDivineOrderChoice(character) !== "thaumaturge") {
    return [];
  }

  if (skill !== SKILL.ARCANA && skill !== SKILL.RELIGION) {
    return [];
  }

  return [
    {
      label: "WIS (Divine Order)",
      abilityModifierSource: "WIS",
      minimumValue: 1
    }
  ];
}

export function getClericWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  if (getClericDivineOrderChoice(character) !== "protector") {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: divineOrderProtectorSource,
      proficiency: WEAPON_PROFICIENCY.MARTIAL,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies WeaponProficiencyEntry
  ];
}

export function getClericArmorProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureArmorProficiencyEntry[] {
  if (getClericDivineOrderChoice(character) !== "protector") {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: divineOrderProtectorSource,
      proficiency: ARMOR_PROFICIENCY.HEAVY,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies ArmorProficiencyEntry
  ];
}

export function getClericCantripCountForLevel(level: number): number | null {
  const cantripCount = getClericFeatureRow(level)?.cantrips;
  return typeof cantripCount === "number" ? Math.max(0, Math.floor(cantripCount)) : null;
}

export function hasClericSpellcastingFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasClericFeature(character, CLASS_FEATURE.SPELLCASTING);
}

export function getClericChannelDivinityUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return 0;
  }

  return getClericFeatureRow(character.level)?.channelDivinity ?? 0;
}

export function getClericChannelDivinityUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getClericChannelDivinityUsesTotal(character);
  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);
  const usesExpended = clericState.channelDivinityUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getClericDivineInterventionUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)) {
    return 0;
  }

  return normalizeClericFeatureState(character.classFeatureState?.cleric, character)
    .divineInterventionUsed
    ? 0
    : 1;
}

export function getClericDivineInterventionEnabledLevels(
  character: Pick<Character, "className" | "level">
): number[] {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)) {
    return [];
  }

  return hasClericGreaterDivineIntervention(character) ? [1, 2, 3, 4, 5, 9] : [1, 2, 3, 4, 5];
}

export function getClericDivineInterventionSpellEntries(
  character: Pick<Character, "className" | "level">
): SpellEntry[] {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)) {
    return [];
  }

  const clericSpellEntries = getSpellEntriesForClassName("Cleric").filter(
    (spell) => spell.spellLevel >= 1 && spell.spellLevel <= 5
  );

  if (!hasClericGreaterDivineIntervention(character)) {
    return clericSpellEntries;
  }

  const wishSpell = getSpellEntryById(greaterDivineInterventionWishSpellId);

  if (!wishSpell) {
    return clericSpellEntries;
  }

  return [...clericSpellEntries, wishSpell].sort((left, right) => {
    if (left.spellLevel !== right.spellLevel) {
      return left.spellLevel - right.spellLevel;
    }

    return left.name.localeCompare(right.name);
  });
}

function getClericChannelDivinityAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return null;
  }

  const totalUses = getClericChannelDivinityUsesTotal(character);
  const usesRemaining = getClericChannelDivinityUsesRemaining(character);

  return {
    key: channelDivinityActionKey,
    name: "Channel Divinity",
    summary: "Choose a divine effect.",
    detail:
      "Use a Magic action to invoke Divine Spark or Turn Undead. Divine Spark scales at Cleric levels 7, 13, and 18.",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    interaction: "select",
    usesLabel: `${usesRemaining}/${totalUses} uses`,
    usesRemaining,
    usesTotal: totalUses,
    drawer: {
      kind: "options",
      eyebrow: "Cleric",
      optionSelection: "single-immediate"
    },
    execute: {
      kind: "option",
      label: "Use Channel Divinity"
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
  };
}

function getClericDivineInterventionAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)) {
    return null;
  }

  const usesRemaining = getClericDivineInterventionUsesRemaining(character);

  return {
    key: divineInterventionActionKey,
    name: "Divine Intervention",
    summary: "Cast a spell without restrictions",
    detail: hasClericGreaterDivineIntervention(character)
      ? "Choose any Cleric spell of level 5 or lower, or Wish, that doesn't require a Reaction to cast."
      : "Choose any Cleric spell of level 5 or lower that doesn't require a Reaction to cast.",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    interaction: "select",
    usesLabel: `${usesRemaining}/1 use`,
    usesRemaining,
    usesTotal: 1,
    drawer: {
      kind: "spell-list",
      eyebrow: "Cleric"
    },
    execute: {
      kind: "spell",
      spellSource: "divine-intervention",
      effectKind: "divine-intervention",
      label: "Open Spell"
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Divine Intervention uses remaining." : undefined
  };
}

export function getClericFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  return [
    getClericChannelDivinityAction(character),
    getClericDivineInterventionAction(character)
  ].filter((entry): entry is FeatureActionCard => entry !== null);
}

export function getClericWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  if (
    !hasClericFeature(character, CLASS_FEATURE.BLESSED_STRIKES) ||
    getClericBlessedStrikesChoice(character) !== "blessed-strike" ||
    clericState.blessedStrikeUsedThisTurn ||
    context.attackKind !== "weapon"
  ) {
    return [];
  }

  const blessedStrikeFormula = hasClericFeature(character, CLASS_FEATURE.IMPROVED_BLESSED_STRIKES)
    ? "2d8"
    : "1d8";

  return [
    {
      label: blessedStrikesSource,
      formula: blessedStrikeFormula,
      displayLabel: `${blessedStrikeFormula} Necrotic/Radiant`
    }
  ];
}

export function getClericFeatureActionOptions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">
): FeatureActionOptionCard[] {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return [];
  }

  const divineSparkEntry = getDivinityEntryById("divinity-divine-spark");
  const turnUndeadEntry = getDivinityEntryById("divinity-turn-undead");

  if (!divineSparkEntry || !turnUndeadEntry) {
    return [];
  }

  const wisdomModifier = getClericWisdomModifier(character);
  const spellSaveDc = getClericSpellSaveDc(character);
  const divineSparkDamage = getResolvedDivinityValue(divineSparkEntry, "damage", character.level);
  const divineSparkHealing = getResolvedDivinityValue(divineSparkEntry, "healing", character.level);

  if (!divineSparkDamage || !divineSparkHealing) {
    return [];
  }

  const divineSparkDiceLabel = formatDivinityValueFormula(divineSparkDamage);
  const divineSparkDamageLabel = formatDivinityValue(divineSparkDamage);
  const divineSparkHealingLabel = formatDivinityValue(divineSparkHealing);
  const wisdomContribution = formatAbilityContribution(wisdomModifier, "WIS");
  const damageFormulaDisplay = `${divineSparkDamageLabel} ${wisdomModifier >= 0 ? "+" : "-"} ${Math.abs(wisdomModifier)} WIS`;
  const healingFormulaDisplay = `${divineSparkHealingLabel} ${wisdomModifier >= 0 ? "+" : "-"} ${Math.abs(wisdomModifier)} WIS`;
  const searUndeadDiceCount = Math.max(1, wisdomModifier);
  const searUndeadValue = {
    amounts: Array.from({ length: searUndeadDiceCount }, () => DICE.D8),
    damageTypes: [DAMAGE_TYPE.RADIANT]
  };
  const searUndeadFormula = formatDivinityValueFormula(searUndeadValue);
  const searUndeadFormulaDisplay = formatDivinityValue(searUndeadValue);
  const turnUndeadBreakdown = hasClericSearUndead(character)
    ? `WIS save DC ${spellSaveDc} | Radiant | Sear Undead`
    : `WIS save DC ${spellSaveDc} | 30 ft`;

  return [
    {
      key: "divine-spark-heal",
      name: `${divineSparkEntry.name} (Heal)`,
      summary: "Healing",
      detail:
        getDivinityDescriptionLine(divineSparkEntry, 1) ||
        getDivinityDescriptionLine(divineSparkEntry, 0),
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      resultLabel: "Heal",
      breakdown: `${wisdomContribution} | Channel Divinity`,
      rollFormula: `${divineSparkDiceLabel}${wisdomModifier >= 0 ? "+" : ""}${wisdomModifier}`,
      rollFormulaDisplay: healingFormulaDisplay,
      rollDescription: `${wisdomContribution} | Channel Divinity | Healing`
    },
    {
      key: "divine-spark-damage",
      name: `${divineSparkEntry.name} (Damage)`,
      summary: "Damage",
      detail:
        getDivinityDescriptionLine(divineSparkEntry, 2) ||
        getDivinityDescriptionLine(divineSparkEntry, 0),
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      resultLabel: "Damage",
      rangeResultLabel: "Necrotic/Radiant Damage",
      breakdown: `${wisdomContribution} | CON save DC ${spellSaveDc} | Half on success`,
      rollFormula: `${divineSparkDiceLabel}${wisdomModifier >= 0 ? "+" : ""}${wisdomModifier}`,
      rollFormulaDisplay: damageFormulaDisplay,
      rollDescription: `${wisdomContribution} | Constitution save DC ${spellSaveDc} | Necrotic/Radiant`
    },
    {
      key: "turn-undead",
      name: turnUndeadEntry.name,
      summary: hasClericSearUndead(character) ? "Damage" : "Specified Effect",
      detail:
        getDivinityDescriptionLine(turnUndeadEntry, 2) ||
        getDivinityDescriptionLine(turnUndeadEntry, 0),
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      resultLabel: hasClericSearUndead(character) ? "Damage" : undefined,
      rangeResultLabel: hasClericSearUndead(character) ? "Radiant Damage" : undefined,
      breakdown: turnUndeadBreakdown,
      rollFormula: hasClericSearUndead(character) ? searUndeadFormula : undefined,
      rollFormulaDisplay: hasClericSearUndead(character) ? searUndeadFormulaDisplay : undefined,
      rollDescription: hasClericSearUndead(character)
        ? `${wisdomContribution} | Wisdom modifier d8s (minimum 1d8) | Radiant | Sear Undead`
        : undefined
    }
  ];
}

export function activateClericFeatureActionOption(
  character: Character,
  optionKey: string
): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  if (!["divine-spark-heal", "divine-spark-damage", "turn-undead"].includes(optionKey)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);
  const totalUses = getClericChannelDivinityUsesTotal(character);
  const usesExpended = clericState.channelDivinityUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        channelDivinityUsesExpended: usesExpended + 1
      }
    }
  };
}

export function activateClericDivineIntervention(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  if (clericState.divineInterventionUsed) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        divineInterventionUsed: true
      }
    }
  };
}

export function applyShortRestToClericFeatures(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  return restoreClericChannelDivinityOnShortRest(character);
}

export function restoreClericChannelDivinityOnShortRest(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        blessedStrikeUsedThisTurn: false,
        channelDivinityUsesExpended: Math.max(0, (clericState.channelDivinityUsesExpended ?? 0) - 1)
      }
    }
  };
}

export function applyLongRestToClericFeatures(character: Character): Character {
  return restoreClericDivineInterventionOnLongRest(
    restoreClericChannelDivinityOnLongRest(character)
  );
}

export function restoreClericChannelDivinityOnLongRest(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        blessedStrikeUsedThisTurn: false,
        channelDivinityUsesExpended: 0
      }
    }
  };
}

export function restoreClericDivineInterventionOnLongRest(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)) {
    return character;
  }

  const clericState = normalizeClericFeatureState(character.classFeatureState?.cleric, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        divineInterventionUsed: false
      }
    }
  };
}

export const clericDivineOrderSkillKeywords = new Set<SKILL_PROFICIENCY>([
  SKILL_PROFICIENCY.ARCANA,
  SKILL_PROFICIENCY.RELIGION
]);
