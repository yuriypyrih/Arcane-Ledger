import { getReactionEntryById } from "../../../../../codex/entries";
import { SKILL } from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { isItemShieldRecord } from "../../../inventoryItems";
import { getEquipmentByName } from "../../../proficiencyCodexData";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { createDefaultFeatureActionDescription } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { getBardicInspirationDie } from "../bard";

export const collegeOfDanceSubclassId = "bard-college-of-dance";

const agileStrikesDescription = "You can make one Unarmed Strike as part of this action.";
const agileStrikesSource = "Agile Strikes";
const dazzlingFootworkPerformanceIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: "Dazzling Footwork"
};

function hasCollegeOfDanceDazzlingFootwork(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfDanceSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWornBodyArmor(
  character: Pick<Parameters<SubclassRuntimeResolver>[0], "equipment" | "inventoryItems" | "customEquipment">
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield";
    }) ||
    (character.inventoryItems ?? []).some((entry) => entry.worn && !isItemShieldRecord(entry.item)) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType !== "shield" && entry.worn
    )
  );
}

function hasShieldEquipped(
  character: Pick<Parameters<SubclassRuntimeResolver>[0], "equipment" | "inventoryItems" | "customEquipment">
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.onHand && !item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield";
    }) ||
    (character.inventoryItems ?? []).some((entry) => entry.onHand && isItemShieldRecord(entry.item)) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType === "shield" && entry.worn
    )
  );
}

function hasActiveCollegeOfDanceCombatBenefits(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    hasCollegeOfDanceDazzlingFootwork(character) &&
    !hasWornBodyArmor(character) &&
    !hasShieldEquipped(character)
  );
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

function appendAgileStrikesDescription(action: FeatureActionCard): FeatureActionCard {
  if (!shouldAppendAgileStrikesDescription(action)) {
    return action;
  }

  return appendSourcedDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    agileStrikesSource,
    [agileStrikesDescription]
  );
}

export const getBardCollegeOfDanceDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (character.className !== "Bard" || character.subclassId !== collegeOfDanceSubclassId) {
    return {};
  }

  const reactionEntries =
    hasCollegeOfDanceDazzlingFootwork(character) && (character.level ?? 0) >= 6
      ? (() => {
          const inspiringMovement = getReactionEntryById("reaction-inspiring-movement");
          return inspiringMovement ? [inspiringMovement] : [];
        })()
      : [];

  return {
    reactionEntries,
    skillIndicators: hasCollegeOfDanceDazzlingFootwork(character)
      ? {
          [SKILL.PERFORMANCE]: [dazzlingFootworkPerformanceIndicator]
        }
      : {},
    transformFeatureAction: hasActiveCollegeOfDanceCombatBenefits(character)
      ? appendAgileStrikesDescription
      : undefined,
    getArmorClassModes: (context) =>
      hasCollegeOfDanceDazzlingFootwork(character) &&
      !context.hasWornBodyArmor &&
      !context.hasShieldEquipped
        ? [
            {
              key: "bard-dance-unarmored-defense",
              label: "Unarmored Defense",
              baseValue: 10,
              abilityModifiers: ["DEX", "CHA"],
              shieldAllowed: false,
              detail: "College of Dance feature"
            }
          ]
        : [],
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
        damageTypeLabel: "Bludgeoning"
      };
    }
  };
};
