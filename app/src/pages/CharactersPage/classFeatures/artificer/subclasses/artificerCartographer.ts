import {
  CLASS_FEATURE,
  CURRENCY_TYPE,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import type {
  Character,
  CharacterArtificerFeatureState,
  CharacterInventoryItem,
  CharacterItemMods
} from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  getFeatureDescriptionAdditions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureDescriptionContribution,
  type FeatureDescriptionContributionTarget,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import {
  createCharacterInventoryItem,
  getInventoryContainerContents,
  getInventoryItemQuantity,
  getInventoryItemConjuredSource,
  INVENTORY_CONJURED_DURATION_DEATH,
  INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS,
  INVENTORY_FEATURE_TAG_CONJURED,
  removeOneContainerContentItemByIndex,
  removeOneInventoryItemCopyById
} from "../../../inventoryItems";
import { createCustomItemRecordFromMods } from "../../../itemMods";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";

export const cartographerSubclassId = "artificer-cartographer";
export const artificerAdventurersAtlasActionKey = "artificer-adventurers-atlas";
export const artificerIlluminatedCartographyActionKey =
  "artificer-illuminated-cartography";
export const artificerUnerringPathActionKey = "artificer-unerring-path";
export const artificerCartographerLifeAndDeathLedgerDescriptionTargetKey =
  "artificer-cartographer-life-and-death-ledger";
export const artificerCartographerFlashOfGeniusDescriptionTargetKey =
  "artificer-cartographer-flash-of-genius";
export const artificerCartographerSpeedDescriptionTargetKey = "speed";

const adventurersAtlasName = "Adventurer's Atlas";
const adventurersAtlasBaseItemId = "custom-item-artificer-adventurers-atlas";
const illuminatedCartographyName = "Illuminated Cartography";
const unerringPathName = "Unerring Path";
const faerieFireSpellId = "spell-faerie-fire";
const findThePathSpellId = "spell-find-the-path";
const illuminatedCartographyHeading = "<strong>Illuminated Cartography.</strong>";
const portalJumpHeading = "<strong>Portal Jump.</strong>";
const safeHavenHeading = "<strong>Safe Haven.</strong>";
const unerringPathHeading = "<strong>Unerring Path.</strong>";
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
  Partial<
    Pick<Character, "abilities" | "inventoryItems" | "level" | "statusEntries" | "subclassId">
  >;

type ArtificerMappingMagicCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "level" | "statusEntries" | "subclassId"
    >
  >;

type ArtificerSuperiorAtlasCharacter = Pick<Character, "className"> &
  Partial<
    Pick<Character, "classFeatureState" | "inventoryItems" | "level" | "subclassId">
  >;

type AdventurersAtlasInventoryEntry = Pick<
  CharacterInventoryItem,
  "conjuredSource" | "featureTags"
>;

const adventurersAtlasBaseItemMods: CharacterItemMods = {
  baseCategory: "general",
  isMagicItem: true,
  name: adventurersAtlasName,
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

function isArtificerAdventurersAtlasInventoryEntry(
  entry: AdventurersAtlasInventoryEntry
): boolean {
  return getInventoryItemConjuredSource(entry) === INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS;
}

function formatDescriptionEntriesForInventoryItem(
  entries: SpellDescriptionEntry[]
): string[] {
  return entries.flatMap((entry) => (typeof entry === "string" ? [entry] : entry.items));
}

function getArtificerAdventurersAtlasMapDescription(
  character: ArtificerSuperiorAtlasCharacter
): string {
  const description = [...adventurersAtlasMapDescription];
  const safeHavenDescription = getSafeHavenDescriptionSection(character);

  if (safeHavenDescription.length > 0) {
    description.push(...formatDescriptionEntriesForInventoryItem(safeHavenDescription));
  }

  return description.join("\n\n");
}

function getArtificerAdventurersAtlasItemMods(
  character: ArtificerSuperiorAtlasCharacter
): CharacterItemMods {
  return {
    ...adventurersAtlasBaseItemMods,
    description: getArtificerAdventurersAtlasMapDescription(character)
  };
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

export function getArtificerAdventurersAtlasInventoryMapCount(
  character: Partial<Pick<Character, "inventoryItems">>
): number {
  return (character.inventoryItems ?? []).reduce((total, entry) => {
    const entryCount = isArtificerAdventurersAtlasInventoryEntry(entry)
      ? getInventoryItemQuantity(entry)
      : 0;
    const containerCount = getInventoryContainerContents(entry).reduce(
      (contentTotal, content) =>
        isArtificerAdventurersAtlasInventoryEntry(content)
          ? contentTotal + getInventoryItemQuantity(content as CharacterInventoryItem)
          : contentTotal,
      0
    );

    return total + entryCount + containerCount;
  }, 0);
}

export function consumeArtificerAdventurersAtlasMapForCharacter(
  character: Character
): Character {
  const inventoryItems = character.inventoryItems ?? [];
  const inventoryMap = inventoryItems.find((entry) =>
    isArtificerAdventurersAtlasInventoryEntry(entry)
  );

  if (inventoryMap) {
    return {
      ...character,
      inventoryItems: removeOneInventoryItemCopyById(inventoryItems, inventoryMap.id)
    };
  }

  for (const entry of inventoryItems) {
    const contentIndex = getInventoryContainerContents(entry).findIndex((content) =>
      isArtificerAdventurersAtlasInventoryEntry(content)
    );

    if (contentIndex >= 0) {
      return {
        ...character,
        inventoryItems: removeOneContainerContentItemByIndex(
          inventoryItems,
          entry.id,
          contentIndex
        )
      };
    }
  }

  return character;
}

function createArtificerAdventurersAtlasInventoryItem(
  character: ArtificerSuperiorAtlasCharacter
): CharacterInventoryItem {
  const mods = getArtificerAdventurersAtlasItemMods(character);
  const item = createCustomItemRecordFromMods(adventurersAtlasBaseItemId, mods);

  return createCharacterInventoryItem(item, {
    quantity: 1,
    featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
    conjuredSource: INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS,
    conjuredDuration: INVENTORY_CONJURED_DURATION_DEATH,
    mods
  });
}

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

function descriptionEntryIncludesText(entry: SpellDescriptionEntry, text: string): boolean {
  return typeof entry === "string"
    ? entry.includes(text)
    : entry.items.some((item) => item.includes(text));
}

function getMappingMagicDescriptionSection(
  character: ArtificerMappingMagicCharacter,
  heading: string
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.MAPPING_MAGIC).filter(
    (entry) => descriptionEntryIncludesText(entry, heading)
  );
}

function getSuperiorAtlasDescriptionSection(
  character: ArtificerSuperiorAtlasCharacter,
  heading: string
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.SUPERIOR_ATLAS).filter(
    (entry) => descriptionEntryIncludesText(entry, heading)
  );
}

function getSafeHavenDescriptionSection(
  character: ArtificerSuperiorAtlasCharacter
): SpellDescriptionEntry[] {
  return hasArtificerSuperiorAtlasFeature(character)
    ? getSuperiorAtlasDescriptionSection(character, safeHavenHeading)
    : [];
}

export function hasArtificerAdventurersAtlasFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, cartographerSubclassId, 3);
}

export function hasArtificerMappingMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, cartographerSubclassId, 3);
}

export function hasArtificerGuidedPrecisionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, cartographerSubclassId, 5);
}

export function hasArtificerIngeniousMovementFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, cartographerSubclassId, 9);
}

export function hasArtificerSuperiorAtlasFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, cartographerSubclassId, 15);
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
  const safeHavenDescriptionAdditions =
    getArtificerCartographerSafeHavenDescriptionAdditionsDirect(character);

  return {
    key: artificerAdventurersAtlasActionKey,
    name: adventurersAtlasName,
    sourceFeature: CLASS_FEATURE.ADVENTURERS_ATLAS,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: `Create ${mapCount} magical maps.`,
    detail: "Replace existing Atlas maps with magical maps for the chosen holders.",
    breakdown: "Create magical maps",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    descriptionAdditions: safeHavenDescriptionAdditions
  };
}

export function getArtificerIlluminatedCartographyUsesTotal(
  character: ArtificerMappingMagicCharacter
): number {
  const intelligenceModifier = getAbilityModifierForCharacter(
    {
      abilities: character.abilities,
      statusEntries: character.statusEntries
    },
    "INT"
  );

  return hasArtificerMappingMagicFeature(character)
    ? Math.max(1, intelligenceModifier)
    : 0;
}

export function normalizeArtificerIlluminatedCartographyState(
  value: unknown,
  character: ArtificerMappingMagicCharacter
): Pick<CharacterArtificerFeatureState, "illuminatedCartographyUsesExpended"> {
  if (!hasArtificerMappingMagicFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const usesTotal = getArtificerIlluminatedCartographyUsesTotal(character);

  return {
    illuminatedCartographyUsesExpended: normalizeUsesExpended(
      record.illuminatedCartographyUsesExpended,
      usesTotal
    )
  };
}

export function getArtificerIlluminatedCartographyUsesRemaining(
  character: ArtificerMappingMagicCharacter
): number {
  const usesTotal = getArtificerIlluminatedCartographyUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.illuminatedCartographyUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function getArtificerIlluminatedCartographyAction(
  character: ArtificerMappingMagicCharacter
): FeatureActionCard | null {
  if (!hasArtificerMappingMagicFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerIlluminatedCartographyUsesTotal(character);
  const usesRemaining = getArtificerIlluminatedCartographyUsesRemaining(character);
  const description = getMappingMagicDescriptionSection(character, illuminatedCartographyHeading);

  return {
    key: artificerIlluminatedCartographyActionKey,
    name: illuminatedCartographyName,
    sourceFeature: CLASS_FEATURE.MAPPING_MAGIC,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Cast Faerie Fire without a spell slot.",
    detail: "Open Faerie Fire and cast it using an Illuminated Cartography charge.",
    breakdown: "Free Faerie Fire",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    description,
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Open Faerie Fire"
    },
    execute: {
      kind: "spell",
      spellSource: "fixed",
      effectKind: "illuminated-cartography",
      spellId: faerieFireSpellId,
      spellLevel: 1,
      label: "Open Faerie Fire",
      actionContextText: "Using Illuminated Cartography",
      actionAvailabilityText: "Cast without expending a spell slot.",
      actionConsumesSpellSlot: false
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0
        ? "Illuminated Cartography recharges when you finish a Long Rest."
        : undefined
  };
}

export function getArtificerUnerringPathUsesTotal(
  character: ArtificerSuperiorAtlasCharacter
): number {
  return hasArtificerSuperiorAtlasFeature(character) ? 1 : 0;
}

export function normalizeArtificerUnerringPathState(
  value: unknown,
  character: ArtificerSuperiorAtlasCharacter
): Pick<CharacterArtificerFeatureState, "unerringPathUsesExpended"> {
  if (!hasArtificerSuperiorAtlasFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const usesTotal = getArtificerUnerringPathUsesTotal(character);

  return {
    unerringPathUsesExpended: normalizeUsesExpended(record.unerringPathUsesExpended, usesTotal)
  };
}

export function getArtificerUnerringPathUsesRemaining(
  character: ArtificerSuperiorAtlasCharacter
): number {
  const usesTotal = getArtificerUnerringPathUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.unerringPathUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function getArtificerUnerringPathAction(
  character: ArtificerSuperiorAtlasCharacter
): FeatureActionCard | null {
  if (!hasArtificerSuperiorAtlasFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerUnerringPathUsesTotal(character);
  const usesRemaining = getArtificerUnerringPathUsesRemaining(character);
  const description = getSuperiorAtlasDescriptionSection(character, unerringPathHeading);

  return {
    key: artificerUnerringPathActionKey,
    name: unerringPathName,
    sourceFeature: CLASS_FEATURE.SUPERIOR_ATLAS,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Cast Find the Path without a spell slot.",
    detail: "Open Find the Path and cast it using Superior Atlas.",
    breakdown: "Free Find the Path",
    economyType: ECONOMY_TYPE.NON_COMBAT,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    description,
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Open Find the Path"
    },
    execute: {
      kind: "spell",
      spellSource: "fixed",
      effectKind: "unerring-path",
      spellId: findThePathSpellId,
      spellLevel: 6,
      label: "Open Find the Path",
      actionContextText: "Using Unerring Path",
      actionAvailabilityText: "Cast without expending a spell slot or spell components.",
      actionConsumesSpellSlot: false
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0 ? "Unerring Path recharges when you finish a Long Rest." : undefined
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
      ...Array.from({ length: mapCount }, () =>
        createArtificerAdventurersAtlasInventoryItem(character)
      )
    ]
  };
}

export function consumeArtificerIlluminatedCartographyUse(character: Character): Character {
  const usesTotal = getArtificerIlluminatedCartographyUsesTotal(character);
  const usesRemaining = getArtificerIlluminatedCartographyUsesRemaining(character);

  if (usesTotal <= 0 || usesRemaining <= 0) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const illuminatedCartographyState = normalizeArtificerIlluminatedCartographyState(
    currentArtificerState,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...illuminatedCartographyState,
        illuminatedCartographyUsesExpended:
          (illuminatedCartographyState.illuminatedCartographyUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreArtificerIlluminatedCartographyOnLongRest(character: Character): Character {
  if (!hasArtificerMappingMagicFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const illuminatedCartographyState = normalizeArtificerIlluminatedCartographyState(
    currentArtificerState,
    character
  );

  if ((illuminatedCartographyState.illuminatedCartographyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...illuminatedCartographyState,
        illuminatedCartographyUsesExpended: 0
      }
    }
  };
}

export function consumeArtificerUnerringPathUse(character: Character): Character {
  const usesTotal = getArtificerUnerringPathUsesTotal(character);
  const usesRemaining = getArtificerUnerringPathUsesRemaining(character);

  if (usesTotal <= 0 || usesRemaining <= 0) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const unerringPathState = normalizeArtificerUnerringPathState(currentArtificerState, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...unerringPathState,
        unerringPathUsesExpended: (unerringPathState.unerringPathUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreArtificerUnerringPathOnLongRest(character: Character): Character {
  if (!hasArtificerSuperiorAtlasFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const unerringPathState = normalizeArtificerUnerringPathState(currentArtificerState, character);

  if ((unerringPathState.unerringPathUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...unerringPathState,
        unerringPathUsesExpended: 0
      }
    }
  };
}

function getArtificerCartographerSafeHavenDescriptionAdditionsDirect(
  character: ArtificerSuperiorAtlasCharacter
): SpellDescriptionEntry[][] {
  const safeHavenDescription = getSafeHavenDescriptionSection(character);

  return safeHavenDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.SUPERIOR_ATLAS,
          safeHavenDescription,
          "Safe Haven"
        )
      ]
    : [];
}

function getArtificerCartographerPortalJumpSpeedDescriptionAdditionsDirect(
  character: ArtificerMappingMagicCharacter
): SpellDescriptionEntry[][] {
  if (!hasArtificerMappingMagicFeature(character)) {
    return [];
  }

  const portalJumpDescription = getMappingMagicDescriptionSection(character, portalJumpHeading);

  return portalJumpDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.MAPPING_MAGIC,
          portalJumpDescription,
          "Mapping Magic"
        )
      ]
    : [];
}

function getArtificerCartographerIngeniousMovementFlashOfGeniusDescriptionAdditionsDirect(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[][] {
  if (!hasArtificerIngeniousMovementFeature(character)) {
    return [];
  }

  const ingeniousMovementDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.INGENIOUS_MOVEMENT
  );

  return ingeniousMovementDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.INGENIOUS_MOVEMENT,
          ingeniousMovementDescription,
          "Ingenious Movement"
        )
      ]
    : [];
}

function compactDescriptionAdditions(
  additions: Array<FeatureDescriptionContribution | null>
): FeatureDescriptionContribution[] {
  return additions.filter(
    (addition): addition is FeatureDescriptionContribution => addition !== null
  );
}

export function getArtificerCartographerFeatureDescriptionAdditions(
  character: Parameters<SubclassRuntimeResolver>[0],
  target: FeatureDescriptionContributionTarget,
  targetKey?: string
): SpellDescriptionEntry[][] {
  return getFeatureDescriptionAdditions(
    compileFeatureContributions(collectArtificerCartographerContributions(character)),
    target,
    {
      character: character as Character,
      targetKey
    }
  );
}

export function getArtificerCartographerSafeHavenDescriptionAdditions(
  character: ArtificerSuperiorAtlasCharacter
): SpellDescriptionEntry[][] {
  return getArtificerCartographerFeatureDescriptionAdditions(
    character as Parameters<SubclassRuntimeResolver>[0],
    "custom",
    artificerCartographerLifeAndDeathLedgerDescriptionTargetKey
  );
}

export function getArtificerCartographerPortalJumpSpeedDescriptionAdditions(
  character: ArtificerMappingMagicCharacter
): SpellDescriptionEntry[][] {
  return getArtificerCartographerFeatureDescriptionAdditions(
    character as Parameters<SubclassRuntimeResolver>[0],
    "stat",
    artificerCartographerSpeedDescriptionTargetKey
  );
}

export function transformArtificerCartographerGuidedPrecisionSpellEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (!hasArtificerGuidedPrecisionFeature(character) || spell.id !== faerieFireSpellId) {
    return spell;
  }

  const guidedPrecisionDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.GUIDED_PRECISION
  );

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.GUIDED_PRECISION,
    guidedPrecisionDescription,
    "Guided Precision"
  );
}

export function getArtificerCartographerIngeniousMovementFlashOfGeniusDescriptionAdditions(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[][] {
  return getArtificerCartographerFeatureDescriptionAdditions(
    character as Parameters<SubclassRuntimeResolver>[0],
    "custom",
    artificerCartographerFlashOfGeniusDescriptionTargetKey
  );
}

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

export function collectArtificerCartographerContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasArtificerSubclassFeature(character, cartographerSubclassId, 3)) {
    return [];
  }

  return [
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-tools-of-the-trade`,
        label: "Tools of the Trade",
        entryId: CLASS_FEATURE.TOOLS_OF_THE_TRADE
      }),
      toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-cartographer-spells`,
        label: "Cartographer Spells",
        entryId: CLASS_FEATURE.CARTOGRAPHER_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        cartographerSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-adventurers-atlas`,
        label: "Adventurer's Atlas",
        entryId: CLASS_FEATURE.ADVENTURERS_ATLAS
      }),
      actions: compactActions([getArtificerAdventurersAtlasAction(character)])
    },
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-mapping-magic`,
        label: "Mapping Magic",
        entryId: CLASS_FEATURE.MAPPING_MAGIC
      }),
      actions: compactActions([getArtificerIlluminatedCartographyAction(character)]),
      descriptionAdditions: compactDescriptionAdditions([
        {
          id: "artificer-cartographer-portal-jump-speed-description",
          target: "stat",
          targetKey: artificerCartographerSpeedDescriptionTargetKey,
          getDescriptionAdditions: () =>
            getArtificerCartographerPortalJumpSpeedDescriptionAdditionsDirect(character)
        }
      ])
    },
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-guided-precision`,
        label: "Guided Precision",
        entryId: CLASS_FEATURE.GUIDED_PRECISION
      }),
      spellTransforms: [
        {
          id: "artificer-cartographer-guided-precision-spell-transform",
          transform: (spell) =>
            transformArtificerCartographerGuidedPrecisionSpellEntry(character, spell)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-ingenious-movement`,
        label: "Ingenious Movement",
        entryId: CLASS_FEATURE.INGENIOUS_MOVEMENT
      }),
      descriptionAdditions: compactDescriptionAdditions([
        {
          id: "artificer-cartographer-ingenious-movement-flash-of-genius-description",
          target: "custom",
          targetKey: artificerCartographerFlashOfGeniusDescriptionTargetKey,
          getDescriptionAdditions: () =>
            getArtificerCartographerIngeniousMovementFlashOfGeniusDescriptionAdditionsDirect(
              character
            )
        }
      ])
    },
    {
      source: createSubclassContributionSource({
        id: `${cartographerSubclassId}-superior-atlas`,
        label: "Superior Atlas",
        entryId: CLASS_FEATURE.SUPERIOR_ATLAS
      }),
      actions: compactActions([getArtificerUnerringPathAction(character)]),
      descriptionAdditions: compactDescriptionAdditions([
        {
          id: "artificer-cartographer-safe-haven-life-and-death-description",
          target: "custom",
          targetKey: artificerCartographerLifeAndDeathLedgerDescriptionTargetKey,
          getDescriptionAdditions: () =>
            getArtificerCartographerSafeHavenDescriptionAdditionsDirect(character)
        }
      ])
    }
  ];
}

export const getArtificerCartographerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectArtificerCartographerContributions(character)),
    {
      character: character as Character
    }
  );
