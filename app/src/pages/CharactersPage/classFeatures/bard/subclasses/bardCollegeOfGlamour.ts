import {
  mantleOfInspirationDescription,
  mantleOfMajestyDescription,
  unbreakableMajestyDescription
} from "../../../../../codex/subclasses/bard";
import type { FeatureActionCard } from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { transformSpellToBonusAction } from "../../subclassRuntime";
import {
  getBardicInspirationUsesRemaining,
  getBardicInspirationUsesTotal,
  getMantleOfMajestyFallbackSlotLevel,
  getMantleOfMajestyFallbackSlotSummary,
  getMantleOfMajestyUsesRemaining,
  getMantleOfMajestyUsesTotal,
  getUnbreakableMajestyUsesRemaining,
  getUnbreakableMajestyUsesTotal,
  hasActiveMantleOfMajesty,
  hasActiveUnbreakableMajesty,
  mantleOfInspirationActionKey,
  mantleOfMajestyActionKey,
  unbreakableMajestyActionKey
} from "../bard";

export const collegeOfGlamourSubclassId = "bard-college-of-glamour";

const glamourBeguilingMagicSpellIds = ["spell-charm-person", "spell-mirror-image"] as const;
const glamourCommandSpellId = "spell-command";

function hasCollegeOfGlamourMantleOfInspiration(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfGlamourMantleOfMajesty(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasCollegeOfGlamourUnbreakableMajesty(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 14
  );
}

export const getBardCollegeOfGlamourDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (character.className !== "Bard" || character.subclassId !== collegeOfGlamourSubclassId) {
    return {};
  }

  const level = character.level ?? 0;
  const featureActions: FeatureActionCard[] = [];

  if (level > 0 && character.abilities && character.feats) {
    const bardResourceCharacter = {
      className: character.className,
      level,
      abilities: character.abilities,
      classFeatureState: character.classFeatureState,
      feats: character.feats
    };
    const glamourCharacter = {
      className: character.className,
      level,
      subclassId: character.subclassId,
      classFeatureState: character.classFeatureState,
      spellSlotsExpended: character.spellSlotsExpended
    };
    const mantleActive = hasActiveMantleOfMajesty(character);
    const unbreakableMajestyActive = hasActiveUnbreakableMajesty(character);

    if (hasCollegeOfGlamourMantleOfInspiration(character)) {
      const usesRemaining = getBardicInspirationUsesRemaining(bardResourceCharacter);
      const usesTotal = getBardicInspirationUsesTotal(bardResourceCharacter);

      featureActions.push({
        key: mantleOfInspirationActionKey,
        name: "Mantle of Inspiration",
        summary: "Grant Temporary Hit Points and movement.",
        detail: "Expend a Bardic Inspiration die to empower nearby allies.",
        breakdown: "Grant TempHP to creatures",
        economyType: ECONOMY_TYPE.BONUS_ACTION,
        actionCategory: ACTION_CATEGORY.FEATURE,
        usesRemaining,
        usesTotal,
        hideUsesTrackerOnCard: true,
        usesInlineLabel: "Use 1",
        usesInlineIcon: "music",
        description: [...mantleOfInspirationDescription],
        drawer: {
          kind: "confirm",
          eyebrow: "College of Glamour",
          confirmLabel: "Roll Bardic Dice",
          resources: [
            {
              kind: "tracker",
              label: "Uses",
              current: usesRemaining,
              total: usesTotal,
              icon: "music",
              cost: 1
            }
          ]
        },
        execute: {
          kind: "activate",
          effectKind: "bardic-inspiration-roll"
        },
        disabled: usesRemaining <= 0,
        disabledReason: usesRemaining <= 0 ? "No Bardic Inspiration uses remaining." : undefined
      });
    }

    if (hasCollegeOfGlamourMantleOfMajesty(character) && character.spellSlotsExpended !== undefined) {
      const usesRemaining = getMantleOfMajestyUsesRemaining(glamourCharacter);
      const usesTotal = getMantleOfMajestyUsesTotal(glamourCharacter);
      const fallbackSlotLevel = getMantleOfMajestyFallbackSlotLevel({
        className: character.className,
        level,
        spellSlotsExpended: character.spellSlotsExpended
      });
      const fallbackSlotSummary = getMantleOfMajestyFallbackSlotSummary({
        className: character.className,
        level,
        spellSlotsExpended: character.spellSlotsExpended
      });
      const hasFallbackSlot = fallbackSlotLevel !== null;

      featureActions.push({
        key: mantleOfMajestyActionKey,
        name: "Mantle of Majesty",
        summary: "Cast Command and assume your unearthly majesty.",
        detail: "Open Command and cast it through Mantle of Majesty.",
        breakdown: "Command as the Majesty you are.",
        economyType: ECONOMY_TYPE.BONUS_ACTION,
        actionCategory: ACTION_CATEGORY.MAGIC,
        usesRemaining,
        usesTotal,
        isActive: mantleActive,
        description: [...mantleOfMajestyDescription],
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal
          },
          ...(usesRemaining <= 0 && hasFallbackSlot
            ? [
                {
                  kind: "text" as const,
                  label: "Level 3+ Slots",
                  value: `${fallbackSlotSummary.remaining}/${fallbackSlotSummary.total}`
                }
              ]
            : [])
        ],
        drawer: {
          kind: "confirm",
          eyebrow: "College of Glamour",
          confirmLabel: "Open Command"
        },
        execute: {
          kind: "spell",
          spellSource: "fixed",
          effectKind: "mantle-of-majesty",
          spellId: glamourCommandSpellId,
          spellLevel: 1,
          label: "Open Command",
          actionContextText: "Using Mantle of Majesty"
        },
        disabled: mantleActive || (usesRemaining <= 0 && !hasFallbackSlot),
        disabledReason: mantleActive
          ? "Mantle of Majesty is already active."
          : usesRemaining <= 0 && !hasFallbackSlot
            ? "No Mantle of Majesty use or level 3+ spell slots remaining."
            : undefined
      });
    }

    if (hasCollegeOfGlamourUnbreakableMajesty(character)) {
      const usesRemaining = getUnbreakableMajestyUsesRemaining(glamourCharacter);
      const usesTotal = getUnbreakableMajestyUsesTotal(glamourCharacter);

      featureActions.push({
        key: unbreakableMajestyActionKey,
        name: "Unbreakable Majesty",
        summary: "Assume a magically majestic presence.",
        detail: "Take on a magically majestic presence for 10 turns.",
        breakdown: "Assume magically majestic presense",
        economyType: ECONOMY_TYPE.BONUS_ACTION,
        actionCategory: ACTION_CATEGORY.FEATURE,
        usesRemaining,
        usesTotal,
        isActive: unbreakableMajestyActive,
        description: [...unbreakableMajestyDescription],
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal
          }
        ],
        drawer: {
          kind: "confirm",
          eyebrow: "College of Glamour",
          confirmLabel: "Assume Majesty"
        },
        execute: {
          kind: "activate"
        },
        disabled: unbreakableMajestyActive || usesRemaining <= 0,
        disabledReason: unbreakableMajestyActive
          ? "Unbreakable Majesty is already active."
          : usesRemaining <= 0
            ? "No Unbreakable Majesty uses remaining."
            : undefined
      });
    }
  }

  return {
    featureActions,
    alwaysPreparedSpellIds:
      level >= 3
        ? [...glamourBeguilingMagicSpellIds, ...(level >= 6 ? [glamourCommandSpellId] : [])]
        : [],
    transformSpellEntry: (spell) =>
      hasActiveMantleOfMajesty(character)
        ? transformSpellToBonusAction(glamourCommandSpellId, spell)
        : spell
  };
};
