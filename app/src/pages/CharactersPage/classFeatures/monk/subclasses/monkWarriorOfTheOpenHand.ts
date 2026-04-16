import { monkFeatures, type MonkFeatureClassObj } from "../../../../../codex/classes";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterMonkFeatureState } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import type { WeaponAction } from "../../../gameplay";
import type { FeatureActionCard } from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const warriorOfTheOpenHandSubclassId = "monk-warrior-of-the-open-hand";
export const monkWholenessOfBodyActionKey =
  "monk-warrior-of-the-open-hand-wholeness-of-body";
export const monkQuiveringPalmActionKey = "monk-warrior-of-the-open-hand-quivering-palm";
export const monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId =
  "feature-monk-warrior-of-the-open-hand-quivering-palm";

const warriorOfTheOpenHandSubclassEntry = getSubclassEntryById(warriorOfTheOpenHandSubclassId);
const openHandTechniqueName = "Open Hand Technique";
const wholenessOfBodyActionName = "Wholeness of Body";
const quiveringPalmEffectName = "Quivering Palm";
const quiveringPalmFocusCost = 3;

type MonkWarriorOfTheOpenHandCharacter = Pick<Character, "className"> &
  Partial<
    Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries" | "abilities">
  >;

type OpenHandWeaponAction = Pick<WeaponAction, "key" | "attackKind">;

export type MonkWarriorOfTheOpenHandQuiveringPalmOptionState = {
  disabled: boolean;
  disabledReason?: string;
};

function getWarriorOfTheOpenHandFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = warriorOfTheOpenHandSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const openHandTechniqueDescription = getWarriorOfTheOpenHandFeatureDescriptionEntries(
  CLASS_FEATURE.OPEN_HAND_TECHNIQUE
);
const wholenessOfBodyDescription = getWarriorOfTheOpenHandFeatureDescriptionEntries(
  CLASS_FEATURE.WHOLENESS_OF_BODY
);
const quiveringPalmDescription = getWarriorOfTheOpenHandFeatureDescriptionEntries(
  CLASS_FEATURE.QUIVERING_PALM
);

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

function getRawWisdomModifier(character: Partial<Pick<Character, "abilities">>): number | null {
  const wisdomScore = character.abilities?.WIS;

  if (typeof wisdomScore !== "number" || !Number.isFinite(wisdomScore)) {
    return null;
  }

  return Math.floor((wisdomScore - 10) / 2);
}

function getMonkMartialArtsDieLabel(character: Partial<Pick<Character, "level">>): string | null {
  const martialArtsDie = getMonkFeatureRow(character.level)?.martialArts;

  return martialArtsDie ? `1${String(martialArtsDie).toLowerCase()}` : null;
}

function getMonkFocusPointsTotal(character: Partial<Pick<Character, "level">>): number {
  return getMonkFeatureRow(character.level)?.focusPoints ?? 0;
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

function isOpenHandUnarmedStrikeAction(action: OpenHandWeaponAction | null): boolean {
  return Boolean(action && action.key === "unarmed-strike" && action.attackKind === "unarmed");
}

function hasMonkWarriorOfTheOpenHandTechnique(
  character: MonkWarriorOfTheOpenHandCharacter
): boolean {
  return (
    character.className === "Monk" &&
    character.subclassId === warriorOfTheOpenHandSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasMonkWarriorOfTheOpenHandWholenessOfBody(
  character: MonkWarriorOfTheOpenHandCharacter
): boolean {
  return hasMonkWarriorOfTheOpenHandTechnique(character) && (character.level ?? 0) >= 6;
}

function hasMonkWarriorOfTheOpenHandQuiveringPalm(
  character: MonkWarriorOfTheOpenHandCharacter
): boolean {
  return hasMonkWarriorOfTheOpenHandTechnique(character) && (character.level ?? 0) >= 17;
}

function getMonkFlurryOfBlowsAttacksRemainingThisTurn(
  character: MonkWarriorOfTheOpenHandCharacter
): number {
  const flurryOfBlowsAttacksRemainingThisTurn = Number(
    character.classFeatureState?.monk?.flurryOfBlowsAttacksRemainingThisTurn
  );

  return Number.isFinite(flurryOfBlowsAttacksRemainingThisTurn)
    ? Math.max(0, Math.floor(flurryOfBlowsAttacksRemainingThisTurn))
    : 0;
}

export function getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal(
  character: MonkWarriorOfTheOpenHandCharacter
): number {
  if (!hasMonkWarriorOfTheOpenHandWholenessOfBody(character)) {
    return 0;
  }

  return Math.max(1, getRawWisdomModifier(character) ?? 0);
}

export function getMonkWarriorOfTheOpenHandWholenessOfBodyUsesRemaining(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfTheOpenHandCharacter
): number {
  const totalUses = getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal(character);
  const usesExpended = Number(
    character.classFeatureState?.monk?.warriorOfTheOpenHandWholenessOfBodyUsesExpended
  );

  return Math.max(
    0,
    totalUses - (Number.isFinite(usesExpended) ? Math.max(0, Math.floor(usesExpended)) : 0)
  );
}

export function getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula(
  character: MonkWarriorOfTheOpenHandCharacter
): string | null {
  if (!hasMonkWarriorOfTheOpenHandWholenessOfBody(character)) {
    return null;
  }

  const martialArtsDie = getMonkMartialArtsDieLabel(character);
  const wisdomModifier = getRawWisdomModifier(character);

  if (!martialArtsDie || wisdomModifier === null) {
    return null;
  }

  if (wisdomModifier === 0) {
    return martialArtsDie;
  }

  return wisdomModifier > 0 ? `${martialArtsDie}+${wisdomModifier}` : `${martialArtsDie}${wisdomModifier}`;
}

export function normalizeMonkWarriorOfTheOpenHandFeatureState(
  value: Partial<CharacterMonkFeatureState> | undefined,
  character: MonkWarriorOfTheOpenHandCharacter
): Pick<CharacterMonkFeatureState, "warriorOfTheOpenHandWholenessOfBodyUsesExpended"> {
  const wholenessOfBodyUsesExpended = Number(value?.warriorOfTheOpenHandWholenessOfBodyUsesExpended);
  const wholenessOfBodyUsesTotal = getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal(character);

  return {
    warriorOfTheOpenHandWholenessOfBodyUsesExpended: hasMonkWarriorOfTheOpenHandWholenessOfBody(
      character
    )
      ? Number.isFinite(wholenessOfBodyUsesExpended)
        ? Math.max(0, Math.min(wholenessOfBodyUsesTotal, Math.floor(wholenessOfBodyUsesExpended)))
        : 0
      : 0
  };
}

function spendMonkFocusPoints(character: Character, focusPointCost: number): Character | null {
  const focusPointsRemaining = getMonkFocusPointsRemaining(character);

  if (focusPointsRemaining < focusPointCost) {
    return null;
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
        focusPointsExpended: Math.min(totalFocusPoints, focusPointsExpended + focusPointCost)
      }
    }
  };
}

export function activateMonkWarriorOfTheOpenHandWholenessOfBody(character: Character): Character {
  if (!hasMonkWarriorOfTheOpenHandWholenessOfBody(character)) {
    return character;
  }

  const usesRemaining = getMonkWarriorOfTheOpenHandWholenessOfBodyUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const usesExpended = Number(monkState.warriorOfTheOpenHandWholenessOfBodyUsesExpended);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        warriorOfTheOpenHandWholenessOfBodyUsesExpended:
          (Number.isFinite(usesExpended) ? Math.max(0, Math.floor(usesExpended)) : 0) + 1
      }
    }
  };
}

export function restoreMonkWarriorOfTheOpenHandWholenessOfBodyOnLongRest(
  character: Character
): Character {
  if (!hasMonkWarriorOfTheOpenHandWholenessOfBody(character)) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};

  if ((monkState.warriorOfTheOpenHandWholenessOfBodyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        warriorOfTheOpenHandWholenessOfBodyUsesExpended: 0
      }
    }
  };
}

export function isMonkWarriorOfTheOpenHandQuiveringPalmActive(
  character: Partial<Pick<Character, "statusEntries">> & MonkWarriorOfTheOpenHandCharacter
): boolean {
  if (!hasMonkWarriorOfTheOpenHandQuiveringPalm(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId
  );
}

export function getMonkWarriorOfTheOpenHandQuiveringPalmOptionState(
  character: MonkWarriorOfTheOpenHandCharacter,
  action: OpenHandWeaponAction | null
): MonkWarriorOfTheOpenHandQuiveringPalmOptionState | null {
  if (!hasMonkWarriorOfTheOpenHandQuiveringPalm(character) || !isOpenHandUnarmedStrikeAction(action)) {
    return null;
  }

  const disabledReason = isMonkWarriorOfTheOpenHandQuiveringPalmActive(character)
    ? `${quiveringPalmEffectName} is already active.`
    : getMonkFocusPointsRemaining(character) < quiveringPalmFocusCost
      ? `You need ${quiveringPalmFocusCost} Focus Points to use ${quiveringPalmEffectName}.`
      : undefined;

  return {
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function activateMonkWarriorOfTheOpenHandQuiveringPalmMark(
  character: Character
): Character {
  const optionState = getMonkWarriorOfTheOpenHandQuiveringPalmOptionState(character, {
    key: "unarmed-strike",
    attackKind: "unarmed"
  });

  if (!optionState || optionState.disabled) {
    return character;
  }

  const characterWithFocusSpent = spendMonkFocusPoints(character, quiveringPalmFocusCost);

  if (!characterWithFocusSpent) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId
  );

  return {
    ...characterWithFocusSpent,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: quiveringPalmEffectName,
        source: quiveringPalmEffectName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.DAYS,
          amount: Math.max(1, Math.floor(character.level ?? 1))
        },
        sourceId: monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId
      })
    ]
  };
}

export function activateMonkWarriorOfTheOpenHandQuiveringPalm(character: Character): Character {
  if (!isMonkWarriorOfTheOpenHandQuiveringPalmActive(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId
  );

  if (nextStatusEntries.length === normalizeCharacterStatusEntries(character.statusEntries).length) {
    return character;
  }

  return {
    ...character,
    statusEntries: nextStatusEntries
  };
}

function getMonkWarriorOfTheOpenHandFeatureActions(
  character: MonkWarriorOfTheOpenHandCharacter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasMonkWarriorOfTheOpenHandWholenessOfBody(character)) {
    const usesRemaining = getMonkWarriorOfTheOpenHandWholenessOfBodyUsesRemaining(character);
    const usesTotal = getMonkWarriorOfTheOpenHandWholenessOfBodyUsesTotal(character);
    const healingFormula = getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula(character);

    actions.push({
      key: monkWholenessOfBodyActionKey,
      name: wholenessOfBodyActionName,
      summary: "Heal yourself with your Martial Arts die and Wisdom.",
      detail: healingFormula
        ? `Heal yourself for ${healingFormula} Hit Points (minimum of 1).`
        : "Heal yourself with your Martial Arts die and Wisdom modifier (minimum of 1).",
      breakdown: healingFormula ? `${healingFormula} HP (minimum 1)` : "Martial Arts die + WIS",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal,
      description: [...wholenessOfBodyDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of the Open Hand",
        description: [...wholenessOfBodyDescription],
        confirmLabel: `Use ${wholenessOfBodyActionName}`
      },
      execute: {
        kind: "activate",
        label: `Use ${wholenessOfBodyActionName}`
      },
      disabled: usesRemaining <= 0,
      disabledReason:
        usesRemaining <= 0 ? `${wholenessOfBodyActionName} recharges on a Long Rest.` : undefined
    });
  }

  if (isMonkWarriorOfTheOpenHandQuiveringPalmActive(character)) {
    actions.push({
      key: monkQuiveringPalmActionKey,
      name: quiveringPalmEffectName,
      summary: "End the vibrations on the creature you marked.",
      detail: "End the current Quivering Palm vibrations on the marked creature.",
      breakdown: "End the active Quivering Palm",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      description: [...quiveringPalmDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of the Open Hand",
        description: [...quiveringPalmDescription],
        confirmLabel: `Use ${quiveringPalmEffectName}`
      },
      execute: {
        kind: "activate",
        label: `Use ${quiveringPalmEffectName}`
      }
    });
  }

  return actions;
}

export const getMonkWarriorOfTheOpenHandDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  if (!hasMonkWarriorOfTheOpenHandTechnique(character)) {
    return {};
  }

  return {
    featureActions: getMonkWarriorOfTheOpenHandFeatureActions(character),
    transformWeaponAction: (action) => {
      if (
        !isOpenHandUnarmedStrikeAction(action) ||
        getMonkFlurryOfBlowsAttacksRemainingThisTurn(character) <= 0
      ) {
        return action;
      }

      return appendSourcedDescriptionAddition(
        action,
        openHandTechniqueName,
        openHandTechniqueDescription
      );
    }
  };
};
