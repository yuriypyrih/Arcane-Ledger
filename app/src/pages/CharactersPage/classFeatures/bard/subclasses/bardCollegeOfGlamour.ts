import { CLASS_FEATURE, MAGIC_SCHOOL, type SpellEntry } from "../../../../../codex/entries";
import {
  mantleOfInspirationDescription,
  mantleOfMajestyDescription,
  unbreakableMajestyDescription
} from "../../../../../codex/subclasses/bard";
import type { Character, CharacterBardFeatureState } from "../../../../../types";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { transformSpellToBonusAction } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import {
  expendBardicInspirationUse,
  getBardicInspirationUsesRemaining,
  getBardicInspirationUsesTotal
} from "../bard";

export const collegeOfGlamourSubclassId = "bard-college-of-glamour";
export const mantleOfInspirationActionKey = "bard-mantle-of-inspiration";
export const mantleOfMajestyActionKey = "bard-mantle-of-majesty";
export const unbreakableMajestyActionKey = "bard-unbreakable-majesty";
export const mantleOfMajestyStatusSourceId = "feature-bard-mantle-of-majesty";
export const mantleOfMajestyConcentrationSourceId =
  "feature-bard-mantle-of-majesty-concentration";
export const unbreakableMajestyStatusSourceId = "feature-bard-unbreakable-majesty";

const glamourBeguilingMagicSpellIds = ["spell-charm-person", "spell-mirror-image"] as const;
const glamourCommandSpellId = "spell-command";

type BardGlamourCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "level" | "subclassId" | "classFeatureState" | "spellSlotsExpended" | "statusEntries"
    >
  >;

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

export function hasBardCollegeOfGlamourBeguilingMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasBardCollegeOfGlamourMantleOfMajestyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasCollegeOfGlamourMantleOfMajesty(character);
}

export function hasBardCollegeOfGlamourUnbreakableMajestyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasCollegeOfGlamourUnbreakableMajesty(character);
}

export function normalizeBardCollegeOfGlamourFeatureState(
  value: Partial<CharacterBardFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterBardFeatureState,
  "beguilingMagicUsesExpended" | "mantleOfMajestyUsesExpended" | "unbreakableMajestyUsesExpended"
> {
  const beguilingMagicUsesExpended = Number(value.beguilingMagicUsesExpended);
  const mantleOfMajestyUsesExpended = Number(value.mantleOfMajestyUsesExpended);
  const unbreakableMajestyUsesExpended = Number(value.unbreakableMajestyUsesExpended);
  const hasBeguilingMagic = hasBardCollegeOfGlamourBeguilingMagicFeature(character);
  const hasMantleOfMajesty = hasBardCollegeOfGlamourMantleOfMajestyFeature(character);
  const hasUnbreakableMajesty = hasBardCollegeOfGlamourUnbreakableMajestyFeature(character);

  return {
    beguilingMagicUsesExpended:
      hasBeguilingMagic && Number.isFinite(beguilingMagicUsesExpended)
        ? Math.max(0, Math.floor(beguilingMagicUsesExpended))
        : hasBeguilingMagic
          ? 0
          : undefined,
    mantleOfMajestyUsesExpended:
      hasMantleOfMajesty && Number.isFinite(mantleOfMajestyUsesExpended)
        ? Math.max(0, Math.floor(mantleOfMajestyUsesExpended))
        : hasMantleOfMajesty
          ? 0
          : undefined,
    unbreakableMajestyUsesExpended:
      hasUnbreakableMajesty && Number.isFinite(unbreakableMajestyUsesExpended)
        ? Math.max(0, Math.floor(unbreakableMajestyUsesExpended))
        : hasUnbreakableMajesty
          ? 0
          : undefined
  };
}

export function getBardCollegeOfGlamourBeguilingMagicUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasBardCollegeOfGlamourBeguilingMagicFeature(character) ? 1 : 0;
}

export function getBardCollegeOfGlamourBeguilingMagicUsesRemaining(
  character: BardGlamourCharacter
): number {
  const totalUses = getBardCollegeOfGlamourBeguilingMagicUsesTotal(character);
  const bardState = character.classFeatureState?.bard;

  return Math.max(0, totalUses - (bardState?.beguilingMagicUsesExpended ?? 0));
}

export function consumeBardCollegeOfGlamourBeguilingMagicUse(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  const totalUses = getBardCollegeOfGlamourBeguilingMagicUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const currentExpended = Math.max(0, bardState.beguilingMagicUsesExpended ?? 0);

  if (currentExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        beguilingMagicUsesExpended: currentExpended + 1
      }
    }
  };
}

export function restoreBardCollegeOfGlamourBeguilingMagicOnLongRest(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  const totalUses = getBardCollegeOfGlamourBeguilingMagicUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  if ((bardState.beguilingMagicUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        beguilingMagicUsesExpended: 0
      }
    }
  };
}

export function consumeBardCollegeOfGlamourBeguilingMagicOrBardicInspiration(
  character: Character
): Character {
  if (getBardCollegeOfGlamourBeguilingMagicUsesTotal(character) <= 0) {
    return character;
  }

  if (getBardCollegeOfGlamourBeguilingMagicUsesRemaining(character) > 0) {
    return consumeBardCollegeOfGlamourBeguilingMagicUse(
      character,
      character.classFeatureState?.bard ?? {}
    );
  }

  return expendBardicInspirationUse(character);
}

function appendBeguilingMagicDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (
    !hasBardCollegeOfGlamourBeguilingMagicFeature(character) ||
    (spell.magicSchool !== MAGIC_SCHOOL.ENCHANTMENT &&
      spell.magicSchool !== MAGIC_SCHOOL.ILLUSION)
  ) {
    return spell;
  }

  return appendSourcedDescriptionAddition(
    spell,
    "Beguiling Magic",
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.BEGUILING_MAGIC)
  );
}

function getBardCollegeOfGlamourTransformedSpell(
  character: Parameters<SubclassRuntimeResolver>[0],
  spell: SpellEntry
): SpellEntry {
  const spellWithBeguilingMagic = appendBeguilingMagicDescription(character, spell);

  return hasActiveBardCollegeOfGlamourMantleOfMajesty(character)
    ? transformSpellToBonusAction(glamourCommandSpellId, spellWithBeguilingMagic)
    : spellWithBeguilingMagic;
}

export function getBardCollegeOfGlamourMantleOfMajestyUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasBardCollegeOfGlamourMantleOfMajestyFeature(character) ? 1 : 0;
}

export function getBardCollegeOfGlamourMantleOfMajestyUsesRemaining(
  character: BardGlamourCharacter
): number {
  const totalUses = getBardCollegeOfGlamourMantleOfMajestyUsesTotal(character);
  const bardState = character.classFeatureState?.bard;

  return Math.max(0, totalUses - (bardState?.mantleOfMajestyUsesExpended ?? 0));
}

export function getBardCollegeOfGlamourMantleOfMajestyFallbackSlotLevel(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number | null {
  const totals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const expended = normalizeSpellSlotsExpended(character.spellSlotsExpended, totals);

  for (let slotLevel = 3; slotLevel <= 9; slotLevel += 1) {
    const remainingSlots = Math.max(
      0,
      (totals[slotLevel - 1] ?? 0) - (expended[slotLevel - 1] ?? 0)
    );

    if (remainingSlots > 0) {
      return slotLevel;
    }
  }

  return null;
}

export function getBardCollegeOfGlamourMantleOfMajestyFallbackSlotSummary(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): { total: number; remaining: number } {
  const totals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const expended = normalizeSpellSlotsExpended(character.spellSlotsExpended, totals);

  return totals.reduce(
    (summary, total, index) => {
      const slotLevel = index + 1;

      if (slotLevel < 3) {
        return summary;
      }

      return {
        total: summary.total + total,
        remaining: summary.remaining + Math.max(0, total - (expended[index] ?? 0))
      };
    },
    { total: 0, remaining: 0 }
  );
}

export function consumeBardCollegeOfGlamourMantleOfMajestyUse(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (
    !hasBardCollegeOfGlamourMantleOfMajestyFeature(character) ||
    getBardCollegeOfGlamourMantleOfMajestyUsesRemaining(character) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        mantleOfMajestyUsesExpended: (bardState.mantleOfMajestyUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreBardCollegeOfGlamourMantleOfMajestyOnLongRest(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (getBardCollegeOfGlamourMantleOfMajestyUsesTotal(character) <= 0) {
    return character;
  }

  if ((bardState.mantleOfMajestyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        mantleOfMajestyUsesExpended: 0
      }
    }
  };
}

export function getBardCollegeOfGlamourUnbreakableMajestyUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasBardCollegeOfGlamourUnbreakableMajestyFeature(character) ? 1 : 0;
}

export function getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining(
  character: BardGlamourCharacter
): number {
  const totalUses = getBardCollegeOfGlamourUnbreakableMajestyUsesTotal(character);
  const bardState = character.classFeatureState?.bard;

  return Math.max(0, totalUses - (bardState?.unbreakableMajestyUsesExpended ?? 0));
}

export function consumeBardCollegeOfGlamourUnbreakableMajestyUse(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (
    !hasBardCollegeOfGlamourUnbreakableMajestyFeature(character) ||
    getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining(character) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        unbreakableMajestyUsesExpended: (bardState.unbreakableMajestyUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreBardCollegeOfGlamourUnbreakableMajestyOnShortRest(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (getBardCollegeOfGlamourUnbreakableMajestyUsesTotal(character) <= 0) {
    return character;
  }

  if ((bardState.unbreakableMajestyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        unbreakableMajestyUsesExpended: 0
      }
    }
  };
}

export function restoreBardCollegeOfGlamourUnbreakableMajestyOnLongRest(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  return restoreBardCollegeOfGlamourUnbreakableMajestyOnShortRest(character, bardState);
}

export function hasActiveBardCollegeOfGlamourMantleOfMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  if (character.className !== "Bard" || character.subclassId !== collegeOfGlamourSubclassId) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === "Mantle of Majesty" &&
      entry.sourceId === mantleOfMajestyStatusSourceId
  );
}

export function hasActiveBardCollegeOfGlamourUnbreakableMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  if (character.className !== "Bard" || character.subclassId !== collegeOfGlamourSubclassId) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === "Unbreakable Majesty" &&
      entry.sourceId === unbreakableMajestyStatusSourceId
  );
}

export function applyBardCollegeOfGlamourMantleOfMajestyStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) =>
      !(
        (entry.group === STATUS_ENTRY_GROUP.EFFECTS && entry.value === EFFECT_NAME.CONCENTRATION) ||
        (entry.duration.kind === STATUS_DURATION_KIND.LINKED &&
          entry.duration.linkedGroup === STATUS_ENTRY_GROUP.EFFECTS &&
          entry.duration.linkedValue === EFFECT_NAME.CONCENTRATION) ||
        entry.sourceId === mantleOfMajestyStatusSourceId ||
        entry.sourceId === mantleOfMajestyConcentrationSourceId
      )
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: EFFECT_NAME.CONCENTRATION,
        source: "Mantle of Majesty",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: mantleOfMajestyConcentrationSourceId
      }),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Mantle of Majesty",
        source: "College of Glamour",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.CONCENTRATION
        },
        sourceId: mantleOfMajestyStatusSourceId
      })
    ]
  };
}

export function applyBardCollegeOfGlamourUnbreakableMajestyStatus(
  character: Character
): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== unbreakableMajestyStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Unbreakable Majesty",
        source: "College of Glamour",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: unbreakableMajestyStatusSourceId
      })
    ]
  };
}

export function activateBardCollegeOfGlamourUnbreakableMajesty(character: Character): Character {
  if (
    getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining(character) <= 0 ||
    hasActiveBardCollegeOfGlamourUnbreakableMajesty(character)
  ) {
    return character;
  }

  return applyBardCollegeOfGlamourUnbreakableMajestyStatus(
    consumeBardCollegeOfGlamourUnbreakableMajestyUse(character, character.classFeatureState?.bard ?? {})
  );
}

export function activateBardCollegeOfGlamourMantleOfInspiration(
  character: Character
): Character {
  if (!hasCollegeOfGlamourMantleOfInspiration(character)) {
    return character;
  }

  if (getBardicInspirationUsesRemaining(character) <= 0) {
    return character;
  }

  return expendBardicInspirationUse(character);
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
      spellSlotsExpended: character.spellSlotsExpended,
      statusEntries: character.statusEntries
    };
    const mantleActive = hasActiveBardCollegeOfGlamourMantleOfMajesty(character);
    const unbreakableMajestyActive = hasActiveBardCollegeOfGlamourUnbreakableMajesty(character);

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

    if (
      hasCollegeOfGlamourMantleOfMajesty(character) &&
      character.spellSlotsExpended !== undefined
    ) {
      const usesRemaining = getBardCollegeOfGlamourMantleOfMajestyUsesRemaining(glamourCharacter);
      const usesTotal = getBardCollegeOfGlamourMantleOfMajestyUsesTotal(glamourCharacter);
      const fallbackSlotLevel = getBardCollegeOfGlamourMantleOfMajestyFallbackSlotLevel({
        className: character.className,
        level,
        spellSlotsExpended: character.spellSlotsExpended
      });
      const fallbackSlotSummary = getBardCollegeOfGlamourMantleOfMajestyFallbackSlotSummary({
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
        breakdown: "Command with majesty",
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
      const usesRemaining =
        getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining(glamourCharacter);
      const usesTotal = getBardCollegeOfGlamourUnbreakableMajestyUsesTotal(glamourCharacter);

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
    transformSpellEntry: (spell) => getBardCollegeOfGlamourTransformedSpell(character, spell)
  };
};
