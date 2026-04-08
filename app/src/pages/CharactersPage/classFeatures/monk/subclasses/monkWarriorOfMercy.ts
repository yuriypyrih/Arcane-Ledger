import { monkFeatures, type MonkFeatureClassObj } from "../../../../../codex/classes";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterMonkFeatureState, SkillName } from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  getSkillProficiencyForSkillName
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  appendSourcedDescriptionAddition,
  appendUniqueDescriptionAddition
} from "../../../actionModalDescriptions";
import type {
  FeatureActionCard,
  FeatureDamageBonus,
  FeatureSkillProficiencyEntry
} from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { WeaponAction } from "../../../gameplay";

export const warriorOfMercySubclassId = "monk-warrior-of-mercy";
export const monkWarriorOfMercyHandOfHarmBonusLabel = "Hand of Harm";
export const monkHandOfHealingActionKey = "monk-warrior-of-mercy-hand-of-healing";

const implementsOfMercySource = "Implements of Mercy";
const warriorOfMercySubclassEntry = getSubclassEntryById(warriorOfMercySubclassId);

type MonkWarriorOfMercyCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "abilities">>;

type MercyWeaponAction = Pick<WeaponAction, "key" | "attackKind" | "description">;

export type MonkWarriorOfMercyHandOfHarmOptionState = {
  damageBonus: FeatureDamageBonus;
  disabled: boolean;
  disabledReason?: string;
};

function getWarriorOfMercyFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = warriorOfMercySubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const handOfHarmDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.HAND_OF_HARM
);
const handOfHealingDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.HAND_OF_HEALING
);
const physiciansTouchHandOfHarmDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.PHYSICIANS_TOUCH
).filter((entry) => entry.startsWith("<strong>Hand of Harm.</strong>"));
const physiciansTouchHandOfHealingDescription = getWarriorOfMercyFeatureDescriptionEntries(
  CLASS_FEATURE.PHYSICIANS_TOUCH
).filter((entry) => entry.startsWith("<strong>Hand of Healing.</strong>"));

function getMonkFeatureRow(level: number | undefined): MonkFeatureClassObj | null {
  if (!Number.isFinite(level)) {
    return null;
  }

  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function appendWeaponDescriptionSection<T extends { description?: SpellDescriptionEntry[] }>(
  action: T,
  sourceName: string,
  descriptionEntries: readonly string[]
): T {
  return appendSourcedDescriptionAddition(action, sourceName, descriptionEntries) as T;
}

function appendFeatureActionDescriptionEntries(
  action: FeatureActionCard,
  actionKey: string,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  if (action.key !== actionKey || descriptionEntries.length === 0) {
    return action;
  }

  return appendUniqueDescriptionAddition(action, descriptionEntries);
}

function getRawWisdomModifier(character: Partial<Pick<Character, "abilities">>): number | null {
  const wisdomScore = character.abilities?.WIS;

  if (typeof wisdomScore !== "number" || !Number.isFinite(wisdomScore)) {
    return null;
  }

  return Math.floor((wisdomScore - 10) / 2);
}

function getMonkFocusPointsTotal(character: Partial<Pick<Character, "level">>): number {
  return getMonkFeatureRow(character.level)?.focusPoints ?? 0;
}

function getMonkMartialArtsDieLabel(character: Partial<Pick<Character, "level">>): string | null {
  const martialArtsDie = getMonkFeatureRow(character.level)?.martialArts;

  return martialArtsDie ? `1${String(martialArtsDie).toLowerCase()}` : null;
}

function getMonkFocusPointsRemaining(
  character: Partial<Pick<Character, "level" | "classFeatureState">>
): number {
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawExpended = Number(character.classFeatureState?.monk?.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawExpended)
    ? Math.max(0, Math.floor(rawExpended))
    : 0;

  return Math.max(0, totalFocusPoints - focusPointsExpended);
}

function isMercyUnarmedStrikeAction(action: MercyWeaponAction | null): boolean {
  return Boolean(action && action.key === "unarmed-strike" && action.attackKind === "unarmed");
}

export function isMonkWarriorOfMercy(character: MonkWarriorOfMercyCharacter): boolean {
  return (
    character.className === "Monk" &&
    character.subclassId === warriorOfMercySubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasMonkWarriorOfMercyHandOfHarm(character: MonkWarriorOfMercyCharacter): boolean {
  return isMonkWarriorOfMercy(character);
}

export function hasMonkWarriorOfMercyHandOfHealing(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character);
}

export function hasMonkWarriorOfMercyImplementsOfMercy(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character);
}

export function hasMonkWarriorOfMercyPhysiciansTouch(
  character: MonkWarriorOfMercyCharacter
): boolean {
  return isMonkWarriorOfMercy(character) && (character.level ?? 0) >= 6;
}

export function getMonkWarriorOfMercyHandOfHarmUsedThisTurn(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfMercyCharacter
): boolean {
  return hasMonkWarriorOfMercyHandOfHarm(character) &&
    character.classFeatureState?.monk?.warriorOfMercyHandOfHarmUsedThisTurn === true
    ? true
    : false;
}

export function normalizeMonkWarriorOfMercyFeatureState(
  value: Partial<CharacterMonkFeatureState> | undefined,
  character: MonkWarriorOfMercyCharacter
): Pick<CharacterMonkFeatureState, "warriorOfMercyHandOfHarmUsedThisTurn"> {
  return {
    warriorOfMercyHandOfHarmUsedThisTurn: hasMonkWarriorOfMercyHandOfHarm(character)
      ? value?.warriorOfMercyHandOfHarmUsedThisTurn === true
      : false
  };
}

export function getMonkWarriorOfMercyHandOfHarmDamageBonus(
  character: MonkWarriorOfMercyCharacter
): FeatureDamageBonus | null {
  if (!hasMonkWarriorOfMercyHandOfHarm(character)) {
    return null;
  }

  const martialArtsDie = getMonkMartialArtsDieLabel(character);
  const wisdomModifier = getRawWisdomModifier(character);

  if (!martialArtsDie || wisdomModifier === null) {
    return null;
  }

  const modifierFormula =
    wisdomModifier === 0 ? "" : wisdomModifier > 0 ? `+${wisdomModifier}` : `${wisdomModifier}`;
  const modifierLabel =
    wisdomModifier === 0
      ? ""
      : wisdomModifier > 0
        ? ` + ${wisdomModifier}`
        : ` - ${Math.abs(wisdomModifier)}`;

  return {
    label: monkWarriorOfMercyHandOfHarmBonusLabel,
    formula: `${martialArtsDie}${modifierFormula}`,
    displayLabel: `${martialArtsDie}${modifierLabel} Necrotic`
  };
}

export function getMonkWarriorOfMercyHandOfHarmOptionState(
  character: MonkWarriorOfMercyCharacter,
  action: MercyWeaponAction | null
): MonkWarriorOfMercyHandOfHarmOptionState | null {
  if (!hasMonkWarriorOfMercyHandOfHarm(character) || !isMercyUnarmedStrikeAction(action)) {
    return null;
  }

  const damageBonus = getMonkWarriorOfMercyHandOfHarmDamageBonus(character);

  if (!damageBonus) {
    return null;
  }

  const disabledReason =
    getMonkFocusPointsRemaining(character) <= 0
      ? "No Focus Points remaining."
      : getMonkWarriorOfMercyHandOfHarmUsedThisTurn(character)
        ? "Hand of Harm has already been used this turn."
        : undefined;

  return {
    damageBonus,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function consumeMonkWarriorOfMercyHandOfHarm(character: Character): Character {
  if (!hasMonkWarriorOfMercyHandOfHarm(character)) {
    return character;
  }

  const optionState = getMonkWarriorOfMercyHandOfHarmOptionState(character, {
    key: "unarmed-strike",
    attackKind: "unarmed"
  });

  if (!optionState || optionState.disabled) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(totalFocusPoints, focusPointsExpended + 1),
        warriorOfMercyHandOfHarmUsedThisTurn: true
      }
    }
  };
}

export function getMonkWarriorOfMercyFeatureActions(
  character: MonkWarriorOfMercyCharacter
): FeatureActionCard[] {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return [];
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const focusPointsTotal = getMonkFocusPointsTotal(character);

  return [
    {
      key: monkHandOfHealingActionKey,
      name: "Hand of Healing",
      summary: "Restore HP equal to your Martial Arts die plus WIS.",
      detail:
        "Expend 1 Focus Point to touch a creature and restore Hit Points equal to your Martial Arts die plus your Wisdom modifier.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "brain",
      description: [...handOfHealingDescription],
      resources: [
        {
          kind: "tracker",
          label: "Focus",
          current: focusPointsRemaining,
          total: focusPointsTotal,
          icon: "brain",
          cost: 1
        }
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of Mercy",
        description: [...handOfHealingDescription],
        confirmLabel: "Use Hand of Healing"
      },
      execute: {
        kind: "activate",
        label: "Use Hand of Healing"
      },
      disabled: focusPointsRemaining <= 0,
      disabledReason: focusPointsRemaining <= 0 ? "No Focus Points remaining." : undefined
    }
  ];
}

export function activateMonkWarriorOfMercyHandOfHealing(character: Character): Character {
  if (!hasMonkWarriorOfMercyHandOfHealing(character)) {
    return character;
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);

  if (focusPointsRemaining <= 0) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(totalFocusPoints, focusPointsExpended + 1)
      }
    }
  };
}

function createImplementsOfMercySkillProficiencyEntry(
  skill: SkillName
): FeatureSkillProficiencyEntry | null {
  const proficiency = getSkillProficiencyForSkillName(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: implementsOfMercySource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

export function getMonkWarriorOfMercySkillProficiencyEntries(
  character: MonkWarriorOfMercyCharacter
): FeatureSkillProficiencyEntry[] {
  if (!hasMonkWarriorOfMercyImplementsOfMercy(character)) {
    return [];
  }

  return [SKILL.INSIGHT, SKILL.MEDICINE]
    .map((skill) => createImplementsOfMercySkillProficiencyEntry(skill))
    .filter((entry): entry is FeatureSkillProficiencyEntry => entry !== null);
}

export const getMonkWarriorOfMercyDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasMonkWarriorOfMercyHandOfHarm(character)) {
    return {};
  }

  return {
    featureActions: getMonkWarriorOfMercyFeatureActions(character),
    transformFeatureAction: hasMonkWarriorOfMercyPhysiciansTouch(character)
      ? (action) =>
          appendFeatureActionDescriptionEntries(
            action,
            monkHandOfHealingActionKey,
            physiciansTouchHandOfHealingDescription
          )
      : undefined,
    skillProficiencyEntries: getMonkWarriorOfMercySkillProficiencyEntries(character),
    transformWeaponAction: (action) => {
      if (!isMercyUnarmedStrikeAction(action)) {
        return action;
      }

      const actionWithHandOfHarm = appendWeaponDescriptionSection(
        action,
        "Hand of Harm",
        handOfHarmDescription
      );

      return hasMonkWarriorOfMercyPhysiciansTouch(character)
        ? appendUniqueDescriptionAddition(
            actionWithHandOfHarm,
            physiciansTouchHandOfHarmDescription
          )
        : actionWithHandOfHarm;
    }
  };
};
