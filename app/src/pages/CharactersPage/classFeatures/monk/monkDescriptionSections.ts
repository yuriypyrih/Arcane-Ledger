import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, Character } from "../../../../types";
import {
  appendSourcedDescriptionAddition,
  createSourcedDescriptionEntries
} from "../../actionModalDescriptions";
import type { WeaponAction } from "../../gameplay";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import { canUseMonkStunningStrikeWithAction } from "./monkStunningStrike";

type MonkDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

type MonkWeaponDescriptionAction = {
  key: string;
  attackKind: "weapon" | "unarmed";
  combatType?: WeaponAction["combatType"];
  weaponTraining?: WeaponAction["weaponTraining"];
  properties?: WeaponAction["properties"];
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
};

const martialArtsSource = "Martial Arts";
const empoweredStrikesSource = "Empowered Strikes";
const extraAttackSource = "Extra Attack";
const stunningStrikeSource = "Stunning Strike";
const disciplinedSurvivorSource = "Disciplined Survivor";
const uncannyMetabolismSource = "Uncanny Metabolism";
const perfectFocusSource = "Perfect Focus";

function createInitiativeFeatureSection(
  character: MonkDescriptionCharacter,
  feature: CLASS_FEATURE,
  sourceName: string
): SpellDescriptionEntry[][] {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0 ? [createSourcedDescriptionEntries(sourceName, description)] : [];
}

function createFeatureSection(
  character: MonkDescriptionCharacter,
  feature: CLASS_FEATURE,
  sourceName: string
): SpellDescriptionEntry[][] {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0 ? [createSourcedDescriptionEntries(sourceName, description)] : [];
}

function appendFeatureDescriptionSection<
  T extends Pick<MonkWeaponDescriptionAction, "description" | "descriptionAdditions">
>(value: T, character: MonkDescriptionCharacter, feature: CLASS_FEATURE, sourceName: string): T {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0
    ? appendSourcedDescriptionAddition(value, sourceName, description)
    : value;
}

function isMonkUnarmedStrikeAction(
  action: Pick<MonkWeaponDescriptionAction, "key" | "attackKind">
): boolean {
  return action.key === "unarmed-strike" && action.attackKind === "unarmed";
}

export function appendMonkWeaponDescriptionSections<T extends MonkWeaponDescriptionAction>(
  action: T,
  character: MonkDescriptionCharacter
): T {
  let nextAction = action;

  if (isMonkUnarmedStrikeAction(nextAction)) {
    nextAction = appendFeatureDescriptionSection(
      nextAction,
      character,
      CLASS_FEATURE.MARTIAL_ARTS,
      martialArtsSource
    );
    nextAction = appendFeatureDescriptionSection(
      nextAction,
      character,
      CLASS_FEATURE.EMPOWERED_STRIKES,
      empoweredStrikesSource
    );
  }

  if (nextAction.attackKind === "weapon" || isMonkUnarmedStrikeAction(nextAction)) {
    nextAction = appendFeatureDescriptionSection(
      nextAction,
      character,
      CLASS_FEATURE.EXTRA_ATTACK,
      extraAttackSource
    );
  }

  if (canUseMonkStunningStrikeWithAction(nextAction)) {
    nextAction = appendFeatureDescriptionSection(
      nextAction,
      character,
      CLASS_FEATURE.STUNNING_STRIKE,
      stunningStrikeSource
    );
  }

  return nextAction;
}

export function getMonkInitiativeDescriptionAdditions(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[][] {
  return [
    ...createInitiativeFeatureSection(
      character,
      CLASS_FEATURE.UNCANNY_METABOLISM,
      uncannyMetabolismSource
    ),
    ...createInitiativeFeatureSection(character, CLASS_FEATURE.PERFECT_FOCUS, perfectFocusSource)
  ];
}

export function getMonkAbilityDescriptionAdditions(
  character: MonkDescriptionCharacter,
  _ability: AbilityKey
): SpellDescriptionEntry[][] {
  return createFeatureSection(
    character,
    CLASS_FEATURE.DISCIPLINED_SURVIVOR,
    disciplinedSurvivorSource
  );
}
