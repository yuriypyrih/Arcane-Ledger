import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import type { Character, CharacterBardFeatureState } from "../../../../../types";
import { SKILL } from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { getInventoryItemOnHandQuantity, isItemShieldRecord } from "../../../inventoryItems";
import { getEquipmentByName } from "../../../proficiencyCodexData";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { createDefaultFeatureActionDescription } from "../../subclassRuntime";
import type { FeatureActionCard, WeaponAttackConsumptionContext } from "../../types";
import { getBardicInspirationDie } from "../bard";

export const collegeOfDanceSubclassId = "bard-college-of-dance";
export const bardCollegeOfDanceInspiringMovementReactionId = "reaction-inspiring-movement";

const agileStrikesDescription = "You can make one Unarmed Strike as part of this action.";
const agileStrikesSource = "Dazzling Footwork / Agile Strikes";
const dazzlingFootworkBardicDamageSource = "Dazzling Footwork / Bardic Damage";
const dazzlingFootworkPerformanceIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: "Dazzling Footwork"
};

type BardCollegeOfDanceCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "level"
      | "subclassId"
      | "classFeatureState"
      | "equipment"
      | "inventoryItems"
      | "customEquipment"
    >
  >;

export function hasBardCollegeOfDanceDazzlingFootworkFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfDanceSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasBardCollegeOfDanceInspiringMovementFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfDanceSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWornBodyArmor(
  character: Pick<
    Parameters<SubclassRuntimeResolver>[0],
    "equipment" | "inventoryItems" | "customEquipment"
  >
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield";
    }) ||
    (character.inventoryItems ?? []).some(
      (entry) => entry.worn && !isItemShieldRecord(entry.item)
    ) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType !== "shield" && entry.worn
    )
  );
}

function hasShieldEquipped(
  character: Pick<
    Parameters<SubclassRuntimeResolver>[0],
    "equipment" | "inventoryItems" | "customEquipment"
  >
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.onHand && !item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield";
    }) ||
    (character.inventoryItems ?? []).some(
      (entry) => getInventoryItemOnHandQuantity(entry) > 0 && isItemShieldRecord(entry.item)
    ) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType === "shield" && entry.worn
    )
  );
}

function hasActiveCollegeOfDanceCombatBenefits(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "subclassId" | "equipment" | "inventoryItems" | "customEquipment">
    >
): boolean {
  return (
    hasBardCollegeOfDanceDazzlingFootworkFeature(character) &&
    !hasWornBodyArmor(character) &&
    !hasShieldEquipped(character)
  );
}

export function normalizeBardCollegeOfDanceFeatureState(
  value: Partial<CharacterBardFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<CharacterBardFeatureState, "dazzlingFootworkUnarmedStrikesRemainingThisTurn"> {
  const dazzlingFootworkUnarmedStrikesRemainingThisTurn = Number(
    value.dazzlingFootworkUnarmedStrikesRemainingThisTurn
  );

  return {
    dazzlingFootworkUnarmedStrikesRemainingThisTurn: hasBardCollegeOfDanceDazzlingFootworkFeature(
      character
    )
      ? Number.isFinite(dazzlingFootworkUnarmedStrikesRemainingThisTurn)
        ? Math.max(0, Math.min(1, Math.floor(dazzlingFootworkUnarmedStrikesRemainingThisTurn)))
        : 0
      : undefined
  };
}

export function getBardCollegeOfDanceUnarmedStrikeMultiCount(
  character: BardCollegeOfDanceCharacter
): number {
  if (!hasActiveCollegeOfDanceCombatBenefits(character)) {
    return 0;
  }

  return character.classFeatureState?.bard?.dazzlingFootworkUnarmedStrikesRemainingThisTurn ?? 0;
}

export function grantBardCollegeOfDanceAgileStrikes(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (!hasActiveCollegeOfDanceCombatBenefits(character)) {
    return character;
  }

  if ((bardState.dazzlingFootworkUnarmedStrikesRemainingThisTurn ?? 0) >= 1) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        dazzlingFootworkUnarmedStrikesRemainingThisTurn: 1
      }
    }
  };
}

export function consumeBardCollegeOfDanceAgileStrike(
  character: Character,
  bardState: CharacterBardFeatureState,
  action: WeaponAttackConsumptionContext
): Character {
  if (action.economyType !== "bonus_action" || action.attackKind !== "unarmed") {
    return character;
  }

  const remaining = getBardCollegeOfDanceUnarmedStrikeMultiCount(character);

  if (remaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        dazzlingFootworkUnarmedStrikesRemainingThisTurn: remaining - 1
      }
    }
  };
}

export function clearBardCollegeOfDanceTurnState(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if ((bardState.dazzlingFootworkUnarmedStrikesRemainingThisTurn ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        dazzlingFootworkUnarmedStrikesRemainingThisTurn: 0
      }
    }
  };
}

export function shouldAdvanceBardCollegeOfDanceFeaturesForNewRound(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasBardCollegeOfDanceDazzlingFootworkFeature(character);
}

function shouldAppendAgileStrikesDescription(action: FeatureActionCard): boolean {
  if (action.key === "bard-bardic-inspiration") {
    return true;
  }

  const searchableText = [action.name, action.summary, action.detail, ...(action.description ?? [])]
    .join(" ")
    .toLowerCase();

  return searchableText.includes("bardic inspiration") && searchableText.includes("expend");
}

function appendAgileStrikesDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  action: FeatureActionCard
): FeatureActionCard {
  if (!shouldAppendAgileStrikesDescription(action)) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    character,
    CLASS_FEATURE.DAZZLING_FOOTWORK,
    [agileStrikesDescription],
    agileStrikesSource
  );
}

function getBardCollegeOfDanceInspiringMovementReactionEntry(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId">> &
    Pick<Parameters<SubclassRuntimeResolver>[0], "equipment" | "inventoryItems" | "customEquipment">
): ReactionEntry {
  const description = getFeatureDescriptionForCharacter(
    {
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    },
    CLASS_FEATURE.INSPIRING_MOVEMENT
  );

  return {
    id: bardCollegeOfDanceInspiringMovementReactionId,
    reaction: REACTION.INSPIRING_MOVEMENT,
    name: "Inspiring Movement",
    sourceType: "feature",
    sourceFeature: CLASS_FEATURE.INSPIRING_MOVEMENT,
    sourceLabel: "College of Dance",
    description: hasActiveCollegeOfDanceCombatBenefits(character)
      ? [
          ...description,
          ...createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.DAZZLING_FOOTWORK,
            [agileStrikesDescription],
            agileStrikesSource
          )
        ]
      : description
  };
}

export const getBardCollegeOfDanceDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (character.className !== "Bard" || character.subclassId !== collegeOfDanceSubclassId) {
    return {};
  }

  const reactionEntries = hasBardCollegeOfDanceInspiringMovementFeature(character)
    ? [getBardCollegeOfDanceInspiringMovementReactionEntry(character)]
    : [];

  return {
    reactionEntries,
    skillIndicators: hasBardCollegeOfDanceDazzlingFootworkFeature(character)
      ? {
          [SKILL.PERFORMANCE]: [dazzlingFootworkPerformanceIndicator]
        }
      : {},
    transformFeatureAction: hasActiveCollegeOfDanceCombatBenefits(character)
      ? (action) => appendAgileStrikesDescription(character, action)
      : undefined,
    getArmorClassModes: (context) => {
      if (!hasBardCollegeOfDanceDazzlingFootworkFeature(character)) {
        return [];
      }

      const isApplicable = !context.hasWornBodyArmor && !context.hasShieldEquipped;
      const unavailableReason = context.hasWornBodyArmor
        ? context.hasShieldEquipped
          ? "Requires you to wear no body armor and wield no shield."
          : "Requires you to wear no body armor."
        : context.hasShieldEquipped
          ? "Requires you to wield no shield."
          : undefined;

      return [
        {
          key: "bard-dance-unarmored-defense",
          label: "Unarmored Defense",
          unlockedAtLevel: 3,
          baseValue: 10,
          abilityModifiers: ["DEX", "CHA"],
          shieldAllowed: false,
          isApplicable,
          unavailableReason,
          detail: "College of Dance feature"
        }
      ];
    },
    getUnarmedStrikeConfig: () => {
      if (!hasActiveCollegeOfDanceCombatBenefits(character)) {
        return null;
      }

      const bardicDie = getBardicInspirationDie({
        className: character.className,
        level: character.level ?? 0
      });

      return {
        attackAbility: "finesse",
        damageAbility: "DEX",
        damageFormula: bardicDie ? `1${String(bardicDie).toLowerCase()}` : undefined,
        damageTypeLabel: "Bludgeoning",
        damageBreakdownLabel: bardicDie ? dazzlingFootworkBardicDamageSource : undefined
      };
    }
  };
};
