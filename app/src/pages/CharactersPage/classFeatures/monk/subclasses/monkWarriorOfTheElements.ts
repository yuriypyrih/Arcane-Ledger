import { monkFeatures, type MonkFeatureClassObj } from "../../../../../codex/classes";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import type {
  FeatureActionCard,
  FeatureSpeedBonus,
  FeatureUnarmedStrikeConfig
} from "../../types";
import {
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const warriorOfTheElementsSubclassId = "monk-warrior-of-the-elements";
export const monkElementalAttunementActionKey =
  "monk-warrior-of-the-elements-elemental-attunement";
export const monkElementalAttunementStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement";
export const monkElementalAttunementStrideStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement-stride";
export const monkElementalAttunementEpitomeStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement-epitome";
export const monkElementalBurstActionKey = "monk-warrior-of-the-elements-elemental-burst";

const warriorOfTheElementsSubclassEntry = getSubclassEntryById(warriorOfTheElementsSubclassId);
const elementalAttunementEffectName = "Elemental Attunement";
const elementalAttunementDurationMinutes = 10;
const elementalAttunementFocusCost = 1;
const elementalBurstFocusCost = 2;
const strideOfTheElementsName = "Stride of the Elements";
const elementalEpitomeName = "Elemental Epitome";
const elementalAttunementAdditionalDamageTypes = [
  "Acid",
  "Cold",
  "Fire",
  "Lightning",
  "Thunder"
] as const;
const elementalAttunementStatusSourceIds = new Set([
  monkElementalAttunementStatusSourceId,
  monkElementalAttunementStrideStatusSourceId,
  monkElementalAttunementEpitomeStatusSourceId
]);
const manipulateElementsElementalismSpellIds = resolveSpellIdsByName(["Elementalism"]);

type MonkWarriorOfTheElementsCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>;

function getWarriorOfTheElementsFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = warriorOfTheElementsSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const elementalAttunementDescription = getWarriorOfTheElementsFeatureDescriptionEntries(
  CLASS_FEATURE.ELEMENTAL_ATTUNEMENT
);
const elementalBurstDescription = getWarriorOfTheElementsFeatureDescriptionEntries(
  CLASS_FEATURE.ELEMENTAL_BURST
);
const strideOfTheElementsDescription = getWarriorOfTheElementsFeatureDescriptionEntries(
  CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS
);
const elementalEpitomeDescription = getWarriorOfTheElementsFeatureDescriptionEntries(
  CLASS_FEATURE.ELEMENTAL_EPITOME
);
const elementalAttunementTraitDescription = elementalAttunementDescription.filter(
  (entry) =>
    entry.startsWith("<strong>Reach.</strong>") ||
    entry.startsWith("<strong>Elemental Strikes.</strong>")
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

function hasEmpoweredStrikes(character: Partial<Pick<Character, "level">>): boolean {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(character.level ?? 0)));

  return monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .some((row) => row.classFeatures.includes(CLASS_FEATURE.EMPOWERED_STRIKES));
}

function getElementalAttunementDamageTypeLabel(
  character: MonkWarriorOfTheElementsCharacter
): string {
  const baseDamageTypes = hasEmpoweredStrikes(character)
    ? ["Bludgeoning", "Force"]
    : ["Bludgeoning"];

  return [...baseDamageTypes, ...elementalAttunementAdditionalDamageTypes].join("/");
}

export function isMonkWarriorOfTheElements(
  character: MonkWarriorOfTheElementsCharacter
): boolean {
  return (
    character.className === "Monk" &&
    character.subclassId === warriorOfTheElementsSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasMonkWarriorOfTheElementsElementalAttunement(
  character: MonkWarriorOfTheElementsCharacter
): boolean {
  return isMonkWarriorOfTheElements(character);
}

export function hasMonkWarriorOfTheElementsElementalBurst(
  character: MonkWarriorOfTheElementsCharacter
): boolean {
  return isMonkWarriorOfTheElements(character) && (character.level ?? 0) >= 6;
}

export function hasMonkWarriorOfTheElementsStrideOfTheElements(
  character: MonkWarriorOfTheElementsCharacter
): boolean {
  return isMonkWarriorOfTheElements(character) && (character.level ?? 0) >= 11;
}

export function hasMonkWarriorOfTheElementsElementalEpitome(
  character: MonkWarriorOfTheElementsCharacter
): boolean {
  return isMonkWarriorOfTheElements(character) && (character.level ?? 0) >= 17;
}

function getElementalAttunementStatusSourceId(
  character: MonkWarriorOfTheElementsCharacter
): string {
  if (hasMonkWarriorOfTheElementsElementalEpitome(character)) {
    return monkElementalAttunementEpitomeStatusSourceId;
  }

  if (hasMonkWarriorOfTheElementsStrideOfTheElements(character)) {
    return monkElementalAttunementStrideStatusSourceId;
  }

  return monkElementalAttunementStatusSourceId;
}

export function isMonkWarriorOfTheElementsElementalAttunementActive(
  character: Partial<Pick<Character, "statusEntries">> & MonkWarriorOfTheElementsCharacter
): boolean {
  if (!hasMonkWarriorOfTheElementsElementalAttunement(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      elementalAttunementStatusSourceIds.has(entry.sourceId ?? "")
  );
}

function spendMonkFocusPoints(
  character: Character,
  focusPointCost: number
): Character | null {
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

export function activateMonkWarriorOfTheElementsElementalAttunement(
  character: Character
): Character {
  if (
    !hasMonkWarriorOfTheElementsElementalAttunement(character) ||
    isMonkWarriorOfTheElementsElementalAttunementActive(character)
  ) {
    return character;
  }

  const characterWithFocusSpent = spendMonkFocusPoints(character, elementalAttunementFocusCost);

  if (!characterWithFocusSpent) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => !elementalAttunementStatusSourceIds.has(entry.sourceId ?? "")
  );

  return {
    ...characterWithFocusSpent,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: elementalAttunementEffectName,
        source: elementalAttunementEffectName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: elementalAttunementDurationMinutes
        },
        sourceId: getElementalAttunementStatusSourceId(character)
      })
    ]
  };
}

export function activateMonkWarriorOfTheElementsElementalBurst(character: Character): Character {
  if (!hasMonkWarriorOfTheElementsElementalBurst(character)) {
    return character;
  }

  return spendMonkFocusPoints(character, elementalBurstFocusCost) ?? character;
}

function appendElementalAttunementDescriptionAddition(
  action: FeatureActionCard,
  sourceName: string,
  descriptionEntries: readonly string[]
): FeatureActionCard {
  return descriptionEntries.length > 0
    ? appendSourcedDescriptionAddition(action, sourceName, descriptionEntries)
    : action;
}

function getMonkWarriorOfTheElementsElementalAttunementAction(
  character: MonkWarriorOfTheElementsCharacter
): FeatureActionCard | null {
  if (!hasMonkWarriorOfTheElementsElementalAttunement(character)) {
    return null;
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const focusPointsTotal = getMonkFocusPointsTotal(character);
  const elementalAttunementActive = isMonkWarriorOfTheElementsElementalAttunementActive(character);
  const disabledReason = elementalAttunementActive
    ? `${elementalAttunementEffectName} is already active.`
    : focusPointsRemaining < elementalAttunementFocusCost
      ? "No Focus Points remaining."
      : undefined;

  let action: FeatureActionCard = {
    key: monkElementalAttunementActionKey,
    name: elementalAttunementEffectName,
    summary: "Imbue yourself with elemental energy for 10 minutes.",
    detail:
      "Expend 1 Focus Point to gain the Reach and Elemental Strikes benefits for 10 minutes.",
    breakdown: "10-minute elemental aura",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "brain",
    description: [...elementalAttunementDescription],
    resources: [
      {
        kind: "tracker",
        label: "Focus",
        current: focusPointsRemaining,
        total: focusPointsTotal,
        icon: "brain",
        cost: elementalAttunementFocusCost
      }
    ],
    drawer: {
      kind: "confirm",
      eyebrow: "Warrior of the Elements",
      description: [...elementalAttunementDescription]
    },
    execute: {
      kind: "activate"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };

  if (hasMonkWarriorOfTheElementsStrideOfTheElements(character)) {
    action = appendElementalAttunementDescriptionAddition(
      action,
      strideOfTheElementsName,
      strideOfTheElementsDescription
    );
  }

  if (hasMonkWarriorOfTheElementsElementalEpitome(character)) {
    action = appendElementalAttunementDescriptionAddition(
      action,
      elementalEpitomeName,
      elementalEpitomeDescription
    );
  }

  return action;
}

function getMonkWarriorOfTheElementsElementalBurstAction(
  character: MonkWarriorOfTheElementsCharacter
): FeatureActionCard | null {
  if (!hasMonkWarriorOfTheElementsElementalBurst(character)) {
    return null;
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const focusPointsTotal = getMonkFocusPointsTotal(character);
  const disabledReason =
    focusPointsRemaining < elementalBurstFocusCost
      ? `You need ${elementalBurstFocusCost} Focus Points to use Elemental Burst.`
      : undefined;

  return {
    key: monkElementalBurstActionKey,
    name: "Elemental Burst",
    summary: "Release a 20-foot-radius burst of elemental energy.",
    detail:
      "Expend 2 Focus Points to create a burst of elemental energy that deals three Martial Arts dice of Acid, Cold, Fire, Lightning, or Thunder damage.",
    breakdown: "20-ft elemental burst",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesInlineLabel: "Use 2",
    usesInlineIcon: "brain",
    description: [...elementalBurstDescription],
    resources: [
      {
        kind: "tracker",
        label: "Focus",
        current: focusPointsRemaining,
        total: focusPointsTotal,
        icon: "brain",
        cost: elementalBurstFocusCost
      }
    ],
    drawer: {
      kind: "confirm",
      eyebrow: "Warrior of the Elements",
      description: [...elementalBurstDescription]
    },
    execute: {
      kind: "activate"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getMonkWarriorOfTheElementsUnarmedStrikeConfig(
  character: MonkWarriorOfTheElementsCharacter
): FeatureUnarmedStrikeConfig | null {
  if (!isMonkWarriorOfTheElementsElementalAttunementActive(character)) {
    return null;
  }

  return {
    damageTypeLabel: getElementalAttunementDamageTypeLabel(character)
  };
}

export function getMonkWarriorOfTheElementsTraitDescription(): string[] {
  return [...elementalAttunementTraitDescription];
}

export const getMonkWarriorOfTheElementsDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  if (!hasMonkWarriorOfTheElementsElementalAttunement(character)) {
    return {};
  }

  const elementalAttunementAction = getMonkWarriorOfTheElementsElementalAttunementAction(character);
  const elementalBurstAction = getMonkWarriorOfTheElementsElementalBurstAction(character);
  const speedBonuses: FeatureSpeedBonus[] =
    hasMonkWarriorOfTheElementsStrideOfTheElements(character) &&
    isMonkWarriorOfTheElementsElementalAttunementActive(character)
      ? [
          {
            label: "Stride of the Elements",
            movementType: "fly",
            value: 0,
            setBaseFromWalkMultiplier: 1
          },
          {
            label: "Stride of the Elements",
            movementType: "swim",
            value: 0,
            setBaseFromWalkMultiplier: 1
          }
        ]
      : [];

  return {
    featureActions: [elementalAttunementAction, elementalBurstAction].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    alwaysPreparedSpellIds: manipulateElementsElementalismSpellIds,
    speedBonuses,
    getUnarmedStrikeConfig: () => getMonkWarriorOfTheElementsUnarmedStrikeConfig(character)
  };
};
