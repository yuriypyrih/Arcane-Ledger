import { sorcererFeatures } from "../../../../../codex/classes";
import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../types";

export const clockworkSorcerySubclassId = "sorcerer-clockwork-sorcery";
export const sorcererClockworkRestoreBalanceReactionId =
  "reaction-sorcerer-clockwork-sorcery-restore-balance";
export const sorcererBastionOfLawActionKey = "sorcerer-clockwork-sorcery-bastion-of-law";
export const sorcererTranceOfOrderActionKey = "sorcerer-clockwork-sorcery-trance-of-order";
export const sorcererClockworkCavalcadeActionKey =
  "sorcerer-clockwork-sorcery-clockwork-cavalcade";
export const sorcererClockworkBastionOfLawStatusSourceId =
  "feature-sorcerer-clockwork-sorcery-bastion-of-law";
export const sorcererClockworkTranceOfOrderStatusSourceId =
  "feature-sorcerer-clockwork-sorcery-trance-of-order";

const clockworkSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Aid", "Alarm", "Lesser Restoration", "Protection from Evil and Good"]),
  5: resolveSpellIdsByName(["Dispel Magic", "Protection from Energy"]),
  7: resolveSpellIdsByName(["Freedom of Movement", "Summon Construct"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Wall of Force"])
} as const;
const bastionOfLawPointOptions = [1, 2, 3, 4, 5] as const;
const clockworkSorcerySubclassEntry = getSubclassEntryById(clockworkSorcerySubclassId);
const restoreBalanceName = "Restore Balance";
const bastionOfLawName = "Bastion of Law";
const tranceOfOrderName = "Trance of Order";
const clockworkCavalcadeName = "Clockwork Cavalcade";
const tranceOfOrderUsesTotal = 1;
const tranceOfOrderDurationRounds = 10;
const tranceOfOrderFallbackSorceryPointCost = 5;
const clockworkCavalcadeUsesTotal = 1;
const clockworkCavalcadeFallbackSorceryPointCost = 7;

type ClockworkSorceryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId" | "statusEntries">>;

function getClockworkFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  return (
    clockworkSorcerySubclassEntry?.features.find((row) => row.classFeatures.includes(feature))
      ?.featureOverrides?.[feature]?.description ?? []
  ).filter((entry): entry is string => typeof entry === "string");
}

const restoreBalanceDescription = getClockworkFeatureDescriptionEntries(CLASS_FEATURE.RESTORE_BALANCE);
const bastionOfLawDescription = getClockworkFeatureDescriptionEntries(CLASS_FEATURE.BASTION_OF_LAW);
const tranceOfOrderDescription = getClockworkFeatureDescriptionEntries(CLASS_FEATURE.TRANCE_OF_ORDER);
const clockworkCavalcadeDescription = getClockworkFeatureDescriptionEntries(
  CLASS_FEATURE.CLOCKWORK_CAVALCADE
);
const restoreBalanceReactionEntry: ReactionEntry = {
  id: sorcererClockworkRestoreBalanceReactionId,
  reaction: REACTION.RESTORE_BALANCE,
  name: restoreBalanceName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.RESTORE_BALANCE,
  sourceLabel: "Clockwork Sorcery",
  description: restoreBalanceDescription
};

function getSorcererFeatureRow(level: number | undefined) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getSorcererClockworkSorceryPointsTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return character.className === "Sorcerer"
    ? Math.max(0, getSorcererFeatureRow(character.level)?.sorceryPoints ?? 0)
    : 0;
}

function getSorcererClockworkSorceryPointsRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState">>
): number {
  const totalPoints = getSorcererClockworkSorceryPointsTotal(character);
  const expendedPoints = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);

  return Math.max(
    0,
    totalPoints -
      (Number.isFinite(expendedPoints)
        ? Math.max(0, Math.min(totalPoints, Math.floor(expendedPoints)))
        : 0)
  );
}

function spendSorcererClockworkSorceryPoints(character: Character, cost: number): Character {
  const normalizedCost = Math.max(0, Math.floor(cost));

  if (normalizedCost <= 0) {
    return character;
  }

  const totalPoints = getSorcererClockworkSorceryPointsTotal(character);
  const remainingPoints = getSorcererClockworkSorceryPointsRemaining(character);

  if (totalPoints <= 0 || remainingPoints < normalizedCost) {
    return character;
  }

  const currentExpended = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);
  const nextExpended = Math.max(
    0,
    Math.min(
      totalPoints,
      (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + normalizedCost
    )
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        sorceryPointsExpended: nextExpended
      }
    }
  };
}

function hasSorcererClockworkRestoreBalanceFeature(character: ClockworkSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === clockworkSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasSorcererClockworkBastionOfLawFeature(character: ClockworkSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === clockworkSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererClockworkTranceOfOrderFeature(character: ClockworkSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === clockworkSorcerySubclassId &&
    (character.level ?? 0) >= 14
  );
}

function hasSorcererClockworkCavalcadeFeature(character: ClockworkSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === clockworkSorcerySubclassId &&
    (character.level ?? 0) >= 18
  );
}

function getSorcererClockworkReactionEntries(character: ClockworkSorceryCharacter): ReactionEntry[] {
  return hasSorcererClockworkRestoreBalanceFeature(character) ? [restoreBalanceReactionEntry] : [];
}

export function getSorcererClockworkRestoreBalanceUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasSorcererClockworkRestoreBalanceFeature(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifierForCharacter(character, "CHA"));
}

export function getSorcererClockworkRestoreBalanceUsesRemaining(
  character: ClockworkSorceryCharacter
): number {
  const totalUses = getSorcererClockworkRestoreBalanceUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.restoreBalanceUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

function createSorcererClockworkBastionOfLawStatusLabel(cost: number): string {
  return `${bastionOfLawName} (${cost}d8 Ward)`;
}

function clearSorcererClockworkBastionOfLawStatuses(statusEntries: Character["statusEntries"]) {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== sorcererClockworkBastionOfLawStatusSourceId
  );
}

function clearSorcererClockworkTranceOfOrderStatuses(statusEntries: Character["statusEntries"]) {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== sorcererClockworkTranceOfOrderStatusSourceId
  );
}

function clearSorcererClockworkLongRestStatuses(statusEntries: Character["statusEntries"]) {
  return clearSorcererClockworkTranceOfOrderStatuses(
    clearSorcererClockworkBastionOfLawStatuses(statusEntries)
  );
}

function getSorcererClockworkLegacyDerivedStatusEntries(
  character: ClockworkSorceryCharacter
): DerivedFeatureStatusEntry[] {
  return normalizeCharacterStatusEntries(character.statusEntries)
    .filter(
      (entry) =>
        entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
        (entry.sourceId === sorcererClockworkBastionOfLawStatusSourceId ||
          entry.sourceId === sorcererClockworkTranceOfOrderStatusSourceId)
    )
    .map((entry) => ({
      ...entry,
      id: entry.sourceId ?? entry.id
    }));
}

function hasActiveSorcererClockworkTranceOfOrder(character: ClockworkSorceryCharacter): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === sorcererClockworkTranceOfOrderStatusSourceId
  );
}

export function getSorcererClockworkTranceOfOrderUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererClockworkTranceOfOrderFeature(character) ? tranceOfOrderUsesTotal : 0;
}

function getSorcererClockworkTranceOfOrderUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  const totalUses = getSorcererClockworkTranceOfOrderUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.tranceOfOrderUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

export function getSorcererClockworkCavalcadeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererClockworkCavalcadeFeature(character) ? clockworkCavalcadeUsesTotal : 0;
}

function getSorcererClockworkCavalcadeUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  const totalUses = getSorcererClockworkCavalcadeUsesTotal(character);
  const expendedUses = Number(
    character.classFeatureState?.sorcerer?.clockworkCavalcadeUsesExpended
  );
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

function getSorcererClockworkBastionOfLawOptions(
  character: ClockworkSorceryCharacter
): FeatureActionOptionCard[] {
  const remainingPoints = getSorcererClockworkSorceryPointsRemaining(character);

  return bastionOfLawPointOptions.map((cost) => ({
    key: String(cost),
    name: `${cost} Sorcery Point${cost === 1 ? "" : "s"}`,
    summary: `Create a ${cost}d8 ward.`,
    detail: `Spend ${cost} Sorcery Point${cost === 1 ? "" : "s"} to create a ${cost}d8 ward until you finish a Long Rest or use Bastion of Law again.`,
    breakdown: `${cost}d8 ward`,
    usesLabel: String(cost),
    usesIcon: "sparkles",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    disabled: cost > remainingPoints,
    disabledReason:
      cost > remainingPoints
        ? `You need ${cost} Sorcery Point${cost === 1 ? "" : "s"}.`
        : undefined
  }));
}

function getSorcererClockworkFeatureActions(
  character: ClockworkSorceryCharacter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasSorcererClockworkBastionOfLawFeature(character)) {
    const remainingPoints = getSorcererClockworkSorceryPointsRemaining(character);
    const totalPoints = getSorcererClockworkSorceryPointsTotal(character);

    actions.push({
      key: sorcererBastionOfLawActionKey,
      name: bastionOfLawName,
      summary: "Spend Sorcery Points to create a ward of order.",
      detail: "Spend 1 to 5 Sorcery Points to create a magical ward represented by d8s.",
      breakdown: "Create ward of order",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      valueLabel: "Uses Sorcery Points",
      description: bastionOfLawDescription,
      resources:
        totalPoints > 0
          ? [
              {
                kind: "tracker",
                label: "Sorcery Points",
                current: remainingPoints,
                total: totalPoints,
                icon: "sparkles",
                tone: remainingPoints > 0 ? "default" : "danger"
              }
            ]
          : undefined,
      drawer: {
        kind: "options",
        eyebrow: "Clockwork Sorcery",
        description: bastionOfLawDescription,
        helperText:
          remainingPoints > 0
            ? "Choose how many Sorcery Points to spend. The ward lasts until you finish a Long Rest or use Bastion of Law again."
            : "You need at least 1 Sorcery Point to create a ward.",
        optionSelection: "single-confirm"
      },
      execute: {
        kind: "option"
      },
      disabled: remainingPoints <= 0,
      disabledReason: remainingPoints <= 0 ? "No Sorcery Points remaining." : undefined
    });
  }

  if (hasSorcererClockworkTranceOfOrderFeature(character)) {
    const usesRemaining = getSorcererClockworkTranceOfOrderUsesRemaining(character);
    const totalPoints = getSorcererClockworkSorceryPointsTotal(character);
    const remainingPoints = getSorcererClockworkSorceryPointsRemaining(character);
    const isActive = hasActiveSorcererClockworkTranceOfOrder(character);
    const fallbackAvailable =
      usesRemaining <= 0 && remainingPoints >= tranceOfOrderFallbackSorceryPointCost;
    const disabledReason = isActive
      ? `${tranceOfOrderName} is already active.`
      : usesRemaining > 0 || fallbackAvailable
        ? undefined
        : `You need ${tranceOfOrderFallbackSorceryPointCost} Sorcery Points.`;

    actions.push({
      key: sorcererTranceOfOrderActionKey,
      name: tranceOfOrderName,
      summary: "Align your consciousness with the order of Mechanus.",
      detail: "Enter a state of perfect order for 10 turns.",
      breakdown: "10-turn perfect order",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        getSorcererClockworkTranceOfOrderUsesTotal(character),
        createFeatureActionCardCost({
          amountText: String(tranceOfOrderFallbackSorceryPointCost),
          icon: "sparkles"
        })
      ),
      usesRemaining,
      usesTotal: getSorcererClockworkTranceOfOrderUsesTotal(character),
      usesInlineLabel:
        usesRemaining <= 0 ? `| Use ${tranceOfOrderFallbackSorceryPointCost}` : undefined,
      usesInlineIcon: usesRemaining <= 0 ? "sparkles" : undefined,
      usesInlineSuffix: usesRemaining <= 0 ? "instead" : undefined,
      description: tranceOfOrderDescription,
      headerTags:
        totalPoints > 0
          ? createChargesAndUsageHeaderTags(
              usesRemaining,
              getSorcererClockworkTranceOfOrderUsesTotal(character),
              createFeatureActionCardCost({
                amountText: String(tranceOfOrderFallbackSorceryPointCost),
                icon: "sparkles"
              }),
              remainingPoints,
              totalPoints,
              {
                icon: "sparkles"
              }
            )
          : undefined,
      resources:
        totalPoints > 0
          ? [
              {
                kind: "tracker",
                label: "Sorcery Points",
                current: remainingPoints,
                total: totalPoints,
                icon: "sparkles",
                tone:
                  usesRemaining <= 0 && remainingPoints < tranceOfOrderFallbackSorceryPointCost
                    ? "danger"
                    : "default",
                cost: usesRemaining <= 0 ? tranceOfOrderFallbackSorceryPointCost : undefined
              }
            ]
          : undefined,
      drawer: {
        kind: "confirm",
        eyebrow: "Clockwork Sorcery",
        description: tranceOfOrderDescription,
        helperText:
          usesRemaining > 0
            ? "Enter Trance of Order for 10 turns."
            : fallbackAvailable
              ? `Your normal use is depleted, so activating this feature will spend ${tranceOfOrderFallbackSorceryPointCost} Sorcery Points.`
              : `You need ${tranceOfOrderFallbackSorceryPointCost} Sorcery Points to activate ${tranceOfOrderName} again.`,
        resources:
          totalPoints > 0
            ? [
                {
                  kind: "tracker",
                  label: "Sorcery Points",
                  current: remainingPoints,
                  total: totalPoints,
                  icon: "sparkles",
                  tone:
                    usesRemaining <= 0 && remainingPoints < tranceOfOrderFallbackSorceryPointCost
                      ? "danger"
                      : "default",
                  cost: usesRemaining <= 0 ? tranceOfOrderFallbackSorceryPointCost : undefined
                }
              ]
            : undefined
      },
      execute: {
        kind: "activate"
      },
      isActive,
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  if (hasSorcererClockworkCavalcadeFeature(character)) {
    const usesRemaining = getSorcererClockworkCavalcadeUsesRemaining(character);
    const totalPoints = getSorcererClockworkSorceryPointsTotal(character);
    const remainingPoints = getSorcererClockworkSorceryPointsRemaining(character);
    const fallbackAvailable =
      usesRemaining <= 0 && remainingPoints >= clockworkCavalcadeFallbackSorceryPointCost;
    const disabledReason =
      usesRemaining > 0 || fallbackAvailable
        ? undefined
        : `You need ${clockworkCavalcadeFallbackSorceryPointCost} Sorcery Points.`;

    actions.push({
      key: sorcererClockworkCavalcadeActionKey,
      name: clockworkCavalcadeName,
      summary: "Summon spirits of order to heal, repair, and dispel.",
      detail: "Summon spirits of order in a 30-foot cube.",
      breakdown: "Summon order spirits",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        getSorcererClockworkCavalcadeUsesTotal(character),
        createFeatureActionCardCost({
          amountText: String(clockworkCavalcadeFallbackSorceryPointCost),
          icon: "sparkles"
        })
      ),
      usesRemaining,
      usesTotal: getSorcererClockworkCavalcadeUsesTotal(character),
      usesInlineLabel:
        usesRemaining <= 0 ? `| Use ${clockworkCavalcadeFallbackSorceryPointCost}` : undefined,
      usesInlineIcon: usesRemaining <= 0 ? "sparkles" : undefined,
      usesInlineSuffix: usesRemaining <= 0 ? "instead" : undefined,
      description: clockworkCavalcadeDescription,
      headerTags:
        totalPoints > 0
          ? createChargesAndUsageHeaderTags(
              usesRemaining,
              getSorcererClockworkCavalcadeUsesTotal(character),
              createFeatureActionCardCost({
                amountText: String(clockworkCavalcadeFallbackSorceryPointCost),
                icon: "sparkles"
              }),
              remainingPoints,
              totalPoints,
              {
                icon: "sparkles"
              }
            )
          : undefined,
      resources:
        totalPoints > 0
          ? [
              {
                kind: "tracker",
                label: "Sorcery Points",
                current: remainingPoints,
                total: totalPoints,
                icon: "sparkles",
                tone:
                  usesRemaining <= 0 && remainingPoints < clockworkCavalcadeFallbackSorceryPointCost
                    ? "danger"
                    : "default",
                cost: usesRemaining <= 0 ? clockworkCavalcadeFallbackSorceryPointCost : undefined
              }
            ]
          : undefined,
      drawer: {
        kind: "confirm",
        eyebrow: "Clockwork Sorcery",
        description: clockworkCavalcadeDescription,
        helperText:
          usesRemaining > 0
            ? "Use Clockwork Cavalcade."
            : fallbackAvailable
              ? `Your normal use is depleted, so activating this feature will spend ${clockworkCavalcadeFallbackSorceryPointCost} Sorcery Points.`
              : `You need ${clockworkCavalcadeFallbackSorceryPointCost} Sorcery Points to activate ${clockworkCavalcadeName} again.`,
        resources:
          totalPoints > 0
            ? [
                {
                  kind: "tracker",
                  label: "Sorcery Points",
                  current: remainingPoints,
                  total: totalPoints,
                  icon: "sparkles",
                  tone:
                    usesRemaining <= 0 &&
                    remainingPoints < clockworkCavalcadeFallbackSorceryPointCost
                      ? "danger"
                      : "default",
                  cost: usesRemaining <= 0 ? clockworkCavalcadeFallbackSorceryPointCost : undefined
                }
              ]
            : undefined
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  return actions;
}

export function consumeSorcererClockworkRestoreBalanceUse(character: Character): Character {
  if (
    !hasSorcererClockworkRestoreBalanceFeature(character) ||
    getSorcererClockworkRestoreBalanceUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const sorcererState = character.classFeatureState?.sorcerer ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        restoreBalanceUsesExpended: (sorcererState.restoreBalanceUsesExpended ?? 0) + 1
      }
    }
  };
}

export function activateSorcererClockworkBastionOfLaw(
  character: Character,
  optionKey: string
): Character {
  if (!hasSorcererClockworkBastionOfLawFeature(character)) {
    return character;
  }

  const cost = Number(optionKey);

  if (
    !Number.isFinite(cost) ||
    !bastionOfLawPointOptions.includes(cost as (typeof bastionOfLawPointOptions)[number])
  ) {
    return character;
  }

  const nextCharacter = spendSorcererClockworkSorceryPoints(character, cost);

  if (nextCharacter === character) {
    return character;
  }

  return {
    ...nextCharacter,
    statusEntries: [
      ...clearSorcererClockworkBastionOfLawStatuses(nextCharacter.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: createSorcererClockworkBastionOfLawStatusLabel(cost),
        source: bastionOfLawName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: sorcererClockworkBastionOfLawStatusSourceId
      })
    ]
  };
}

export function activateSorcererClockworkTranceOfOrder(character: Character): Character {
  if (
    !hasSorcererClockworkTranceOfOrderFeature(character) ||
    hasActiveSorcererClockworkTranceOfOrder(character)
  ) {
    return character;
  }

  const usesRemaining = getSorcererClockworkTranceOfOrderUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const sorcererState = character.classFeatureState?.sorcerer ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...sorcererState,
          tranceOfOrderUsesExpended: Math.max(
            0,
            Math.min(
              tranceOfOrderUsesTotal,
              (sorcererState.tranceOfOrderUsesExpended ?? 0) + 1
            )
          )
        }
      }
    };
  } else {
    nextCharacter = spendSorcererClockworkSorceryPoints(
      character,
      tranceOfOrderFallbackSorceryPointCost
    );

    if (nextCharacter === character) {
      return character;
    }
  }

  return {
    ...nextCharacter,
    statusEntries: [
      ...clearSorcererClockworkTranceOfOrderStatuses(nextCharacter.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: tranceOfOrderName,
        source: tranceOfOrderName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: tranceOfOrderDurationRounds
        },
        sourceId: sorcererClockworkTranceOfOrderStatusSourceId
      })
    ]
  };
}

export function activateSorcererClockworkCavalcade(character: Character): Character {
  if (!hasSorcererClockworkCavalcadeFeature(character)) {
    return character;
  }

  const usesRemaining = getSorcererClockworkCavalcadeUsesRemaining(character);

  if (usesRemaining > 0) {
    const sorcererState = character.classFeatureState?.sorcerer ?? {};

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...sorcererState,
          clockworkCavalcadeUsesExpended: Math.max(
            0,
            Math.min(
              clockworkCavalcadeUsesTotal,
              (sorcererState.clockworkCavalcadeUsesExpended ?? 0) + 1
            )
          )
        }
      }
    };
  }

  return spendSorcererClockworkSorceryPoints(character, clockworkCavalcadeFallbackSorceryPointCost);
}

export function restoreSorcererClockworkRestoreBalanceOnLongRest(character: Character): Character {
  if (!hasSorcererClockworkRestoreBalanceFeature(character)) {
    return character;
  }

  const sorcererState = character.classFeatureState?.sorcerer ?? {};

  if ((sorcererState.restoreBalanceUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        restoreBalanceUsesExpended: 0
      }
    }
  };
}

function restoreSorcererClockworkTranceOfOrderOnLongRest(character: Character): Character {
  if (!hasSorcererClockworkTranceOfOrderFeature(character)) {
    return character;
  }

  const sorcererState = character.classFeatureState?.sorcerer ?? {};

  if ((sorcererState.tranceOfOrderUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        tranceOfOrderUsesExpended: 0
      }
    }
  };
}

function restoreSorcererClockworkCavalcadeOnLongRest(character: Character): Character {
  if (!hasSorcererClockworkCavalcadeFeature(character)) {
    return character;
  }

  const sorcererState = character.classFeatureState?.sorcerer ?? {};

  if ((sorcererState.clockworkCavalcadeUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        clockworkCavalcadeUsesExpended: 0
      }
    }
  };
}

export function restoreSorcererClockworkFeaturesOnLongRest(character: Character): Character {
  const nextStatusEntries = clearSorcererClockworkLongRestStatuses(character.statusEntries);
  const currentStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const statusesChanged =
    nextStatusEntries.length !== currentStatusEntries.length ||
    nextStatusEntries.some((entry, index) => entry.id !== currentStatusEntries[index]?.id);
  const nextCharacter = statusesChanged
    ? {
        ...character,
        statusEntries: nextStatusEntries
      }
    : character;

  return restoreSorcererClockworkCavalcadeOnLongRest(
    restoreSorcererClockworkTranceOfOrderOnLongRest(
      restoreSorcererClockworkRestoreBalanceOnLongRest(nextCharacter)
    )
  );
}

export const getSorcererClockworkSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === clockworkSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        derivedStatusEntries: getSorcererClockworkLegacyDerivedStatusEntries(character),
        featureActions: getSorcererClockworkFeatureActions(character),
        featureActionOptions: hasSorcererClockworkBastionOfLawFeature(character)
          ? {
              [sorcererBastionOfLawActionKey]: getSorcererClockworkBastionOfLawOptions(character)
            }
          : {},
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          clockworkSorcerySpellIdsByLevel
        ),
        reactionEntries: getSorcererClockworkReactionEntries(character)
      }
    : {};
