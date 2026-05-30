import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character, CharacterArtificerFeatureState } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artificerRestorativeReagentsActionKey = "artificer-restorative-reagents";

const alchemistSubclassId = "artificer-alchemist";
const lesserRestorationSpellId = "spell-lesser-restoration";
const restorativeReagentsName = "Restorative Reagents";

type RestorativeReagentsCharacter = Pick<Character, "className"> &
  Partial<
    Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId">
  >;

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

export function hasArtificerRestorativeReagentsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, alchemistSubclassId, 9);
}

export function getArtificerRestorativeReagentsUsesTotal(
  character: RestorativeReagentsCharacter
): number {
  const intelligenceModifier = getAbilityModifierForCharacter(
    {
      abilities: character.abilities,
      statusEntries: character.statusEntries
    },
    "INT"
  );

  return hasArtificerRestorativeReagentsFeature(character)
    ? Math.max(1, intelligenceModifier)
    : 0;
}

export function normalizeArtificerRestorativeReagentsState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "statusEntries" | "subclassId">>
): Pick<CharacterArtificerFeatureState, "restorativeReagentsUsesExpended"> {
  if (!hasArtificerRestorativeReagentsFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const usesTotal = getArtificerRestorativeReagentsUsesTotal(character);

  return {
    restorativeReagentsUsesExpended: normalizeUsesExpended(
      record.restorativeReagentsUsesExpended,
      usesTotal
    )
  };
}

export function getArtificerRestorativeReagentsUsesRemaining(
  character: RestorativeReagentsCharacter
): number {
  const usesTotal = getArtificerRestorativeReagentsUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.restorativeReagentsUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function getArtificerRestorativeReagentsAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  if (!hasArtificerRestorativeReagentsFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerRestorativeReagentsUsesTotal(character);
  const usesRemaining = getArtificerRestorativeReagentsUsesRemaining(character);
  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.RESTORATIVE_REAGENTS
  );

  return {
    key: artificerRestorativeReagentsActionKey,
    name: restorativeReagentsName,
    sourceFeature: CLASS_FEATURE.RESTORATIVE_REAGENTS,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Cast Lesser Restoration without a spell slot.",
    detail: "Open Lesser Restoration and cast it using your Restorative Reagents charge.",
    breakdown: "Free restoration",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    description,
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Open Lesser Restoration"
    },
    execute: {
      kind: "spell",
      spellSource: "fixed",
      effectKind: "restorative-reagents",
      spellId: lesserRestorationSpellId,
      spellLevel: 2,
      label: "Open Lesser Restoration",
      actionContextText: "Using Restorative Reagents",
      actionAvailabilityText: "Cast without expending a spell slot.",
      actionConsumesSpellSlot: false,
      freeCastSlotLevel: 2
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0
        ? "Restorative Reagents recharges when you finish a Long Rest."
        : undefined
  };
}

export function consumeArtificerRestorativeReagentsUse(character: Character): Character {
  const usesTotal = getArtificerRestorativeReagentsUsesTotal(character);
  const usesRemaining = getArtificerRestorativeReagentsUsesRemaining(character);

  if (usesTotal <= 0 || usesRemaining <= 0) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const restorativeReagentsState = normalizeArtificerRestorativeReagentsState(
    currentArtificerState,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...restorativeReagentsState,
        restorativeReagentsUsesExpended:
          (restorativeReagentsState.restorativeReagentsUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreArtificerRestorativeReagentsOnLongRest(character: Character): Character {
  if (!hasArtificerRestorativeReagentsFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const restorativeReagentsState = normalizeArtificerRestorativeReagentsState(
    currentArtificerState,
    character
  );

  if ((restorativeReagentsState.restorativeReagentsUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...restorativeReagentsState,
        restorativeReagentsUsesExpended: 0
      }
    }
  };
}
