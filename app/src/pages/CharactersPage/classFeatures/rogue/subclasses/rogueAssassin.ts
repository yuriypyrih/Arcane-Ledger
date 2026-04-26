import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, ToolProficiencyEntry } from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  TOOL_PROFICIENCY
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { CoreStatIndicatorMap, FeatureActionCard } from "../../types";
import type { RogueSneakAttackEffectKey } from "../types";
import { rogueSneakAttackActionKey, rogueSteadyAimActionKey } from "../rogue";

export const assassinSubclassId = "rogue-assassin";

const assassinateSource = "Assassinate";
const assassinsToolsSource = "Assassin's Tools";
const surprisingStrikesSource = "Surprising Strikes";
const rovingAimSource = "Roving Aim";
const envenomWeaponsSource = "Envenom Weapons";
const deathStrikeSource = "Death Strike";
const assassinSubclassEntry = getSubclassEntryById(assassinSubclassId);
const assassinateAdvantageIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: assassinateSource
};

type RogueAssassinCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId">>;

function hasRogueAssassinFeature(character: RogueAssassinCharacter, minimumLevel: number): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === assassinSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function hasRogueAssassinInfiltrationExpertise(character: RogueAssassinCharacter): boolean {
  return hasRogueAssassinFeature(character, 9);
}

export function hasRogueAssassinEnvenomWeapons(character: RogueAssassinCharacter): boolean {
  return hasRogueAssassinFeature(character, 13);
}

export function hasRogueAssassinDeathStrike(character: RogueAssassinCharacter): boolean {
  return hasRogueAssassinFeature(character, 17);
}

function getRogueAssassinFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = assassinSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

function extractFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.startsWith(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}

function stripFeatureDescriptionHeading(description: readonly string[], heading: string): string[] {
  const [firstEntry, ...remainingEntries] = description;

  if (!firstEntry) {
    return [];
  }

  const normalizedFirstEntry = firstEntry.replace(heading, "").trim();

  return [...(normalizedFirstEntry ? [normalizedFirstEntry] : []), ...remainingEntries];
}

const assassinateDescription = getRogueAssassinFeatureDescriptionEntries(CLASS_FEATURE.ASSASSINATE);
const infiltrationExpertiseDescription = getRogueAssassinFeatureDescriptionEntries(
  CLASS_FEATURE.INFILTRATION_EXPERTISE
);
const envenomWeaponsDescription = getRogueAssassinFeatureDescriptionEntries(
  CLASS_FEATURE.ENVENOM_WEAPONS
);
const deathStrikeDescription = getRogueAssassinFeatureDescriptionEntries(
  CLASS_FEATURE.DEATH_STRIKE
);
const surprisingStrikesDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    assassinateDescription,
    `<strong>${surprisingStrikesSource}.</strong>`
  ),
  `<strong>${surprisingStrikesSource}.</strong>`
);
const rovingAimDescription = stripFeatureDescriptionHeading(
  extractFeatureDescriptionSection(
    infiltrationExpertiseDescription,
    `<strong>${rovingAimSource}.</strong>`
  ),
  `<strong>${rovingAimSource}.</strong>`
);

function createSourcedDescriptionEntries(
  sourceName: string,
  descriptionEntries: readonly string[]
): string[] {
  const [firstEntry, ...remainingEntries] = descriptionEntries;

  if (!firstEntry) {
    return [];
  }

  return [`<strong>${sourceName}.</strong> ${firstEntry}`, ...remainingEntries];
}

function getRogueAssassinCoreStatIndicators(
  character: RogueAssassinCharacter
): CoreStatIndicatorMap {
  if (!hasRogueAssassinFeature(character, 3)) {
    return {};
  }

  return {
    initiative: [assassinateAdvantageIndicator]
  };
}

function getRogueAssassinToolProficiencyEntries(
  character: RogueAssassinCharacter
): ToolProficiencyEntry[] {
  if (!hasRogueAssassinFeature(character, 3)) {
    return [];
  }

  return [TOOL_PROFICIENCY.DISGUISE_KIT, TOOL_PROFICIENCY.POISONERS_KIT].map((proficiency) => ({
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: assassinsToolsSource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  }));
}

function appendWeaponDescriptionSection(
  action: WeaponAction,
  sourceName: string,
  descriptionEntries: readonly string[]
): WeaponAction {
  if (action.attackKind !== "weapon" || descriptionEntries.length === 0) {
    return action;
  }

  return appendSourcedDescriptionAddition(action, sourceName, descriptionEntries);
}

function appendFeatureActionDescriptionSection(
  action: FeatureActionCard,
  actionKey: string,
  sourceName: string,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendSourcedDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    sourceName,
    descriptionEntries
  );
}

function transformRogueAssassinFeatureAction(
  character: RogueAssassinCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  let nextAction = action;

  if (hasRogueAssassinInfiltrationExpertise(character)) {
    nextAction = appendFeatureActionDescriptionSection(
      nextAction,
      rogueSteadyAimActionKey,
      rovingAimSource,
      rovingAimDescription
    );
  }

  if (hasRogueAssassinDeathStrike(character)) {
    nextAction = appendFeatureActionDescriptionSection(
      nextAction,
      rogueSneakAttackActionKey,
      deathStrikeSource,
      deathStrikeDescription
    );
  }

  return nextAction;
}

export const getRogueAssassinDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasRogueAssassinFeature(character, 3)
    ? {
        coreStatIndicators: getRogueAssassinCoreStatIndicators(character),
        toolProficiencyEntries: getRogueAssassinToolProficiencyEntries(character),
        transformWeaponAction: (action) =>
          appendWeaponDescriptionSection(
            action,
            surprisingStrikesSource,
            surprisingStrikesDescription
          ),
        transformFeatureAction:
          hasRogueAssassinInfiltrationExpertise(character) || hasRogueAssassinDeathStrike(character)
            ? (action) => transformRogueAssassinFeatureAction(character, action)
            : undefined
      }
    : {};

export function getRogueAssassinSneakAttackEffectDescriptionAdditions(
  character: RogueAssassinCharacter,
  effectKey: RogueSneakAttackEffectKey
): string[] {
  if (!hasRogueAssassinEnvenomWeapons(character) || effectKey !== "poison") {
    return [];
  }

  return createSourcedDescriptionEntries(envenomWeaponsSource, envenomWeaponsDescription);
}
