import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, ToolProficiencyEntry } from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  TOOL_PROFICIENCY
} from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { getAbilityModifierBreakdownForCharacter } from "../../../abilities";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getProficiencyBonus } from "../../../gameplay";
import type { WeaponAction } from "../../../gameplay";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { CoreStatIndicatorMap, FeatureActionCard, FeatureActionFact } from "../../types";
import type { RogueSneakAttackEffectKey } from "../types";
import { rogueSneakAttackActionKey, rogueSteadyAimActionKey } from "../actionKeys";

export const assassinSubclassId = "rogue-assassin";

const assassinateSource = "Assassinate";
const assassinsToolsSource = "Assassin's Tools";
const surprisingStrikesSource = "Surprising Strikes";
const rovingAimSource = "Roving Aim";
const envenomWeaponsSource = "Envenom Weapons";
const assassinSubclassEntry = getSubclassEntryById(assassinSubclassId);
const assassinateAdvantageIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: assassinateSource
};

type RogueAssassinCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "feats" | "level" | "statusEntries" | "subclassId"
    >
  >;

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
  character: RogueAssassinCharacter,
  action: WeaponAction,
  feature: CLASS_FEATURE,
  descriptionEntries: readonly string[]
): WeaponAction {
  if (
    (action.attackKind !== "weapon" && action.attackKind !== "unarmed") ||
    descriptionEntries.length === 0
  ) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(action, character, feature, descriptionEntries);
}

function createDefaultFeatureActionFacts(action: FeatureActionCard): FeatureActionFact[] {
  if (action.facts && action.facts.length > 0) {
    return [...action.facts];
  }

  return action.valueLabel
    ? [
        {
          label: "Value",
          value: action.valueLabel
        }
      ]
    : [];
}

function getRogueAssassinDeathStrikeSavingThrowFormulaFact(
  character: RogueAssassinCharacter
): FeatureActionFact {
  const dexterityModifier = getAbilityModifierBreakdownForCharacter(character, "DEX").total;
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const saveDc = 8 + dexterityModifier + proficiencyBonus;

  return {
    label: "Death Strike Saving Throw Formula",
    value: `Constitution DC ${saveDc} = DC 8 + ${dexterityModifier} DEX + ${proficiencyBonus} Prof. Bonus`,
    fullWidth: true
  };
}

function appendUniqueFeatureActionFact(
  action: FeatureActionCard,
  fact: FeatureActionFact
): FeatureActionCard {
  const drawerFacts = action.drawer?.facts;
  const facts = drawerFacts ? [...drawerFacts] : createDefaultFeatureActionFacts(action);

  if (facts.some((entry) => entry.label === fact.label)) {
    return drawerFacts ? { ...action, drawer: { ...action.drawer!, facts } } : { ...action, facts };
  }

  const nextFacts = [...facts, fact];

  if (drawerFacts) {
    return {
      ...action,
      drawer: {
        ...action.drawer!,
        facts: nextFacts
      }
    };
  }

  return {
    ...action,
    facts: nextFacts
  };
}

function appendFeatureActionDescriptionSection(
  character: RogueAssassinCharacter,
  action: FeatureActionCard,
  actionKey: string,
  feature: CLASS_FEATURE,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(action, character, feature, descriptionEntries);
}

function createRogueAssassinLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource(input)
  };
}

function createRogueAssassinAssassinateContribution(
  character: RogueAssassinCharacter
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "rogue-assassin-assassinate",
      label: assassinateSource,
      entryId: CLASS_FEATURE.ASSASSINATE
    }),
    coreStatIndicators: getRogueAssassinCoreStatIndicators(character),
    weaponActionTransforms: [
      {
        id: "rogue-assassin-assassinate-weapon-transform",
        transform: (_character: Character, action: unknown) =>
          appendWeaponDescriptionSection(
            character,
            action as WeaponAction,
            CLASS_FEATURE.ASSASSINATE,
            surprisingStrikesDescription
          )
      }
    ],
    featureActionTransforms: [
      {
        id: "rogue-assassin-assassinate-feature-action-transform",
        transform: (action) =>
          appendFeatureActionDescriptionSection(
            character,
            action,
            rogueSneakAttackActionKey,
            CLASS_FEATURE.ASSASSINATE,
            surprisingStrikesDescription
          )
      }
    ]
  };
}

function createRogueAssassinToolsContribution(
  character: RogueAssassinCharacter
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "rogue-assassin-assassins-tools",
      label: assassinsToolsSource,
      entryId: CLASS_FEATURE.ASSASSINS_TOOLS
    }),
    toolProficiencyEntries: getRogueAssassinToolProficiencyEntries(character)
  };
}

function createRogueAssassinInfiltrationExpertiseContribution(
  character: RogueAssassinCharacter
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "rogue-assassin-infiltration-expertise",
      label: "Infiltration Expertise",
      entryId: CLASS_FEATURE.INFILTRATION_EXPERTISE
    }),
    featureActionTransforms: [
      {
        id: "rogue-assassin-roving-aim-feature-action-transform",
        transform: (action) =>
          appendFeatureActionDescriptionSection(
            character,
            action,
            rogueSteadyAimActionKey,
            CLASS_FEATURE.INFILTRATION_EXPERTISE,
            rovingAimDescription
          )
      }
    ]
  };
}

function createRogueAssassinDeathStrikeContribution(
  character: RogueAssassinCharacter
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "rogue-assassin-death-strike",
      label: "Death Strike",
      entryId: CLASS_FEATURE.DEATH_STRIKE
    }),
    featureActionTransforms: [
      {
        id: "rogue-assassin-death-strike-feature-action-transform",
        transform: (action) => {
          const actionWithDescription = appendFeatureActionDescriptionSection(
            character,
            action,
            rogueSneakAttackActionKey,
            CLASS_FEATURE.DEATH_STRIKE,
            deathStrikeDescription
          );

          return actionWithDescription.key === rogueSneakAttackActionKey
            ? appendUniqueFeatureActionFact(
                actionWithDescription,
                getRogueAssassinDeathStrikeSavingThrowFormulaFact(character)
              )
            : actionWithDescription;
        }
      }
    ]
  };
}

function collectRogueAssassinFeatureContributions(
  character: RogueAssassinCharacter
): FeatureContributionSpec[] {
  if (!hasRogueAssassinFeature(character, 3)) {
    return [];
  }

  const contributions: FeatureContributionSpec[] = [
    createRogueAssassinAssassinateContribution(character),
    createRogueAssassinToolsContribution(character)
  ];

  if (hasRogueAssassinInfiltrationExpertise(character)) {
    contributions.push(createRogueAssassinInfiltrationExpertiseContribution(character));
  }

  if (hasRogueAssassinEnvenomWeapons(character)) {
    contributions.push(
      createRogueAssassinLocalHookContribution({
        id: "rogue-assassin-envenom-weapons",
        label: envenomWeaponsSource,
        entryId: CLASS_FEATURE.ENVENOM_WEAPONS
      })
    );
  }

  if (hasRogueAssassinDeathStrike(character)) {
    contributions.push(createRogueAssassinDeathStrikeContribution(character));
  }

  return contributions;
}

export const getRogueAssassinDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectRogueAssassinFeatureContributions(character)),
    {
      character: character as Character
    }
  );

export function getRogueAssassinSneakAttackEffectDescriptionAdditions(
  character: RogueAssassinCharacter,
  effectKey: RogueSneakAttackEffectKey
): string[] {
  if (!hasRogueAssassinEnvenomWeapons(character) || effectKey !== "poison") {
    return [];
  }

  return createFeatureSourcedDescriptionEntries(
    character,
    CLASS_FEATURE.ENVENOM_WEAPONS,
    envenomWeaponsDescription,
    envenomWeaponsSource
  ).filter((entry): entry is string => typeof entry === "string");
}
