import { CLASS_FEATURE, REACTION, type ReactionEntry, type SpellEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  getSkillProficiencyForSkillName
} from "../../../../../types";
import type {
  Character,
  RangerFeyWandererGift,
  RangerOtherworldlyGlamourSkill,
  SkillProficiencyEntry
} from "../../../../../types";
import type {
  FeatureDamageBonus,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  WeaponFeatureContext
} from "../../types";
import { createSourcedDescriptionEntries, descriptionValueSomeText } from "../../../actionModalDescriptions";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const feyWandererSubclassId = "ranger-fey-wanderer";
export const rangerFeyWandererGiftOptions = [
  {
    key: "illusory-butterflies",
    value: "illusory-butterflies",
    content: "Illusory butterflies flutter around you while you take a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
  },
  {
    key: "flowers-bloom",
    value: "flowers-bloom",
    content: "Flowers bloom from your hair each dawn."
  },
  {
    key: "comforting-aroma",
    value: "comforting-aroma",
    content:
      "You faintly smell of cinnamon, lavender, nutmeg, or another comforting herb or spice."
  },
  {
    key: "dancing-shadow",
    value: "dancing-shadow",
    content: "Your shadow dances while no one is looking directly at it."
  },
  {
    key: "horns-or-antlers",
    value: "horns-or-antlers",
    content: "Horns or antlers sprout from your head."
  },
  {
    key: "shifting-colors",
    value: "shifting-colors",
    content: "Your skin and hair change color each dawn."
  }
] as const satisfies ReadonlyArray<{
  key: RangerFeyWandererGift;
  value: RangerFeyWandererGift;
  content: string;
}>;
export const rangerOtherworldlyGlamourSkillOptions = [
  {
    key: SKILL.DECEPTION,
    value: SKILL.DECEPTION,
    content: SKILL.DECEPTION
  },
  {
    key: SKILL.PERFORMANCE,
    value: SKILL.PERFORMANCE,
    content: SKILL.PERFORMANCE
  },
  {
    key: SKILL.PERSUASION,
    value: SKILL.PERSUASION,
    content: SKILL.PERSUASION
  }
] as const satisfies ReadonlyArray<{
  key: RangerOtherworldlyGlamourSkill;
  value: RangerOtherworldlyGlamourSkill;
  content: string;
}>;
const rangerFeyWandererGiftOptionSet = new Set<RangerFeyWandererGift>(
  rangerFeyWandererGiftOptions.map((option) => option.value)
);
const rangerOtherworldlyGlamourSkillOptionSet = new Set<RangerOtherworldlyGlamourSkill>(
  rangerOtherworldlyGlamourSkillOptions.map((option) => option.value)
);
const feyWandererSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Charm Person"]),
  5: resolveSpellIdsByName(["Misty Step"]),
  9: resolveSpellIdsByName(["Summon Fey"]),
  13: resolveSpellIdsByName(["Dimension Door"]),
  17: resolveSpellIdsByName(["Mislead"])
} as const;

type RangerFeyWandererCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>;

const dreadfulStrikesLabel = "Dreadful Strikes";
const otherworldlyGlamourLabel = "Otherworldly Glamour";
const beguilingTwistName = "Beguiling Twist";
const feyReinforcementsUsesTotal = 1;
const mistyWandererName = "Misty Wanderer";
const mistyStepSpellId = "spell-misty-step";
const otherworldlyGlamourCharismaSkills = [
  SKILL.DECEPTION,
  SKILL.INTIMIDATION,
  SKILL.PERFORMANCE,
  SKILL.PERSUASION
] as const;
const feyWandererSubclassEntry = getSubclassEntryById(feyWandererSubclassId);
const mistyWandererSpellDescription = [
  "In addition, whenever you cast Misty Step, you can bring along one willing creature you can see within 5 feet of yourself. That creature teleports to an unoccupied space of your choice within 5 feet of your destination space."
] as const;

function getRangerFeyWandererFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = feyWandererSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const beguilingTwistDescription = getRangerFeyWandererFeatureDescriptionEntries(
  CLASS_FEATURE.BEGUILING_TWIST
);
const beguilingTwistReactionEntry: ReactionEntry = {
  id: "reaction-ranger-beguiling-twist",
  reaction: REACTION.BEGUILING_TWIST,
  name: beguilingTwistName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.BEGUILING_TWIST,
  sourceLabel: "Fey Wanderer",
  description: [...beguilingTwistDescription]
};

function getDreadfulStrikesDamageFormula(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  if (!hasRangerFeyWandererDreadfulStrikesFeature(character)) {
    return null;
  }

  return (character.level ?? 0) >= 11 ? "1d6" : "1d4";
}

function hasRangerFeyWandererDreadfulStrikesAvailable(character: RangerFeyWandererCharacter): boolean {
  return (
    hasRangerFeyWandererDreadfulStrikesFeature(character) &&
    character.classFeatureState?.ranger?.dreadfulStrikesUsedThisTurn !== true
  );
}

function getRangerFeyWandererWeaponDamageBonuses(
  character: RangerFeyWandererCharacter,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const damageFormula = getDreadfulStrikesDamageFormula(character);

  if (
    damageFormula === null ||
    !hasRangerFeyWandererDreadfulStrikesAvailable(character) ||
    context.attackKind !== "weapon"
  ) {
    return [];
  }

  return [
    {
      label: dreadfulStrikesLabel,
      formula: damageFormula,
      displayLabel: `${damageFormula} Psychic`
    }
  ];
}

export function hasRangerFeyWandererDreadfulStrikesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === feyWandererSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasRangerFeyWandererSpellsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === feyWandererSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasRangerFeyWandererOtherworldlyGlamourFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === feyWandererSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasRangerFeyWandererBeguilingTwistFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === feyWandererSubclassId &&
    (character.level ?? 0) >= 7
  );
}

export function hasRangerFeyWandererFeyReinforcementsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === feyWandererSubclassId &&
    (character.level ?? 0) >= 11
  );
}

export function hasRangerFeyWandererMistyWandererFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === feyWandererSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function normalizeRangerFeyWandererGiftSelection(
  value: unknown
): RangerFeyWandererGift | undefined {
  return typeof value === "string" && rangerFeyWandererGiftOptionSet.has(value as RangerFeyWandererGift)
    ? (value as RangerFeyWandererGift)
    : undefined;
}

export function getRangerFeyWandererGiftSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RangerFeyWandererGift | null {
  if (!hasRangerFeyWandererSpellsFeature(character)) {
    return null;
  }

  return character.classFeatureState?.ranger?.feyWandererGift ?? null;
}

export function normalizeRangerOtherworldlyGlamourSkillSelection(
  value: unknown
): RangerOtherworldlyGlamourSkill | undefined {
  return typeof value === "string" &&
    rangerOtherworldlyGlamourSkillOptionSet.has(value as RangerOtherworldlyGlamourSkill)
    ? (value as RangerOtherworldlyGlamourSkill)
    : undefined;
}

export function getRangerOtherworldlyGlamourSkillSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RangerOtherworldlyGlamourSkill | null {
  if (!hasRangerFeyWandererOtherworldlyGlamourFeature(character)) {
    return null;
  }

  return character.classFeatureState?.ranger?.otherworldlyGlamourSkill ?? null;
}

export function getRangerFeyWandererFeyReinforcementsUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRangerFeyWandererFeyReinforcementsFeature(character) ? feyReinforcementsUsesTotal : 0;
}

export function getRangerFeyWandererFeyReinforcementsUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  const totalUses = getRangerFeyWandererFeyReinforcementsUsesTotal(character);
  const usesExpended = character.classFeatureState?.ranger?.feyReinforcementsUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRangerFeyWandererMistyWandererUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasRangerFeyWandererMistyWandererFeature(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifierForCharacter(character, "WIS"));
}

export function getRangerFeyWandererMistyWandererUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  const totalUses = getRangerFeyWandererMistyWandererUsesTotal(character);
  const usesExpended = character.classFeatureState?.ranger?.mistyWandererUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function consumeRangerFeyWandererFeyReinforcementsUse(character: Character): Character {
  if (!hasRangerFeyWandererFeyReinforcementsFeature(character)) {
    return character;
  }

  const totalUses = getRangerFeyWandererFeyReinforcementsUsesTotal(character);
  const rangerState = character.classFeatureState?.ranger ?? {};
  const usesExpended = rangerState.feyReinforcementsUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        feyReinforcementsUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerFeyWandererMistyWandererUse(character: Character): Character {
  if (!hasRangerFeyWandererMistyWandererFeature(character)) {
    return character;
  }

  const totalUses = getRangerFeyWandererMistyWandererUsesTotal(character);
  const rangerState = character.classFeatureState?.ranger ?? {};
  const usesExpended = rangerState.mistyWandererUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        mistyWandererUsesExpended: usesExpended + 1
      }
    }
  };
}

export function restoreRangerFeyWandererFeyReinforcementsOnLongRest(character: Character): Character {
  if (!hasRangerFeyWandererFeyReinforcementsFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if ((rangerState.feyReinforcementsUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        feyReinforcementsUsesExpended: 0
      }
    }
  };
}

export function restoreRangerFeyWandererMistyWandererOnLongRest(character: Character): Character {
  if (!hasRangerFeyWandererMistyWandererFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if ((rangerState.mistyWandererUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        mistyWandererUsesExpended: 0
      }
    }
  };
}

function appendMistyWandererDescription(spell: SpellEntry): SpellEntry {
  if (spell.id !== mistyStepSpellId) {
    return spell;
  }

  const marker = `<strong>${mistyWandererName}.</strong>`;

  if (
    descriptionValueSomeText({ description: spell.description }, (entry) => entry.includes(marker))
  ) {
    return spell;
  }

  return {
    ...spell,
    description: [
      ...spell.description,
      ...createSourcedDescriptionEntries(mistyWandererName, mistyWandererSpellDescription)
    ]
  };
}

export function setRangerOtherworldlyGlamourSkillSelection(
  character: Character,
  selection: RangerOtherworldlyGlamourSkill | null
): Character {
  if (!hasRangerFeyWandererOtherworldlyGlamourFeature(character)) {
    return character;
  }

  const normalizedSelection =
    selection === null ? undefined : normalizeRangerOtherworldlyGlamourSkillSelection(selection);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        otherworldlyGlamourSkill: normalizedSelection
      }
    }
  };
}

export function getRangerFeyWandererOtherworldlyGlamourSkillBonuses(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  skill: string
): FeatureSkillBonus[] {
  if (
    !hasRangerFeyWandererOtherworldlyGlamourFeature(character) ||
    !otherworldlyGlamourCharismaSkills.includes(skill as (typeof otherworldlyGlamourCharismaSkills)[number])
  ) {
    return [];
  }

  return [
    {
      label: "WIS (Otherworldly Glamour)",
      abilityModifierSource: "WIS",
      minimumValue: 1
    }
  ];
}

export function getRangerFeyWandererOtherworldlyGlamourSkillProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): FeatureSkillProficiencyEntry[] {
  const selection = getRangerOtherworldlyGlamourSkillSelection(character);

  if (selection === null) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: otherworldlyGlamourLabel,
      proficiency: getSkillProficiencyForSkillName(selection)!,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies SkillProficiencyEntry
  ];
}

export function setRangerFeyWandererGiftSelection(
  character: Character,
  selection: RangerFeyWandererGift | null
): Character {
  if (!hasRangerFeyWandererSpellsFeature(character)) {
    return character;
  }

  const normalizedSelection =
    selection === null ? undefined : normalizeRangerFeyWandererGiftSelection(selection);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        feyWandererGift: normalizedSelection
      }
    }
  };
}

export const getRangerFeyWandererDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Ranger" && character.subclassId === feyWandererSubclassId
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          feyWandererSpellIdsByLevel
        ),
        reactionEntries: hasRangerFeyWandererBeguilingTwistFeature(character)
          ? [beguilingTwistReactionEntry]
          : [],
        transformSpellEntry: hasRangerFeyWandererMistyWandererFeature(character)
          ? appendMistyWandererDescription
          : undefined,
        getWeaponDamageBonuses: (context) =>
          getRangerFeyWandererWeaponDamageBonuses(character, context)
      }
    : {};
