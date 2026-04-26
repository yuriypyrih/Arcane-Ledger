import {
  ACTION_TYPE,
  CLASS_FEATURE,
  REACTION,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { hasStatusCondition } from "../../../statusEntries";
import type { DerivedFeatureStatusEntry } from "../../types";
import { resolveSpellIdsByName, type SubclassRuntimeResolver } from "../../subclassRuntime";

export const arcaneTricksterSubclassId = "rogue-arcane-trickster";
export const rogueArcaneTricksterMagicalAmbushStatusSourceId =
  "feature-rogue-arcane-trickster-magical-ambush";
export const rogueArcaneTricksterSpellThiefReactionId =
  "reaction-rogue-arcane-trickster-spell-thief";
export const rogueArcaneTricksterSpellThiefStatusSourceIdPrefix =
  "feature-rogue-arcane-trickster-spell-thief:";

const arcaneTricksterAlwaysPreparedSpellIds = resolveSpellIdsByName(["Mage Hand"]);
const mageHandSpellId = "spell-mage-hand";
const mageHandLegerdemainSource = "Mage Hand Legerdemain";
const magicalAmbushName = "Magical Ambush";
const spellThiefName = "Spell Thief";
const versatileTricksterSource = "Versatile Trickster";
const arcaneTricksterSubclassEntry = getSubclassEntryById(arcaneTricksterSubclassId);

function hasRogueArcaneTricksterFeature(
  character: Parameters<SubclassRuntimeResolver>[0],
  minimumLevel: number
): boolean {
  return (
    character.className === "Rogue" &&
    character.subclassId === arcaneTricksterSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

function getRogueArcaneTricksterFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = arcaneTricksterSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const mageHandLegerdemainDescription = getRogueArcaneTricksterFeatureDescriptionEntries(
  CLASS_FEATURE.MAGE_HAND_LEGERDEMAIN
);
const magicalAmbushDescription = getRogueArcaneTricksterFeatureDescriptionEntries(
  CLASS_FEATURE.MAGICAL_AMBUSH
);
const spellThiefDescription = getRogueArcaneTricksterFeatureDescriptionEntries(
  CLASS_FEATURE.SPELL_THIEF
);
const versatileTricksterDescription = getRogueArcaneTricksterFeatureDescriptionEntries(
  CLASS_FEATURE.VERSATILE_TRICKSTER
);

const spellThiefReactionEntry: ReactionEntry = {
  id: rogueArcaneTricksterSpellThiefReactionId,
  reaction: REACTION.SPELL_THIEF,
  name: spellThiefName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.SPELL_THIEF,
  sourceLabel: "Arcane Trickster",
  description: spellThiefDescription
};

export function isRogueArcaneTricksterSpellThiefStatusSourceId(
  value: string | null | undefined
): value is `${typeof rogueArcaneTricksterSpellThiefStatusSourceIdPrefix}${string}` {
  return (
    typeof value === "string" &&
    value.startsWith(rogueArcaneTricksterSpellThiefStatusSourceIdPrefix)
  );
}

export function getRogueArcaneTricksterSpellThiefStatusSourceId(spellId: string): string {
  return `${rogueArcaneTricksterSpellThiefStatusSourceIdPrefix}${spellId}`;
}

export function getRogueArcaneTricksterSpellThiefSpellId(
  sourceId: string | null | undefined
): string | null {
  if (!isRogueArcaneTricksterSpellThiefStatusSourceId(sourceId)) {
    return null;
  }

  const spellId = sourceId.slice(rogueArcaneTricksterSpellThiefStatusSourceIdPrefix.length).trim();
  return spellId.length > 0 ? spellId : null;
}

function getRogueArcaneTricksterSpellThiefAlwaysPreparedSpellIds(
  character: Parameters<SubclassRuntimeResolver>[0]
): string[] {
  if (!hasRogueArcaneTricksterFeature(character, 17) || !Array.isArray(character.statusEntries)) {
    return [];
  }

  return [
    ...new Set(
      character.statusEntries.flatMap((entry) => {
        const spellId = getRogueArcaneTricksterSpellThiefSpellId(entry.sourceId);
        return spellId ? [spellId] : [];
      })
    )
  ];
}

function getRogueArcaneTricksterSpellThiefStatusEntries(
  character: Parameters<SubclassRuntimeResolver>[0]
): DerivedFeatureStatusEntry[] {
  if (!hasRogueArcaneTricksterFeature(character, 17) || !Array.isArray(character.statusEntries)) {
    return [];
  }

  return character.statusEntries.filter(
    (entry): entry is DerivedFeatureStatusEntry =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      isRogueArcaneTricksterSpellThiefStatusSourceId(entry.sourceId)
  );
}

function appendArcaneTricksterSpellDescription(
  spell: SpellEntry,
  sourceName: string,
  descriptionEntries: readonly string[]
): SpellEntry {
  if (descriptionEntries.length <= 0) {
    return spell;
  }

  return appendSourcedDescriptionAddition(spell, sourceName, descriptionEntries);
}

function getRogueArcaneTricksterDerivedStatusEntries(
  character: Parameters<SubclassRuntimeResolver>[0]
): DerivedFeatureStatusEntry[] {
  const derivedEntries = getRogueArcaneTricksterSpellThiefStatusEntries(character);

  if (!hasRogueArcaneTricksterFeature(character, 9)) {
    return derivedEntries;
  }

  return [
    ...derivedEntries,
    {
      id: rogueArcaneTricksterMagicalAmbushStatusSourceId,
      sourceId: rogueArcaneTricksterMagicalAmbushStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: magicalAmbushName,
      source: "Arcane Trickster",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.CONDITIONS,
        linkedValue: CONDITION_NAME.INVISIBLE
      }
    }
  ];
}

function transformArcaneTricksterSpell(
  character: Parameters<SubclassRuntimeResolver>[0],
  spell: SpellEntry
): SpellEntry {
  if (!hasRogueArcaneTricksterFeature(character, 3)) {
    return spell;
  }

  let nextSpell =
    spell.id === mageHandSpellId
      ? appendArcaneTricksterSpellDescription(
          spell,
          mageHandLegerdemainSource,
          mageHandLegerdemainDescription
        )
      : spell;

  if (spell.id === mageHandSpellId && hasRogueArcaneTricksterFeature(character, 13)) {
    nextSpell = appendArcaneTricksterSpellDescription(
      nextSpell,
      versatileTricksterSource,
      versatileTricksterDescription
    );
  }

  return hasRogueArcaneTricksterFeature(character, 9) && spell.isSavingThrowSpell === true
    ? appendArcaneTricksterSpellDescription(nextSpell, magicalAmbushName, magicalAmbushDescription)
    : nextSpell;
}

export function isRogueArcaneTricksterMagicalAmbushActiveForSpell(
  character: Parameters<SubclassRuntimeResolver>[0],
  spell: Pick<SpellEntry, "isSavingThrowSpell">
): boolean {
  return (
    hasRogueArcaneTricksterFeature(character, 9) &&
    spell.isSavingThrowSpell === true &&
    hasStatusCondition(character.statusEntries, CONDITION_NAME.INVISIBLE)
  );
}

export function canUseRogueArcaneTricksterMageHandLegerdemainBonusActionPathForSpell(
  character: Parameters<SubclassRuntimeResolver>[0],
  spell: Pick<SpellEntry, "id" | "castingTime">
): boolean {
  return (
    hasRogueArcaneTricksterFeature(character, 3) &&
    spell.id === mageHandSpellId &&
    spell.castingTime.includes(ACTION_TYPE.ACTION)
  );
}

export const getRogueArcaneTricksterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasRogueArcaneTricksterFeature(character, 3)
    ? {
        alwaysPreparedSpellIds: [
          ...new Set([
            ...arcaneTricksterAlwaysPreparedSpellIds,
            ...getRogueArcaneTricksterSpellThiefAlwaysPreparedSpellIds(character)
          ])
        ],
        derivedStatusEntries: getRogueArcaneTricksterDerivedStatusEntries(character),
        reactionEntries: hasRogueArcaneTricksterFeature(character, 17)
          ? [spellThiefReactionEntry]
          : undefined,
        transformSpellEntry: (spell) => transformArcaneTricksterSpell(character, spell)
      }
    : {};
