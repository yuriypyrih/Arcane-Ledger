import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character, CharacterItemMods } from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  createCharacterInventoryItem,
  INVENTORY_CONJURED_DURATION_LONG_REST,
  INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR,
  INVENTORY_FEATURE_TAG_CONJURED
} from "../../../inventoryItems";
import { createCustomItemRecordFromMods } from "../../../itemMods";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artificerExperimentalElixirActionKey = "artificer-experimental-elixir";

const alchemistSubclassId = "artificer-alchemist";
const experimentalElixirName = "Experimental Elixir";

export type ArtificerExperimentalElixirOptionKey =
  | "healing"
  | "swiftness"
  | "resilience"
  | "boldness"
  | "flight";

export type ArtificerExperimentalElixirOption = {
  key: ArtificerExperimentalElixirOptionKey;
  name: string;
  description: string;
};

export type ArtificerExperimentalElixirSpellSlotOption = {
  level: number;
  remaining: number;
  total: number;
};

type ExperimentalElixirOptionDefinition = {
  key: ArtificerExperimentalElixirOptionKey;
  name: string;
  getDescription: (level: number) => string;
};

const experimentalElixirOptionDefinitions: ExperimentalElixirOptionDefinition[] = [
  {
    key: "healing",
    name: "Healing",
    getDescription: (level) =>
      `Healing. The drinker regains ${getHealingDice(level)} plus your Intelligence modifier Hit Points.`
  },
  {
    key: "swiftness",
    name: "Swiftness",
    getDescription: (level) =>
      `Swiftness. The drinker's Speed increases by ${getSwiftnessBonus(level)} for 1 hour.`
  },
  {
    key: "resilience",
    name: "Resilience",
    getDescription: (level) =>
      `Resilience. The drinker gains a +1 bonus to AC for ${getResilienceDuration(level)}.`
  },
  {
    key: "boldness",
    name: "Boldness",
    getDescription: (level) =>
      `Boldness. The drinker can roll 1d4 and add the number rolled to every attack roll and saving throw they make for ${getBoldnessDuration(level)}.`
  },
  {
    key: "flight",
    name: "Flight",
    getDescription: (level) =>
      `Flight. The drinker gains a Fly Speed of ${getFlightSpeed(level)} for 10 minutes.`
  }
];

function getHealingDice(level: number): string {
  if (level >= 15) {
    return "4d8";
  }

  return level >= 9 ? "3d8" : "2d8";
}

function getSwiftnessBonus(level: number): string {
  if (level >= 15) {
    return "20 feet";
  }

  return level >= 9 ? "15 feet" : "10 feet";
}

function getResilienceDuration(level: number): string {
  if (level >= 15) {
    return "8 hours";
  }

  return level >= 9 ? "1 hour" : "10 minutes";
}

function getBoldnessDuration(level: number): string {
  if (level >= 15) {
    return "1 hour";
  }

  return level >= 9 ? "10 minutes" : "1 minute";
}

function getFlightSpeed(level: number): string {
  if (level >= 15) {
    return "30 feet";
  }

  return level >= 9 ? "20 feet" : "10 feet";
}

function getSpellSlotState(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "customClass" | "level" | "spellSlotsExpended" | "subclassId">>
) {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId,
    character.customClass
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );

  return {
    spellSlotTotals,
    spellSlotsExpended,
    spellSlotsRemaining
  };
}

function expendExperimentalElixirSpellSlot(
  character: Character,
  spellSlotLevel: number
): Character {
  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const { spellSlotTotals, spellSlotsExpended, spellSlotsRemaining } = getSpellSlotState(character);
  const slotIndex = normalizedSpellSlotLevel - 1;

  if ((spellSlotTotals[slotIndex] ?? 0) <= 0 || (spellSlotsRemaining[slotIndex] ?? 0) <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[slotIndex] = (nextSpellSlotsExpended[slotIndex] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function hasArtificerExperimentalElixirFeature(
  character: SubclassRuntimeCharacter
): boolean {
  return hasArtificerSubclassFeature(character, alchemistSubclassId, 3);
}

export function getArtificerExperimentalElixirOptionsForCharacter(
  character: SubclassRuntimeCharacter
): ArtificerExperimentalElixirOption[] {
  if (!hasArtificerExperimentalElixirFeature(character)) {
    return [];
  }

  const level = character.level ?? 0;

  return experimentalElixirOptionDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    description: definition.getDescription(level)
  }));
}

export function getArtificerExperimentalElixirSpellSlotOptions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "customClass" | "level" | "spellSlotsExpended" | "subclassId">>
): ArtificerExperimentalElixirSpellSlotOption[] {
  const { spellSlotTotals, spellSlotsRemaining } = getSpellSlotState(character);

  return spellSlotTotals.flatMap((total, index) => {
    const remaining = spellSlotsRemaining[index] ?? 0;

    return total > 0 && remaining > 0
      ? [
          {
            level: index + 1,
            remaining,
            total
          }
        ]
      : [];
  });
}

export function getArtificerExperimentalElixirAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  if (!hasArtificerExperimentalElixirFeature(character)) {
    return null;
  }

  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.EXPERIMENTAL_ELIXIR
  );

  return {
    key: artificerExperimentalElixirActionKey,
    name: experimentalElixirName,
    sourceFeature: CLASS_FEATURE.EXPERIMENTAL_ELIXIR,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Create a chosen magical elixir.",
    detail: "Choose an elixir effect and add the vial to your inventory.",
    breakdown: "Create elixir vial",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    description,
    drawer: {
      kind: "custom-form",
      description,
      formKind: "artificer-experimental-elixir"
    },
    execute: {
      kind: "custom-form",
      formKind: "artificer-experimental-elixir"
    }
  };
}

function createExperimentalElixirInventoryItem(option: ArtificerExperimentalElixirOption) {
  const mods: CharacterItemMods = {
    baseCategory: "general",
    isCustom: true,
    isMagicItem: true,
    name: `Artificer's Elixir of ${option.name}`,
    description: option.description,
    weight: null
  };
  const item = createCustomItemRecordFromMods(
    `custom-item-artificer-experimental-elixir-${option.key}`,
    mods
  );

  return createCharacterInventoryItem(item, {
    quantity: 1,
    featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
    conjuredSource: INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR,
    conjuredDuration: INVENTORY_CONJURED_DURATION_LONG_REST,
    mods
  });
}

export function addArtificerExperimentalElixirToInventory(
  character: Character,
  optionKey: ArtificerExperimentalElixirOptionKey,
  spellSlotLevel: number | null
): Character {
  if (!hasArtificerExperimentalElixirFeature(character)) {
    return character;
  }

  const option = getArtificerExperimentalElixirOptionsForCharacter(character).find(
    (currentOption) => currentOption.key === optionKey
  );

  if (!option) {
    return character;
  }

  const characterWithSpellSlot =
    spellSlotLevel === null
      ? character
      : expendExperimentalElixirSpellSlot(character, spellSlotLevel);

  if (spellSlotLevel !== null && characterWithSpellSlot === character) {
    return character;
  }

  return {
    ...characterWithSpellSlot,
    inventoryItems: [
      ...(characterWithSpellSlot.inventoryItems ?? []),
      createExperimentalElixirInventoryItem(option)
    ]
  };
}
