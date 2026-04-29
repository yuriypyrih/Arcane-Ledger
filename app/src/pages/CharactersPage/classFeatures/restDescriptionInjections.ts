import {
  CLASS_FEATURE,
  getClassEntryByName,
  type FeatureMapEntry,
  type SpellDescriptionEntry
} from "../../../codex/entries";
import {
  artificerFeatureMap,
  barbarianFeatureMap,
  bardFeatureMap,
  clericFeatureMap,
  druidFeatureMap,
  fighterFeatureMap,
  monkFeatureMap,
  paladinFeatureMap,
  rangerFeatureMap,
  rogueFeatureMap,
  sorcererFeatureMap,
  warlockFeatureMap,
  wizardFeatureMap
} from "../../../codex/classes";
import type { Character } from "../../../types";
import { createSourcedDescriptionEntries } from "../actionModalDescriptions";
import { getSelectedSubclassForCharacter } from "../subclasses";

type RestKey = "shortRest" | "longRest";
type RestDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;
export type RestDescriptionInjectionSection = SpellDescriptionEntry[];

export type RestDescriptionInjections = Record<RestKey, RestDescriptionInjectionSection[]>;

type DescriptionSlice = {
  entryIndex: number;
  start?: string;
};

type RestDescriptionRule = {
  className: string;
  subclassId?: string;
  feature: CLASS_FEATURE;
  restKeys: RestKey[];
  slices: DescriptionSlice[];
};

type FeatureDescriptionMetadata = {
  description: string[];
  level: number;
  name: string;
};

type RestDescriptionGroup = {
  entries: SpellDescriptionEntry[];
  index: number;
  level: number;
  sourceName: string;
};

const classFeatureMapsByName: Record<string, Partial<Record<CLASS_FEATURE, FeatureMapEntry>>> = {
  Artificer: artificerFeatureMap,
  Barbarian: barbarianFeatureMap,
  Bard: bardFeatureMap,
  Cleric: clericFeatureMap,
  Druid: druidFeatureMap,
  Fighter: fighterFeatureMap,
  Monk: monkFeatureMap,
  Paladin: paladinFeatureMap,
  Ranger: rangerFeatureMap,
  Rogue: rogueFeatureMap,
  Sorcerer: sorcererFeatureMap,
  Warlock: warlockFeatureMap,
  Wizard: wizardFeatureMap
};

const restDescriptionRules: RestDescriptionRule[] = [
  {
    className: "Artificer",
    feature: CLASS_FEATURE.SPELLCASTING,
    restKeys: ["longRest"],
    slices: [
      { entryIndex: 2, start: "Whenever you finish" },
      { entryIndex: 8 }
    ]
  },
  {
    className: "Artificer",
    feature: CLASS_FEATURE.REPLICATE_MAGIC_ITEM,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 3 }, { entryIndex: 5 }]
  },
  {
    className: "Artificer",
    feature: CLASS_FEATURE.SPELL_STORING_ITEM,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 0 }]
  },
  {
    className: "Barbarian",
    feature: CLASS_FEATURE.WEAPON_MASTERY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 0, start: "Whenever you finish" }]
  },
  {
    className: "Barbarian",
    feature: CLASS_FEATURE.RELENTLESS_RAGE,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 2, start: "When you finish" }]
  },
  {
    className: "Barbarian",
    subclassId: "barbarian-path-of-the-wild-heart",
    feature: CLASS_FEATURE.ASPECT_OF_THE_WILDS,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 0 }]
  },
  {
    className: "Cleric",
    feature: CLASS_FEATURE.SPELLCASTING,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 8 }]
  },
  {
    className: "Druid",
    feature: CLASS_FEATURE.SPELLCASTING,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 8 }]
  },
  {
    className: "Druid",
    feature: CLASS_FEATURE.WILD_SHAPE,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 3, start: "Whenever you finish" }]
  },
  {
    className: "Druid",
    subclassId: "druid-circle-of-the-stars",
    feature: CLASS_FEATURE.STAR_MAP,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 4 }]
  },
  {
    className: "Druid",
    subclassId: "druid-circle-of-the-stars",
    feature: CLASS_FEATURE.COSMIC_OMEN,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 0 }, { entryIndex: 1 }]
  },
  {
    className: "Fighter",
    feature: CLASS_FEATURE.WEAPON_MASTERY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 0, start: "Whenever you finish" }]
  },
  {
    className: "Fighter",
    subclassId: "fighter-banneret",
    feature: CLASS_FEATURE.KNIGHTLY_ENVOY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 2 }]
  },
  {
    className: "Fighter",
    subclassId: "fighter-eldritch-knight",
    feature: CLASS_FEATURE.WAR_BOND,
    restKeys: ["shortRest"],
    slices: [{ entryIndex: 0 }]
  },
  {
    className: "Paladin",
    feature: CLASS_FEATURE.SPELLCASTING,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 5 }]
  },
  {
    className: "Paladin",
    feature: CLASS_FEATURE.WEAPON_MASTERY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 1 }]
  },
  {
    className: "Ranger",
    feature: CLASS_FEATURE.SPELLCASTING,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 5 }]
  },
  {
    className: "Ranger",
    feature: CLASS_FEATURE.WEAPON_MASTERY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 1 }]
  },
  {
    className: "Ranger",
    feature: CLASS_FEATURE.TIRELESS,
    restKeys: ["shortRest"],
    slices: [{ entryIndex: 2 }]
  },
  {
    className: "Ranger",
    subclassId: "ranger-beast-master",
    feature: CLASS_FEATURE.PRIMAL_COMPANION,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 7 }]
  },
  {
    className: "Ranger",
    subclassId: "ranger-fey-wanderer",
    feature: CLASS_FEATURE.FEY_WANDERER_SPELLS,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 8 }]
  },
  {
    className: "Ranger",
    subclassId: "ranger-hunter",
    feature: CLASS_FEATURE.HUNTERS_PREY,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 0 }]
  },
  {
    className: "Ranger",
    subclassId: "ranger-hunter",
    feature: CLASS_FEATURE.DEFENSIVE_TACTICS,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 0 }]
  },
  {
    className: "Rogue",
    feature: CLASS_FEATURE.WEAPON_MASTERY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 1 }]
  },
  {
    className: "Rogue",
    subclassId: "rogue-scion-of-the-three",
    feature: CLASS_FEATURE.DREAD_ALLEGIANCE,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 0, start: "When you finish" }]
  },
  {
    className: "Warlock",
    subclassId: "warlock-celestial-patron",
    feature: CLASS_FEATURE.CELESTIAL_RESILIENCE,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 0 }, { entryIndex: 1 }, { entryIndex: 2 }, { entryIndex: 3 }]
  },
  {
    className: "Warlock",
    subclassId: "warlock-fiend-patron",
    feature: CLASS_FEATURE.FIENDISH_RESILIENCE,
    restKeys: ["shortRest", "longRest"],
    slices: [{ entryIndex: 0 }, { entryIndex: 1 }]
  },
  {
    className: "Wizard",
    feature: CLASS_FEATURE.SPELLCASTING,
    restKeys: ["longRest"],
    slices: [
      { entryIndex: 1, start: "Whenever you finish" },
      { entryIndex: 10 }
    ]
  },
  {
    className: "Wizard",
    feature: CLASS_FEATURE.MEMORIZE_SPELL,
    restKeys: ["shortRest"],
    slices: [{ entryIndex: 0 }]
  },
  {
    className: "Wizard",
    feature: CLASS_FEATURE.SPELL_MASTERY,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 2 }]
  },
  {
    className: "Wizard",
    subclassId: "wizard-diviner",
    feature: CLASS_FEATURE.PORTENT,
    restKeys: ["longRest"],
    slices: [{ entryIndex: 1 }, { entryIndex: 5 }]
  }
];

function normalizeCharacterLevel(level: number): number {
  return Math.max(1, Math.floor(level));
}

function formatClassFeatureName(feature: CLASS_FEATURE): string {
  return feature
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getClassFeatureMetadata(
  character: RestDescriptionCharacter,
  rule: RestDescriptionRule
): FeatureDescriptionMetadata | null {
  const normalizedLevel = normalizeCharacterLevel(character.level);
  const classEntry = getClassEntryByName(character.className);
  const matchingRow = [...(classEntry?.features ?? [])]
    .filter(
      (featureRow) =>
        featureRow.level <= normalizedLevel &&
        (featureRow.classFeatures.includes(rule.feature) ||
          featureRow.featureOverrides?.[rule.feature] !== undefined)
    )
    .sort((left, right) => right.level - left.level)[0];

  if (!matchingRow) {
    return null;
  }

  const details =
    matchingRow.featureOverrides?.[rule.feature] ??
    classFeatureMapsByName[character.className]?.[rule.feature];

  return details
    ? {
        description: [...details.description],
        level: matchingRow.level,
        name: formatClassFeatureName(rule.feature)
      }
    : null;
}

function getSubclassFeatureMetadata(
  character: RestDescriptionCharacter,
  rule: RestDescriptionRule
): FeatureDescriptionMetadata | null {
  const subclass = getSelectedSubclassForCharacter(character);

  if (!subclass || subclass.id !== rule.subclassId) {
    return null;
  }

  const normalizedLevel = normalizeCharacterLevel(character.level);
  const matchingRow = [...subclass.features]
    .filter(
      (featureRow) =>
        featureRow.level <= normalizedLevel &&
        (featureRow.classFeatures.includes(rule.feature) ||
          featureRow.featureOverrides?.[rule.feature] !== undefined)
    )
    .sort((left, right) => right.level - left.level)[0];
  const details = matchingRow?.featureOverrides?.[rule.feature];

  return details
    ? {
        description: [...details.description],
        level: matchingRow.level,
        name: formatClassFeatureName(rule.feature)
      }
    : null;
}

function getRuleFeatureMetadata(
  character: RestDescriptionCharacter,
  rule: RestDescriptionRule
): FeatureDescriptionMetadata | null {
  if (character.className !== rule.className) {
    return null;
  }

  return rule.subclassId
    ? getSubclassFeatureMetadata(character, rule)
    : getClassFeatureMetadata(character, rule);
}

function extractDescriptionSlice(
  description: readonly string[],
  slice: DescriptionSlice
): SpellDescriptionEntry | null {
  const entry = description[slice.entryIndex];

  if (typeof entry !== "string") {
    return null;
  }

  if (!slice.start) {
    return entry;
  }

  const startIndex = entry.indexOf(slice.start);

  return startIndex >= 0 ? entry.slice(startIndex).trim() : null;
}

function addEntriesToRestGroup(
  groups: Map<string, RestDescriptionGroup>,
  metadata: FeatureDescriptionMetadata,
  entries: SpellDescriptionEntry[],
  index: number
) {
  const sourceName = `Level ${metadata.level}: ${metadata.name}`;
  const existingGroup = groups.get(sourceName);

  if (existingGroup) {
    existingGroup.entries.push(...entries);
    return;
  }

  groups.set(sourceName, {
    entries: [...entries],
    index,
    level: metadata.level,
    sourceName
  });
}

function createRestDescriptionSections(groups: Map<string, RestDescriptionGroup>) {
  return [...groups.values()]
    .sort((left, right) => left.level - right.level || left.index - right.index)
    .map((group) => createSourcedDescriptionEntries(group.sourceName, group.entries));
}

export function getRestDescriptionInjectionsForCharacter(
  character: RestDescriptionCharacter
): RestDescriptionInjections {
  const groups: Record<RestKey, Map<string, RestDescriptionGroup>> = {
    shortRest: new Map(),
    longRest: new Map()
  };

  restDescriptionRules.forEach((rule, index) => {
    const metadata = getRuleFeatureMetadata(character, rule);

    if (!metadata) {
      return;
    }

    const entries = rule.slices
      .map((slice) => extractDescriptionSlice(metadata.description, slice))
      .filter((entry): entry is SpellDescriptionEntry => Boolean(entry));

    if (entries.length === 0) {
      return;
    }

    rule.restKeys.forEach((restKey) =>
      addEntriesToRestGroup(groups[restKey], metadata, entries, index)
    );
  });

  return {
    shortRest: createRestDescriptionSections(groups.shortRest),
    longRest: createRestDescriptionSections(groups.longRest)
  };
}
