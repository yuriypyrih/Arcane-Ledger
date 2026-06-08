import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_ROUND_TICK,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { WeaponAction } from "../../../gameplay";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureIndicator,
  FeatureSpeedBonus
} from "../../types";
import {
  expendPaladinChannelDivinityUse,
  getPaladinChannelDivinityUsesRemaining,
  hasActivePaladinAuraOfProtection,
  hasPaladinFeature
} from "../paladin";

export const oathOfVengeanceSubclassId = "paladin-oath-of-vengeance";
export const avengingAngelActionKey = "paladin-avenging-angel";
export const frightfulAuraReactionId = "reaction-paladin-frightful-aura";
export const relentlessAvengerReactionId = "reaction-paladin-relentless-avenger";
export const soulOfVengeanceReactionId = "reaction-paladin-soul-of-vengeance";
export const paladinOathOfVengeanceAvengingAngelStatusSourceId =
  "feature-paladin-oath-of-vengeance-avenging-angel";
export const paladinOathOfVengeanceFrightfulAuraStatusSourceId =
  "feature-paladin-oath-of-vengeance-frightful-aura";
export const paladinOathOfVengeanceVowOfEnmityStatusSourceId =
  "feature-paladin-oath-of-vengeance-vow-of-enmity";

const oathOfVengeanceSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Bane", "Hunter's Mark"]),
  5: resolveSpellIdsByName(["Hold Person", "Misty Step"]),
  9: resolveSpellIdsByName(["Haste", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Banishment", "Dimension Door"]),
  17: resolveSpellIdsByName(["Hold Monster", "Scrying"])
} as const;
const avengingAngelName = "Avenging Angel";
const frightfulAuraName = "Frightful Aura";
const relentlessAvengerName = "Relentless Avenger";
const soulOfVengeanceName = "Soul of Vengeance";
const vowOfEnmityName = "Vow of Enmity";
const vowOfEnmityDurationTurns = 10;
const avengingAngelUsesTotal = 1;
const avengingAngelFallbackSpellSlotLevel = 5;
const oathOfVengeanceSubclassEntry = getSubclassEntryById(oathOfVengeanceSubclassId);
const vowOfEnmityAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: vowOfEnmityName
};
const frightfulAuraDescription = [
  "Whenever an enemy starts its turn in your Aura of Protection, that creature must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute or until it takes any damage.",
  "Attack rolls against the Frightened creature have Advantage."
] as const;

type PaladinOathOfVengeanceCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "classFeatureState" | "level" | "spellSlotsExpended" | "statusEntries" | "subclassId"
    >
  >;

type VowOfEnmityAction = Pick<WeaponAction, "attackKind">;

export type PaladinOathOfVengeanceVowOfEnmityOptionState = {
  active: boolean;
  disabled: boolean;
  disabledReason?: string;
};

function getOathOfVengeanceFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = oathOfVengeanceSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const avengingAngelDescription = getOathOfVengeanceFeatureDescriptionEntries(
  CLASS_FEATURE.AVENGING_ANGEL
);
const frightfulAuraReactionEntry: ReactionEntry = {
  id: frightfulAuraReactionId,
  reaction: REACTION.FRIGHTFUL_AURA,
  name: frightfulAuraName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.AVENGING_ANGEL,
  sourceLabel: "Oath of Vengeance",
  description: [...frightfulAuraDescription]
};
const relentlessAvengerDescription = getOathOfVengeanceFeatureDescriptionEntries(
  CLASS_FEATURE.RELENTLESS_AVENGER
);
const relentlessAvengerReactionEntry: ReactionEntry = {
  id: relentlessAvengerReactionId,
  reaction: REACTION.RELENTLESS_AVENGER,
  name: relentlessAvengerName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.RELENTLESS_AVENGER,
  sourceLabel: "Oath of Vengeance",
  description: [...relentlessAvengerDescription]
};
const soulOfVengeanceDescription = getOathOfVengeanceFeatureDescriptionEntries(
  CLASS_FEATURE.SOUL_OF_VENGEANCE
);
const soulOfVengeanceReactionEntry: ReactionEntry = {
  id: soulOfVengeanceReactionId,
  reaction: REACTION.SOUL_OF_VENGEANCE,
  name: soulOfVengeanceName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.SOUL_OF_VENGEANCE,
  sourceLabel: "Oath of Vengeance",
  description: [...soulOfVengeanceDescription]
};

export function hasPaladinOathOfVengeanceAvengingAngelFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfVengeanceSubclassId &&
    (character.level ?? 0) >= 20
  );
}

export function hasPaladinOathOfVengeanceVowOfEnmity(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfVengeanceSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasPaladinOathOfVengeanceRelentlessAvengerFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfVengeanceSubclassId &&
    (character.level ?? 0) >= 7
  );
}

function hasPaladinOathOfVengeanceSoulOfVengeanceFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfVengeanceSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function getPaladinOathOfVengeanceAvengingAngelUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasPaladinOathOfVengeanceAvengingAngelFeature(character) ? avengingAngelUsesTotal : 0;
}

export function getPaladinOathOfVengeanceAvengingAngelUsesRemaining(
  character: PaladinOathOfVengeanceCharacter
): number {
  const totalUses = getPaladinOathOfVengeanceAvengingAngelUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.avengingAngelUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getPaladinOathOfVengeanceAvengingAngelFallbackSlotSummary(
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
  const slotIndex = avengingAngelFallbackSpellSlotLevel - 1;
  const total = spellSlotTotals[slotIndex] ?? 0;

  return {
    total,
    remaining: Math.max(0, total - (spellSlotsExpended[slotIndex] ?? 0))
  };
}

function getPaladinOathOfVengeanceAvengingAngelFallbackSlotLevel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): number | null {
  return getPaladinOathOfVengeanceAvengingAngelFallbackSlotSummary(character).remaining > 0
    ? avengingAngelFallbackSpellSlotLevel
    : null;
}

function getPaladinAuraRangeFeet(character: PaladinOathOfVengeanceCharacter): number {
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

function getPaladinChannelDivinityUsesRemainingForCharacter(
  character: PaladinOathOfVengeanceCharacter
): number {
  return getPaladinChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState ?? {}
  });
}

export function hasActivePaladinOathOfVengeanceAvengingAngel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasPaladinOathOfVengeanceAvengingAngelFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfVengeanceAvengingAngelStatusSourceId
  );
}

export function hasActivePaladinOathOfVengeanceVowOfEnmity(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasPaladinOathOfVengeanceVowOfEnmity(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfVengeanceVowOfEnmityStatusSourceId
  );
}

function isVowOfEnmityEligibleAction(action: VowOfEnmityAction | null): boolean {
  return action?.attackKind === "weapon" || action?.attackKind === "unarmed";
}

export function getPaladinOathOfVengeanceVowOfEnmityOptionState(
  character: PaladinOathOfVengeanceCharacter,
  action: VowOfEnmityAction | null
): PaladinOathOfVengeanceVowOfEnmityOptionState | null {
  if (!hasPaladinOathOfVengeanceVowOfEnmity(character) || !isVowOfEnmityEligibleAction(action)) {
    return null;
  }

  const isActive = hasActivePaladinOathOfVengeanceVowOfEnmity(character);
  let disabledReason: string | undefined;

  if (isActive) {
    disabledReason = "Vow of Enmity is already active.";
  } else if (getPaladinChannelDivinityUsesRemainingForCharacter(character) <= 0) {
    disabledReason = "No Channel Divinity uses remaining.";
  }

  return {
    active: isActive,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function applyPaladinOathOfVengeanceVowOfEnmityAction(action: WeaponAction): WeaponAction {
  if (
    !isVowOfEnmityEligibleAction(action) ||
    action.indicators.some(
      (indicator) =>
        indicator.label === vowOfEnmityAdvantageIndicator.label &&
        indicator.tone === vowOfEnmityAdvantageIndicator.tone &&
        (Array.isArray(indicator.source)
          ? indicator.source.includes(vowOfEnmityName)
          : indicator.source === vowOfEnmityName)
    )
  ) {
    return action;
  }

  return {
    ...action,
    indicators: [...action.indicators, vowOfEnmityAdvantageIndicator]
  };
}

function hasActivePaladinOathOfVengeanceFrightfulAura(
  character: PaladinOathOfVengeanceCharacter
): boolean {
  return (
    hasActivePaladinOathOfVengeanceAvengingAngel(character) &&
    hasActivePaladinAuraOfProtection({
      className: character.className,
      level: character.level ?? 0,
      statusEntries: character.statusEntries ?? []
    })
  );
}

function transformVowOfEnmityAction(
  character: PaladinOathOfVengeanceCharacter,
  action: WeaponAction
): WeaponAction {
  return hasActivePaladinOathOfVengeanceVowOfEnmity(character)
    ? applyPaladinOathOfVengeanceVowOfEnmityAction(action)
    : action;
}

function getPaladinOathOfVengeanceFeatureActions(
  character: PaladinOathOfVengeanceCharacter
): FeatureActionCard[] {
  if (!hasPaladinOathOfVengeanceAvengingAngelFeature(character)) {
    return [];
  }

  const usesRemaining = getPaladinOathOfVengeanceAvengingAngelUsesRemaining(character);
  const fallbackSlotSummary = getPaladinOathOfVengeanceAvengingAngelFallbackSlotSummary(character);
  const showFallbackSlotInfo = usesRemaining <= 0 && fallbackSlotSummary.total > 0;
  const hasFallbackSlot = showFallbackSlotInfo && fallbackSlotSummary.remaining > 0;
  const isActive = hasActivePaladinOathOfVengeanceAvengingAngel(character);

  return [
    {
      key: avengingAngelActionKey,
      name: avengingAngelName,
      summary: "Assume your avenging form.",
      detail: "Gain Avenging Angel for 10 minutes.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      cardUsage: createChargesOrResourceCardUsage(
        usesRemaining,
        avengingAngelUsesTotal,
        createFeatureActionCardCost({
          amountText: "5th",
          resourceLabel: "Spell Slot"
        })
      ),
      usesRemaining,
      usesTotal: avengingAngelUsesTotal,
      usesInlineLabel: showFallbackSlotInfo ? "| Use 5th Spell Slot" : undefined,
      description: [...avengingAngelDescription],
      headerTags: createChargesAndUsageHeaderTags(
        usesRemaining,
        avengingAngelUsesTotal,
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
        eyebrow: "Oath of Vengeance"
      },
      execute: {
        kind: "activate"
      },
      isActive,
      disabled: isActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: isActive
        ? "Avenging Angel is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Avenging Angel use or level 5 spell slots remaining."
          : undefined
    }
  ];
}

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function getReactionEntryById(
  reactions: ReactionEntry[],
  reactionId: string
): ReactionEntry[] {
  return reactions.filter((reaction) => reaction.id === reactionId);
}

function getPaladinOathOfVengeanceDerivedStatusEntries(
  character: PaladinOathOfVengeanceCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasActivePaladinOathOfVengeanceFrightfulAura(character)) {
    return [];
  }

  return [
    {
      id: paladinOathOfVengeanceFrightfulAuraStatusSourceId,
      sourceId: paladinOathOfVengeanceFrightfulAuraStatusSourceId,
      group: STATUS_ENTRY_GROUP.AURAS,
      value: frightfulAuraName,
      source: avengingAngelName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: getPaladinAuraRangeFeet(character)
    }
  ];
}

function getPaladinOathOfVengeanceReactionEntries(
  character: PaladinOathOfVengeanceCharacter
): ReactionEntry[] {
  const reactionEntries: ReactionEntry[] = [];

  if (hasPaladinOathOfVengeanceRelentlessAvengerFeature(character)) {
    reactionEntries.push(relentlessAvengerReactionEntry);
  }

  if (hasPaladinOathOfVengeanceSoulOfVengeanceFeature(character)) {
    reactionEntries.push(soulOfVengeanceReactionEntry);
  }

  if (hasActivePaladinOathOfVengeanceFrightfulAura(character)) {
    reactionEntries.push(frightfulAuraReactionEntry);
  }

  return reactionEntries;
}

function getPaladinOathOfVengeanceSpeedBonuses(
  character: PaladinOathOfVengeanceCharacter
): FeatureSpeedBonus[] {
  return hasActivePaladinOathOfVengeanceAvengingAngel(character)
    ? [
        {
          label: avengingAngelName,
          value: 0,
          movementType: "fly",
          setTotal: 60,
          hover: true
        }
      ]
    : [];
}

export function applyPaladinOathOfVengeanceAvengingAngelStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfVengeanceAvengingAngelStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: avengingAngelName,
        source: avengingAngelName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: paladinOathOfVengeanceAvengingAngelStatusSourceId
      })
    ]
  };
}

export function activatePaladinOathOfVengeanceVowOfEnmity(character: Character): Character {
  if (
    !hasPaladinOathOfVengeanceVowOfEnmity(character) ||
    hasActivePaladinOathOfVengeanceVowOfEnmity(character) ||
    getPaladinChannelDivinityUsesRemainingForCharacter(character) <= 0
  ) {
    return character;
  }

  const nextCharacter = expendPaladinChannelDivinityUse(character);

  if (nextCharacter === character) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfVengeanceVowOfEnmityStatusSourceId
  );

  return {
    ...nextCharacter,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: vowOfEnmityName,
        source: vowOfEnmityName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: vowOfEnmityDurationTurns,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        },
        sourceId: paladinOathOfVengeanceVowOfEnmityStatusSourceId
      })
    ]
  };
}

export function activatePaladinOathOfVengeanceAvengingAngel(character: Character): Character {
  if (
    !hasPaladinOathOfVengeanceAvengingAngelFeature(character) ||
    hasActivePaladinOathOfVengeanceAvengingAngel(character)
  ) {
    return character;
  }

  const usesRemaining = getPaladinOathOfVengeanceAvengingAngelUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const paladinState = character.classFeatureState?.paladin ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        paladin: {
          ...paladinState,
          avengingAngelUsesExpended: (paladinState.avengingAngelUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    const fallbackSlotLevel = getPaladinOathOfVengeanceAvengingAngelFallbackSlotLevel(character);

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

  return applyPaladinOathOfVengeanceAvengingAngelStatus(nextCharacter);
}

export function restorePaladinOathOfVengeanceAvengingAngelOnLongRest(
  character: Character
): Character {
  if (!hasPaladinOathOfVengeanceAvengingAngelFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.avengingAngelUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        avengingAngelUsesExpended: 0
      }
    }
  };
}

function collectPaladinOathOfVengeanceContributions(
  character: PaladinOathOfVengeanceCharacter
): FeatureContributionSpec[] {
  if (
    character.className !== "Paladin" ||
    character.subclassId !== oathOfVengeanceSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return [];
  }

  const featureActions = getPaladinOathOfVengeanceFeatureActions(character);
  const reactionEntries = getPaladinOathOfVengeanceReactionEntries(character);
  const contributions: FeatureContributionSpec[] = [
    {
      source: createSubclassContributionSource({
        id: "paladin-oath-of-vengeance-spells",
        label: "Oath of Vengeance Spells",
        entryId: CLASS_FEATURE.OATH_OF_VENGEANCE_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        oathOfVengeanceSpellIdsByLevel
      )
    }
  ];

  if (hasPaladinOathOfVengeanceVowOfEnmity(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-vengeance-vow-of-enmity",
        label: vowOfEnmityName,
        entryId: CLASS_FEATURE.VOW_OF_ENMITY
      }),
      weaponActionTransforms: [
        {
          id: "paladin-oath-of-vengeance-vow-of-enmity-transform",
          transform: (_character, action) =>
            transformVowOfEnmityAction(character, action as WeaponAction)
        }
      ]
    });
  }

  if (hasPaladinOathOfVengeanceRelentlessAvengerFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-vengeance-relentless-avenger",
        label: relentlessAvengerName,
        entryId: CLASS_FEATURE.RELENTLESS_AVENGER
      }),
      reactions: getReactionEntryById(reactionEntries, relentlessAvengerReactionId)
    });
  }

  if (hasPaladinOathOfVengeanceSoulOfVengeanceFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-vengeance-soul-of-vengeance",
        label: soulOfVengeanceName,
        entryId: CLASS_FEATURE.SOUL_OF_VENGEANCE
      }),
      reactions: getReactionEntryById(reactionEntries, soulOfVengeanceReactionId)
    });
  }

  if (hasPaladinOathOfVengeanceAvengingAngelFeature(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "paladin-oath-of-vengeance-avenging-angel",
        label: avengingAngelName,
        entryId: CLASS_FEATURE.AVENGING_ANGEL
      }),
      actions: getFeatureActionByKey(featureActions, avengingAngelActionKey),
      statuses: getPaladinOathOfVengeanceDerivedStatusEntries(character),
      reactions: getReactionEntryById(reactionEntries, frightfulAuraReactionId),
      speedBonuses: getPaladinOathOfVengeanceSpeedBonuses(character)
    });
  }

  return contributions;
}

export const getPaladinOathOfVengeanceDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectPaladinOathOfVengeanceContributions(character)),
    {
      character: character as Character
    }
  );
