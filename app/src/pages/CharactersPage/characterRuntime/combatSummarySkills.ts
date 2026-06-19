import type {
  Character,
  CharacterProficiencyCollections,
  SkillName,
  SkillProficiencyEntry
} from "../../../types";
import {
  getSkillIndicatorsForCharacter,
  getSkillReferenceDescriptionAdditionsForCharacter,
  getSkillRollD20MinimumForCharacter,
  type FeatureIndicator
} from "../classFeatures";
import { formatCustomTraitBonusRollFormulaTerm } from "../customTraitEffects";
import {
  getDisplayArmorProficiencyEntries,
  getDisplayLanguageProficiencyEntries,
  getDisplaySavingThrowProficiencyEntries,
  getDisplaySkillProficiencyEntries,
  getDisplayToolProficiencyEntries,
  getDisplayWeaponProficiencyEntries,
  isWeaponMasteryProficiency,
  type ProficiencyDisplayEntry
} from "../proficiency";
import { getProficiencyRuntimeForCharacter } from "../proficiency/runtime";
import {
  formatFormulaCell,
  formatFormulaDieDisplayTerm,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../shared";
import { getSkillRowsByAbility, type SkillRow, type SkillRowsByAbility } from "../skills";

export type CombatSummarySkillReferenceDetailCard = {
  label: string;
  value: string;
  breakdown?: string;
  variant?: "default" | "formula";
};

export type CombatSummarySkillReference = {
  indicators?: FeatureIndicator[];
  reliableTalentD20Minimum: number | null;
  descriptionAdditions?: ReturnType<typeof getSkillReferenceDescriptionAdditionsForCharacter>;
  detailCards: CombatSummarySkillReferenceDetailCard[];
  rollModifier: number;
  rollDescription?: string;
  rollFormula: string;
  rollFormulaDisplay: string;
  additionalBonusLabels: string[];
  hasAdditionalBonuses: boolean;
};

export type ProficiencySummarySection = {
  title: string;
  entries: ProficiencyDisplayEntry[];
};

export type CharacterCombatSummarySkills = {
  rowsByAbility: SkillRowsByAbility[];
  indicators: ReturnType<typeof getSkillIndicatorsForCharacter>;
  referencesBySkill: Map<SkillName, CombatSummarySkillReference>;
  proficiencySections: ProficiencySummarySection[];
  getReferenceForSkill: (skillName: SkillName) => CombatSummarySkillReference | null;
};

export function getProficiencySummarySections(
  collections: CharacterProficiencyCollections,
  className?: string
): ProficiencySummarySection[] {
  const displayedWeaponProficiencyEntries = getDisplayWeaponProficiencyEntries(
    collections.weaponProficiencies,
    className
  );
  const sections: ProficiencySummarySection[] = [
    {
      title: "Skill Proficiencies",
      entries: getDisplaySkillProficiencyEntries(collections.skillProficiencies)
    },
    {
      title: "Saving Throws",
      entries: getDisplaySavingThrowProficiencyEntries(collections.savingThrowProficiencies)
    },
    {
      title: "Weapon Proficiencies",
      entries: displayedWeaponProficiencyEntries.filter(
        (entry) => !isWeaponMasteryProficiency(entry.proficiency)
      )
    },
    {
      title: "Weapon Masteries",
      entries: displayedWeaponProficiencyEntries.filter((entry) =>
        isWeaponMasteryProficiency(entry.proficiency)
      )
    },
    {
      title: "Armor Training",
      entries: getDisplayArmorProficiencyEntries(collections.armorProficiencies)
    },
    {
      title: "Tool Proficiencies",
      entries: getDisplayToolProficiencyEntries(collections.toolProficiencies)
    },
    {
      title: "Languages",
      entries: getDisplayLanguageProficiencyEntries(collections.languageProficiencies)
    }
  ];

  return sections.filter((section) => section.entries.length > 0);
}

function formatSkillRollFormula(
  modifier: number,
  d20Minimum: number | null,
  formulaTerms: string[] = []
): string {
  const d20Term = d20Minimum ? `1d20m${d20Minimum}` : "1d20";
  const d20Formula =
    modifier === 0 ? d20Term : `${d20Term} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;

  return formatFormulaTerms([d20Formula, ...formulaTerms]);
}

function getSkillRollFormulaTerms(row: SkillRow): string[] {
  return row.bonusEntries
    .map(formatCustomTraitBonusRollFormulaTerm)
    .filter((entry): entry is string => Boolean(entry));
}

function getSkillFormulaDisplayTerms(row: SkillRow, d20Minimum: number | null = null): string[] {
  const d20Term = formatFormulaDieDisplayTerm(
    "1d20",
    d20Minimum ? [{ kind: "minimum", value: d20Minimum }] : []
  );
  const terms = [d20Term, formatSignedFormulaTerm(row.abilityModifierBase, row.abilityLabel)];

  row.abilityModifierBonusEntries.forEach((entry) => {
    terms.push(entry.formulaLabel ?? formatSignedFormulaTerm(entry.value, entry.label));
  });

  if (row.proficiencyMultiplier === 1) {
    terms.push(formatSignedFormulaTerm(row.proficiencyContribution, "Proficiency Bonus"));
  } else if (row.proficiencyMultiplier === 2) {
    terms.push(formatSignedFormulaTerm(row.proficiencyContribution, "Proficiency Bonus x2"));
  }

  row.bonusEntries.forEach((entry) => {
    terms.push(entry.formulaLabel ?? formatSignedFormulaTerm(entry.value, entry.label));
  });

  return terms;
}

function getSkillReferenceDetailCards({
  row,
  rollFormula,
  d20Minimum
}: {
  row: SkillRow;
  rollFormula: string;
  d20Minimum: number | null;
}): CombatSummarySkillReferenceDetailCard[] {
  const formulaCell = formatFormulaCell({
    formula: rollFormula,
    displayTerms: getSkillFormulaDisplayTerms(row, d20Minimum),
    resultLabel: row.name
  });

  return [
    {
      label: "Formula",
      value: formulaCell.value,
      breakdown: formulaCell.breakdown,
      variant: "formula"
    }
  ];
}

function createSkillReference(
  character: Character,
  row: SkillRow,
  indicators: ReturnType<typeof getSkillIndicatorsForCharacter>
): CombatSummarySkillReference {
  const additionalBonusLabels = [
    ...row.abilityModifierBonusEntries.map((entry) => entry.label),
    ...row.bonusEntries.map((entry) => entry.label)
  ];
  const reliableTalentD20Minimum = getSkillRollD20MinimumForCharacter(character, row.name);
  const skillDescriptionAdditions = getSkillReferenceDescriptionAdditionsForCharacter(
    character,
    row.name
  );
  const skillFormulaTerms = getSkillRollFormulaTerms(row);
  const skillRollFormula = formatSkillRollFormula(
    row.totalModifier,
    reliableTalentD20Minimum,
    skillFormulaTerms
  );
  const detailCards = getSkillReferenceDetailCards({
    row,
    rollFormula: skillRollFormula,
    d20Minimum: reliableTalentD20Minimum
  });
  const skillFormulaDescription =
    typeof detailCards[0]?.value === "string" ? detailCards[0].value : undefined;

  return {
    indicators: indicators[row.name],
    reliableTalentD20Minimum,
    descriptionAdditions: skillDescriptionAdditions,
    detailCards,
    rollModifier: row.totalModifier,
    rollDescription: skillFormulaDescription,
    rollFormula: skillRollFormula,
    rollFormulaDisplay: skillRollFormula,
    additionalBonusLabels,
    hasAdditionalBonuses: additionalBonusLabels.length > 0
  };
}

export function createCombatSummarySkills(
  character: Character,
  skillProficiencies: SkillProficiencyEntry[] = character.skillProficiencies
): CharacterCombatSummarySkills {
  const proficiencyRuntime = getProficiencyRuntimeForCharacter(character);
  const resolvedSkillProficiencies =
    skillProficiencies === character.skillProficiencies
      ? proficiencyRuntime.collections.skillProficiencies
      : skillProficiencies;
  const indicators = getSkillIndicatorsForCharacter(character);
  const rowsByAbility = getSkillRowsByAbility(character, resolvedSkillProficiencies);
  const referencesBySkill = new Map<SkillName, CombatSummarySkillReference>();
  const collections =
    skillProficiencies === character.skillProficiencies
      ? proficiencyRuntime.collections
      : {
          ...proficiencyRuntime.collections,
          skillProficiencies
        };

  rowsByAbility.forEach((group) => {
    group.rows.forEach((row) => {
      referencesBySkill.set(row.name, createSkillReference(character, row, indicators));
    });
  });

  return {
    rowsByAbility,
    indicators,
    referencesBySkill,
    proficiencySections: getProficiencySummarySections(collections, character.className),
    getReferenceForSkill: (skillName) => referencesBySkill.get(skillName) ?? null
  };
}
