import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  vestigeCompanionName,
  vestigeCompanionReferenceStatBlock
} from "../../../../../codex/subclasses/warlockVestigeCompanion";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterCompanion,
  type CharacterWarlockFeatureState
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { normalizeCharacterCompanions } from "../../../companions";
import { getClassLevel } from "../../../multiclassState";
import {
  createTemporaryHitPointsAssignment,
  swapTemporaryHitPointsAssignment
} from "../../../shared";
import { createCharacterStatusEntry } from "../../../statusEntries";
import { createChargesCardUsage, createChargesHeaderTag } from "../../cardUsage";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const semblanceOfLifeActionKey = "warlock-semblance-of-life";
export const semblanceOfLifeSourceId = "feature-warlock-semblance-of-life";
const semblanceOfLifeName = "Semblance of Life";
const spiritByType: Record<string, string> = {
  celestial: "Celestial Spirit",
  fiend: "Fiendish Spirit",
  undead: "Undead Spirit"
};

function getTraitId(companion: CharacterCompanion): string {
  return `${semblanceOfLifeSourceId}:${companion.id}`;
}

export function getSemblanceOfLifeCompanion(character: SubclassRuntimeCharacter) {
  return character.companions?.find((entry) => entry.source === vestigeCompanionName);
}

export function getSemblanceOfLifeSpellLevel(character: SubclassRuntimeCharacter): number {
  return Math.min(9, Math.floor(getClassLevel(character, "Warlock") / 2));
}

export function getSemblanceOfLifeSpiritName(
  character: SubclassRuntimeCharacter
): string | undefined {
  return spiritByType[getSemblanceOfLifeCompanion(character)?.type.toLowerCase() ?? ""];
}

export function hasSemblanceOfLife(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.SEMBLANCE_OF_LIFE) !== null
  );
}

export function normalizeSemblanceOfLifeState(
  value: Partial<CharacterWarlockFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterWarlockFeatureState, "semblanceOfLifeUsesExpended"> {
  if (!hasSemblanceOfLife(character)) return {};
  const expended = Number(value.semblanceOfLifeUsesExpended);
  return { semblanceOfLifeUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getSemblanceOfLifeUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasSemblanceOfLife(character)) return 0;
  return (
    1 -
    (normalizeSemblanceOfLifeState(character.classFeatureState?.warlock ?? {}, character)
      .semblanceOfLifeUsesExpended ?? 0)
  );
}

export function getSemblanceOfLifeDefinitionError(definition?: CharacterCompanion): string | null {
  if (!definition?.inheritedCreatureEntry) return "Choose and configure a spirit stat block first.";
  if (!Number.isFinite(definition.maxHitPoints) || definition.maxHitPoints < 1) {
    return "Set the spirit form's Max HP to the temporary HP it grants.";
  }
  return null;
}

export function getSemblanceOfLifeAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.SEMBLANCE_OF_LIFE
  );
  if (!feature) return null;
  const companion = getSemblanceOfLifeCompanion(character);
  const usesRemaining = getSemblanceOfLifeUsesRemaining(character);
  const isActive = Boolean(companion?.semblanceOfLife);
  const disabledReason = !companion?.inheritedCreatureEntry
    ? "Summon your Vestige Companion first."
    : companion.currentHitPoints <= 0
      ? "Your Vestige Companion must have at least 1 HP."
      : isActive
        ? "Your vestige is already transformed."
        : usesRemaining <= 0
          ? "Semblance of Life is expended until your next Long Rest."
          : undefined;
  return {
    key: semblanceOfLifeActionKey,
    name: semblanceOfLifeName,
    sourceFeature: CLASS_FEATURE.SEMBLANCE_OF_LIFE,
    summary: "Transform your vestige into a spirit for 1 hour.",
    detail: "Choose and configure the spirit form before transforming your companion.",
    breakdown: "Transform companion | 1 hour",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal: 1,
    cardUsage: createChargesCardUsage(usesRemaining, 1),
    headerTags: [createChargesHeaderTag(usesRemaining, 1, "Long Rest")],
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description: feature.description,
    drawer: {
      kind: "custom-form",
      formKind: "warlock-semblance-of-life",
      description: feature.description,
      blockedReason: disabledReason
    },
    execute: { kind: "custom-form", formKind: "warlock-semblance-of-life" }
  };
}

export function activateSemblanceOfLife(
  character: Character,
  value: CharacterCompanion
): Character {
  const action = getSemblanceOfLifeAction(character);
  const companion = getSemblanceOfLifeCompanion(character);
  const definition = normalizeCharacterCompanions([value])[0];
  if (
    !action ||
    action.disabled ||
    !companion?.inheritedCreatureEntry ||
    getSemblanceOfLifeDefinitionError(definition) ||
    !definition?.inheritedCreatureEntry
  )
    return character;
  const original = companion.inheritedCreatureEntry;
  const spirit = definition.inheritedCreatureEntry;
  const divinePower = (vestigeCompanionReferenceStatBlock.actions ?? [])
    .filter((entry) => entry.action_type === "BONUS_ACTION")
    .map((entry) => original.actions?.find((action) => action.name === entry.name) ?? entry);
  const traitId = getTraitId(companion);
  const next = spendClassResource(
    character,
    {
      stateKey: "warlock",
      counter: "semblanceOfLifeUsesExpended",
      total: 1,
      remaining: getSemblanceOfLifeUsesRemaining(character)
    },
    1
  );
  return {
    ...next,
    companions: next.companions.map((entry) =>
      entry.id !== companion.id
        ? entry
        : {
            ...entry,
            ...swapTemporaryHitPointsAssignment(
              entry.temporaryHitPoints,
              entry.temporaryHitPointsSource,
              definition.maxHitPoints,
              semblanceOfLifeName
            ),
            semblanceOfLife: { traitId },
            additionalStatBlocks: [
              ...(entry.additionalStatBlocks ?? []),
              {
                id: traitId,
                modified: true,
                monster: {
                  ...spirit,
                  hit_points: entry.maxHitPoints,
                  hit_dice: original.hit_dice,
                  actions: [
                    ...(spirit.actions ?? []).filter(
                      (action) => !divinePower.some((power) => power.name === action.name)
                    ),
                    ...divinePower
                  ]
                }
              }
            ]
          }
    ),
    statusEntries: [
      ...(next.statusEntries ?? []).filter((entry) => entry.sourceId !== semblanceOfLifeSourceId),
      createCharacterStatusEntry({
        id: traitId,
        sourceId: semblanceOfLifeSourceId,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: semblanceOfLifeName,
        source: semblanceOfLifeName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        // Minutes allow the existing Short Rest fast-forward to expire the full hour.
        duration: { kind: STATUS_DURATION_KIND.MINUTES, amount: 60 },
        description: action.description
          ?.filter((entry): entry is string => typeof entry === "string")
          .join("\n\n")
      })
    ]
  };
}

/** The trait owns only its temporary block; other blocks and current HP stay untouched. */
export function reconcileSemblanceOfLife(character: Character): Character {
  const entries = character.statusEntries ?? [];
  if (
    !character.companions.some((entry) => entry.semblanceOfLife) &&
    !entries.some((entry) => entry.sourceId === semblanceOfLifeSourceId)
  )
    return character;
  const activeTraitIds = new Set<string>();
  let companionsChanged = false;
  const companions = character.companions.map((companion) => {
    const form = companion.semblanceOfLife;
    if (!form) return companion;
    const active =
      hasSemblanceOfLife(character) &&
      companion.source === vestigeCompanionName &&
      form.traitId === getTraitId(companion) &&
      companion.additionalStatBlocks?.some((block) => block.id === form.traitId) &&
      companion.temporaryHitPoints > 0 &&
      entries.some(
        (entry) =>
          entry.id === form.traitId && entry.sourceId === semblanceOfLifeSourceId && !entry.disabled
      );
    if (active) {
      activeTraitIds.add(form.traitId);
      return companion;
    }
    companionsChanged = true;
    return {
      ...companion,
      semblanceOfLife: undefined,
      additionalStatBlocks: companion.additionalStatBlocks?.filter(
        (block) => block.id !== form.traitId
      ),
      ...(companion.temporaryHitPointsSource === semblanceOfLifeName
        ? createTemporaryHitPointsAssignment(0)
        : {})
    };
  });
  const statusEntries = entries.filter(
    (entry) => entry.sourceId !== semblanceOfLifeSourceId || activeTraitIds.has(entry.id)
  );
  return companionsChanged || statusEntries.length !== entries.length
    ? {
        ...character,
        companions: companionsChanged ? companions : character.companions,
        statusEntries
      }
    : character;
}

export function restoreSemblanceOfLifeOnLongRest(character: Character): Character {
  if (
    !hasSemblanceOfLife(character) ||
    !character.classFeatureState?.warlock?.semblanceOfLifeUsesExpended
  )
    return character;
  return replaceClassFeatureState(character, "warlock", {
    ...character.classFeatureState?.warlock,
    semblanceOfLifeUsesExpended: 0
  });
}
