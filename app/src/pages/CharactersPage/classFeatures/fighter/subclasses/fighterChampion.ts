import { CLASS_FEATURE } from "../../../../../codex/entries";
import {
  fighterChampionImprovedCriticalDescription,
  fighterChampionSuperiorCriticalDescription
} from "../../../../../codex/subclasses/fighterChampion";
import { SKILL, type Character } from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { restoreHeroicInspirationForCharacter } from "../../../heroicInspiration";
import type { WeaponAction } from "../../../gameplay";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { CoreStatIndicatorMap, SkillIndicatorMap } from "../../types";

export const championSubclassId = "fighter-champion";

const improvedCriticalSource = "Improved Critical";
const remarkableAthleteSource = "Remarkable Athlete";
const superiorCriticalSource = "Superior Critical";
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

function appendWeaponDescriptionSection(
  action: WeaponAction,
  sourceName: string,
  descriptionEntries: string[]
): WeaponAction {
  return appendSourcedDescriptionAddition(action, sourceName, descriptionEntries);
}

function getRemarkableAthleteCriticalHitDescription(
  character: Parameters<SubclassRuntimeResolver>[0]
): string[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.REMARKABLE_ATHLETE).filter(
    (entry): entry is string => typeof entry === "string" && entry.includes("Critical Hit")
  );
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
  const remarkableAthleteDescription = hasFighterChampionRemarkableAthlete(character)
    ? getRemarkableAthleteCriticalHitDescription(character)
    : [];

  return {
    coreStatIndicators: getFighterChampionCoreStatIndicators(character),
    skillIndicators: getFighterChampionSkillIndicators(character),
    transformWeaponAction: (action) =>
      appendWeaponDescriptionSection(
        appendWeaponDescriptionSection(action, criticalFeatureSource, criticalFeatureDescription),
        remarkableAthleteSource,
        remarkableAthleteDescription
      )
  };
};

export function advanceFighterChampionFeaturesForNewRound(character: Character): Character {
  if (!hasFighterChampionHeroicWarrior(character) || character.heroicInspiration) {
    return character;
  }

  return restoreHeroicInspirationForCharacter(character);
}
