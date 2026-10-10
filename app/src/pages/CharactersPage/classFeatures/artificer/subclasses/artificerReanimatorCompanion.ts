import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  type Character,
  type CharacterArtificerFeatureState,
  type CharacterCompanion
} from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
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

export function getLivingArtificerReanimatedCompanions(
  character: Partial<Pick<Character, "companions">>
): CharacterCompanion[] {
  return (character.companions ?? []).filter(
    (companion) =>
      companion.source === reanimatedCompanionName &&
      (companion.currentHitPoints > 0 || (companion.deathSaves?.failures ?? 0) < 3)
  );
}

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
  const hasCompanion = getLivingArtificerReanimatedCompanions(character).length > 0;
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
  const descriptionAdditions = [
    CLASS_FEATURE.STRANGE_MODIFICATIONS,
    CLASS_FEATURE.IMPROVED_REANIMATION,
    CLASS_FEATURE.MACABRE_MODIFICATIONS,
    CLASS_FEATURE.REFINED_REANIMATION
  ].flatMap((feature) => {
    const entries = createFeatureSourcedDescriptionEntries(
      character,
      feature,
      getFeatureDescriptionForCharacter(character, feature)
    );
    return entries.length ? [entries] : [];
  });
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
    descriptionAdditions,
    drawer: {
      kind: "custom-form",
      eyebrow: "Reanimator",
      description,
      descriptionAdditions,
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
