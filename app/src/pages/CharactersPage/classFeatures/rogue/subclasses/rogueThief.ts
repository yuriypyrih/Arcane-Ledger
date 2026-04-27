import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, SkillName } from "../../../../../types";
import { SKILL } from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard, FeatureSpeedBonus } from "../../types";
import { rogueSneakAttackActionKey } from "../rogue";
import type { RogueSneakAttackEffectDefinition } from "../types";

export const thiefSubclassId = "rogue-thief";
const fastHandsSource = "Fast Hands";
const secondStoryWorkSource = "Second-Story Work";
const thiefsReflexesSource = "Thief's Reflexes";
const thiefSubclassEntry = getSubclassEntryById(thiefSubclassId);

type RogueThiefCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId">>;

function hasRogueThiefFeature(character: RogueThiefCharacter, minimumLevel: number): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === thiefSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function hasRogueThiefSecondStoryWorkFeature(character: RogueThiefCharacter): boolean {
  return hasRogueThiefFeature(character, 3);
}

export function hasRogueThiefFastHandsFeature(character: RogueThiefCharacter): boolean {
  return hasRogueThiefFeature(character, 3);
}

export function hasRogueThiefSupremeSneakFeature(character: RogueThiefCharacter): boolean {
  return hasRogueThiefFeature(character, 9);
}

export function hasRogueThiefThiefsReflexesFeature(character: RogueThiefCharacter): boolean {
  return hasRogueThiefFeature(character, 17);
}

function getRogueThiefFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = thiefSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const fastHandsDescription = getRogueThiefFeatureDescriptionEntries(CLASS_FEATURE.FAST_HANDS);
const supremeSneakDescription = getRogueThiefFeatureDescriptionEntries(CLASS_FEATURE.SUPREME_SNEAK);
const supremeSneakEffectDescription = supremeSneakDescription.slice(1).filter(Boolean);
const thiefsReflexesDescription = getRogueThiefFeatureDescriptionEntries(
  CLASS_FEATURE.THIEFS_REFLEXES
);

export function getRogueThiefSkillReferenceDescriptionAdditions(
  character: RogueThiefCharacter,
  skill: SkillName
) {
  if (
    skill !== SKILL.SLEIGHT_OF_HAND ||
    !hasRogueThiefFastHandsFeature(character) ||
    fastHandsDescription.length === 0
  ) {
    return [];
  }

  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.FAST_HANDS,
      fastHandsDescription,
      fastHandsSource
    )
  ];
}

export function getRogueThiefInitiativeDescriptionAdditions(character: RogueThiefCharacter) {
  if (!hasRogueThiefThiefsReflexesFeature(character) || thiefsReflexesDescription.length === 0) {
    return [];
  }

  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.THIEFS_REFLEXES,
      thiefsReflexesDescription,
      thiefsReflexesSource
    )
  ];
}

function getRogueThiefSpeedBonuses(character: RogueThiefCharacter): FeatureSpeedBonus[] {
  if (!hasRogueThiefSecondStoryWorkFeature(character)) {
    return [];
  }

  return [
    {
      label: secondStoryWorkSource,
      movementType: "climb",
      value: 0,
      setBaseFromWalkMultiplier: 1
    }
  ];
}

export function getRogueThiefSneakAttackEffectDefinitions(
  character: RogueThiefCharacter
): RogueSneakAttackEffectDefinition[] {
  if (!hasRogueThiefSupremeSneakFeature(character)) {
    return [];
  }

  return [
    {
      key: "stealth-attack",
      name: "Stealth Attack",
      costDice: 1,
      referenceDescription: [...supremeSneakEffectDescription]
    }
  ];
}

function appendFeatureActionDescriptionSection(
  character: RogueThiefCharacter,
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

function transformRogueThiefFeatureAction(
  character: RogueThiefCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  return appendFeatureActionDescriptionSection(
    character,
    action,
    rogueSneakAttackActionKey,
    CLASS_FEATURE.SUPREME_SNEAK,
    supremeSneakEffectDescription
  );
}

export const getRogueThiefDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasRogueThiefSecondStoryWorkFeature(character)
    ? {
        speedBonuses: getRogueThiefSpeedBonuses(character),
        transformFeatureAction: hasRogueThiefSupremeSneakFeature(character)
          ? (action) => transformRogueThiefFeatureAction(character, action)
          : undefined
      }
    : {};
