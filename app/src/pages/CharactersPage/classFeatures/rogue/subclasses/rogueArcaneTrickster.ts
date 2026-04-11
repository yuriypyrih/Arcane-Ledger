import {
  ACTION_TYPE,
  CLASS_FEATURE,
  REACTION,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import { CONDITION_NAME, STATUS_DURATION_KIND, STATUS_ENTRY_GROUP, STATUS_ENTRY_SOURCE_TYPE } from "../../../../../types";
import {
  createSourcedDescriptionEntries,
  descriptionValueSomeText
} from "../../../actionModalDescriptions";
import type { DerivedFeatureStatusEntry } from "../../types";
import {
  resolveSpellIdsByName,
  transformSpellToBonusAction,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

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
    typeof value === "string" && value.startsWith(rogueArcaneTricksterSpellThiefStatusSourceIdPrefix)
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
  if (spell.id !== mageHandSpellId || descriptionEntries.length <= 0) {
    return spell;
  }

  const marker = `<strong>${sourceName}.</strong>`;

  if (
    descriptionValueSomeText({ description: spell.description }, (entry) => entry.includes(marker))
  ) {
    return spell;
  }

  return {
    ...spell,
    description: [
      ...spell.description,
      ...createSourcedDescriptionEntries(sourceName, descriptionEntries)
    ]
  };
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
  if (!hasRogueArcaneTricksterFeature(character, 3) || spell.id !== mageHandSpellId) {
    return spell;
  }

  let nextSpell = transformSpellToBonusAction(mageHandSpellId, spell);

  if (!nextSpell.castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    nextSpell = {
      ...nextSpell,
      castingTime: [ACTION_TYPE.BONUS_ACTION]
    };
  }

  nextSpell = appendArcaneTricksterSpellDescription(
    nextSpell,
    mageHandLegerdemainSource,
    mageHandLegerdemainDescription
  );

  return hasRogueArcaneTricksterFeature(character, 13)
    ? appendArcaneTricksterSpellDescription(
        nextSpell,
        versatileTricksterSource,
        versatileTricksterDescription
      )
    : nextSpell;
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
