import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard, FeatureSpeedBonus } from "../../types";
import { rogueSneakAttackActionKey } from "../rogue";
import type { RogueSneakAttackEffectDefinition } from "../types";

export const thiefSubclassId = "rogue-thief";
const secondStoryWorkSource = "Second-Story Work";
const supremeSneakSource = "Supreme Sneak";
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

export function hasRogueThiefSupremeSneakFeature(character: RogueThiefCharacter): boolean {
  return hasRogueThiefFeature(character, 9);
}

function getRogueThiefFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = thiefSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const supremeSneakDescription = getRogueThiefFeatureDescriptionEntries(CLASS_FEATURE.SUPREME_SNEAK);
const supremeSneakEffectDescription = supremeSneakDescription.slice(1).filter(Boolean);

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

function transformRogueThiefFeatureAction(action: FeatureActionCard): FeatureActionCard {
  return appendFeatureActionDescriptionSection(
    action,
    rogueSneakAttackActionKey,
    supremeSneakSource,
    supremeSneakEffectDescription
  );
}

export const getRogueThiefDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasRogueThiefSecondStoryWorkFeature(character)
    ? {
        speedBonuses: getRogueThiefSpeedBonuses(character),
        transformFeatureAction: hasRogueThiefSupremeSneakFeature(character)
          ? transformRogueThiefFeatureAction
          : undefined
      }
    : {};
