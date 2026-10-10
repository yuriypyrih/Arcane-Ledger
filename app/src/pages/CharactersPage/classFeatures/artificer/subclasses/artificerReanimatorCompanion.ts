import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  type Character,
  type CharacterArtificerFeatureState,
  type CharacterCompanion
} from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { CHARACTER_COMPANION_LIMIT, normalizeCharacterCompanions } from "../../../companions";
import { getSheetSpellSlotTotals } from "../../../multiclassSpellcasting";
import { normalizeSpellSlotsExpended } from "../../../spellSlots";
import {
  appendSpellSummonCompanionsForCast,
  type SpellSummonDefinitionConfig
} from "../../../spellSummons";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { hasArtificerReanimatorFeature } from "./artificerReanimatorSkillSet";

export const artificerReanimatedCompanionActionKey = "artificer-reanimator-reanimated-companion";
export const reanimatedCompanionName = "Reanimated Companion";
export const reanimatedCompanionDefinitionConfig: SpellSummonDefinitionConfig = {
  spellId: artificerReanimatedCompanionActionKey,
  defaultType: "Undead",
  defaultDuration: { kind: STATUS_DURATION_KIND.LONG_REST }
};

export function normalizeArtificerReanimatedCompanionState(
  value: unknown,
  character: SubclassRuntimeCharacter
): Pick<CharacterArtificerFeatureState, "reanimatorCompanionUsesExpended"> {
  if (!hasArtificerReanimatorFeature(character)) return {};
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const expended = Number(record.reanimatorCompanionUsesExpended);
  return { reanimatorCompanionUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getArtificerReanimatedCompanionUsesTotal(
  character: SubclassRuntimeCharacter
): number {
  return hasArtificerReanimatorFeature(character) ? 1 : 0;
}

export function getArtificerReanimatedCompanionUsesRemaining(
  character: SubclassRuntimeCharacter
): number {
  return (
    getArtificerReanimatedCompanionUsesTotal(character) -
    (normalizeArtificerReanimatedCompanionState(character.classFeatureState?.artificer, character)
      .reanimatorCompanionUsesExpended ?? 0)
  );
}

export function getArtificerReanimatedCompanionSpellSlotOptions(
  character: SubclassRuntimeCharacter
) {
  const totals = getSheetSpellSlotTotals(character);
  const expended = normalizeSpellSlotsExpended(character.spellSlotsExpended, totals);
  return totals.flatMap((total, index) => {
    const remaining = total - (expended[index] ?? 0);
    return remaining > 0 ? [{ level: index + 1, total, remaining }] : [];
  });
}

export function getArtificerReanimatedCompanionAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  if (!hasArtificerReanimatorFeature(character)) return null;
  const hasCompanion = (character.companions ?? []).some(
    (companion) => companion.source === reanimatedCompanionName
  );
  const usesRemaining = getArtificerReanimatedCompanionUsesRemaining(character);
  const slotTotals = getSheetSpellSlotTotals(character);
  const slotExpended = normalizeSpellSlotsExpended(character.spellSlotsExpended, slotTotals);
  const remainingSlots = slotTotals.reduce(
    (sum, total, index) => sum + total - (slotExpended[index] ?? 0),
    0
  );
  const spellSlotCost = createFeatureActionCardCost({ resourceLabel: "Spell Slot" });
  const disabledReason = hasCompanion
    ? "Dismiss your Reanimated Companion before creating another."
    : (character.companions ?? []).length >= CHARACTER_COMPANION_LIMIT
      ? "Remove a companion before creating a Reanimated Companion."
      : usesRemaining <= 0 &&
          getArtificerReanimatedCompanionSpellSlotOptions(character).length === 0
        ? "Finish a Long Rest or expend a spell slot to create another companion."
        : undefined;
  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.REANIMATED_COMPANION
  );
  return {
    key: artificerReanimatedCompanionActionKey,
    name: reanimatedCompanionName,
    sourceFeature: CLASS_FEATURE.REANIMATED_COMPANION,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Create a Reanimated Companion until your next Long Rest.",
    detail: "Choose the companion's stat block.",
    breakdown: "Create companion until Long Rest",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal: 1,
    cardUsage: createChargesOrResourceCardUsage(usesRemaining, 1, spellSlotCost),
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      1,
      spellSlotCost,
      remainingSlots,
      slotTotals.reduce((sum, total) => sum + total, 0),
      { label: "Spell Slots" },
      undefined,
      { isFallback: true }
    ),
    isActive: hasCompanion,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "custom-form",
      eyebrow: "Reanimator",
      description,
      formKind: "artificer-reanimated-companion",
      blockedReason: disabledReason
    },
    execute: { kind: "custom-form", formKind: "artificer-reanimated-companion" }
  };
}

export function createArtificerReanimatedCompanionForCharacter(
  character: Character,
  definition: CharacterCompanion,
  spellSlotLevel: number | null
): Character {
  const action = getArtificerReanimatedCompanionAction(character);
  const companion = normalizeCharacterCompanions([definition])[0];
  if (!action || action.disabled || !companion?.inheritedCreatureEntry) return character;

  let nextCharacter = character;
  if (getArtificerReanimatedCompanionUsesRemaining(character) > 0) {
    nextCharacter = spendClassResource(
      character,
      {
        stateKey: "artificer",
        counter: "reanimatorCompanionUsesExpended",
        total: 1,
        remaining: 1
      },
      1
    );
  } else {
    const slot = getArtificerReanimatedCompanionSpellSlotOptions(character).find(
      (option) => option.level === spellSlotLevel
    );
    if (!slot) return character;
    const expended = normalizeSpellSlotsExpended(
      character.spellSlotsExpended,
      getSheetSpellSlotTotals(character)
    );
    expended[slot.level - 1] += 1;
    nextCharacter = { ...character, spellSlotsExpended: expended };
  }
  return appendSpellSummonCompanionsForCast(nextCharacter, [
    {
      ...companion,
      source: reanimatedCompanionName,
      separateInitiative: false,
      duration: { kind: STATUS_DURATION_KIND.LONG_REST }
    }
  ]);
}

export function restoreArtificerReanimatedCompanionOnLongRest(character: Character): Character {
  if (
    !hasArtificerReanimatorFeature(character) ||
    !character.classFeatureState?.artificer?.reanimatorCompanionUsesExpended
  )
    return character;
  return replaceClassFeatureState(character, "artificer", {
    ...character.classFeatureState?.artificer,
    reanimatorCompanionUsesExpended: 0
  });
}
