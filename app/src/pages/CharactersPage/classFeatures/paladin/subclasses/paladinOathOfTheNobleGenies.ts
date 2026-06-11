import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type {
  Character,
  CharacterPaladinFeatureState,
  SkillName,
  SkillProficiencyEntry
} from "../../../../../types";
import {
  CONDITION_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  getSkillProficiencyForSkillName,
  isSkillName
} from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import {
  paladinChannelDivinityActionKey,
  paladinChannelDivinityOptionKeys
} from "../../channelDivinity";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus
} from "../../types";
import {
  getPaladinChannelDivinityUsesRemaining,
  hasActivePaladinAuraOfProtection,
  hasPaladinFeature
} from "../paladin";

export const oathOfTheNobleGeniesSubclassId = "paladin-oath-of-the-noble-genies";
export const paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions = [
  SKILL.ACROBATICS,
  SKILL.INTIMIDATION,
  SKILL.PERFORMANCE,
  SKILL.PERSUASION
] as const satisfies readonly SkillName[];
export const paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId =
  "feature-paladin-oath-of-the-noble-genies-aura-of-elemental-shielding";
export const paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions = [
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.THUNDER
] as const satisfies readonly DAMAGE_TYPE[];
export const elementalRebukeReactionId = "reaction-paladin-elemental-rebuke";
export const minorWishReactionId = "reaction-paladin-minor-wish";
export const nobleScionActionKey = "paladin-noble-scion";
export const paladinOathOfTheNobleGeniesNobleScionStatusSourceId =
  "feature-paladin-oath-of-the-noble-genies-noble-scion";
export const paladinOathOfTheNobleGeniesMinorWishStatusSourceId =
  "feature-paladin-oath-of-the-noble-genies-minor-wish";

const oathOfTheNobleGeniesSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Chromatic Orb", "Elementalism", "Thunderous Smite"]),
  5: resolveSpellIdsByName(["Mirror Image", "Phantasmal Force"]),
  9: resolveSpellIdsByName(["Fly", "Gaseous Form"]),
  13: resolveSpellIdsByName(["Conjure Minor Elementals", "Summon Elemental"]),
  17: resolveSpellIdsByName(["Banishing Smite", "Contact Other Plane"])
} as const;
const divineSmiteSpellId = "spell-divine-smite";
const geniesSplendorSource = "Genie's Splendor";
const elementalSmiteSource = "Elemental Smite";
const elementalSmiteDjinnisEscapeName = "Djinni's Escape";
const elementalSmiteDjinnisEscapeStatusSourceId =
  "feature-paladin-oath-of-the-noble-genies-elemental-smite-djinnis-escape";
const elementalSmiteDjinnisEscapeDurationRounds = 2;
const elementalSmiteEfreetisFuryBonusDamageDetail = "2d4 Fire";
const auraOfElementalShieldingName = "Aura of Elemental Shielding";
const elementalRebukeName = "Elemental Rebuke";
const nobleScionName = "Noble Scion";
const minorWishName = "Minor Wish";
const oathOfTheNobleGeniesSubclassEntry = getSubclassEntryById(oathOfTheNobleGeniesSubclassId);
const defaultAuraOfElementalShieldingDamageType = DAMAGE_TYPE.ACID;
const nobleScionUsesTotal = 1;
const nobleScionFallbackSpellSlotLevel = 5;
const minorWishDescription = [
  "When you or an ally in your Aura of Protection fails a D20 Test, you can take a Reaction to make the D20 Test succeed instead."
] as const;

function stripElementalSmiteOptionLabel(
  label: string,
  entry: SpellDescriptionEntry | undefined
): SpellDescriptionEntry | null {
  if (!entry) {
    return null;
  }

  if (typeof entry !== "string") {
    return entry;
  }

  const prefix = `<strong>${label}.</strong> `;

  return entry.startsWith(prefix) ? entry.slice(prefix.length) : entry;
}

type PaladinOathOfTheNobleGeniesCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "classFeatureState"
      | "level"
      | "spellSlotsExpended"
      | "statusEntries"
      | "subclassId"
    >
  >;

function getOathOfTheNobleGeniesFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = oathOfTheNobleGeniesSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const elementalSmiteDescription = getOathOfTheNobleGeniesFeatureDescriptionEntries(
  CLASS_FEATURE.ELEMENTAL_SMITE
);
const elementalSmiteIntroDescription = elementalSmiteDescription[0]
  ? [elementalSmiteDescription[0]]
  : [];
export const paladinOathOfTheNobleGeniesElementalSmiteOptions = [
  {
    key: "dao-crush",
    label: "Dao's Crush",
    descriptionEntries: [
      stripElementalSmiteOptionLabel("Dao's Crush", elementalSmiteDescription[1])
    ].filter((entry): entry is SpellDescriptionEntry => entry !== null)
  },
  {
    key: "djinnis-escape",
    label: "Djinni's Escape",
    descriptionEntries: [
      stripElementalSmiteOptionLabel("Djinni's Escape", elementalSmiteDescription[2]),
      elementalSmiteDescription[3] ?? null
    ].filter((entry): entry is SpellDescriptionEntry => entry !== null)
  },
  {
    key: "efreetis-fury",
    label: "Efreeti's Fury",
    descriptionEntries: [
      stripElementalSmiteOptionLabel("Efreeti's Fury", elementalSmiteDescription[4])
    ].filter((entry): entry is SpellDescriptionEntry => entry !== null)
  },
  {
    key: "marids-surge",
    label: "Marid's Surge",
    descriptionEntries: [
      stripElementalSmiteOptionLabel("Marid's Surge", elementalSmiteDescription[5])
    ].filter((entry): entry is SpellDescriptionEntry => entry !== null)
  }
] as const;

export type PaladinOathOfTheNobleGeniesElementalSmiteOptionKey =
  (typeof paladinOathOfTheNobleGeniesElementalSmiteOptions)[number]["key"];
const elementalRebukeDescription = getOathOfTheNobleGeniesFeatureDescriptionEntries(
  CLASS_FEATURE.ELEMENTAL_REBUKE
);
const nobleScionDescription = getOathOfTheNobleGeniesFeatureDescriptionEntries(
  CLASS_FEATURE.NOBLE_SCION
);
const elementalRebukeReactionEntry: ReactionEntry = {
  id: elementalRebukeReactionId,
  reaction: REACTION.ELEMENTAL_REBUKE,
  name: elementalRebukeName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.ELEMENTAL_REBUKE,
  sourceLabel: "Oath of the Noble Genies",
  description: [...elementalRebukeDescription]
};
const minorWishReactionEntry: ReactionEntry = {
  id: minorWishReactionId,
  reaction: REACTION.MINOR_WISH,
  name: minorWishName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.NOBLE_SCION,
  sourceLabel: "Oath of the Noble Genies",
  description: [...minorWishDescription]
};

function isPaladinOathOfTheNobleGenies(character: PaladinOathOfTheNobleGeniesCharacter): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheNobleGeniesSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasPaladinOathOfTheNobleGeniesElementalSmite(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isPaladinOathOfTheNobleGenies(character);
}

export function hasPaladinOathOfTheNobleGeniesGeniesSplendor(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isPaladinOathOfTheNobleGenies(character);
}

export function hasPaladinOathOfTheNobleGeniesAuraOfElementalShielding(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheNobleGeniesSubclassId &&
    (character.level ?? 0) >= 7
  );
}

export function hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheNobleGeniesSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function hasPaladinOathOfTheNobleGeniesNobleScionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheNobleGeniesSubclassId &&
    (character.level ?? 0) >= 20
  );
}

export function normalizePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
  value: unknown
): SkillName | undefined {
  return typeof value === "string" &&
    isSkillName(value) &&
    paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions.some((option) => option === value)
    ? value
    : undefined;
}

export function normalizePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(
  value: unknown
): DAMAGE_TYPE {
  return typeof value === "string" &&
    paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions.some(
      (option) => option === value
    )
    ? (value as DAMAGE_TYPE)
    : defaultAuraOfElementalShieldingDamageType;
}

export function getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
  character: PaladinOathOfTheNobleGeniesCharacter
): SkillName | null {
  if (!hasPaladinOathOfTheNobleGeniesGeniesSplendor(character)) {
    return null;
  }

  return (
    normalizePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
      (character.classFeatureState?.paladin as Partial<CharacterPaladinFeatureState> | undefined)
        ?.nobleGeniesGeniesSplendorSkill
    ) ?? null
  );
}

export function getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(
  character: PaladinOathOfTheNobleGeniesCharacter
): DAMAGE_TYPE | null {
  if (!hasPaladinOathOfTheNobleGeniesAuraOfElementalShielding(character)) {
    return null;
  }

  return normalizePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(
    (character.classFeatureState?.paladin as Partial<CharacterPaladinFeatureState> | undefined)
      ?.nobleGeniesAuraOfElementalShieldingDamageType
  );
}

export function setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
  character: Character,
  selection: SkillName | null
): Character {
  if (!hasPaladinOathOfTheNobleGeniesGeniesSplendor(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};
  const nextSelection =
    selection === null
      ? undefined
      : normalizePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(selection);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        nobleGeniesGeniesSplendorSkill: nextSelection
      }
    }
  };
}

export function setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(
  character: Character,
  damageType: DAMAGE_TYPE
): Character {
  if (!hasPaladinOathOfTheNobleGeniesAuraOfElementalShielding(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        nobleGeniesAuraOfElementalShieldingDamageType:
          normalizePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(damageType)
      }
    }
  };
}

export function getPaladinOathOfTheNobleGeniesElementalRebukeUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifierForCharacter(character, "CHA"));
}

export function getPaladinOathOfTheNobleGeniesElementalRebukeUsesRemaining(
  character: PaladinOathOfTheNobleGeniesCharacter
): number {
  const totalUses = getPaladinOathOfTheNobleGeniesElementalRebukeUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.elementalRebukeUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getPaladinOathOfTheNobleGeniesNobleScionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasPaladinOathOfTheNobleGeniesNobleScionFeature(character) ? nobleScionUsesTotal : 0;
}

export function getPaladinOathOfTheNobleGeniesNobleScionUsesRemaining(
  character: PaladinOathOfTheNobleGeniesCharacter
): number {
  const totalUses = getPaladinOathOfTheNobleGeniesNobleScionUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.nobleScionUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getPaladinOathOfTheNobleGeniesNobleScionFallbackSlotSummary(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): { total: number; remaining: number } {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = nobleScionFallbackSpellSlotLevel - 1;
  const total = spellSlotTotals[slotIndex] ?? 0;

  return {
    total,
    remaining: Math.max(0, total - (spellSlotsExpended[slotIndex] ?? 0))
  };
}

function getPaladinOathOfTheNobleGeniesNobleScionFallbackSlotLevel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): number | null {
  return getPaladinOathOfTheNobleGeniesNobleScionFallbackSlotSummary(character).remaining > 0
    ? nobleScionFallbackSpellSlotLevel
    : null;
}

function getPaladinAuraRangeFeet(character: PaladinOathOfTheNobleGeniesCharacter): number {
  return hasPaladinFeature(
    {
      className: character.className,
      level: character.level ?? 0
    },
    CLASS_FEATURE.AURA_EXPANSION
  )
    ? 30
    : 10;
}

function createGeniesSplendorSkillEntry(skill: SkillName): SkillProficiencyEntry | null {
  const proficiency = getSkillProficiencyForSkillName(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: geniesSplendorSource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  } satisfies SkillProficiencyEntry;
}

function getPaladinOathOfTheNobleGeniesSkillProficiencyEntries(
  character: PaladinOathOfTheNobleGeniesCharacter
): FeatureSkillProficiencyEntry[] {
  const selection = getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(character);

  if (!selection) {
    return [];
  }

  const entry = createGeniesSplendorSkillEntry(selection);
  return entry ? [entry] : [];
}

function appendElementalSmiteDescription(
  character: PaladinOathOfTheNobleGeniesCharacter,
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== divineSmiteSpellId) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.ELEMENTAL_SMITE,
    elementalSmiteIntroDescription,
    elementalSmiteSource
  );
}

export function getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail(
  baseDamageDetail: string,
  option: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null
): string {
  return option === "efreetis-fury"
    ? `${baseDamageDetail} + ${elementalSmiteEfreetisFuryBonusDamageDetail}`
    : baseDamageDetail;
}

export function applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
  character: Character,
  option: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null
): Character {
  if (option !== "djinnis-escape") {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== elementalSmiteDjinnisEscapeStatusSourceId
  );
  const duration = {
    kind: STATUS_DURATION_KIND.ROUNDS as const,
    amount: elementalSmiteDjinnisEscapeDurationRounds,
    tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
  };

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      ...[DAMAGE_TYPE.BLUDGEONING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.SLASHING].map((damageType) =>
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: damageType,
          source: elementalSmiteDjinnisEscapeName,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration,
          sourceId: elementalSmiteDjinnisEscapeStatusSourceId
        })
      ),
      ...[CONDITION_NAME.GRAPPLED, CONDITION_NAME.PRONE, CONDITION_NAME.RESTRAINED].map(
        (condition) =>
          createCharacterStatusEntry({
            group: STATUS_ENTRY_GROUP.IMMUNITIES,
            value: condition,
            source: elementalSmiteDjinnisEscapeName,
            sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
            duration,
            sourceId: elementalSmiteDjinnisEscapeStatusSourceId
          })
      )
    ]
  };
}

function getPaladinOathOfTheNobleGeniesDerivedStatusEntries(
  character: PaladinOathOfTheNobleGeniesCharacter
): DerivedFeatureStatusEntry[] {
  const derivedStatusEntries: DerivedFeatureStatusEntry[] = [];
  const hasAuraOfProtection = hasActivePaladinAuraOfProtection({
    className: character.className,
    level: character.level ?? 0,
    statusEntries: character.statusEntries ?? []
  });

  if (hasPaladinOathOfTheNobleGeniesAuraOfElementalShielding(character) && hasAuraOfProtection) {
    const damageType =
      getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(character);

    if (damageType) {
      derivedStatusEntries.push(
        {
          id: paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId,
          sourceId: paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId,
          group: STATUS_ENTRY_GROUP.AURAS,
          value: auraOfElementalShieldingName,
          source: auraOfElementalShieldingName,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.INFINITE
          },
          rangeFeet: getPaladinAuraRangeFeet(character)
        },
        {
          id: `${paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId}-resistance`,
          sourceId: paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: damageType,
          source: auraOfElementalShieldingName,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.INFINITE
          }
        }
      );
    }
  }

  if (hasActivePaladinOathOfTheNobleGeniesMinorWishAura(character)) {
    derivedStatusEntries.push({
      id: paladinOathOfTheNobleGeniesMinorWishStatusSourceId,
      sourceId: paladinOathOfTheNobleGeniesMinorWishStatusSourceId,
      group: STATUS_ENTRY_GROUP.AURAS,
      value: minorWishName,
      source: minorWishName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: getPaladinAuraRangeFeet(character)
    });
  }

  return derivedStatusEntries;
}

function getPaladinOathOfTheNobleGeniesReactionEntries(
  character: PaladinOathOfTheNobleGeniesCharacter
): ReactionEntry[] {
  const reactionEntries: ReactionEntry[] = [];

  if (hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(character)) {
    reactionEntries.push(elementalRebukeReactionEntry);
  }

  if (hasActivePaladinOathOfTheNobleGeniesMinorWishAura(character)) {
    reactionEntries.push(minorWishReactionEntry);
  }

  return reactionEntries;
}

export function consumePaladinOathOfTheNobleGeniesElementalRebukeUse(
  character: Character
): Character {
  if (
    !hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(character) ||
    getPaladinOathOfTheNobleGeniesElementalRebukeUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        elementalRebukeUsesExpended: (paladinState.elementalRebukeUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restorePaladinOathOfTheNobleGeniesElementalRebukeOnLongRest(
  character: Character
): Character {
  if (!hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.elementalRebukeUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        elementalRebukeUsesExpended: 0
      }
    }
  };
}

export function hasActivePaladinOathOfTheNobleGeniesNobleScion(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasPaladinOathOfTheNobleGeniesNobleScionFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfTheNobleGeniesNobleScionStatusSourceId
  );
}

function hasActivePaladinOathOfTheNobleGeniesMinorWishAura(
  character: PaladinOathOfTheNobleGeniesCharacter
): boolean {
  return (
    hasActivePaladinOathOfTheNobleGeniesNobleScion(character) &&
    hasActivePaladinAuraOfProtection({
      className: character.className,
      level: character.level ?? 0,
      statusEntries: character.statusEntries ?? []
    })
  );
}

function getPaladinOathOfTheNobleGeniesFeatureActions(
  character: PaladinOathOfTheNobleGeniesCharacter
): FeatureActionCard[] {
  if (!hasPaladinOathOfTheNobleGeniesNobleScionFeature(character)) {
    return [];
  }

  const usesRemaining = getPaladinOathOfTheNobleGeniesNobleScionUsesRemaining(character);
  const fallbackSlotSummary =
    getPaladinOathOfTheNobleGeniesNobleScionFallbackSlotSummary(character);
  const showFallbackSlotInfo = usesRemaining <= 0 && fallbackSlotSummary.total > 0;
  const hasFallbackSlot = showFallbackSlotInfo && fallbackSlotSummary.remaining > 0;
  const isActive = hasActivePaladinOathOfTheNobleGeniesNobleScion(character);

  return [
    {
      key: nobleScionActionKey,
      name: nobleScionName,
      summary: "Assume regal elemental splendor.",
      detail: "Gain Noble Scion for 10 minutes.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        nobleScionUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        })
      ),
      usesRemaining,
      usesTotal: nobleScionUsesTotal,
      usesInlineLabel: showFallbackSlotInfo ? "| Use 5th Spell Slot" : undefined,
      description: [...nobleScionDescription],
      headerTags: createChargesAndUsageHeaderTags(
        usesRemaining,
        nobleScionUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        }),
        fallbackSlotSummary.remaining,
        fallbackSlotSummary.total,
        {
          label: "Spell Slots"
        }
      ),
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of the Noble Genies"
      },
      execute: {
        kind: "activate"
      },
      isActive,
      disabled: isActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: isActive
        ? "Noble Scion is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Noble Scion use or level 5 spell slots remaining."
          : undefined
    }
  ];
}

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function getReactionEntryById(
  reactions: ReactionEntry[],
  reactionId: string
): ReactionEntry[] {
  return reactions.filter((reaction) => reaction.id === reactionId);
}

function getStatusEntriesBySource(
  statuses: DerivedFeatureStatusEntry[],
  source: string
): DerivedFeatureStatusEntry[] {
  return statuses.filter((status) => status.source === source);
}

function getPaladinOathOfTheNobleGeniesSpeedBonuses(
  character: PaladinOathOfTheNobleGeniesCharacter
): FeatureSpeedBonus[] {
  return hasActivePaladinOathOfTheNobleGeniesNobleScion(character)
    ? [
        {
          label: nobleScionName,
          value: 0,
          movementType: "fly",
          setTotal: 60,
          hover: true
        }
      ]
    : [];
}

export function applyPaladinOathOfTheNobleGeniesNobleScionStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfTheNobleGeniesNobleScionStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: nobleScionName,
        source: nobleScionName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: paladinOathOfTheNobleGeniesNobleScionStatusSourceId
      })
    ]
  };
}

export function activatePaladinOathOfTheNobleGeniesNobleScion(character: Character): Character {
  if (
    !hasPaladinOathOfTheNobleGeniesNobleScionFeature(character) ||
    hasActivePaladinOathOfTheNobleGeniesNobleScion(character)
  ) {
    return character;
  }

  const usesRemaining = getPaladinOathOfTheNobleGeniesNobleScionUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const paladinState = character.classFeatureState?.paladin ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        paladin: {
          ...paladinState,
          nobleScionUsesExpended: (paladinState.nobleScionUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    const fallbackSlotLevel = getPaladinOathOfTheNobleGeniesNobleScionFallbackSlotLevel(character);

    if (fallbackSlotLevel === null) {
      return character;
    }

    const spellSlotTotals = getSpellSlotTotalsForCharacter(
      character.className,
      character.level,
      character.subclassId
    );
    const spellSlotsExpended = normalizeSpellSlotsExpended(
      character.spellSlotsExpended,
      spellSlotTotals
    );
    const nextSpellSlotsExpended = [...spellSlotsExpended];
    nextSpellSlotsExpended[fallbackSlotLevel - 1] =
      (nextSpellSlotsExpended[fallbackSlotLevel - 1] ?? 0) + 1;

    nextCharacter = {
      ...character,
      spellSlotsExpended: nextSpellSlotsExpended
    };
  }

  return applyPaladinOathOfTheNobleGeniesNobleScionStatus(nextCharacter);
}

export function restorePaladinOathOfTheNobleGeniesNobleScionOnLongRest(
  character: Character
): Character {
  if (!hasPaladinOathOfTheNobleGeniesNobleScionFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.nobleScionUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        nobleScionUsesExpended: 0
      }
    }
  };
}

function collectPaladinOathOfTheNobleGeniesContributions(
  character: PaladinOathOfTheNobleGeniesCharacter
): FeatureContributionSpec[] {
  if (!isPaladinOathOfTheNobleGenies(character)) {
    return [];
  }

  const featureActions = getPaladinOathOfTheNobleGeniesFeatureActions(character);
  const channelDivinityCharacter = {
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState
  };
  const derivedStatusEntries = getPaladinOathOfTheNobleGeniesDerivedStatusEntries(character);
  const reactionEntries = getPaladinOathOfTheNobleGeniesReactionEntries(character);
  const contributions: FeatureContributionSpec[] = [
    {
      source: createSubclassContributionSource({
        id: "paladin-oath-of-the-noble-genies-spells",
        label: "Genie Spells",
        entryId: CLASS_FEATURE.GENIE_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        oathOfTheNobleGeniesSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: "paladin-oath-of-the-noble-genies-elemental-smite",
        label: elementalSmiteSource,
        entryId: CLASS_FEATURE.ELEMENTAL_SMITE
      }),
      actionOptions: {
        [paladinChannelDivinityActionKey]: [
          {
            key: paladinChannelDivinityOptionKeys.elementalSmite,
            name: elementalSmiteSource,
            summary: "Invoke an elemental smite",
            detail:
              "Spend 1 Channel Divinity after Divine Smite to choose a genie smite effect.",
            economyType: ECONOMY_TYPE.BONUS_ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            resultLabel: "Effect",
            breakdown: "After Divine Smite",
            description: elementalSmiteDescription,
            disabled: getPaladinChannelDivinityUsesRemaining(channelDivinityCharacter) <= 0,
            disabledReason:
              getPaladinChannelDivinityUsesRemaining(channelDivinityCharacter) <= 0
                ? "No Channel Divinity uses remaining."
                : undefined
          }
        ]
      },
      spellTransforms: [
        {
          id: "paladin-oath-of-the-noble-genies-elemental-smite-transform",
          transform: (spell) => appendElementalSmiteDescription(character, spell)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: "paladin-oath-of-the-noble-genies-genies-splendor",
        label: geniesSplendorSource,
        entryId: CLASS_FEATURE.GENIES_SPLENDOR
      }),
      armorClassModes: [
        {
          id: "paladin-oath-of-the-noble-genies-genies-splendor-mode",
          getModes: (context) => [
            {
              key: "paladin-oath-of-the-noble-genies-genies-splendor",
              label: geniesSplendorSource,
              unlockedAtLevel: 3,
              baseValue: 10,
              abilityModifiers: ["DEX", "CHA"],
              shieldAllowed: true,
              isApplicable: !context.hasWornBodyArmor,
              unavailableReason: context.hasWornBodyArmor
                ? "Requires you to wear no body armor."
                : undefined,
              detail: "Oath of the Noble Genies feature"
            }
          ]
        }
      ],
      skillProficiencyEntries: getPaladinOathOfTheNobleGeniesSkillProficiencyEntries(character)
    }
  ];

  if (hasPaladinOathOfTheNobleGeniesAuraOfElementalShielding(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-the-noble-genies-aura-of-elemental-shielding",
        label: auraOfElementalShieldingName,
        entryId: CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING
      }),
      statuses: getStatusEntriesBySource(derivedStatusEntries, auraOfElementalShieldingName)
    });
  }

  if (hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-the-noble-genies-elemental-rebuke",
        label: elementalRebukeName,
        entryId: CLASS_FEATURE.ELEMENTAL_REBUKE
      }),
      reactions: getReactionEntryById(reactionEntries, elementalRebukeReactionId)
    });
  }

  if (hasPaladinOathOfTheNobleGeniesNobleScionFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-the-noble-genies-noble-scion",
        label: nobleScionName,
        entryId: CLASS_FEATURE.NOBLE_SCION
      }),
      actions: getFeatureActionByKey(featureActions, nobleScionActionKey),
      statuses: getStatusEntriesBySource(derivedStatusEntries, minorWishName),
      reactions: getReactionEntryById(reactionEntries, minorWishReactionId),
      speedBonuses: getPaladinOathOfTheNobleGeniesSpeedBonuses(character)
    });
  }

  return contributions;
}

export const getPaladinOathOfTheNobleGeniesDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectPaladinOathOfTheNobleGeniesContributions(character)),
    {
      character: character as Character
    }
  );
