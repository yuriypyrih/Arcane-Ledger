import {
  ARMOR_TYPES,
  type ArmorEntry
} from "../../codex/entries";
import { getArmorEntries } from "../../codex/selectors";
import type {
  AbilityKey,
  Character,
  CharacterCustomEquipment,
  CharacterEquipmentItem,
  CharacterInventoryItem
} from "../../types";
import { getAbilityScoreForCharacter } from "./abilities";
import {
  getArmorClassBonusesForCharacter,
  getArmorClassModesForCharacter,
  type FeatureArmorClassBonus,
  type FeatureArmorClassMode
} from "./classFeatures";
import { getFeatArmorClassBonusesForCharacter } from "./feats";
import {
  getItemArmorType,
  isItemBodyArmorRecord,
  isItemShieldRecord
} from "./inventoryItems";

export type BodyArmorType = "light" | "medium" | "heavy";

type BodyArmorCandidate = {
  key: string;
  name: string;
  armorBase: number;
  armorType: BodyArmorType;
  worn: boolean;
};

type BaseArmorClassMode = {
  key: string;
  label: string;
  detail?: string;
  baseValue: number;
  abilityModifiers: AbilityKey[];
  abilityModifierCaps?: Partial<Record<AbilityKey, number | null>>;
  shieldAllowed: boolean;
  armorType: BodyArmorType | "unarmored";
};

export type ArmorClassBreakdownEntry = {
  label: string;
  value: number;
};

export type ArmorClassBreakdown = {
  total: number;
  source: string;
  detail?: string;
  entries: ArmorClassBreakdownEntry[];
};

type NormalizeArmorWearStateOptions = {
  autoEquipLegacyArmor?: boolean;
};

const codexArmorEntriesByName = new Map<string, ArmorEntry>(
  getArmorEntries().map((entry) => [entry.name, entry])
);

export function isShieldArmorEntry(entry: Pick<ArmorEntry, "tags">): boolean {
  return entry.tags.includes(ARMOR_TYPES.SHIELD);
}

function getBodyArmorTypeFromTags(tags: ArmorEntry["tags"]): BodyArmorType | null {
  if (tags.includes(ARMOR_TYPES.LIGHT_ARMOR)) {
    return "light";
  }

  if (tags.includes(ARMOR_TYPES.MEDIUM_ARMOR)) {
    return "medium";
  }

  if (tags.includes(ARMOR_TYPES.HEAVY_ARMOR)) {
    return "heavy";
  }

  return null;
}

export function getArmorDexModifierCap(entry: Pick<ArmorEntry, "tags">): number | null {
  const armorType = getBodyArmorTypeFromTags(entry.tags);

  if (armorType === "heavy") {
    return 0;
  }

  if (armorType === "medium") {
    return 2;
  }

  return null;
}

function getCodexBodyArmorCandidate(item: CharacterEquipmentItem): BodyArmorCandidate | null {
  const armorEntry = codexArmorEntriesByName.get(item.name);

  if (!armorEntry || isShieldArmorEntry(armorEntry)) {
    return null;
  }

  const armorType = getBodyArmorTypeFromTags(armorEntry.tags);

  if (!armorType) {
    return null;
  }

  return {
    key: `codex:${item.name}`,
    name: item.name,
    armorBase: armorEntry.armorBase,
    armorType,
    worn: Boolean(item.worn)
  };
}

function getCustomBodyArmorCandidate(
  customEquipment: CharacterCustomEquipment
): BodyArmorCandidate | null {
  if (customEquipment.kind !== "armor" || customEquipment.armorType === "shield") {
    return null;
  }

  return {
    key: `custom:${customEquipment.id}`,
    name: customEquipment.name,
    armorBase: customEquipment.armorBase,
    armorType: customEquipment.armorType,
    worn: Boolean(customEquipment.worn)
  };
}

function getInventoryBodyArmorCandidate(
  inventoryItem: CharacterInventoryItem
): BodyArmorCandidate | null {
  if (!isItemBodyArmorRecord(inventoryItem.item)) {
    return null;
  }

  const armorType = getItemArmorType(inventoryItem.item);
  const armorBase = inventoryItem.item.armor?.ac_base;

  if (!armorType || typeof armorBase !== "number") {
    return null;
  }

  return {
    key: `inventory:${inventoryItem.id}`,
    name: inventoryItem.item.name ?? inventoryItem.item.key ?? "Armor",
    armorBase,
    armorType,
    worn: Boolean(inventoryItem.worn)
  };
}

function pickLegacyBodyArmorCandidate(candidates: BodyArmorCandidate[]): BodyArmorCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((left, right) => right.armorBase - left.armorBase)[0] ?? null;
}

function getBodyArmorCandidates(character: Character): BodyArmorCandidate[] {
  return [
    ...character.equipment
      .map((item) => getCodexBodyArmorCandidate(item))
      .filter((candidate): candidate is BodyArmorCandidate => candidate !== null),
    ...character.inventoryItems
      .map((item) => getInventoryBodyArmorCandidate(item))
      .filter((candidate): candidate is BodyArmorCandidate => candidate !== null),
    ...character.customEquipment
      .map((entry) => getCustomBodyArmorCandidate(entry))
      .filter((candidate): candidate is BodyArmorCandidate => candidate !== null)
  ];
}

export function getWornBodyArmorTypeForCharacter(character: Character): BodyArmorType | null {
  return getBodyArmorCandidates(character).find((candidate) => candidate.worn)?.armorType ?? null;
}

export function normalizeCharacterArmorWearState(
  equipment: CharacterEquipmentItem[],
  inventoryItems: CharacterInventoryItem[],
  customEquipment: CharacterCustomEquipment[],
  options?: NormalizeArmorWearStateOptions
): {
  equipment: CharacterEquipmentItem[];
  inventoryItems: CharacterInventoryItem[];
  customEquipment: CharacterCustomEquipment[];
} {
  const normalizedEquipment = equipment.map((item) => {
    const armorEntry = codexArmorEntriesByName.get(item.name);
    const isBodyArmor = armorEntry ? !isShieldArmorEntry(armorEntry) : false;

    return {
      ...item,
      worn: isBodyArmor ? Boolean(item.worn) : false
    };
  });
  const normalizedInventoryItems = inventoryItems.map((entry) =>
    isItemBodyArmorRecord(entry.item)
      ? {
          ...entry,
          worn: Boolean(entry.worn)
        }
      : {
          ...entry,
          worn: false
        }
  );
  const normalizedCustomEquipment = customEquipment.map((entry) =>
    entry.kind === "armor" && entry.armorType !== "shield"
      ? {
          ...entry,
          worn: Boolean(entry.worn)
        }
      : entry.kind === "armor"
        ? {
            ...entry,
            worn: false
          }
        : entry
  );
  const candidates = [
    ...normalizedEquipment
      .map((item) => getCodexBodyArmorCandidate(item))
      .filter((candidate): candidate is BodyArmorCandidate => candidate !== null),
    ...normalizedInventoryItems
      .map((entry) => getInventoryBodyArmorCandidate(entry))
      .filter((candidate): candidate is BodyArmorCandidate => candidate !== null),
    ...normalizedCustomEquipment
      .map((entry) => getCustomBodyArmorCandidate(entry))
      .filter((candidate): candidate is BodyArmorCandidate => candidate !== null)
  ];
  let selectedBodyArmorKey =
    candidates.find((candidate) => candidate.worn)?.key ?? null;

  if (options?.autoEquipLegacyArmor && !selectedBodyArmorKey) {
    selectedBodyArmorKey = pickLegacyBodyArmorCandidate(candidates)?.key ?? null;
  }

  return {
    equipment: normalizedEquipment.map((item) => ({
      ...item,
      worn: selectedBodyArmorKey === `codex:${item.name}`
    })),
    inventoryItems: normalizedInventoryItems.map((entry) => ({
      ...entry,
      worn: selectedBodyArmorKey === `inventory:${entry.id}`
    })),
    customEquipment: normalizedCustomEquipment.map((entry) =>
      entry.kind === "armor" && entry.armorType !== "shield"
        ? {
            ...entry,
            worn: selectedBodyArmorKey === `custom:${entry.id}`
          }
        : entry
    )
  };
}

function applyBodyArmorWearState(
  character: Character,
  target:
    | { kind: "codex"; name: string }
    | { kind: "inventory"; inventoryItemId: string }
    | { kind: "custom"; customEquipmentId: string },
  shouldWear: boolean
): Character {
  const isValidBodyArmorTarget =
    target.kind === "codex"
      ? (() => {
          const armorEntry = codexArmorEntriesByName.get(target.name);
          return Boolean(armorEntry && !isShieldArmorEntry(armorEntry));
        })()
      : target.kind === "inventory"
        ? character.inventoryItems.some(
            (entry) => entry.id === target.inventoryItemId && isItemBodyArmorRecord(entry.item)
          )
      : character.customEquipment.some(
          (entry) =>
            entry.kind === "armor" &&
            entry.id === target.customEquipmentId &&
            entry.armorType !== "shield"
        );

  if (!isValidBodyArmorTarget) {
    return character;
  }

  return {
    ...character,
    equipment: character.equipment.map((item) => ({
      ...item,
      worn: shouldWear && target.kind === "codex" ? item.name === target.name : false
    })),
    inventoryItems: character.inventoryItems.map((entry) => ({
      ...entry,
      worn: shouldWear && target.kind === "inventory" ? entry.id === target.inventoryItemId : false
    })),
    customEquipment: character.customEquipment.map((entry) =>
      entry.kind === "armor" && entry.armorType !== "shield"
        ? {
            ...entry,
            worn: shouldWear && target.kind === "custom" ? entry.id === target.customEquipmentId : false
          }
        : entry
    )
  };
}

export function setCodexArmorWornState(
  character: Character,
  itemName: string,
  shouldWear: boolean
): Character {
  return applyBodyArmorWearState(character, { kind: "codex", name: itemName }, shouldWear);
}

export function setCustomArmorWornState(
  character: Character,
  customEquipmentId: string,
  shouldWear: boolean
): Character {
  return applyBodyArmorWearState(character, { kind: "custom", customEquipmentId }, shouldWear);
}

export function setInventoryItemArmorWornState(
  character: Character,
  inventoryItemId: string,
  shouldWear: boolean
): Character {
  return applyBodyArmorWearState(character, { kind: "inventory", inventoryItemId }, shouldWear);
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function getHeldShieldBonus(character: Character): number {
  const codexShieldBonus = character.equipment.reduce((highestShieldBonus, item) => {
    if (!item.onHand) {
      return highestShieldBonus;
    }

    const armorEntry = codexArmorEntriesByName.get(item.name);

    if (!armorEntry || !isShieldArmorEntry(armorEntry)) {
      return highestShieldBonus;
    }

    return Math.max(highestShieldBonus, armorEntry.shieldBonus);
  }, 0);
  const inventoryShieldBonus = character.inventoryItems.reduce((highestShieldBonus, item) => {
    if (!item.onHand || !isItemShieldRecord(item.item)) {
      return highestShieldBonus;
    }

    return Math.max(highestShieldBonus, 2);
  }, 0);

  return Math.max(codexShieldBonus, inventoryShieldBonus);
}

function getBaseArmorClassModes(character: Character): BaseArmorClassMode[] {
  const wornBodyArmor = getBodyArmorCandidates(character).find((candidate) => candidate.worn) ?? null;
  const baseModes: BaseArmorClassMode[] = [
    {
      key: "base-unarmored",
      label: "Unarmored",
      baseValue: 10,
      abilityModifiers: ["DEX"],
      shieldAllowed: true,
      armorType: "unarmored"
    }
  ];

  if (!wornBodyArmor) {
    return baseModes;
  }

  return [
    {
      key: wornBodyArmor.key,
      label: wornBodyArmor.name,
      baseValue: wornBodyArmor.armorBase,
      abilityModifiers: ["DEX"],
      abilityModifierCaps: {
        DEX:
          wornBodyArmor.armorType === "heavy"
            ? 0
            : wornBodyArmor.armorType === "medium"
              ? 2
              : null
      },
      shieldAllowed: true,
      armorType: wornBodyArmor.armorType
    }
  ];
}

function getArmorClassModeValue(
  character: Character,
  mode: Pick<
    BaseArmorClassMode | FeatureArmorClassMode,
    "baseValue" | "abilityModifiers" | "abilityModifierCaps" | "shieldAllowed"
  >,
  shieldBonus: number,
  featureBonuses: FeatureArmorClassBonus[]
): number {
  const abilityTotal = mode.abilityModifiers.reduce(
    (total, ability) => {
      const modifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
      const cap = mode.abilityModifierCaps?.[ability];
      const adjustedModifier = cap === null || cap === undefined ? modifier : Math.min(modifier, cap);

      return total + adjustedModifier;
    },
    0
  );
  const shieldTotal = mode.shieldAllowed ? shieldBonus : 0;
  const featureBonusTotal = featureBonuses.reduce((total, bonus) => total + bonus.value, 0);

  return mode.baseValue + abilityTotal + shieldTotal + featureBonusTotal;
}

function buildArmorClassBreakdownEntries(
  character: Character,
  mode: BaseArmorClassMode | FeatureArmorClassMode,
  shieldBonus: number,
  featureBonuses: FeatureArmorClassBonus[]
): ArmorClassBreakdownEntry[] {
  const entries: ArmorClassBreakdownEntry[] = [
    {
      label: "Base",
      value: mode.baseValue
    },
    ...mode.abilityModifiers.map((ability) => ({
      label: ability,
      value:
        mode.abilityModifierCaps?.[ability] === null || mode.abilityModifierCaps?.[ability] === undefined
          ? getAbilityModifier(getAbilityScoreForCharacter(character, ability))
          : Math.min(
              getAbilityModifier(getAbilityScoreForCharacter(character, ability)),
              mode.abilityModifierCaps[ability] ?? 0
            )
    }))
  ];

  if (mode.shieldAllowed && shieldBonus > 0) {
    entries.push({
      label: "Shield",
      value: shieldBonus
    });
  }

  featureBonuses.forEach((bonus) => {
    if (bonus.value !== 0) {
      entries.push({
        label: bonus.label,
        value: bonus.value
      });
    }
  });

  return entries;
}

export function getArmorClassBreakdownForCharacter(character: Character): ArmorClassBreakdown {
  const baseModes = getBaseArmorClassModes(character);
  const shieldBonus = getHeldShieldBonus(character);
  const featureContext = {
    hasWornBodyArmor: baseModes.some((mode) => mode.armorType !== "unarmored"),
    hasShieldEquipped: shieldBonus > 0
  };
  const featureModes = getArmorClassModesForCharacter(character, featureContext);
  const featureBonuses = [
    ...getArmorClassBonusesForCharacter(character, featureContext),
    ...getFeatArmorClassBonusesForCharacter(character, featureContext)
  ];
  const allModes: Array<BaseArmorClassMode | FeatureArmorClassMode> = [...baseModes, ...featureModes];
  const selectedMode =
    [...allModes].sort((left, right) => {
      const leftValue = getArmorClassModeValue(character, left, shieldBonus, featureBonuses);
      const rightValue = getArmorClassModeValue(character, right, shieldBonus, featureBonuses);

      if (rightValue !== leftValue) {
        return rightValue - leftValue;
      }

      return right.label.localeCompare(left.label);
    })[0] ?? baseModes[0];
  const entries = buildArmorClassBreakdownEntries(character, selectedMode, shieldBonus, featureBonuses);

  return {
    total: entries.reduce((total, entry) => total + entry.value, 0),
    source: selectedMode.label,
    detail: selectedMode.detail,
    entries
  };
}

export function getArmorClassForCharacter(character: Character): number {
  return getArmorClassBreakdownForCharacter(character).total;
}
