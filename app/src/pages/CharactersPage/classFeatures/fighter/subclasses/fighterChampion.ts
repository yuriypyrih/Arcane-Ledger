import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import {
  fighterChampionImprovedCriticalDescription,
  fighterChampionSuperiorCriticalDescription
} from "../../../../../codex/subclasses/fighterChampion";
import { SKILL, type Character } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { isCharacterBloodied } from "../../../bloodied";
import { normalizeRoundTracker } from "../../../combat";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { restoreHeroicInspirationForCharacter } from "../../../heroicInspiration";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
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

export function hasFighterChampionSurvivorFeature(
  character: Partial<Pick<Character, "className" | "subclassId" | "level">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === championSubclassId &&
    (character.level ?? 0) >= 18
  );
}

function getFighterChampionSurvivorSectionDescription(
  character: Parameters<SubclassRuntimeResolver>[0],
  sectionName: string
): SpellDescriptionEntry[] {
  if (!hasFighterChampionSurvivorFeature(character)) {
    return [];
  }

  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.SURVIVOR).filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.includes(`<strong>${sectionName}.</strong>`)
  );
}

export function getFighterChampionSurvivorDefyDeathDescription(
  character: Parameters<SubclassRuntimeResolver>[0]
): SpellDescriptionEntry[] {
  return getFighterChampionSurvivorSectionDescription(character, "Defy Death");
}

export function getFighterChampionSurvivorHeroicRallyDescription(
  character: Parameters<SubclassRuntimeResolver>[0]
): SpellDescriptionEntry[] {
  return getFighterChampionSurvivorSectionDescription(character, "Heroic Rally");
}

export function isFighterChampionHeroicRallyActive(character: Character): boolean {
  return (
    hasFighterChampionSurvivorFeature(character) &&
    normalizeRoundTracker(character.roundTracker).isInCombat &&
    isCharacterBloodied(character)
  );
}

function applyFighterChampionHeroicRallyForNewRound(character: Character): Character {
  if (!isFighterChampionHeroicRallyActive(character)) {
    return character;
  }

  const healingAmount = Math.max(0, 5 + getAbilityModifierForCharacter(character, "CON"));

  if (healingAmount <= 0) {
    return character;
  }

  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(character);
  const nextCurrentHitPoints = Math.min(
    effectiveHitPointMaximum,
    character.currentHitPoints + healingAmount
  );

  return nextCurrentHitPoints === character.currentHitPoints
    ? character
    : reconcileCharacterStatusConsequences({
        ...character,
        currentHitPoints: nextCurrentHitPoints
      });
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
  character: Parameters<SubclassRuntimeResolver>[0],
  action: WeaponAction,
  feature: CLASS_FEATURE,
  descriptionEntries: string[],
  sourceName: string
): WeaponAction {
  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    feature,
    descriptionEntries,
    sourceName
  );
}

function getRemarkableAthleteCriticalHitDescription(
  character: Parameters<SubclassRuntimeResolver>[0]
): string[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.REMARKABLE_ATHLETE).filter(
    (entry): entry is string => typeof entry === "string" && entry.includes("Critical Hit")
  );
}

export function collectFighterChampionContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasFighterChampionImprovedCritical(character)) {
    return [];
  }

  const criticalFeatureSource = hasFighterChampionSuperiorCritical(character)
    ? superiorCriticalSource
    : improvedCriticalSource;
  const criticalFeature = hasFighterChampionSuperiorCritical(character)
    ? CLASS_FEATURE.SUPERIOR_CRITICAL
    : CLASS_FEATURE.IMPROVED_CRITICAL;
  const criticalFeatureDescription = hasFighterChampionSuperiorCritical(character)
    ? fighterChampionSuperiorCriticalDescription
    : fighterChampionImprovedCriticalDescription;
  const remarkableAthleteDescription = hasFighterChampionRemarkableAthlete(character)
    ? getRemarkableAthleteCriticalHitDescription(character)
    : [];

  return [
    {
      source: createSubclassContributionSource({
        id: `${championSubclassId}-${criticalFeature.toLowerCase().replace(/_/g, "-")}`,
        label: criticalFeatureSource,
        entryId: criticalFeature
      }),
      weaponActionTransforms: [
        {
          id: `${championSubclassId}-critical-weapon-action-transform`,
          transform: (_character, action) =>
            appendWeaponDescriptionSection(
              character,
              action as WeaponAction,
              criticalFeature,
              criticalFeatureDescription,
              criticalFeatureSource
            )
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${championSubclassId}-remarkable-athlete`,
        label: "Remarkable Athlete",
        entryId: CLASS_FEATURE.REMARKABLE_ATHLETE
      }),
      coreStatIndicators: getFighterChampionCoreStatIndicators(character),
      skillIndicators: getFighterChampionSkillIndicators(character),
      weaponActionTransforms: [
        {
          id: `${championSubclassId}-remarkable-athlete-weapon-action-transform`,
          transform: (_character, action) =>
            appendWeaponDescriptionSection(
              character,
              action as WeaponAction,
              CLASS_FEATURE.REMARKABLE_ATHLETE,
              remarkableAthleteDescription,
              remarkableAthleteSource
            )
        }
      ]
    },
    ...(hasFighterChampionHeroicWarrior({
      className: character.className,
      subclassId: character.subclassId ?? "",
      level: character.level ?? 0
    })
      ? [
          {
            source: createSubclassContributionSource({
              id: `${championSubclassId}-heroic-warrior`,
              label: "Heroic Warrior",
              entryId: CLASS_FEATURE.HEROIC_WARRIOR
            })
          }
        ]
      : []),
    ...(hasFighterChampionSurvivorFeature(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: `${championSubclassId}-survivor`,
              label: "Survivor",
              entryId: CLASS_FEATURE.SURVIVOR
            })
          }
        ]
      : [])
  ];
};

export const getFighterChampionDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectFighterChampionContributions(character)),
    {
      character: character as Character
    }
  );

export function advanceFighterChampionFeaturesForNewRound(character: Character): Character {
  let nextCharacter = applyFighterChampionHeroicRallyForNewRound(character);

  if (hasFighterChampionHeroicWarrior(nextCharacter) && !nextCharacter.heroicInspiration) {
    nextCharacter = restoreHeroicInspirationForCharacter(nextCharacter);
  }

  return nextCharacter;
}
