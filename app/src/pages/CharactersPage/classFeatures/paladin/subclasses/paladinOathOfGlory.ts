import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifier } from "../../../gameplay";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import {
  createDefaultFeatureActionDescription,
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type {
  AbilityCheckIndicatorMap,
  FeatureActionCard,
  FeatureIndicator,
  FeatureSpeedBonus,
  SkillIndicatorMap
} from "../../types";
import {
  expendPaladinChannelDivinityUse,
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal,
  paladinsSmiteActionKey
} from "../paladin";

export const oathOfGlorySubclassId = "paladin-oath-of-glory";
export const peerlessAthleteActionKey = "paladin-peerless-athlete";
export const livingLegendActionKey = "paladin-living-legend";
export const gloriousDefenseReactionId = "reaction-paladin-glorious-defense";
export const paladinOathOfGloryPeerlessAthleteStatusSourceId =
  "feature-paladin-oath-of-glory-peerless-athlete";
export const paladinOathOfGloryAuraOfAlacrityProtectionStatusSourceId =
  "feature-paladin-aura-of-protection-oath-of-glory-aura-of-alacrity";
export const paladinOathOfGloryLivingLegendStatusSourceId =
  "feature-paladin-oath-of-glory-living-legend";

const oathOfGlorySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Guiding Bolt", "Heroism"]),
  5: resolveSpellIdsByName(["Enhance Ability", "Magic Weapon"]),
  9: resolveSpellIdsByName(["Haste", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Compulsion", "Freedom of Movement"]),
  17: resolveSpellIdsByName(["Legend Lore", "Yolande's Regal Presence"])
} as const;
const peerlessAthleteName = "Peerless Athlete";
const gloriousDefenseName = "Glorious Defense";
const livingLegendName = "Living Legend";
const livingLegendUsesTotal = 1;
const livingLegendFallbackSpellSlotLevel = 5;
const oathOfGlorySubclassEntry = getSubclassEntryById(oathOfGlorySubclassId);
const peerlessAthleteAdvantageIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: peerlessAthleteName
};
const livingLegendAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: livingLegendName
};

type PaladinOathOfGloryCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "level" | "subclassId" | "classFeatureState" | "spellSlotsExpended" | "statusEntries"
    >
  >;

function isPaladinOathOfGlory(character: PaladinOathOfGloryCharacter): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfGlorySubclassId &&
    (character.level ?? 0) >= 3
  );
}

function getOathOfGloryFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = oathOfGlorySubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const inspiringSmiteDescription = getOathOfGloryFeatureDescriptionEntries(
  CLASS_FEATURE.INSPIRING_SMITE
);
const peerlessAthleteDescription = getOathOfGloryFeatureDescriptionEntries(
  CLASS_FEATURE.PEERLESS_ATHLETE
);
const gloriousDefenseDescription = getOathOfGloryFeatureDescriptionEntries(
  CLASS_FEATURE.GLORIOUS_DEFENSE
);
const livingLegendDescription = getOathOfGloryFeatureDescriptionEntries(CLASS_FEATURE.LIVING_LEGEND);
const gloriousDefenseReactionEntry: ReactionEntry = {
  id: gloriousDefenseReactionId,
  reaction: REACTION.GLORIOUS_DEFENSE,
  name: gloriousDefenseName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.GLORIOUS_DEFENSE,
  sourceLabel: "Oath of Glory",
  description: [...gloriousDefenseDescription]
};

export function hasPaladinOathOfGloryAuraOfAlacrity(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfGlorySubclassId &&
    (character.level ?? 0) >= 7
  );
}

export function hasPaladinOathOfGloryGloriousDefenseFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfGlorySubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function hasPaladinOathOfGloryLivingLegendFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Paladin" &&
    character.subclassId === oathOfGlorySubclassId &&
    (character.level ?? 0) >= 20
  );
}

export function getPaladinOathOfGloryGloriousDefenseUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasPaladinOathOfGloryGloriousDefenseFeature(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifier(character.abilities?.CHA ?? 10));
}

export function getPaladinOathOfGloryGloriousDefenseUsesRemaining(
  character: PaladinOathOfGloryCharacter
): number {
  const totalUses = getPaladinOathOfGloryGloriousDefenseUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.gloriousDefenseUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getPaladinOathOfGloryLivingLegendUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasPaladinOathOfGloryLivingLegendFeature(character) ? livingLegendUsesTotal : 0;
}

export function getPaladinOathOfGloryLivingLegendUsesRemaining(
  character: PaladinOathOfGloryCharacter
): number {
  const totalUses = getPaladinOathOfGloryLivingLegendUsesTotal(character);
  const usesExpended = character.classFeatureState?.paladin?.livingLegendUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getPaladinOathOfGloryLivingLegendFallbackSlotSummary(
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
  const slotIndex = livingLegendFallbackSpellSlotLevel - 1;
  const total = spellSlotTotals[slotIndex] ?? 0;

  return {
    total,
    remaining: Math.max(0, total - (spellSlotsExpended[slotIndex] ?? 0))
  };
}

function getPaladinOathOfGloryLivingLegendFallbackSlotLevel(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
): number | null {
  return getPaladinOathOfGloryLivingLegendFallbackSlotSummary(character).remaining > 0
    ? livingLegendFallbackSpellSlotLevel
    : null;
}

export function hasActivePaladinOathOfGloryPeerlessAthlete(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!isPaladinOathOfGlory(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfGloryPeerlessAthleteStatusSourceId
  );
}

export function hasActivePaladinOathOfGloryLivingLegend(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasPaladinOathOfGloryLivingLegendFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === paladinOathOfGloryLivingLegendStatusSourceId
  );
}

function getPaladinOathOfGloryFeatureActions(
  character: PaladinOathOfGloryCharacter
): FeatureActionCard[] {
  if (!isPaladinOathOfGlory(character)) {
    return [];
  }

  const usesRemaining = getPaladinChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState ?? {}
  });
  const usesTotal = getPaladinChannelDivinityUsesTotal({
    className: character.className,
    level: character.level ?? 0
  });
  const isActive = hasActivePaladinOathOfGloryPeerlessAthlete(character);
  const livingLegendUsesRemaining = getPaladinOathOfGloryLivingLegendUsesRemaining(character);
  const livingLegendFallbackSlotSummary =
    getPaladinOathOfGloryLivingLegendFallbackSlotSummary(character);
  const showLivingLegendFallbackSlotInfo =
    livingLegendUsesRemaining <= 0 && livingLegendFallbackSlotSummary.total > 0;
  const hasLivingLegendFallbackSlot =
    showLivingLegendFallbackSlotInfo && livingLegendFallbackSlotSummary.remaining > 0;
  const isLivingLegendActive = hasActivePaladinOathOfGloryLivingLegend(character);

  const actions: FeatureActionCard[] = [
    {
      key: peerlessAthleteActionKey,
      name: peerlessAthleteName,
      summary: "Augment your athleticism.",
      detail: "Expend Channel Divinity to empower your athleticism for 1 hour.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "pyromancy",
      usesRemaining,
      usesTotal,
      description: [...peerlessAthleteDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: usesTotal,
          icon: "pyromancy",
          cost: 1
        }
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of Glory",
        confirmLabel: "Activate Peerless Athlete",
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal,
            icon: "pyromancy",
            cost: 1
          }
        ]
      },
      execute: {
        kind: "activate",
        label: "Activate Peerless Athlete"
      },
      isActive,
      disabled: isActive || usesRemaining <= 0,
      disabledReason: isActive
        ? "Peerless Athlete is already active."
        : usesRemaining <= 0
          ? "No Channel Divinity uses remaining."
          : undefined
    }
  ];

  if (hasPaladinOathOfGloryLivingLegendFeature(character)) {
    actions.push({
      key: livingLegendActionKey,
      name: livingLegendName,
      summary: "Become the embodiment of heroic glory.",
      detail: "Assume a legendary presence for 10 minutes.",
      breakdown: "Heroic glory form",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining: livingLegendUsesRemaining,
      usesTotal: livingLegendUsesTotal,
      usesInlineLabel: showLivingLegendFallbackSlotInfo ? "| Use 5th Spell Slot" : undefined,
      description: [...livingLegendDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: livingLegendUsesRemaining,
          total: livingLegendUsesTotal,
          cost: 1
        },
        ...(showLivingLegendFallbackSlotInfo
          ? [
              {
                kind: "text" as const,
                label: "Level 5 Slots",
                value: `${livingLegendFallbackSlotSummary.remaining}/${livingLegendFallbackSlotSummary.total}`
              }
            ]
          : [])
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "Oath of Glory",
        confirmLabel: "Activate Living Legend",
        resources: [
          {
            kind: "tracker" as const,
            label: "Uses",
            current: livingLegendUsesRemaining,
            total: livingLegendUsesTotal,
            cost: 1
          },
          ...(showLivingLegendFallbackSlotInfo
            ? [
                {
                  kind: "text" as const,
                  label: "Level 5 Slots",
                  value: `${livingLegendFallbackSlotSummary.remaining}/${livingLegendFallbackSlotSummary.total}`
                }
              ]
            : [])
        ]
      },
      execute: {
        kind: "activate",
        label: "Activate Living Legend"
      },
      isActive: isLivingLegendActive,
      disabled: isLivingLegendActive || (livingLegendUsesRemaining <= 0 && !hasLivingLegendFallbackSlot),
      disabledReason: isLivingLegendActive
        ? "Living Legend is already active."
        : livingLegendUsesRemaining <= 0 && !hasLivingLegendFallbackSlot
          ? "No Living Legend use or level 5 spell slots remaining."
          : undefined
    });
  }

  return actions;
}

export function applyPaladinOathOfGloryLivingLegendStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfGloryLivingLegendStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: livingLegendName,
        source: livingLegendName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: paladinOathOfGloryLivingLegendStatusSourceId
      })
    ]
  };
}

export function applyPaladinOathOfGloryPeerlessAthleteStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== paladinOathOfGloryPeerlessAthleteStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: peerlessAthleteName,
        source: peerlessAthleteName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.HOURS,
          amount: 1
        },
        sourceId: paladinOathOfGloryPeerlessAthleteStatusSourceId
      })
    ]
  };
}

export function activatePaladinOathOfGloryPeerlessAthlete(character: Character): Character {
  if (
    !isPaladinOathOfGlory(character) ||
    hasActivePaladinOathOfGloryPeerlessAthlete(character) ||
    getPaladinChannelDivinityUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const nextCharacter = expendPaladinChannelDivinityUse(character);

  return nextCharacter === character
    ? character
    : applyPaladinOathOfGloryPeerlessAthleteStatus(nextCharacter);
}

function getPaladinOathOfGlorySkillIndicators(
  character: PaladinOathOfGloryCharacter
): SkillIndicatorMap {
  const indicators: SkillIndicatorMap = {};

  if (hasActivePaladinOathOfGloryPeerlessAthlete(character)) {
    indicators[SKILL.ACROBATICS] = [peerlessAthleteAdvantageIndicator];
    indicators[SKILL.ATHLETICS] = [peerlessAthleteAdvantageIndicator];
  }

  if (hasActivePaladinOathOfGloryLivingLegend(character)) {
    indicators[SKILL.DECEPTION] = [livingLegendAdvantageIndicator];
    indicators[SKILL.INTIMIDATION] = [livingLegendAdvantageIndicator];
    indicators[SKILL.PERFORMANCE] = [livingLegendAdvantageIndicator];
    indicators[SKILL.PERSUASION] = [livingLegendAdvantageIndicator];
  }

  return indicators;
}

function getPaladinOathOfGloryAbilityCheckIndicators(
  character: PaladinOathOfGloryCharacter
): AbilityCheckIndicatorMap {
  return hasActivePaladinOathOfGloryLivingLegend(character)
    ? {
        CHA: [livingLegendAdvantageIndicator]
      }
    : {};
}

export function activatePaladinOathOfGloryLivingLegend(character: Character): Character {
  if (
    !hasPaladinOathOfGloryLivingLegendFeature(character) ||
    hasActivePaladinOathOfGloryLivingLegend(character)
  ) {
    return character;
  }

  const usesRemaining = getPaladinOathOfGloryLivingLegendUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const paladinState = character.classFeatureState?.paladin ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        paladin: {
          ...paladinState,
          livingLegendUsesExpended: (paladinState.livingLegendUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    const fallbackSlotLevel = getPaladinOathOfGloryLivingLegendFallbackSlotLevel(character);

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

  return applyPaladinOathOfGloryLivingLegendStatus(nextCharacter);
}

export function restorePaladinOathOfGloryLivingLegendOnLongRest(character: Character): Character {
  if (!hasPaladinOathOfGloryLivingLegendFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.livingLegendUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        livingLegendUsesExpended: 0
      }
    }
  };
}

function getPaladinOathOfGloryReactionEntries(
  character: PaladinOathOfGloryCharacter
): ReactionEntry[] {
  return hasPaladinOathOfGloryGloriousDefenseFeature(character)
    ? [gloriousDefenseReactionEntry]
    : [];
}

function appendInspiringSmiteDescription(action: FeatureActionCard): FeatureActionCard {
  if (action.key !== paladinsSmiteActionKey) {
    return action;
  }

  const nextAction =
    action.description?.length && action.description.length > 0
      ? action
      : {
          ...action,
          description: createDefaultFeatureActionDescription(action)
        };

  return appendSourcedDescriptionAddition(nextAction, "Inspiring Smite", inspiringSmiteDescription);
}

function getPaladinOathOfGlorySpeedBonuses(
  character: PaladinOathOfGloryCharacter
): FeatureSpeedBonus[] {
  return hasPaladinOathOfGloryAuraOfAlacrity(character)
    ? [
        {
          label: "Aura of Alacrity",
          value: 10
        }
      ]
    : [];
}

export function consumePaladinOathOfGloryGloriousDefenseUse(character: Character): Character {
  if (
    !hasPaladinOathOfGloryGloriousDefenseFeature(character) ||
    getPaladinOathOfGloryGloriousDefenseUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        gloriousDefenseUsesExpended: (paladinState.gloriousDefenseUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restorePaladinOathOfGloryGloriousDefenseOnLongRest(
  character: Character
): Character {
  if (!hasPaladinOathOfGloryGloriousDefenseFeature(character)) {
    return character;
  }

  const paladinState = character.classFeatureState?.paladin ?? {};

  if ((paladinState.gloriousDefenseUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        gloriousDefenseUsesExpended: 0
      }
    }
  };
}

export const getPaladinOathOfGloryDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfGlorySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          oathOfGlorySpellIdsByLevel
        ),
        featureActions: getPaladinOathOfGloryFeatureActions(character),
        abilityCheckIndicators: getPaladinOathOfGloryAbilityCheckIndicators(character),
        skillIndicators: getPaladinOathOfGlorySkillIndicators(character),
        speedBonuses: getPaladinOathOfGlorySpeedBonuses(character),
        reactionEntries: getPaladinOathOfGloryReactionEntries(character),
        transformFeatureAction: appendInspiringSmiteDescription
      }
    : {};
