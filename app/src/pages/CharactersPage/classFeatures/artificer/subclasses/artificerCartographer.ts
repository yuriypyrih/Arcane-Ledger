import { CLASS_FEATURE, CURRENCY_TYPE } from "../../../../../codex/entries";
import type {
  Character,
  CharacterInventoryItem,
  CharacterItemMods
} from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  createCharacterInventoryItem,
  getInventoryItemConjuredSource,
  INVENTORY_CONJURED_DURATION_DEATH,
  INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS,
  INVENTORY_FEATURE_TAG_CONJURED
} from "../../../inventoryItems";
import { createCustomItemRecordFromMods } from "../../../itemMods";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";

export const cartographerSubclassId = "artificer-cartographer";
export const artificerAdventurersAtlasActionKey = "artificer-adventurers-atlas";

const adventurersAtlasName = "Adventurer's Atlas";
const adventurersAtlasBaseItemId = "custom-item-artificer-adventurers-atlas";
const adventurersAtlasMapDescription = [
  "Each target receives a magical map, which constantly updates to show the relative position of all the map holders but is illegible to all others.",
  "The maps last until you die or until you use this feature again, at which point any existing maps created by this feature immediately vanish.",
  "While carrying the map, a target gains the following benefits.",
  "<strong>Awareness.</strong> The target adds <strong>1d4</strong> to its <link:Initiative>Initiative</link> rolls.",
  "<strong>Positioning.</strong> The target knows the location of all other map holders that are on the same plane of existence as itself. When casting a spell or creating another effect that requires being able to see the effect's target, a map holder can target another map holder regardless of sight or cover, so long as the other map holder is still within the effect's range."
];

const cartographerSpellIdsByLevel = {
  3: ["spell-faerie-fire", "spell-guiding-bolt", "spell-healing-word"],
  5: ["spell-locate-object", "spell-mind-spike"],
  9: ["spell-call-lightning", "spell-clairvoyance"],
  13: ["spell-banishment", "spell-locate-creature"],
  17: ["spell-scrying", "spell-teleportation-circle"]
} as const;

type ArtificerAdventurersAtlasCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "inventoryItems" | "level" | "statusEntries" | "subclassId">>;

type AdventurersAtlasInventoryEntry = Pick<
  CharacterInventoryItem,
  "conjuredSource" | "featureTags"
>;

const adventurersAtlasItemMods: CharacterItemMods = {
  baseCategory: "general",
  isMagicItem: true,
  name: adventurersAtlasName,
  description: adventurersAtlasMapDescription.join("\n\n"),
  cost: {
    amount: 0,
    currency: CURRENCY_TYPE.GP
  },
  weight: 0,
  effects: [
    {
      type: "initiative",
      value: "1d4"
    }
  ]
};

const adventurersAtlasItem = createCustomItemRecordFromMods(
  adventurersAtlasBaseItemId,
  adventurersAtlasItemMods
);

function isArtificerAdventurersAtlasInventoryEntry(
  entry: AdventurersAtlasInventoryEntry
): boolean {
  return getInventoryItemConjuredSource(entry) === INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS;
}

function removeArtificerAdventurersAtlasInventoryItems(
  inventoryItems: CharacterInventoryItem[]
): CharacterInventoryItem[] {
  let didRemoveAtlasItem = false;
  const nextInventoryItems = inventoryItems.flatMap((entry) => {
    if (isArtificerAdventurersAtlasInventoryEntry(entry)) {
      didRemoveAtlasItem = true;
      return [];
    }

    if (!entry.containerContents?.length) {
      return [entry];
    }

    const containerContents = entry.containerContents.filter(
      (content) => !isArtificerAdventurersAtlasInventoryEntry(content)
    );

    if (containerContents.length === entry.containerContents.length) {
      return [entry];
    }

    didRemoveAtlasItem = true;
    return [
      {
        ...entry,
        containerContents
      }
    ];
  });

  return didRemoveAtlasItem ? nextInventoryItems : inventoryItems;
}

function createArtificerAdventurersAtlasInventoryItem(): CharacterInventoryItem {
  return createCharacterInventoryItem(adventurersAtlasItem, {
    quantity: 1,
    featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
    conjuredSource: INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS,
    conjuredDuration: INVENTORY_CONJURED_DURATION_DEATH,
    mods: adventurersAtlasItemMods
  });
}

export function hasArtificerAdventurersAtlasFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, cartographerSubclassId, 3);
}

export function getArtificerAdventurersAtlasMapCount(
  character: ArtificerAdventurersAtlasCharacter
): number {
  const intelligenceModifier = getAbilityModifierForCharacter(
    {
      abilities: character.abilities,
      statusEntries: character.statusEntries
    },
    "INT"
  );

  return hasArtificerAdventurersAtlasFeature(character)
    ? 1 + Math.max(1, intelligenceModifier)
    : 0;
}

export function getArtificerAdventurersAtlasAction(
  character: ArtificerAdventurersAtlasCharacter
): FeatureActionCard | null {
  if (!hasArtificerAdventurersAtlasFeature(character)) {
    return null;
  }

  const mapCount = getArtificerAdventurersAtlasMapCount(character);

  return {
    key: artificerAdventurersAtlasActionKey,
    name: adventurersAtlasName,
    sourceFeature: CLASS_FEATURE.ADVENTURERS_ATLAS,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: `Create ${mapCount} magical maps.`,
    detail: "Replace existing Atlas maps with magical maps for the chosen holders.",
    breakdown: "Create magical maps",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC
  };
}

export function createArtificerAdventurersAtlasMapsForCharacter(
  character: Character
): Character {
  if (!hasArtificerAdventurersAtlasFeature(character)) {
    return character;
  }

  const mapCount = getArtificerAdventurersAtlasMapCount(character);

  if (mapCount <= 0) {
    return character;
  }

  return {
    ...character,
    inventoryItems: [
      ...removeArtificerAdventurersAtlasInventoryItems(character.inventoryItems ?? []),
      ...Array.from({ length: mapCount }, createArtificerAdventurersAtlasInventoryItem)
    ]
  };
}

export const getArtificerCartographerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, cartographerSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          cartographerSpellIdsByLevel
        ),
        featureActions: [getArtificerAdventurersAtlasAction(character)].filter(
          (action): action is FeatureActionCard => Boolean(action)
        ),
        toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character)
      }
    : {};
