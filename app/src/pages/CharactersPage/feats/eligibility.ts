import { ARMOR_PROFICIENCY, PROF_LEVEL, type Character } from "../../../types";
import { getAbilityScoresForCharacter } from "../abilities";
import type { FeatDefinition, FeatProficiencyRequirement, FeatRequirement } from "./types";
import { formatCodexLabel } from "../../../utils/codex";
import {
  getArmorLevelFromEntries,
  getLanguageLevelFromEntries,
  getProficiencyLabel,
  getSavingThrowLevelFromEntries,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  getToolLevelFromEntries,
  getWeaponLevelFromEntries
} from "../proficiency";
import { isSpellcastingClass } from "../spellcasting";

export type FeatEligibilityResult = {
  isEligible: boolean;
  unmetRequirements: string[];
};

const abilityNameToKey = {
  Strength: "STR",
  Dexterity: "DEX",
  Constitution: "CON",
  Intelligence: "INT",
  Wisdom: "WIS",
  Charisma: "CHA"
} as const;

const abilityNamePattern = Object.keys(abilityNameToKey).join("|");
const abilityRequirementPattern = new RegExp(
  `((?:${abilityNamePattern})(?:(?:,\\s*|\\s+or\\s+|,\\s+or\\s+)(?:${abilityNamePattern}))*)\\s+(\\d+)\\+`,
  "g"
);

function getFeatRequirementProficiencyLabel(requirement: FeatProficiencyRequirement): string {
  if (requirement.kind === "skill") {
    return requirement.proficiency;
  }

  return getProficiencyLabel(requirement.proficiency);
}

function parseAbilityRequirementNames(value: string): Array<keyof typeof abilityNameToKey> {
  return value
    .replace(/,\s*or\s+/g, ",")
    .replace(/\s+or\s+/g, ",")
    .split(/\s*,\s*/)
    .filter((ability): ability is keyof typeof abilityNameToKey => ability in abilityNameToKey);
}

function parseFeatPrerequisiteRequirements(prerequisite?: string): FeatRequirement[] {
  if (!prerequisite) {
    return [];
  }

  const requirements: FeatRequirement[] = [];
  const levelMatch = prerequisite.match(/Level\s+(\d+)\+/i);

  if (levelMatch) {
    requirements.push({
      type: "minimum-level",
      level: Number(levelMatch[1])
    });
  }

  for (const match of prerequisite.matchAll(abilityRequirementPattern)) {
    const abilityNames = parseAbilityRequirementNames(match[1]);
    const score = Number(match[2]);

    if (abilityNames.length > 0 && Number.isFinite(score)) {
      requirements.push({
        type: "minimum-ability-score",
        abilities: abilityNames.map((abilityName) => abilityNameToKey[abilityName]),
        score
      });
    }
  }

  if (/Spellcasting|Pact Magic/i.test(prerequisite)) {
    requirements.push({
      type: "spellcasting-or-pact-magic"
    });
  }

  if (/Light Armor Training/i.test(prerequisite)) {
    requirements.push({
      type: "proficiency",
      proficiency: {
        kind: "armor",
        proficiency: ARMOR_PROFICIENCY.LIGHT
      }
    });
  }

  if (/Medium Armor Training/i.test(prerequisite)) {
    requirements.push({
      type: "proficiency",
      proficiency: {
        kind: "armor",
        proficiency: ARMOR_PROFICIENCY.MEDIUM
      }
    });
  }

  if (/Heavy Armor Training/i.test(prerequisite)) {
    requirements.push({
      type: "proficiency",
      proficiency: {
        kind: "armor",
        proficiency: ARMOR_PROFICIENCY.HEAVY
      }
    });
  }

  if (/Shield Training/i.test(prerequisite)) {
    requirements.push({
      type: "proficiency",
      proficiency: {
        kind: "armor",
        proficiency: ARMOR_PROFICIENCY.SHIELD
      }
    });
  }

  return requirements;
}

export function getFeatRequirements(definition: FeatDefinition): FeatRequirement[] {
  return definition.requirements ?? parseFeatPrerequisiteRequirements(definition.prerequisite);
}

function hasRequiredProficiency(
  character: Character,
  requirement: FeatProficiencyRequirement
): boolean {
  if (requirement.kind === "armor") {
    return (
      getArmorLevelFromEntries(character.armorProficiencies, requirement.proficiency) !==
      PROF_LEVEL.NONE
    );
  }

  if (requirement.kind === "language") {
    return (
      getLanguageLevelFromEntries(character.languageProficiencies, requirement.proficiency) !==
      PROF_LEVEL.NONE
    );
  }

  if (requirement.kind === "savingThrow") {
    return (
      getSavingThrowLevelFromEntries(
        character.savingThrowProficiencies,
        requirement.proficiency
      ) !== PROF_LEVEL.NONE
    );
  }

  if (requirement.kind === "skill") {
    const skillProficiency = getSkillProficiencyForName(requirement.proficiency);

    return (
      skillProficiency !== null &&
      getSkillLevelFromEntries(character.skillProficiencies, skillProficiency) !== PROF_LEVEL.NONE
    );
  }

  if (requirement.kind === "tool") {
    return (
      getToolLevelFromEntries(character.toolProficiencies, requirement.proficiency) !==
      PROF_LEVEL.NONE
    );
  }

  return (
    getWeaponLevelFromEntries(character.weaponProficiencies, requirement.proficiency) !==
    PROF_LEVEL.NONE
  );
}

function formatAbilityRequirementLabel(
  requirement: Extract<FeatRequirement, { type: "minimum-ability-score" }>
): string {
  return `${requirement.abilities.join(" or ")} ${requirement.score}`;
}

function hasRequiredFeat(
  character: Character,
  feat: Extract<FeatRequirement, { type: "feat" }>["feat"]
): boolean {
  return Array.isArray(character.feats) && character.feats.some((entry) => entry.feat === feat);
}

function isFeatRequirementMet(
  character: Character,
  abilityScores: ReturnType<typeof getAbilityScoresForCharacter>,
  requirement: FeatRequirement
): boolean {
  if (requirement.type === "minimum-level") {
    return character.level >= requirement.level;
  }

  if (requirement.type === "minimum-ability-score") {
    return requirement.abilities.some((ability) => abilityScores[ability] >= requirement.score);
  }

  if (requirement.type === "proficiency") {
    return hasRequiredProficiency(character, requirement.proficiency);
  }

  if (requirement.type === "spellcasting-or-pact-magic") {
    return isSpellcastingClass(
      character.className,
      character.level,
      character.subclassId,
      character.customClass,
      character.classRules
    );
  }

  if (requirement.type === "feat") {
    return hasRequiredFeat(character, requirement.feat);
  }

  return requirement.requirements.some((nestedRequirement) =>
    isFeatRequirementMet(character, abilityScores, nestedRequirement)
  );
}

function formatFeatRequirementLabel(requirement: FeatRequirement): string {
  if (requirement.type === "minimum-level") {
    return `level ${requirement.level}`;
  }

  if (requirement.type === "minimum-ability-score") {
    return formatAbilityRequirementLabel(requirement);
  }

  if (requirement.type === "proficiency") {
    return `${getFeatRequirementProficiencyLabel(requirement.proficiency)} proficiency`;
  }

  if (requirement.type === "spellcasting-or-pact-magic") {
    return "Spellcasting or Pact Magic";
  }

  if (requirement.type === "feat") {
    return `${formatCodexLabel(requirement.feat)} feat`;
  }

  return requirement.requirements.map(formatFeatRequirementLabel).join(" or ");
}

function getUnmetRequirementMessages(
  character: Character,
  abilityScores: ReturnType<typeof getAbilityScoresForCharacter>,
  requirement: FeatRequirement
): string[] {
  if (isFeatRequirementMet(character, abilityScores, requirement)) {
    return [];
  }

  if (requirement.type === "minimum-level") {
    return [`Requires level ${requirement.level}.`];
  }

  if (requirement.type === "minimum-ability-score") {
    return [`Requires ${formatAbilityRequirementLabel(requirement)}.`];
  }

  if (requirement.type === "proficiency") {
    return [`Requires ${getFeatRequirementProficiencyLabel(requirement.proficiency)} proficiency.`];
  }

  if (requirement.type === "spellcasting-or-pact-magic") {
    return ["Requires Spellcasting or Pact Magic."];
  }

  if (requirement.type === "feat") {
    return [`Requires ${formatCodexLabel(requirement.feat)} feat.`];
  }

  return [`Requires ${formatFeatRequirementLabel(requirement)}.`];
}

export function getFeatEligibilityForCharacter(
  character: Character,
  definition: FeatDefinition
): FeatEligibilityResult {
  const abilityScores = getAbilityScoresForCharacter(character);
  const unmetRequirements = getFeatRequirements(definition).flatMap((requirement) =>
    getUnmetRequirementMessages(character, abilityScores, requirement)
  );

  return {
    isEligible: unmetRequirements.length === 0,
    unmetRequirements
  };
}
