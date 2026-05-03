import { CLASS_FEATURE, FEATS } from "../../../codex/entries";
import type {
  BlessedWarriorChoice,
  CharacterFeatEntry,
  CrafterChoice,
  DruidicWarriorChoice,
  LuckyChoice,
  MagicInitiateChoice,
  MusicianChoice
} from "../../../types";
import type {
  AbilityScoreImprovementChoice,
  BoonOfIrresistibleOffenseChoice,
  CharacterFeatSource,
  EpicBoonAbilityChoice,
  SkilledChoice
} from "../../../types/feats";
import { formatCodexLabel } from "../../../utils/codex";
import {
  epicBoonAbilityIncreaseFeatOptions,
  normalizeAbilityScoreImprovementChoice,
  normalizeBlessedWarriorChoice,
  normalizeBoonOfIrresistibleOffenseChoice,
  normalizeDruidicWarriorChoice,
  normalizeEpicBoonAbilityChoice,
  normalizeLuckyChoice,
  normalizeMagicInitiateChoice,
  normalizeMusicianChoice,
  normalizeSkilledChoice
} from "./choices";
import { normalizeCrafterChoice } from "./crafter";
import { featDefinitions } from "./definitions";

const deprecatedSubclassPlaceholderFeatures = new Set<CLASS_FEATURE>([
  CLASS_FEATURE.ARTIFICER_SUBCLASS,
  CLASS_FEATURE.BARBARIAN_SUBCLASS,
  CLASS_FEATURE.BARD_SUBCLASS,
  CLASS_FEATURE.CLERIC_SUBCLASS,
  CLASS_FEATURE.DRUID_SUBCLASS,
  CLASS_FEATURE.FIGHTER_SUBCLASS,
  CLASS_FEATURE.MONK_SUBCLASS,
  CLASS_FEATURE.PALADIN_SUBCLASS,
  CLASS_FEATURE.RANGER_SUBCLASS,
  CLASS_FEATURE.ROGUE_SUBCLASS,
  CLASS_FEATURE.SORCERER_SUBCLASS,
  CLASS_FEATURE.WARLOCK_SUBCLASS,
  CLASS_FEATURE.WIZARD_SUBCLASS,
  CLASS_FEATURE.SUBCLASS_FEATURE
]);

const featValues = Object.values(FEATS);
const featValueSet = new Set<string>(featValues);

function normalizeFeatLookupKey(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/['’]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const featLookupByNormalizedKey = new Map<string, FEATS>();

featValues.forEach((feat) => {
  featLookupByNormalizedKey.set(normalizeFeatLookupKey(feat), feat);
});

featDefinitions.forEach((definition) => {
  featLookupByNormalizedKey.set(normalizeFeatLookupKey(definition.label), definition.feat);
});

function clampFeatLevel(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.min(20, Math.floor(parsed)));
}

function normalizeCharacterFeatSource(value: unknown, takenAtLevel: number): CharacterFeatSource {
  if (!value || typeof value !== "object") {
    return {
      type: "manual"
    };
  }

  const record = value as Partial<CharacterFeatSource>;

  if (record.type === "background") {
    return typeof record.background === "string" && record.background.trim().length > 0
      ? {
          type: "background",
          background: record.background.trim()
        }
      : {
          type: "manual"
        };
  }

  if (record.type === "class-feature") {
    if (typeof record.feature !== "string") {
      return {
        type: "manual"
      };
    }

    if (deprecatedSubclassPlaceholderFeatures.has(record.feature as CLASS_FEATURE)) {
      return {
        type: "manual"
      };
    }

    return {
      type: "class-feature",
      feature: record.feature as CLASS_FEATURE,
      level: clampFeatLevel(record.level, takenAtLevel)
    };
  }

  return {
    type: "manual"
  };
}

function createFeatEntryId(feat: FEATS): string {
  return `${feat}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolveFeatValue(value: unknown): FEATS | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (featValueSet.has(trimmedValue)) {
    return trimmedValue as FEATS;
  }

  return featLookupByNormalizedKey.get(normalizeFeatLookupKey(trimmedValue)) ?? null;
}

function getRawFeatEntries(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;

  if ("feat" in record || "featId" in record || "value" in record || "name" in record) {
    return [value];
  }

  return Object.entries(record).flatMap(([featKey, rawEntry]) => {
    if (rawEntry === false || rawEntry === null || rawEntry === undefined) {
      return [];
    }

    if (rawEntry === true) {
      return [featKey];
    }

    if (rawEntry && typeof rawEntry === "object" && !Array.isArray(rawEntry)) {
      return [
        {
          feat: featKey,
          ...(rawEntry as Record<string, unknown>)
        }
      ];
    }

    return [rawEntry];
  });
}

function getRawFeatValue(rawEntry: unknown): unknown {
  if (typeof rawEntry === "string") {
    return rawEntry;
  }

  if (!rawEntry || typeof rawEntry !== "object") {
    return null;
  }

  const record = rawEntry as Record<string, unknown>;

  return record.feat ?? record.featId ?? record.value ?? record.name ?? record.label;
}

export function normalizeCharacterFeats(
  value: unknown,
  currentLevel: number
): CharacterFeatEntry[] {
  const rawEntries = getRawFeatEntries(value);

  if (rawEntries.length === 0) {
    return [];
  }

  return rawEntries.flatMap((rawEntry, index): CharacterFeatEntry[] => {
    if (!rawEntry || typeof rawEntry !== "object") {
      const feat = resolveFeatValue(rawEntry);

      if (!feat) {
        return [];
      }

      return [
        {
          id: `${createFeatEntryId(feat)}-${index}`,
          feat,
          takenAtLevel: clampFeatLevel(undefined, currentLevel),
          source: {
            type: "manual"
          }
        }
      ];
    }

    const record = rawEntry as Partial<CharacterFeatEntry>;
    const feat = resolveFeatValue(getRawFeatValue(rawEntry));

    if (!feat) {
      return [];
    }

    const abilityScoreImprovement =
      feat === FEATS.ABILITY_SCORE_IMPROVEMENT
        ? normalizeAbilityScoreImprovementChoice(record.abilityScoreImprovement)
        : undefined;
    const boonOfIrresistibleOffense =
      feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE
        ? normalizeBoonOfIrresistibleOffenseChoice(record.boonOfIrresistibleOffense)
        : undefined;
    const blessedWarrior =
      feat === FEATS.BLESSED_WARRIOR
        ? normalizeBlessedWarriorChoice(record.blessedWarrior)
        : undefined;
    const druidicWarrior =
      feat === FEATS.DRUIDIC_WARRIOR
        ? normalizeDruidicWarriorChoice(record.druidicWarrior)
        : undefined;
    const magicInitiate =
      feat === FEATS.MAGIC_INITIATE
        ? normalizeMagicInitiateChoice(record.magicInitiate)
        : undefined;
    const crafter = feat === FEATS.CRAFTER ? normalizeCrafterChoice(record.crafter) : undefined;
    const epicBoonAbilityChoice = epicBoonAbilityIncreaseFeatOptions.has(feat)
      ? normalizeEpicBoonAbilityChoice(feat, record.epicBoonAbilityChoice)
      : undefined;
    const skilled = feat === FEATS.SKILLED ? normalizeSkilledChoice(record.skilled) : undefined;
    const musician = feat === FEATS.MUSICIAN ? normalizeMusicianChoice(record.musician) : undefined;
    const lucky =
      feat === FEATS.LUCKY ? normalizeLuckyChoice(record.lucky, currentLevel) : undefined;

    return [
      {
        id:
          typeof record.id === "string" && record.id.trim().length > 0
            ? record.id.trim()
            : `${createFeatEntryId(feat)}-${index}`,
        feat,
        takenAtLevel: clampFeatLevel(record.takenAtLevel, currentLevel),
        source: normalizeCharacterFeatSource(
          record.source,
          clampFeatLevel(record.takenAtLevel, currentLevel)
        ),
        abilityScoreImprovement,
        blessedWarrior,
        druidicWarrior,
        magicInitiate,
        crafter,
        boonOfIrresistibleOffense,
        epicBoonAbilityChoice,
        skilled,
        musician,
        lucky
      }
    ];
  });
}

export function createCharacterFeatEntry(
  feat: FEATS,
  takenAtLevel: number,
  options?: {
    source?: CharacterFeatSource;
    abilityScoreImprovement?: AbilityScoreImprovementChoice;
    blessedWarrior?: BlessedWarriorChoice;
    druidicWarrior?: DruidicWarriorChoice;
    magicInitiate?: MagicInitiateChoice;
    musician?: MusicianChoice;
    crafter?: CrafterChoice;
    boonOfIrresistibleOffense?: BoonOfIrresistibleOffenseChoice;
    epicBoonAbilityChoice?: EpicBoonAbilityChoice;
    skilled?: SkilledChoice;
    lucky?: LuckyChoice;
  }
): CharacterFeatEntry {
  return {
    id: createFeatEntryId(feat),
    feat,
    takenAtLevel: clampFeatLevel(takenAtLevel, takenAtLevel),
    source: options?.source ?? { type: "manual" },
    abilityScoreImprovement:
      feat === FEATS.ABILITY_SCORE_IMPROVEMENT ? options?.abilityScoreImprovement : undefined,
    blessedWarrior: feat === FEATS.BLESSED_WARRIOR ? options?.blessedWarrior : undefined,
    druidicWarrior: feat === FEATS.DRUIDIC_WARRIOR ? options?.druidicWarrior : undefined,
    magicInitiate: feat === FEATS.MAGIC_INITIATE ? options?.magicInitiate : undefined,
    musician: feat === FEATS.MUSICIAN ? options?.musician : undefined,
    crafter: feat === FEATS.CRAFTER ? options?.crafter : undefined,
    boonOfIrresistibleOffense:
      feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE ? options?.boonOfIrresistibleOffense : undefined,
    epicBoonAbilityChoice: epicBoonAbilityIncreaseFeatOptions.has(feat)
      ? options?.epicBoonAbilityChoice
      : undefined,
    skilled: feat === FEATS.SKILLED ? options?.skilled : undefined,
    lucky: feat === FEATS.LUCKY ? options?.lucky : undefined
  };
}

export function getCharacterFeatSourceLabel(entry: CharacterFeatEntry): string {
  if (entry.source.type === "manual") {
    return "MANUAL";
  }

  if (entry.source.type === "background") {
    return `Background: ${entry.source.background}`;
  }

  if (entry.source.feature === CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT) {
    return `Level ${entry.source.level}: ASI`;
  }

  return `Level ${entry.source.level}: ${formatCodexLabel(entry.source.feature)}`;
}

export function isFeatFromBackgroundSource(
  entry: CharacterFeatEntry,
  background?: string
): boolean {
  return (
    entry.source.type === "background" &&
    (background === undefined || entry.source.background === background)
  );
}

export function isFeatEntryRemovable(entry: CharacterFeatEntry): boolean {
  return !isFeatFromBackgroundSource(entry);
}
