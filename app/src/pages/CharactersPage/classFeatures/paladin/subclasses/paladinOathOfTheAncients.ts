import {
  ACTION_TYPE,
  CLASS_FEATURE,
  DAMAGE_TYPE,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost,
  createHeaderTagsFromResources
} from "../../cardUsage";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";
import {
  expendPaladinChannelDivinityUse,
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal,
  hasActivePaladinAuraOfProtection,
  hasPaladinFeature
} from "../paladin";

export const oathOfTheAncientsSubclassId = "paladin-oath-of-the-ancients";
export const naturesWrathActionKey = "paladin-natures-wrath";
export const undyingSentinelActionKey = "paladin-undying-sentinel";
export const elderChampionActionKey = "paladin-elder-champion";
export const paladinOathOfTheAncientsAuraOfWardingStatusSourceId =
  "feature-paladin-oath-of-the-ancients-aura-of-warding";
export const paladinOathOfTheAncientsElderChampionStatusSourceId =
  "feature-paladin-oath-of-the-ancients-elder-champion";
export const paladinOathOfTheAncientsDiminishDefianceStatusSourceId =
  "feature-paladin-oath-of-the-ancients-diminish-defiance";

const oathOfTheAncientsSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Ensnaring Strike", "Speak with Animals"]),
  5: resolveSpellIdsByName(["Misty Step", "Moonbeam"]),
  9: resolveSpellIdsByName(["Plant Growth", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Ice Storm", "Stoneskin"]),
  17: resolveSpellIdsByName(["Commune with Nature", "Tree Stride"])
} as const;
const undyingSentinelUsesTotal = 1;
const elderChampionUsesTotal = 1;
const elderChampionFallbackSpellSlotLevel = 5;
const auraOfWardingName = "Aura of Warding";
const diminishDefianceName = "Diminish Defiance";
const elderChampionName = "Elder Champion";
const oathOfTheAncientsSubclassEntry = getSubclassEntryById(oathOfTheAncientsSubclassId);

type PaladinOathOfTheAncientsCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "classFeatureState"
      | "currentHitPoints"
      | "level"
      | "spellSlotsExpended"
      | "statusEntries"
      | "subclassId"
    >
  >;

function isPaladinOathOfTheAncients(character: PaladinOathOfTheAncientsCharacter): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheAncientsSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function getOathOfTheAncientsFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = oathOfTheAncientsSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const naturesWrathDescription = getOathOfTheAncientsFeatureDescriptionEntries(
  CLASS_FEATURE.NATURES_WRATH
);
const undyingSentinelDescription = getOathOfTheAncientsFeatureDescriptionEntries(
  CLASS_FEATURE.UNDYING_SENTINEL
);
const elderChampionDescription = getOathOfTheAncientsFeatureDescriptionEntries(
  CLASS_FEATURE.ELDER_CHAMPION
);

function hasPaladinOathOfTheAncientsAuraOfWarding(
  character: PaladinOathOfTheAncientsCharacter
): boolean {
  return isPaladinOathOfTheAncients(character) && (character.level ?? 0) >= 7;
}

export function hasPaladinOathOfTheAncientsUndyingSentinelFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheAncientsSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function hasPaladinOathOfTheAncientsElderChampionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfTheAncientsSubclassId &&
    (character.level ?? 0) >= 20
  );
}

function getPaladinAuraRangeFeet(character: PaladinOathOfTheAncientsCharacter): number {
  return hasPaladinFeature(
    {
      className: character.className,
      level: character.level ?? 0
    },
    CLASS_FEATURE.AURA_EXPANSION
  )
    ? 30
    : 10;
}

export function getPaladinOathOfTheAncientsUndyingSentinelUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasPaladinOathOfTheAncientsUndyingSentinelFeature(character)
    ? undyingSentinelUsesTotal
    : 0;
}

export function getPaladinOathOfTheAncientsUndyingSentinelUsesRemaining(
  character: PaladinOathOfTheAncientsCharacter
): number {
  const totalUses = getPaladinOathOfTheAncientsUndyingSentinelUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.undyingSentinelUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getPaladinOathOfTheAncientsElderChampionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasPaladinOathOfTheAncientsElderChampionFeature(character) ? elderChampionUsesTotal : 0;
}

export function getPaladinOathOfTheAncientsElderChampionUsesRemaining(
  character: PaladinOathOfTheAncientsCharacter
): number {
  const totalUses = getPaladinOathOfTheAncientsElderChampionUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.elderChampionUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getPaladinOathOfTheAncientsElderChampionFallbackSlotSummary(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): { total: number; remaining: number } {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = elderChampionFallbackSpellSlotLevel - 1;
  const total = spellSlotTotals[slotIndex] ?? 0;

  return {
    total,
    remaining: Math.max(0, total - (spellSlotsExpended[slotIndex] ?? 0))
  };
}

function getPaladinOathOfTheAncientsElderChampionFallbackSlotLevel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): number | null {
  return getPaladinOathOfTheAncientsElderChampionFallbackSlotSummary(character).remaining > 0
    ? elderChampionFallbackSpellSlotLevel
    : null;
}

export function hasActivePaladinOathOfTheAncientsElderChampion(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasPaladinOathOfTheAncientsElderChampionFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfTheAncientsElderChampionStatusSourceId
  );
}

export function canUsePaladinOathOfTheAncientsElderChampionBonusActionPathForSpell(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return (
    hasActivePaladinOathOfTheAncientsElderChampion(character) &&
    spell.spellLevel > 0 &&
    spell.castingTime.includes(ACTION_TYPE.ACTION)
  );
}

function getPaladinOathOfTheAncientsFeatureActions(
  character: PaladinOathOfTheAncientsCharacter
): FeatureActionCard[] {
  if (!isPaladinOathOfTheAncients(character)) {
    return [];
  }

  const channelDivinityUsesRemaining = getPaladinChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState ?? {}
  });
  const channelDivinityUsesTotal = getPaladinChannelDivinityUsesTotal({
    className: character.className,
    level: character.level ?? 0
  });
  const actions: FeatureActionCard[] = [
    {
      key: naturesWrathActionKey,
      name: "Nature's Wrath",
      summary: "Conjure spectral vines around nearby creatures.",
      detail: "Use a Magic action to restrain nearby creatures with primal magic.",
      breakdown: "Spectral vine restraint",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "pyromancy",
      usesRemaining: channelDivinityUsesRemaining,
      usesTotal: channelDivinityUsesTotal,
      description: [...naturesWrathDescription],
      headerTags: createHeaderTagsFromResources([
        {
          kind: "tracker",
          label: "Uses",
          current: channelDivinityUsesRemaining,
          total: channelDivinityUsesTotal,
          icon: "pyromancy",
          cost: 1
        }
      ]),
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of the Ancients"
      },
      execute: {
        kind: "activate"
      },
      disabled: channelDivinityUsesRemaining <= 0,
      disabledReason:
        channelDivinityUsesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
    }
  ];

  if (hasPaladinOathOfTheAncientsUndyingSentinelFeature(character)) {
    const usesRemaining = getPaladinOathOfTheAncientsUndyingSentinelUsesRemaining(character);

    actions.push({
      key: undyingSentinelActionKey,
      name: "Undying Sentinel",
      summary: "Rise with ancient vitality when you are at death's door.",
      detail: "When you are at 0 Hit Points, restore yourself with life-preserving magic.",
      breakdown: "Rise at death's door",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal: undyingSentinelUsesTotal,
      description: [...undyingSentinelDescription],
      headerTags: createHeaderTagsFromResources([
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: undyingSentinelUsesTotal,
          cost: 1
        }
      ]),
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of the Ancients",
        blockedReason:
          character.currentHitPoints === 0
            ? undefined
            : "Undying Sentinel can only activate while you are at 0 Hit Points."
      },
      execute: {
        kind: "activate"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Undying Sentinel recharges on a Long Rest." : undefined
    });
  }

  if (hasPaladinOathOfTheAncientsElderChampionFeature(character)) {
    const usesRemaining = getPaladinOathOfTheAncientsElderChampionUsesRemaining(character);
    const fallbackSlotSummary =
      getPaladinOathOfTheAncientsElderChampionFallbackSlotSummary(character);
    const showFallbackSlotInfo = usesRemaining <= 0 && fallbackSlotSummary.total > 0;
    const hasFallbackSlot = showFallbackSlotInfo && fallbackSlotSummary.remaining > 0;
    const isActive = hasActivePaladinOathOfTheAncientsElderChampion(character);

    actions.push({
      key: elderChampionActionKey,
      name: elderChampionName,
      summary: "Imbue your aura with primal power.",
      detail: "Enter an empowered champion state for 10 rounds.",
      breakdown: "Primal champion aura",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        elderChampionUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        })
      ),
      usesRemaining,
      usesTotal: elderChampionUsesTotal,
      usesInlineLabel: showFallbackSlotInfo ? "| Use 5th Spell Slot" : undefined,
      description: [...elderChampionDescription],
      headerTags: createChargesAndUsageHeaderTags(
        usesRemaining,
        elderChampionUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        }),
        fallbackSlotSummary.remaining,
        fallbackSlotSummary.total,
        {
          label: "Spell Slots"
        }
      ),
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of the Ancients"
      },
      execute: {
        kind: "activate"
      },
      isActive,
      disabled: isActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: isActive
        ? "Elder Champion is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Elder Champion use or level 5 spell slots remaining."
          : undefined
    });
  }

  return actions;
}

function getPaladinOathOfTheAncientsDerivedStatusEntries(
  character: PaladinOathOfTheAncientsCharacter
): DerivedFeatureStatusEntry[] {
  const auraProtectionActive = hasActivePaladinAuraOfProtection({
    className: character.className,
    level: character.level ?? 0,
    statusEntries: character.statusEntries ?? []
  });
  const statusEntries: DerivedFeatureStatusEntry[] = [];

  if (hasPaladinOathOfTheAncientsAuraOfWarding(character) && auraProtectionActive) {
    statusEntries.push(
      {
        id: paladinOathOfTheAncientsAuraOfWardingStatusSourceId,
        sourceId: paladinOathOfTheAncientsAuraOfWardingStatusSourceId,
        group: STATUS_ENTRY_GROUP.AURAS,
        value: auraOfWardingName,
        source: auraOfWardingName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        rangeFeet: getPaladinAuraRangeFeet(character)
      },
      {
        id: `${paladinOathOfTheAncientsAuraOfWardingStatusSourceId}-necrotic`,
        sourceId: paladinOathOfTheAncientsAuraOfWardingStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.NECROTIC,
        source: auraOfWardingName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        }
      },
      {
        id: `${paladinOathOfTheAncientsAuraOfWardingStatusSourceId}-psychic`,
        sourceId: paladinOathOfTheAncientsAuraOfWardingStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.PSYCHIC,
        source: auraOfWardingName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        }
      },
      {
        id: `${paladinOathOfTheAncientsAuraOfWardingStatusSourceId}-radiant`,
        sourceId: paladinOathOfTheAncientsAuraOfWardingStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.RADIANT,
        source: auraOfWardingName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        }
      }
    );
  }

  if (hasActivePaladinOathOfTheAncientsElderChampion(character) && auraProtectionActive) {
    statusEntries.push({
      id: paladinOathOfTheAncientsDiminishDefianceStatusSourceId,
      sourceId: paladinOathOfTheAncientsDiminishDefianceStatusSourceId,
      group: STATUS_ENTRY_GROUP.AURAS,
      value: diminishDefianceName,
      source: diminishDefianceName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: getPaladinAuraRangeFeet(character)
    });
  }

  return statusEntries;
}

export function applyPaladinOathOfTheAncientsElderChampionStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfTheAncientsElderChampionStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: elderChampionName,
        source: elderChampionName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: paladinOathOfTheAncientsElderChampionStatusSourceId
      })
    ]
  };
}

export function activatePaladinOathOfTheAncientsNaturesWrath(character: Character): Character {
  if (
    !isPaladinOathOfTheAncients(character) ||
    getPaladinChannelDivinityUsesRemaining(character) <= 0
  ) {
    return character;
  }

  return expendPaladinChannelDivinityUse(character);
}

export function activatePaladinOathOfTheAncientsUndyingSentinel(character: Character): Character {
  if (
    !hasPaladinOathOfTheAncientsUndyingSentinelFeature(character) ||
    character.currentHitPoints !== 0 ||
    getPaladinOathOfTheAncientsUndyingSentinelUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};
  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(character);
  const nextCurrentHitPoints = Math.min(
    effectiveHitPointMaximum,
    Math.max(0, 3 * (character.level ?? 0))
  );

  return reconcileCharacterStatusConsequences({
    ...character,
    currentHitPoints: nextCurrentHitPoints,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        undyingSentinelUsesExpended: (paladinState.undyingSentinelUsesExpended ?? 0) + 1
      }
    }
  });
}

export function activatePaladinOathOfTheAncientsElderChampion(character: Character): Character {
  if (
    !hasPaladinOathOfTheAncientsElderChampionFeature(character) ||
    hasActivePaladinOathOfTheAncientsElderChampion(character)
  ) {
    return character;
  }

  const usesRemaining = getPaladinOathOfTheAncientsElderChampionUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const paladinState = character.classFeatureState?.paladin ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        paladin: {
          ...paladinState,
          elderChampionUsesExpended: (paladinState.elderChampionUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    const fallbackSlotLevel = getPaladinOathOfTheAncientsElderChampionFallbackSlotLevel(character);

    if (fallbackSlotLevel === null) {
      return character;
    }

    const spellSlotTotals = getSpellSlotTotalsForCharacter(
      character.className,
      character.level,
      character.subclassId
    );
    const spellSlotsExpended = normalizeSpellSlotsExpended(
      character.spellSlotsExpended,
      spellSlotTotals
    );
    const nextSpellSlotsExpended = [...spellSlotsExpended];
    nextSpellSlotsExpended[fallbackSlotLevel - 1] =
      (nextSpellSlotsExpended[fallbackSlotLevel - 1] ?? 0) + 1;

    nextCharacter = {
      ...character,
      spellSlotsExpended: nextSpellSlotsExpended
    };
  }

  return applyPaladinOathOfTheAncientsElderChampionStatus(nextCharacter);
}

export function restorePaladinOathOfTheAncientsUndyingSentinelOnLongRest(
  character: Character
): Character {
  if (!hasPaladinOathOfTheAncientsUndyingSentinelFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.undyingSentinelUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        undyingSentinelUsesExpended: 0
      }
    }
  };
}

export function restorePaladinOathOfTheAncientsElderChampionOnLongRest(
  character: Character
): Character {
  if (!hasPaladinOathOfTheAncientsElderChampionFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.elderChampionUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        elderChampionUsesExpended: 0
      }
    }
  };
}

export function advancePaladinOathOfTheAncientsFeaturesForNewRound(
  character: Character
): Character {
  if (!hasActivePaladinOathOfTheAncientsElderChampion(character)) {
    return character;
  }

  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(character);
  const nextCurrentHitPoints = Math.min(
    effectiveHitPointMaximum,
    Math.max(0, character.currentHitPoints) + 10
  );

  return nextCurrentHitPoints === character.currentHitPoints
    ? character
    : reconcileCharacterStatusConsequences({
        ...character,
        currentHitPoints: nextCurrentHitPoints
      });
}

export const getPaladinOathOfTheAncientsDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfTheAncientsSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          oathOfTheAncientsSpellIdsByLevel
        ),
        featureActions: getPaladinOathOfTheAncientsFeatureActions(character),
        derivedStatusEntries: getPaladinOathOfTheAncientsDerivedStatusEntries(character)
      }
    : {};
