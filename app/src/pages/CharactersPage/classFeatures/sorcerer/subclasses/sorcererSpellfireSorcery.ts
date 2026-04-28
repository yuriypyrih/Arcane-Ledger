import { sorcererFeatures } from "../../../../../codex/classes";
import { CLASS_FEATURE, type SpellEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../shared/formulas";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import {
  createDefaultFeatureActionDescription,
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName
} from "../../subclassRuntime";
import type { FeatureActionCard, FeatureActionFact, FeatureSpeedBonus } from "../../types";

export const spellfireSorcerySubclassId = "sorcerer-spellfire-sorcery";
export const sorcererSpellfireBurstActionKey = "sorcerer-spellfire-sorcery-spellfire-burst";
export const spellfireBurstName = "Spellfire Burst";
export const spellfireCrownOfSpellfireName = "Crown of Spellfire";
export const spellfireCrownOfSpellfireStatusSourceId =
  "feature-sorcerer-spellfire-sorcery-crown-of-spellfire";

const spellfireSorcerySubclassEntry = getSubclassEntryById(spellfireSorcerySubclassId);
const sorcererInnateSorceryActionKey = "sorcerer-innate-sorcery";
const sorcererInnateSorceryEffectName = "Innate Sorcery";
const spellfireSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Scorching Ray"]),
  5: resolveSpellIdsByName(["Aura of Vitality", "Dispel Magic"]),
  7: resolveSpellIdsByName(["Fire Shield", "Wall of Fire"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Flame Strike"])
} as const;
const counterspellSpellIds = resolveSpellIdsByName(["Counterspell"]);
const counterspellSpellId = counterspellSpellIds[0] ?? null;
const crownOfSpellfireUsesTotal = 1;
const crownOfSpellfireFallbackSorceryPointCost = 5;
const spellfireSorceryBonusSpellIdsByLevel = {
  6: counterspellSpellIds
} as const;

type SpellfireSorceryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "statusEntries" | "subclassId">>;

function getSorcererFeatureRow(level: number | undefined) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getSorcererSpellfireSorceryPointsTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return character.className === "Sorcerer"
    ? Math.max(0, getSorcererFeatureRow(character.level)?.sorceryPoints ?? 0)
    : 0;
}

function getSorcererSpellfireSorceryPointsRemaining(
  character: Pick<Character, "className"> & Partial<Pick<Character, "classFeatureState" | "level">>
): number {
  const totalPoints = getSorcererSpellfireSorceryPointsTotal(character);
  const expendedPoints = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);

  return Math.max(
    0,
    totalPoints -
      (Number.isFinite(expendedPoints)
        ? Math.max(0, Math.min(totalPoints, Math.floor(expendedPoints)))
        : 0)
  );
}

function spendSorcererSpellfireSorceryPoints(character: Character, cost: number): Character {
  const normalizedCost = Math.max(0, Math.floor(cost));

  if (normalizedCost <= 0) {
    return character;
  }

  const totalPoints = getSorcererSpellfireSorceryPointsTotal(character);
  const remainingPoints = getSorcererSpellfireSorceryPointsRemaining(character);

  if (totalPoints <= 0 || remainingPoints < normalizedCost) {
    return character;
  }

  const currentExpended = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);
  const nextExpended = Math.max(
    0,
    Math.min(
      totalPoints,
      (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + normalizedCost
    )
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        sorceryPointsExpended: nextExpended
      }
    }
  };
}

function getSpellfireFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  return (
    spellfireSorcerySubclassEntry?.features.find((row) => row.classFeatures.includes(feature))
      ?.featureOverrides?.[feature]?.description ?? []
  ).filter((entry): entry is string => typeof entry === "string");
}

const absorbSpellsCounterspellDescription = getSpellfireFeatureDescriptionEntries(
  CLASS_FEATURE.ABSORB_SPELLS
);
const spellfireBurstDescription = getSpellfireFeatureDescriptionEntries(
  CLASS_FEATURE.SPELLFIRE_BURST
);
const honedSpellfireDescription = getSpellfireFeatureDescriptionEntries(
  CLASS_FEATURE.HONED_SPELLFIRE
);
export const spellfireCrownOfSpellfireDescription = getSpellfireFeatureDescriptionEntries(
  CLASS_FEATURE.CROWN_OF_SPELLFIRE
);

function hasSorcererSpellfireBurstFeature(character: SpellfireSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === spellfireSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasSorcererSpellfireBurstFeatureForCharacter(
  character: SpellfireSorceryCharacter
): boolean {
  return hasSorcererSpellfireBurstFeature(character);
}

function hasSorcererSpellfireHonedSpellfireFeature(character: SpellfireSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === spellfireSorcerySubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getSorcererSpellfireBurstDescriptionAdditions(
  character: SpellfireSorceryCharacter
): FeatureActionCard["descriptionAdditions"] {
  return hasSorcererSpellfireHonedSpellfireFeature(character) && honedSpellfireDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.HONED_SPELLFIRE,
          honedSpellfireDescription,
          "Honed Spellfire"
        )
      ]
    : [];
}

function hasSorcererSpellfireAbsorbSpellsFeature(character: SpellfireSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === spellfireSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererSpellfireCrownOfSpellfireFeature(
  character: SpellfireSorceryCharacter
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === spellfireSorcerySubclassId &&
    (character.level ?? 0) >= 18
  );
}

type SpellfireBurstFormula = {
  formula: string;
  formulaDisplay: string;
  fact: FeatureActionFact;
};

function getSorcererSpellfireBurstBolsteringFlamesFormula(
  character: SpellfireSorceryCharacter
): SpellfireBurstFormula {
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const sorcererLevel = Math.max(1, Math.floor(character.level ?? 1));
  const honedBonus = hasSorcererSpellfireHonedSpellfireFeature(character) ? sorcererLevel : 0;
  const formulaTerms = [
    "1d4",
    charismaModifier !== 0 ? String(charismaModifier) : null,
    honedBonus > 0 ? String(honedBonus) : null
  ];
  const displayTerms = [
    "1d4",
    charismaModifier !== 0 ? formatSignedFormulaTerm(charismaModifier, "CHA") : null,
    honedBonus > 0 ? formatSignedFormulaTerm(honedBonus, "Sorcerer Level") : null
  ];
  const formula = formatFormulaTerms(formulaTerms);
  const formulaCell = formatFormulaCell({
    formula,
    displayTerms,
    resultLabel: "Temporary HP"
  });

  return {
    formula,
    formulaDisplay: formulaCell.value.replace(/^.* = /, ""),
    fact: {
      label: "Bolstering Flames Formula",
      value: formulaCell.value,
      fullWidth: true
    }
  };
}

function getSorcererSpellfireBurstRadiantFireFormula(
  character: SpellfireSorceryCharacter
): SpellfireBurstFormula {
  const formula = hasSorcererSpellfireHonedSpellfireFeature(character) ? "1d8" : "1d4";
  const formulaCell = formatFormulaCell({
    formula,
    displayTerms: [`${formula} Fire/Radiant`],
    resultLabel: "Damage"
  });

  return {
    formula,
    formulaDisplay: `${formula} Fire/Radiant`,
    fact: {
      label: "Radiant Fire Formula",
      value: formulaCell.value,
      fullWidth: true
    }
  };
}

export function getSorcererSpellfireBurstBolsteringFlamesRollFormula(
  character: SpellfireSorceryCharacter
): SpellfireBurstFormula {
  return getSorcererSpellfireBurstBolsteringFlamesFormula(character);
}

export function getSorcererSpellfireBurstRadiantFireRollFormula(
  character: SpellfireSorceryCharacter
): SpellfireBurstFormula {
  return getSorcererSpellfireBurstRadiantFireFormula(character);
}

function getSorcererSpellfireBurstAction(
  character: SpellfireSorceryCharacter
): FeatureActionCard | null {
  if (!hasSorcererSpellfireBurstFeature(character)) {
    return null;
  }

  const usedThisTurn = character.classFeatureState?.sorcerer?.spellfireBurstUsedThisTurn === true;
  const bolsteringFlamesFormula =
    getSorcererSpellfireBurstBolsteringFlamesFormula(character).fact;
  const radiantFireFormula = getSorcererSpellfireBurstRadiantFireFormula(character).fact;
  const descriptionAdditions = getSorcererSpellfireBurstDescriptionAdditions(character);

  return {
    key: sorcererSpellfireBurstActionKey,
    name: spellfireBurstName,
    sourceFeature: CLASS_FEATURE.SPELLFIRE_BURST,
    summary: "Unleash bolstering flame or radiant fire.",
    detail: "Unleash one Spellfire Burst effect.",
    breakdown: "Once per turn",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    description: spellfireBurstDescription,
    descriptionAdditions,
    facts: [bolsteringFlamesFormula, radiantFireFormula],
    drawer: {
      kind: "custom-form",
      eyebrow: "Spellfire Sorcery",
      description: spellfireBurstDescription,
      descriptionAdditions,
      facts: [bolsteringFlamesFormula, radiantFireFormula],
      factsSectionTitle: "Formulas",
      formKind: "spellfire-burst"
    },
    execute: {
      kind: "custom-form",
      formKind: "spellfire-burst"
    },
    disabled: usedThisTurn,
    disabledReason: usedThisTurn ? "Spellfire Burst has already been used this turn." : undefined
  };
}

export function activateSorcererSpellfireBurst(character: Character): Character {
  if (
    !hasSorcererSpellfireBurstFeature(character) ||
    character.classFeatureState?.sorcerer?.spellfireBurstUsedThisTurn === true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        spellfireBurstUsedThisTurn: true
      }
    }
  };
}

function appendAbsorbSpellsCounterspellDescription(
  character: SpellfireSorceryCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!counterspellSpellId || spell.id !== counterspellSpellId) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.ABSORB_SPELLS,
    absorbSpellsCounterspellDescription,
    "Absorb Spells"
  );
}

function appendCrownOfSpellfireDescription(
  character: SpellfireSorceryCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (
    action.key !== sorcererInnateSorceryActionKey ||
    spellfireCrownOfSpellfireDescription.length <= 0
  ) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    character,
    CLASS_FEATURE.CROWN_OF_SPELLFIRE,
    spellfireCrownOfSpellfireDescription,
    spellfireCrownOfSpellfireName
  );
}

function hasActiveSorcererSpellfireCrownOfSpellfire(character: SpellfireSorceryCharacter): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === spellfireCrownOfSpellfireStatusSourceId
  );
}

function getSorcererSpellfireCrownOfSpellfireSpeedBonuses(
  character: SpellfireSorceryCharacter
): FeatureSpeedBonus[] {
  return hasActiveSorcererSpellfireCrownOfSpellfire(character)
    ? [
        {
          label: spellfireCrownOfSpellfireName,
          value: 0,
          movementType: "fly",
          setTotal: 60,
          hover: true
        }
      ]
    : [];
}

export function getSorcererSpellfireCrownOfSpellfireUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererSpellfireCrownOfSpellfireFeature(character) ? crownOfSpellfireUsesTotal : 0;
}

export function getSorcererSpellfireCrownOfSpellfireUsesRemaining(
  character: SpellfireSorceryCharacter
): number {
  const totalUses = getSorcererSpellfireCrownOfSpellfireUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.crownOfSpellfireUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

export function getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCost(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererSpellfireCrownOfSpellfireFeature(character)
    ? crownOfSpellfireFallbackSorceryPointCost
    : 0;
}

export function activateSorcererSpellfireCrownOfSpellfire(character: Character): Character {
  if (!hasSorcererSpellfireCrownOfSpellfireFeature(character)) {
    return character;
  }

  const usesRemaining = getSorcererSpellfireCrownOfSpellfireUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const currentExpended = Number(
      character.classFeatureState?.sorcerer?.crownOfSpellfireUsesExpended
    );
    const nextExpended = Math.max(
      0,
      Math.min(
        crownOfSpellfireUsesTotal,
        (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + 1
      )
    );

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...character.classFeatureState?.sorcerer,
          crownOfSpellfireUsesExpended: nextExpended
        }
      }
    };
  } else {
    nextCharacter = spendSorcererSpellfireSorceryPoints(
      character,
      crownOfSpellfireFallbackSorceryPointCost
    );

    if (nextCharacter === character) {
      return character;
    }
  }

  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) => entry.sourceId !== spellfireCrownOfSpellfireStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: spellfireCrownOfSpellfireName,
        source: spellfireCrownOfSpellfireName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: sorcererInnateSorceryEffectName
        },
        sourceId: spellfireCrownOfSpellfireStatusSourceId
      })
    ]
  };
}

export function restoreSorcererSpellfireCrownOfSpellfireOnLongRest(
  character: Character
): Character {
  if (!hasSorcererSpellfireCrownOfSpellfireFeature(character)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        crownOfSpellfireUsesExpended: 0
      }
    }
  };
}

export const getSorcererSpellfireSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === spellfireSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        featureActions: [
          ...(() => {
            const spellfireBurstAction = getSorcererSpellfireBurstAction(character);
            return spellfireBurstAction ? [spellfireBurstAction] : [];
          })()
        ],
        alwaysPreparedSpellIds: [
          ...getPreparedSpellIdsByLevel(character.level ?? 0, spellfireSorcerySpellIdsByLevel),
          ...((character.level ?? 0) >= 6 ? spellfireSorceryBonusSpellIdsByLevel[6] : [])
        ],
        transformFeatureAction: hasSorcererSpellfireCrownOfSpellfireFeature(character)
          ? (action) => appendCrownOfSpellfireDescription(character, action)
          : undefined,
        transformSpellEntry: hasSorcererSpellfireAbsorbSpellsFeature(character)
          ? (spell) => appendAbsorbSpellsCounterspellDescription(character, spell)
          : undefined,
        speedBonuses: getSorcererSpellfireCrownOfSpellfireSpeedBonuses(character)
      }
    : {};
