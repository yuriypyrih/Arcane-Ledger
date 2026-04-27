import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, Character } from "../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
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

type MonkCommonActionDescriptionAction = Pick<
  MonkWeaponDescriptionAction,
  "key" | "description" | "descriptionAdditions"
>;

const martialArtsSource = "Martial Arts";
const empoweredStrikesSource = "Empowered Strikes";
const extraAttackSource = "Extra Attack";
const stunningStrikeSource = "Stunning Strike";
const disciplinedSurvivorSource = "Disciplined Survivor";
const uncannyMetabolismSource = "Uncanny Metabolism";
const perfectFocusSource = "Perfect Focus";
const heightenedFocusSource = "Heightened Focus";
const fleetStepSource = "Fleet Step";
const elementalEpitomeSource = "Elemental Epitome";
const patientDefenseSource = "Patient Defense";
const stepOfTheWindSource = "Step of the Wind";

const patientDefenseCommonActionDescription: SpellDescriptionEntry[] = [
  "You can take the Disengage action as a Bonus Action."
];

const stepOfTheWindCommonActionDescription: SpellDescriptionEntry[] = [
  "You can take the Dash action as a Bonus Action."
];

function getFeatureDescriptionSlice(
  character: MonkDescriptionCharacter,
  feature: CLASS_FEATURE,
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, feature).filter((entry) =>
    typeof entry === "string" ? predicate(entry) : entry.items.some((item) => predicate(item))
  );
}

function isFlurryOfBlowsDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Flurry of Blows.</strong>");
}

function isPatientDefenseDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Patient Defense.</strong>");
}

function isStepOfTheWindDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Step of the Wind.</strong>");
}

function isDestructiveStrideDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Destructive Stride.</strong>");
}

function createInitiativeFeatureSection(
  character: MonkDescriptionCharacter,
  feature: CLASS_FEATURE,
  sourceName: string
): SpellDescriptionEntry[][] {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0
    ? [createFeatureSourcedDescriptionEntries(character, feature, description, sourceName)]
    : [];
}

function createFeatureSection(
  character: MonkDescriptionCharacter,
  feature: CLASS_FEATURE,
  sourceName: string
): SpellDescriptionEntry[][] {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0
    ? [createFeatureSourcedDescriptionEntries(character, feature, description, sourceName)]
    : [];
}

function appendFeatureDescriptionSection<
  T extends Pick<MonkWeaponDescriptionAction, "description" | "descriptionAdditions">
>(value: T, character: MonkDescriptionCharacter, feature: CLASS_FEATURE, sourceName: string): T {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0
    ? appendFeatureSourcedDescriptionAddition(value, character, feature, description, sourceName)
    : value;
}

function isMonkUnarmedStrikeAction(
  action: Pick<MonkWeaponDescriptionAction, "key" | "attackKind">
): boolean {
  return action.key === "unarmed-strike" && action.attackKind === "unarmed";
}

function isMonkDisengageCommonAction(
  action: Pick<MonkCommonActionDescriptionAction, "key">
): boolean {
  return action.key === "common-action-disengage";
}

function isMonkDashCommonAction(action: Pick<MonkCommonActionDescriptionAction, "key">): boolean {
  return action.key === "common-action-dash";
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

export function appendMonkCommonActionDescriptionSections<
  T extends MonkCommonActionDescriptionAction
>(action: T, character: MonkDescriptionCharacter): T {
  let nextAction = action;

  if (isMonkDisengageCommonAction(nextAction)) {
    nextAction = appendFeatureSourcedDescriptionAddition(
      nextAction,
      character,
      CLASS_FEATURE.MONKS_FOCUS,
      patientDefenseCommonActionDescription,
      patientDefenseSource
    );
  }

  if (isMonkDashCommonAction(nextAction)) {
    nextAction = appendFeatureSourcedDescriptionAddition(
      nextAction,
      character,
      CLASS_FEATURE.MONKS_FOCUS,
      stepOfTheWindCommonActionDescription,
      stepOfTheWindSource
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

export function getMonkFlurryOfBlowsBaseDescription(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[] {
  return getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.MONKS_FOCUS,
    isFlurryOfBlowsDescriptionEntry
  );
}

export function getMonkPatientDefenseBaseDescription(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[] {
  return getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.MONKS_FOCUS,
    isPatientDefenseDescriptionEntry
  );
}

export function getMonkPatientDefenseDescriptionAdditions(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[][] {
  const heightenedFocusDescription = getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.HEIGHTENED_FOCUS,
    isPatientDefenseDescriptionEntry
  );

  return heightenedFocusDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.HEIGHTENED_FOCUS,
          heightenedFocusDescription,
          heightenedFocusSource
        )
      ]
    : [];
}

export function getMonkStepOfTheWindBaseDescription(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[] {
  return getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.MONKS_FOCUS,
    isStepOfTheWindDescriptionEntry
  );
}

export function getMonkStepOfTheWindDescriptionAdditions(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[][] {
  const heightenedFocusDescription = getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.HEIGHTENED_FOCUS,
    isStepOfTheWindDescriptionEntry
  );
  const fleetStepDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.FLEET_STEP
  );
  const elementalEpitomeDescription = getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.ELEMENTAL_EPITOME,
    isDestructiveStrideDescriptionEntry
  );

  return [
    ...(heightenedFocusDescription.length > 0
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.HEIGHTENED_FOCUS,
            heightenedFocusDescription,
            heightenedFocusSource
          )
        ]
      : []),
    ...(fleetStepDescription.length > 0
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.FLEET_STEP,
            fleetStepDescription,
            fleetStepSource
          )
        ]
      : []),
    ...(elementalEpitomeDescription.length > 0
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.ELEMENTAL_EPITOME,
            elementalEpitomeDescription,
            elementalEpitomeSource
          )
        ]
      : [])
  ];
}

export function getMonkFlurryOfBlowsDescriptionAdditions(
  character: MonkDescriptionCharacter
): SpellDescriptionEntry[][] {
  const heightenedFocusDescription = getFeatureDescriptionSlice(
    character,
    CLASS_FEATURE.HEIGHTENED_FOCUS,
    isFlurryOfBlowsDescriptionEntry
  );

  return heightenedFocusDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.HEIGHTENED_FOCUS,
          heightenedFocusDescription,
          heightenedFocusSource
        )
      ]
    : [];
}
