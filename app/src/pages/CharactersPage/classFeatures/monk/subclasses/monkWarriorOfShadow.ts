import { monkFeatures, type MonkFeatureClassObj } from "../../../../../codex/classes";
import { CLASS_FEATURE, WEAPON_COMBAT_TYPE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterMonkFeatureState } from "../../../../../types";
import {
  CONDITION_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureIndicator } from "../../types";
import {
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const warriorOfShadowSubclassId = "monk-warrior-of-shadow";
export const monkShadowArtsDarknessActionKey = "monk-warrior-of-shadow-shadow-arts-darkness";
export const monkShadowStepActionKey = "monk-warrior-of-shadow-shadow-step";
export const monkCloakOfShadowActionKey = "monk-warrior-of-shadow-cloak-of-shadow";
export const monkCloakOfShadowStatusSourceId = "feature-monk-warrior-of-shadow-cloak-of-shadow";

const warriorOfShadowSubclassEntry = getSubclassEntryById(warriorOfShadowSubclassId);
const shadowArtsDarkvisionSource = "Shadow Arts";
const shadowArtsDarknessSpellId = resolveSpellIdsByName(["Darkness"])[0] ?? null;
const shadowArtsMinorIllusionSpellIds = resolveSpellIdsByName(["Minor Illusion"]);
const cloakOfShadowActionName = "Cloak of Shadow";
const cloakOfShadowEffectName = "Cloak of Shadow";
const shadowStepAdvantageSource = "Shadow Step";
const shadowStepAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: shadowStepAdvantageSource
};
const cloakOfShadowInvisibleStatusSourceId = "feature-monk-warrior-of-shadow-cloak-of-shadow-invisible";
const cloakOfShadowDurationRounds = 10;
const cloakOfShadowFocusCost = 3;

type MonkWarriorOfShadowCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>;
type ShadowFeatureAction = Pick<FeatureActionCard, "key">;

export type MonkWarriorOfShadowImprovedShadowStepOptionState = {
  disabled: boolean;
  disabledReason?: string;
};

function getWarriorOfShadowFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = warriorOfShadowSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const shadowArtsDescription = getWarriorOfShadowFeatureDescriptionEntries(CLASS_FEATURE.SHADOW_ARTS);
const shadowArtsDarknessDescription = shadowArtsDescription.filter((entry) =>
  entry.startsWith("<strong>Darkness.</strong>")
);
const shadowStepDescription = getWarriorOfShadowFeatureDescriptionEntries(CLASS_FEATURE.SHADOW_STEP);
const improvedShadowStepDescription = getWarriorOfShadowFeatureDescriptionEntries(
  CLASS_FEATURE.IMPROVED_SHADOW_STEP
);
const cloakOfShadowsDescription = getWarriorOfShadowFeatureDescriptionEntries(
  CLASS_FEATURE.CLOAK_OF_SHADOWS
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

export function isMonkWarriorOfShadow(character: MonkWarriorOfShadowCharacter): boolean {
  return (
    character.className === "Monk" &&
    character.subclassId === warriorOfShadowSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasMonkWarriorOfShadowArts(character: MonkWarriorOfShadowCharacter): boolean {
  return isMonkWarriorOfShadow(character);
}

function hasMonkWarriorOfShadowStep(character: MonkWarriorOfShadowCharacter): boolean {
  return isMonkWarriorOfShadow(character) && (character.level ?? 0) >= 6;
}

export function hasMonkWarriorOfShadowImprovedShadowStep(
  character: MonkWarriorOfShadowCharacter
): boolean {
  return isMonkWarriorOfShadow(character) && (character.level ?? 0) >= 11;
}

export function hasMonkWarriorOfShadowCloakOfShadows(
  character: MonkWarriorOfShadowCharacter
): boolean {
  return isMonkWarriorOfShadow(character) && (character.level ?? 0) >= 17;
}

export function isMonkWarriorOfShadowCloakOfShadowActive(
  character: Partial<Pick<Character, "statusEntries">> & MonkWarriorOfShadowCharacter
): boolean {
  if (!hasMonkWarriorOfShadowCloakOfShadows(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === monkCloakOfShadowStatusSourceId
  );
}

export function normalizeMonkWarriorOfShadowFeatureState(
  value: Partial<CharacterMonkFeatureState> | undefined,
  character: MonkWarriorOfShadowCharacter
): Pick<
  CharacterMonkFeatureState,
  | "warriorOfShadowShadowStepAdvantageActive"
  | "warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn"
> {
  const shadowStepAdvantageActive = value?.warriorOfShadowShadowStepAdvantageActive === true;
  const improvedShadowStepUnarmedStrikesRemainingThisTurn = Number(
    value?.warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn
  );

  return {
    warriorOfShadowShadowStepAdvantageActive: hasMonkWarriorOfShadowStep(character)
      ? shadowStepAdvantageActive
      : false,
    warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn:
      hasMonkWarriorOfShadowImprovedShadowStep(character) &&
      Number.isFinite(improvedShadowStepUnarmedStrikesRemainingThisTurn)
        ? Math.max(0, Math.floor(improvedShadowStepUnarmedStrikesRemainingThisTurn))
        : 0
  };
}

export function hasMonkWarriorOfShadowStepAttackAdvantage(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfShadowCharacter
): boolean {
  return (
    hasMonkWarriorOfShadowStep(character) &&
    character.classFeatureState?.monk?.warriorOfShadowShadowStepAdvantageActive === true
  );
}

function isMonkWarriorOfShadowStepEligibleWeaponAction(
  action: Pick<WeaponAction, "attackKind" | "combatType">
): boolean {
  return (
    action.attackKind === "unarmed" ||
    (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

function appendShadowStepAdvantageIndicator(action: WeaponAction): WeaponAction {
  if (
    !isMonkWarriorOfShadowStepEligibleWeaponAction(action) ||
    action.indicators.some(
      (indicator) =>
        indicator.label === shadowStepAdvantageIndicator.label &&
        indicator.tone === shadowStepAdvantageIndicator.tone &&
        (Array.isArray(indicator.source)
          ? indicator.source.includes(shadowStepAdvantageSource)
          : indicator.source === shadowStepAdvantageSource)
    )
  ) {
    return action;
  }

  return {
    ...action,
    indicators: [...action.indicators, shadowStepAdvantageIndicator]
  };
}

export function getMonkWarriorOfShadowImprovedShadowStepUnarmedStrikeMultiCount(
  character: Partial<Pick<Character, "classFeatureState">> & MonkWarriorOfShadowCharacter
): number {
  return hasMonkWarriorOfShadowImprovedShadowStep(character)
    ? Math.max(
        0,
        Math.floor(
          Number(
            character.classFeatureState?.monk
              ?.warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn
          ) || 0
        )
      )
    : 0;
}

export function getMonkWarriorOfShadowImprovedShadowStepOptionState(
  character: MonkWarriorOfShadowCharacter,
  action: ShadowFeatureAction | null
): MonkWarriorOfShadowImprovedShadowStepOptionState | null {
  if (!hasMonkWarriorOfShadowImprovedShadowStep(character) || action?.key !== monkShadowStepActionKey) {
    return null;
  }

  const disabledReason =
    getMonkFocusPointsRemaining(character) <= 0 ? "No Focus Points remaining." : undefined;

  return {
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function activateMonkWarriorOfShadowImprovedShadowStep(character: Character): Character {
  const optionState = getMonkWarriorOfShadowImprovedShadowStepOptionState(character, {
    key: monkShadowStepActionKey
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
        warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn:
          getMonkWarriorOfShadowImprovedShadowStepUnarmedStrikeMultiCount(character) + 1
      }
    }
  };
}

export function activateMonkWarriorOfShadowStep(character: Character): Character {
  if (!hasMonkWarriorOfShadowStep(character)) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};

  if (monkState.warriorOfShadowShadowStepAdvantageActive === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        warriorOfShadowShadowStepAdvantageActive: true
      }
    }
  };
}

export function consumeMonkWarriorOfShadowStepAttackAdvantage(
  character: Character,
  action: Pick<WeaponAction, "attackKind" | "combatType">
): Character {
  if (
    !hasMonkWarriorOfShadowStepAttackAdvantage(character) ||
    !isMonkWarriorOfShadowStepEligibleWeaponAction(action)
  ) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        warriorOfShadowShadowStepAdvantageActive: false
      }
    }
  };
}

export function activateMonkWarriorOfShadowCloakOfShadow(character: Character): Character {
  if (
    !hasMonkWarriorOfShadowCloakOfShadows(character) ||
    isMonkWarriorOfShadowCloakOfShadowActive(character)
  ) {
    return character;
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);

  if (focusPointsRemaining < cloakOfShadowFocusCost) {
    return character;
  }

  const monkState = character.classFeatureState?.monk ?? {};
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) =>
      entry.sourceId !== monkCloakOfShadowStatusSourceId &&
      entry.sourceId !== cloakOfShadowInvisibleStatusSourceId
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(
          totalFocusPoints,
          focusPointsExpended + cloakOfShadowFocusCost
        )
      }
    },
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: cloakOfShadowEffectName,
        source: cloakOfShadowEffectName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: cloakOfShadowDurationRounds,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        },
        sourceId: monkCloakOfShadowStatusSourceId
      }),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.CONDITIONS,
        value: CONDITION_NAME.INVISIBLE,
        source: cloakOfShadowEffectName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: cloakOfShadowEffectName
        },
        sourceId: cloakOfShadowInvisibleStatusSourceId
      })
    ]
  };
}

function appendImprovedShadowStepDescription(action: FeatureActionCard): FeatureActionCard {
  return action.key === monkShadowStepActionKey && improvedShadowStepDescription.length > 0
    ? appendSourcedDescriptionAddition(
        action,
        "Improved Shadow Step",
        improvedShadowStepDescription
      )
    : action;
}

function getMonkWarriorOfShadowDerivedStatusEntries(
  character: MonkWarriorOfShadowCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasMonkWarriorOfShadowArts(character)) {
    return [];
  }

  return [
    {
      id: "feature-monk-shadow-arts-darkvision",
      sourceId: "feature-monk-shadow-arts-darkvision",
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      source: shadowArtsDarkvisionSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: 60
    }
  ];
}

function getMonkWarriorOfShadowFeatureActions(
  character: MonkWarriorOfShadowCharacter
): FeatureActionCard[] {
  if (!hasMonkWarriorOfShadowArts(character)) {
    return [];
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const focusPointsTotal = getMonkFocusPointsTotal(character);
  const cloakOfShadowActive = isMonkWarriorOfShadowCloakOfShadowActive(character);

  const actions: FeatureActionCard[] = [];

  if (shadowArtsDarknessSpellId) {
    actions.push({
      key: monkShadowArtsDarknessActionKey,
      name: "Shadow Arts Darkness",
      summary: "Cast Darkness without a spell slot.",
      detail: "Expend 1 Focus Point to cast Darkness without spell components.",
      breakdown: "Open Darkness using Shadow Arts",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "brain",
      description: [...shadowArtsDarknessDescription],
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
        eyebrow: "Warrior of Shadow",
        description: [...shadowArtsDarknessDescription],
        confirmLabel: "Open Darkness"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "shadow-arts-darkness",
        spellId: shadowArtsDarknessSpellId,
        spellLevel: 2,
        label: "Open Darkness",
        actionLabel: "Cast Darkness",
        actionContextText: "Using Shadow Arts Darkness",
        actionAvailabilityText:
          "Cast without expending a spell slot or spell components. You can see within the spell's area when you cast it with this feature.",
        actionConsumesSpellSlot: false
      },
      disabled: focusPointsRemaining <= 0,
      disabledReason: focusPointsRemaining <= 0 ? "No Focus Points remaining." : undefined
    });
  }

  if (hasMonkWarriorOfShadowStep(character)) {
    const shadowStepAction: FeatureActionCard = {
      key: monkShadowStepActionKey,
      name: "Shadow Step",
      summary: "Teleport up to 60 feet through shadow.",
      detail: "Teleport between areas of Dim Light or Darkness and gain Advantage on your next melee attack this turn.",
      breakdown: "Bonus Action teleport with Advantage",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      consumesEconomyOnActivate: true,
      description: [...shadowStepDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of Shadow",
        description: [...shadowStepDescription]
      },
      execute: {
        kind: "activate"
      }
    };

    actions.push(
      hasMonkWarriorOfShadowImprovedShadowStep(character)
        ? appendImprovedShadowStepDescription(shadowStepAction)
        : shadowStepAction
    );
  }

  if (hasMonkWarriorOfShadowCloakOfShadows(character)) {
    const cloakOfShadowDisabledReason = cloakOfShadowActive
      ? `${cloakOfShadowActionName} is already active.`
      : focusPointsRemaining < cloakOfShadowFocusCost
        ? `You need ${cloakOfShadowFocusCost} Focus Points to use ${cloakOfShadowActionName}.`
        : undefined;

    actions.push({
      key: monkCloakOfShadowActionKey,
      name: cloakOfShadowActionName,
      summary: "Shroud yourself with shadows for 10 turns.",
      detail:
        "Expend 3 Focus Points to shroud yourself with shadows, becoming Invisible and gaining Shadow Flurry for 10 turns.",
      breakdown: "Gain a 10-turn shadow shroud",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesInlineLabel: "Use 3",
      usesInlineIcon: "brain",
      description: [...cloakOfShadowsDescription],
      resources: [
        {
          kind: "tracker",
          label: "Focus",
          current: focusPointsRemaining,
          total: focusPointsTotal,
          icon: "brain",
          cost: cloakOfShadowFocusCost
        }
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "Warrior of Shadow",
        description: [...cloakOfShadowsDescription]
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(cloakOfShadowDisabledReason),
      disabledReason: cloakOfShadowDisabledReason
    });
  }

  return actions;
}

export const getMonkWarriorOfShadowDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasMonkWarriorOfShadowArts(character)) {
    return {};
  }

  return {
    derivedStatusEntries: getMonkWarriorOfShadowDerivedStatusEntries(character),
    featureActions: getMonkWarriorOfShadowFeatureActions(character),
    transformWeaponAction: (action) =>
      hasMonkWarriorOfShadowStepAttackAdvantage(character)
        ? appendShadowStepAdvantageIndicator(action)
        : action,
    alwaysPreparedSpellIds: shadowArtsMinorIllusionSpellIds
  };
};
