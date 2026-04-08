import {
  fighterChampionImprovedCriticalDescription,
  fighterChampionSuperiorCriticalDescription
} from "../../../../../codex/subclasses/fighterChampion";
import { SKILL, type Character } from "../../../../../types";
import { restoreHeroicInspirationForCharacter } from "../../../heroicInspiration";
import type { WeaponAction } from "../../../gameplay";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { CoreStatIndicatorMap, SkillIndicatorMap } from "../../types";

export const championSubclassId = "fighter-champion";

const improvedCriticalSource = "Improved Critical";
const superiorCriticalSource = "Superior Critical";
const featureDescriptionDivider = "--------------------";
const remarkableAthleteAdvantageIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: "Remarkable Athlete"
};

function hasFighterChampionImprovedCritical(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === championSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasFighterChampionRemarkableAthlete(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === championSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasFighterChampionSuperiorCritical(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === championSubclassId &&
    (character.level ?? 0) >= 15
  );
}

function hasFighterChampionHeroicWarrior(
  character: Pick<Character, "className" | "subclassId" | "level">
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === championSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function getFighterChampionCoreStatIndicators(
  character: Parameters<SubclassRuntimeResolver>[0]
): CoreStatIndicatorMap {
  if (!hasFighterChampionRemarkableAthlete(character)) {
    return {};
  }

  return {
    initiative: [remarkableAthleteAdvantageIndicator]
  };
}

function getFighterChampionSkillIndicators(
  character: Parameters<SubclassRuntimeResolver>[0]
): SkillIndicatorMap {
  if (!hasFighterChampionRemarkableAthlete(character)) {
    return {};
  }

  return {
    [SKILL.ATHLETICS]: [remarkableAthleteAdvantageIndicator]
  };
}

function createDescriptionSection(sourceName: string, descriptionEntries: string[]) {
  const [firstEntry, ...remainingEntries] = descriptionEntries;

  if (!firstEntry) {
    return [];
  }

  return [`<strong>${sourceName}.</strong> ${firstEntry}`, ...remainingEntries];
}

function appendWeaponDescriptionSection(
  action: WeaponAction,
  sourceName: string,
  descriptionEntries: string[]
): WeaponAction {
  const marker = `<strong>${sourceName}.<\/strong>`;
  const existingDescription = action.description?.length ? [...action.description] : [];
  const hasSection = existingDescription.some(
    (entry) => typeof entry === "string" && entry.includes(marker)
  );

  if (hasSection) {
    return action;
  }

  const section = createDescriptionSection(sourceName, descriptionEntries);

  if (section.length === 0) {
    return action;
  }

  return {
    ...action,
    description:
      existingDescription.length > 0
        ? [...existingDescription, featureDescriptionDivider, ...section]
        : section
  };
}

export const getFighterChampionDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasFighterChampionImprovedCritical(character)) {
    return {};
  }

  const criticalFeatureSource = hasFighterChampionSuperiorCritical(character)
    ? superiorCriticalSource
    : improvedCriticalSource;
  const criticalFeatureDescription = hasFighterChampionSuperiorCritical(character)
    ? fighterChampionSuperiorCriticalDescription
    : fighterChampionImprovedCriticalDescription;

  return {
    coreStatIndicators: getFighterChampionCoreStatIndicators(character),
    skillIndicators: getFighterChampionSkillIndicators(character),
    transformWeaponAction: (action) =>
      appendWeaponDescriptionSection(
        action,
        criticalFeatureSource,
        criticalFeatureDescription
      )
  };
};

export function advanceFighterChampionFeaturesForNewRound(character: Character): Character {
  if (!hasFighterChampionHeroicWarrior(character) || character.heroicInspiration) {
    return character;
  }

  return restoreHeroicInspirationForCharacter(character);
}
