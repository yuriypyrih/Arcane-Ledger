import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterClericFeatureState
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker,
  startRoundTrackerTurn
} from "../../../combat";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  WeaponAttackConsumptionContext
} from "../../types";
import { expendClericChannelDivinityUse } from "../clericChannelDivinity";

export const warDomainSubclassId = "cleric-war-domain";
export const warPriestActionKey = "cleric-war-priest";
export const guidedStrikeReactionEntryId = "reaction-cleric-guided-strike";
const guidedStrikeName = "Guided Strike";
const warGodsBlessingName = "War God's Blessing";
const avatarOfBattleName = "Avatar of Battle";
const shieldOfFaithSpellId = "spell-shield-of-faith";
const spiritualWeaponSpellId = "spell-spiritual-weapon";

const warDomainSpellIdsByLevel = {
  3: [
    "spell-guiding-bolt",
    "spell-magic-weapon",
    "spell-shield-of-faith",
    "spell-spiritual-weapon"
  ],
  5: ["spell-crusaders-mantle", "spell-spirit-guardians"],
  7: ["spell-fire-shield", "spell-freedom-of-movement"],
  9: ["spell-hold-monster", "spell-steel-wind-strike"]
} as const;

type ClericWarDomainCharacter = Pick<Character, "className"> &
  Partial<
    Pick<Character, "abilities" | "classFeatureState" | "level" | "roundTracker" | "subclassId">
  >;

function getClericWarDomainFeatureDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  feature: CLASS_FEATURE
) {
  return getFeatureDescriptionForCharacter(
    {
      className: character.className,
      level: character.level ?? 1,
      subclassId: character.subclassId
    },
    feature
  );
}

function getClericWarDomainAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function hasClericWarDomainFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Cleric" &&
    character.subclassId === warDomainSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function getClericWarPriestUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasClericWarDomainFeature(character, 3)) {
    return 0;
  }

  return Math.max(1, getClericWarDomainAbilityModifier(character.abilities?.WIS ?? 10));
}

export function normalizeClericWarDomainFeatureState(
  value: Partial<CharacterClericFeatureState>,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): Pick<CharacterClericFeatureState, "warPriestUsesExpended" | "warPriestBonusAttackAvailable"> {
  const warPriestUsesTotal = getClericWarPriestUsesTotal(character);

  return {
    warPriestUsesExpended: hasClericWarDomainFeature(character, 3)
      ? Math.max(
          0,
          Math.min(
            warPriestUsesTotal,
            Number.isFinite(Number(value.warPriestUsesExpended))
              ? Math.floor(Number(value.warPriestUsesExpended))
              : 0
          )
        )
      : undefined,
    warPriestBonusAttackAvailable: hasClericWarDomainFeature(character, 3)
      ? value.warPriestBonusAttackAvailable === true
      : undefined
  };
}

export function getClericWarPriestUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  const totalUses = getClericWarPriestUsesTotal(character);
  const warDomainState = normalizeClericWarDomainFeatureState(
    character.classFeatureState?.cleric ?? {},
    character
  );

  return Math.max(0, totalUses - (warDomainState.warPriestUsesExpended ?? 0));
}

export function hasClericWarPriestBonusAttackAvailable(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): boolean {
  if (!hasClericWarDomainFeature(character, 3)) {
    return false;
  }

  return (
    normalizeClericWarDomainFeatureState(character.classFeatureState?.cleric ?? {}, character)
      .warPriestBonusAttackAvailable === true
  );
}

export function getClericWarDomainFeatureActions(
  character: ClericWarDomainCharacter
): FeatureActionCard[] {
  if (!hasClericWarDomainFeature(character, 3)) {
    return [];
  }

  const usesRemaining = getClericWarPriestUsesRemaining(character);
  const usesTotal = getClericWarPriestUsesTotal(character);
  const isActive = hasClericWarPriestBonusAttackAvailable(character);
  const description = getClericWarDomainFeatureDescription(character, CLASS_FEATURE.WAR_PRIEST);

  return [
    {
      key: warPriestActionKey,
      name: "War Priest",
      sourceFeature: CLASS_FEATURE.WAR_PRIEST,
      summary: "Ready a bonus-action weapon or unarmed attack this turn.",
      detail: "Spend 1 charge to use a weapon or unarmed strike with your bonus action this turn.",
      breakdown: "Ready bonus attack",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal,
      isActive,
      description,
      drawer: {
        kind: "confirm",
        eyebrow: "War Domain",
        description
      },
      execute: {
        kind: "activate"
      },
      disabled: isActive || usesRemaining <= 0,
      disabledReason: isActive
        ? "War Priest is already active for this turn."
        : usesRemaining <= 0
          ? "No War Priest charges remaining."
          : undefined
    }
  ];
}

function getGuidedStrikeDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return getClericWarDomainFeatureDescription(character, CLASS_FEATURE.GUIDED_STRIKE);
}

function getWarGodsBlessingDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return getClericWarDomainFeatureDescription(character, CLASS_FEATURE.WAR_GODS_BLESSING);
}

export function canUseClericWarGodsBlessingForSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null
): boolean {
  return (
    spell !== null &&
    hasClericWarDomainFeature(character, 6) &&
    (spell.id === shieldOfFaithSpellId || spell.id === spiritualWeaponSpellId)
  );
}

function getClericWarGodsBlessingSpellEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (!canUseClericWarGodsBlessingForSpell(character, spell)) {
    return spell;
  }

  return appendSourcedDescriptionAddition(
    spell,
    warGodsBlessingName,
    getWarGodsBlessingDescription(character)
  );
}

function getClericGuidedStrikeReactionEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry {
  return {
    id: guidedStrikeReactionEntryId,
    reaction: REACTION.GUIDED_STRIKE,
    name: guidedStrikeName,
    sourceType: "feature",
    sourceFeature: CLASS_FEATURE.GUIDED_STRIKE,
    sourceLabel: "War Domain",
    description: getGuidedStrikeDescription(character)
  };
}

export function consumeClericGuidedStrikeReaction(character: Character): Character {
  return hasClericWarDomainFeature(character, 3)
    ? expendClericChannelDivinityUse(character)
    : character;
}

function getClericAvatarOfBattleDerivedStatusEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): DerivedFeatureStatusEntry[] {
  if (!hasClericWarDomainFeature(character, 17)) {
    return [];
  }

  return [
    {
      id: "feature-cleric-war-domain-avatar-of-battle-resistance-bludgeoning",
      sourceId: "feature-cleric-war-domain-avatar-of-battle",
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.BLUDGEONING,
      source: avatarOfBattleName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    },
    {
      id: "feature-cleric-war-domain-avatar-of-battle-resistance-piercing",
      sourceId: "feature-cleric-war-domain-avatar-of-battle",
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.PIERCING,
      source: avatarOfBattleName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    },
    {
      id: "feature-cleric-war-domain-avatar-of-battle-resistance-slashing",
      sourceId: "feature-cleric-war-domain-avatar-of-battle",
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.SLASHING,
      source: avatarOfBattleName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export function activateClericWarPriest(character: Character): Character {
  if (
    !hasClericWarDomainFeature(character, 3) ||
    hasClericWarPriestBonusAttackAvailable(character)
  ) {
    return character;
  }

  const usesRemaining = getClericWarPriestUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const rawClericState = character.classFeatureState?.cleric ?? {};
  const warDomainState = normalizeClericWarDomainFeatureState(rawClericState, character);
  const roundTracker = normalizeRoundTracker(character.roundTracker);

  return {
    ...character,
    roundTracker: roundTracker.turnStarted ? roundTracker : startRoundTrackerTurn(),
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...rawClericState,
        warPriestUsesExpended: (warDomainState.warPriestUsesExpended ?? 0) + 1,
        warPriestBonusAttackAvailable: true
      }
    }
  };
}

export function consumeClericWarPriestWeaponAttack(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  if (
    action.economyType !== ECONOMY_TYPE.BONUS_ACTION ||
    !hasClericWarPriestBonusAttackAvailable(character) ||
    (action.attackKind !== "weapon" && action.attackKind !== "unarmed") ||
    !isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction")
  ) {
    return character;
  }

  const rawClericState = character.classFeatureState?.cleric ?? {};
  const roundTracker = normalizeRoundTracker(character.roundTracker);

  return {
    ...character,
    roundTracker: consumeRoundTrackerResource(
      roundTracker.turnStarted ? roundTracker : startRoundTrackerTurn(),
      "bonusAction"
    ),
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...rawClericState,
        warPriestBonusAttackAvailable: false
      }
    }
  };
}

export function advanceClericWarPriestForNewRound(character: Character): Character {
  if (!hasClericWarPriestBonusAttackAvailable(character)) {
    return character;
  }

  const rawClericState = character.classFeatureState?.cleric ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...rawClericState,
        warPriestBonusAttackAvailable: false
      }
    }
  };
}

function restoreClericWarPriestUses(character: Character): Character {
  if (!hasClericWarDomainFeature(character, 3)) {
    return character;
  }

  const rawClericState = character.classFeatureState?.cleric ?? {};

  if (
    (rawClericState.warPriestUsesExpended ?? 0) <= 0 &&
    rawClericState.warPriestBonusAttackAvailable !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...rawClericState,
        warPriestUsesExpended: 0,
        warPriestBonusAttackAvailable: false
      }
    }
  };
}

export function restoreClericWarPriestOnShortRest(character: Character): Character {
  return restoreClericWarPriestUses(character);
}

export function restoreClericWarPriestOnLongRest(character: Character): Character {
  return restoreClericWarPriestUses(character);
}

export const getClericWarDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasClericWarDomainFeature(character, 3)
    ? {
        featureActions: getClericWarDomainFeatureActions(character),
        derivedStatusEntries: getClericAvatarOfBattleDerivedStatusEntries(character),
        reactionEntries: [getClericGuidedStrikeReactionEntry(character)],
        transformSpellEntry: (spell) => getClericWarGodsBlessingSpellEntry(character, spell),
        transformWeaponAction: (action) =>
          appendSourcedDescriptionAddition(
            action,
            guidedStrikeName,
            getGuidedStrikeDescription(character)
          ),
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          warDomainSpellIdsByLevel
        )
      }
    : {};
