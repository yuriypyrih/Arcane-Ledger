import { ARMOR_TYPES, type ArmorEntry } from "../../codex/entries";
import { getArmorEntries } from "../../codex/selectors";
import type {
  AbilityKey,
  CharacterArmorClassFormulaSelection,
  Character,
  CharacterCustomEquipment,
  CharacterEquipmentItem,
  CharacterInventoryItem
} from "../../types";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityModifierForCharacter
} from "./abilities";
import { formatCustomTraitBonusFormulaTerm } from "./customTraitEffects";
import {
  getArmorClassBonusesForCharacter,
  getArmorClassModesForCharacter,
  type FeatureArmorClassBonus
} from "./classFeatures";
import {
  getFeatArmorClassBonusesForCharacter,
  hasMediumArmorMasterForCharacter
} from "./feats/runtime";
import {
  getInventoryItemOnHandQuantity,
  getInventoryItemStackIdFromCopyId,
  getItemArmorType,
  isItemBodyArmorRecord,
  isItemShieldRecord
} from "./inventoryItems";
import { getEffectiveInventoryItemRecord, getItemShieldBonus } from "./itemMods";
import {
  getBarkskinArmorClassModes,
  getMageArmorArmorClassModes,
  getSpellArmorClassBonusesForCharacter
} from "./characterRuntime/spellImplementations";

export type BodyArmorType = "light" | "medium" | "heavy";

export type BodyArmorCandidate = {
  key: string;
  name: string;
  armorBase: number;
  armorType: BodyArmorType;
  worn: boolean;
};

type ArmorClassModeDefinition = {
  key: string;
  label: string;
  detail?: string;
  unlockedAtLevel?: number;
  baseValue: number;
  abilityModifiers: AbilityKey[];
  abilityModifierCaps?: Partial<Record<AbilityKey, number | null>>;
  shieldAllowed: boolean;
  featureBonusesAllowed?: boolean;
};

export type ArmorClassBreakdownEntry = {
  label: string;
  value: number;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
  formulaLabel?: string;
};

export type ArmorClassBreakdown = {
  total: number;
  source: string;
  detail?: string;
  entries: ArmorClassBreakdownEntry[];
};

export type ArmorClassFormulaOption = {
  key: string;
  label: string;
  selectorLabel: string;
  detail?: string;
  isApplicable: boolean;
  unavailableReason?: string;
  isDefault: boolean;
  breakdown: ArmorClassBreakdown;
};

export type ArmorClassResolution = {
  formulas: ArmorClassFormulaOption[];
  defaultFormula: ArmorClassFormulaOption;
  selectedFormula: ArmorClassFormulaOption;
  activeFormula: ArmorClassFormulaOption;
  selection: CharacterArmorClassFormulaSelection;
  warning: string | null;
};

type ArmorClassFormulaSelectionCharacter = Pick<
  Character,
  "className" | "level" | "equipment" | "inventoryItems" | "customEquipment"
> &
  Partial<Pick<Character, "classFeatureState" | "feats" | "statusEntries" | "subclassId">>;

const codexArmorEntriesByName = new Map<string, ArmorEntry>(
  getArmorEntries().map((entry) => [entry.name, entry])
);

const defaultArmorClassFormulaSelection: CharacterArmorClassFormulaSelection = {
  key: null,
  mode: "auto"
};

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

export function getCodexBodyArmorKey(itemName: string): string {
  return `codex:${itemName}`;
}

export function getCustomBodyArmorKey(customEquipmentId: string): string {
  return `custom:${customEquipmentId}`;
}

export function getInventoryBodyArmorKey(inventoryItemId: string): string {
  return `inventory:${inventoryItemId}`;
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
    key: getCodexBodyArmorKey(item.name),
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
    key: getCustomBodyArmorKey(customEquipment.id),
    name: customEquipment.name,
    armorBase: customEquipment.armorBase,
    armorType: customEquipment.armorType,
    worn: Boolean(customEquipment.worn)
  };
}

function getInventoryBodyArmorCandidate(
  inventoryItem: CharacterInventoryItem
): BodyArmorCandidate | null {
  const item = getEffectiveInventoryItemRecord(inventoryItem);

  if (!isItemBodyArmorRecord(item)) {
    return null;
  }

  const armorType = getItemArmorType(item);
  const armorBase = item.armor?.ac_base;

  if (!armorType || typeof armorBase !== "number") {
    return null;
  }

  return {
    key: getInventoryBodyArmorKey(inventoryItem.id),
    name: item.name ?? item.key ?? "Armor",
    armorBase,
    armorType,
    worn: Boolean(inventoryItem.worn)
  };
}

function getBodyArmorCandidates(
  character: Pick<Character, "equipment" | "inventoryItems" | "customEquipment">
): BodyArmorCandidate[] {
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

export function getWornBodyArmorTypeForCharacter(
  character: Pick<Character, "equipment" | "inventoryItems" | "customEquipment">
): BodyArmorType | null {
  return getBodyArmorCandidates(character).find((candidate) => candidate.worn)?.armorType ?? null;
}

export function getWornBodyArmorCandidateForCharacter(
  character: Pick<Character, "equipment" | "inventoryItems" | "customEquipment">
): BodyArmorCandidate | null {
  return getBodyArmorCandidates(character).find((candidate) => candidate.worn) ?? null;
}

export function getBodyArmorCandidateByKeyForCharacter(
  character: Pick<Character, "equipment" | "inventoryItems" | "customEquipment">,
  armorKey: string
): BodyArmorCandidate | null {
  return getBodyArmorCandidates(character).find((candidate) => candidate.key === armorKey) ?? null;
}

export function normalizeCharacterArmorWearState(
  equipment: CharacterEquipmentItem[],
  inventoryItems: CharacterInventoryItem[],
  customEquipment: CharacterCustomEquipment[]
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
    isItemBodyArmorRecord(getEffectiveInventoryItemRecord(entry))
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
  const selectedBodyArmorKey = candidates.find((candidate) => candidate.worn)?.key ?? null;

  return {
    equipment: normalizedEquipment.map((item) => ({
      ...item,
      worn: selectedBodyArmorKey === getCodexBodyArmorKey(item.name)
    })),
    inventoryItems: normalizedInventoryItems.map((entry) => ({
      ...entry,
      worn: selectedBodyArmorKey === getInventoryBodyArmorKey(entry.id)
    })),
    customEquipment: normalizedCustomEquipment.map((entry) =>
      entry.kind === "armor" && entry.armorType !== "shield"
        ? {
            ...entry,
            worn: selectedBodyArmorKey === getCustomBodyArmorKey(entry.id)
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
  const inventoryTargetId =
    target.kind === "inventory" ? getInventoryItemStackIdFromCopyId(target.inventoryItemId) : null;
  const isValidBodyArmorTarget =
    target.kind === "codex"
      ? (() => {
          const armorEntry = codexArmorEntriesByName.get(target.name);
          return Boolean(armorEntry && !isShieldArmorEntry(armorEntry));
        })()
      : target.kind === "inventory"
        ? character.inventoryItems.some(
            (entry) =>
              entry.id === inventoryTargetId &&
              isItemBodyArmorRecord(getEffectiveInventoryItemRecord(entry))
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
      worn: shouldWear && target.kind === "inventory" ? entry.id === inventoryTargetId : false
    })),
    customEquipment: character.customEquipment.map((entry) =>
      entry.kind === "armor" && entry.armorType !== "shield"
        ? {
            ...entry,
            worn:
              shouldWear && target.kind === "custom" ? entry.id === target.customEquipmentId : false
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

function getHeldShieldBonus(character: Pick<Character, "equipment" | "inventoryItems">): number {
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
    const effectiveItem = getEffectiveInventoryItemRecord(item);

    if (getInventoryItemOnHandQuantity(item) <= 0 || !isItemShieldRecord(effectiveItem)) {
      return highestShieldBonus;
    }

    return Math.max(highestShieldBonus, getItemShieldBonus(effectiveItem));
  }, 0);

  return Math.max(codexShieldBonus, inventoryShieldBonus);
}

type ArmorClassModeState = ArmorClassModeDefinition & {
  isApplicable: boolean;
  unavailableReason?: string;
  isDefault: boolean;
};

function getDefaultArmorClassMode(
  character: ArmorClassFormulaSelectionCharacter
): ArmorClassModeState {
  const wornBodyArmor =
    getBodyArmorCandidates(character).find((candidate) => candidate.worn) ?? null;

  if (!wornBodyArmor) {
    return {
      key: "base-unarmored",
      label: "Unarmored",
      baseValue: 10,
      abilityModifiers: ["DEX"],
      shieldAllowed: true,
      isApplicable: true,
      isDefault: true
    };
  }

  const mediumArmorDexCap = hasMediumArmorMasterForCharacter(character) ? 3 : 2;

  return {
    key: wornBodyArmor.key,
    label: wornBodyArmor.name,
    baseValue: wornBodyArmor.armorBase,
    abilityModifiers: ["DEX"],
    abilityModifierCaps: {
      DEX:
        wornBodyArmor.armorType === "heavy"
          ? 0
          : wornBodyArmor.armorType === "medium"
            ? mediumArmorDexCap
            : null
    },
    shieldAllowed: true,
    isApplicable: true,
    isDefault: true
  };
}

function getArmorClassModeStates(
  character: ArmorClassFormulaSelectionCharacter
): ArmorClassModeState[] {
  const defaultMode = getDefaultArmorClassMode(character);
  const shieldBonus = getHeldShieldBonus(character);
  const featureContext = {
    hasWornBodyArmor: defaultMode.key !== "base-unarmored",
    hasShieldEquipped: shieldBonus > 0
  };
  const featureModes = [
    ...getArmorClassModesForCharacter(character, featureContext),
    ...getMageArmorArmorClassModes(character, featureContext),
    ...getBarkskinArmorClassModes(character, featureContext)
  ].map((mode) => ({
    ...mode,
    isDefault: false
  }));

  return [defaultMode, ...featureModes];
}

function getArmorClassFormulaSelectorLabel(
  mode: Pick<ArmorClassModeState, "isDefault" | "unlockedAtLevel" | "label">
): string {
  if (mode.isDefault) {
    return "Default";
  }

  if (typeof mode.unlockedAtLevel === "number" && Number.isFinite(mode.unlockedAtLevel)) {
    return `Level ${mode.unlockedAtLevel}: ${mode.label}`;
  }

  return mode.label;
}

function buildArmorClassBreakdownEntries(
  character: Character,
  mode: ArmorClassModeDefinition,
  shieldBonus: number,
  featureBonuses: FeatureArmorClassBonus[]
): ArmorClassBreakdownEntry[] {
  const entries: ArmorClassBreakdownEntry[] = [
    {
      label: "Base",
      value: mode.baseValue
    },
    ...mode.abilityModifiers.flatMap((ability) => {
      const breakdown = getAbilityModifierBreakdownForCharacter(character, ability);
      const cappedBaseValue =
        mode.abilityModifierCaps?.[ability] === null ||
        mode.abilityModifierCaps?.[ability] === undefined
          ? breakdown.baseValue
          : Math.min(breakdown.baseValue, mode.abilityModifierCaps[ability] ?? 0);

      return [
        {
          label: ability,
          value: cappedBaseValue
        },
        ...breakdown.bonusEntries
      ];
    })
  ];

  if (mode.shieldAllowed && shieldBonus > 0) {
    entries.push({
      label: "Shield",
      value: shieldBonus
    });
  }

  featureBonuses.forEach((bonus) => {
    const value = bonus.abilityModifierSource
      ? getAbilityModifierForCharacter(character, bonus.abilityModifierSource) *
        (bonus.abilityModifierMultiplier ?? 1)
      : bonus.value;

    if (value !== 0) {
      entries.push({
        label: bonus.label,
        value,
        abilityModifierSource: bonus.abilityModifierSource,
        formulaSourceLabel: bonus.formulaSourceLabel,
        formulaLabel:
          formatCustomTraitBonusFormulaTerm({
            ...bonus,
            value
          }) ?? undefined
      });
    }
  });

  return entries;
}

function buildArmorClassBreakdown(
  character: Character,
  mode: ArmorClassModeDefinition,
  shieldBonus: number,
  featureBonuses: FeatureArmorClassBonus[]
): ArmorClassBreakdown {
  const entries = buildArmorClassBreakdownEntries(
    character,
    mode,
    shieldBonus,
    mode.featureBonusesAllowed === false ? [] : featureBonuses
  );

  return {
    total: entries.reduce((total, entry) => total + entry.value, 0),
    source: mode.label,
    detail: mode.detail,
    entries
  };
}

function buildArmorClassFormulaOption(
  character: Character,
  mode: ArmorClassModeState,
  shieldBonus: number,
  featureBonuses: FeatureArmorClassBonus[]
): ArmorClassFormulaOption {
  return {
    key: mode.key,
    label: mode.label,
    selectorLabel: getArmorClassFormulaSelectorLabel(mode),
    detail: mode.detail,
    isApplicable: mode.isApplicable,
    unavailableReason: mode.unavailableReason,
    isDefault: mode.isDefault,
    breakdown: buildArmorClassBreakdown(character, mode, shieldBonus, featureBonuses)
  };
}

function getAutoSelectedArmorClassFormulaKey(
  modes: Array<Pick<ArmorClassModeState, "key">>
): string | null {
  return modes[modes.length - 1]?.key ?? null;
}

export function normalizeArmorClassFormulaSelection(
  value: unknown,
  character: ArmorClassFormulaSelectionCharacter
): CharacterArmorClassFormulaSelection {
  const modes = getArmorClassModeStates(character);
  const defaultMode = modes[0];
  const autoSelectedKey = getAutoSelectedArmorClassFormulaKey(modes) ?? defaultMode?.key ?? null;

  if (!defaultMode) {
    return {
      ...defaultArmorClassFormulaSelection,
      key: autoSelectedKey
    };
  }

  let mode: CharacterArmorClassFormulaSelection["mode"] = defaultArmorClassFormulaSelection.mode;
  let key: string | null = defaultArmorClassFormulaSelection.key;

  if (typeof value === "string") {
    mode = "manual";
    key = value.trim() || null;
  } else if (value && typeof value === "object") {
    const record = value as Partial<CharacterArmorClassFormulaSelection>;

    if (record.mode === "manual" || record.mode === "auto") {
      mode = record.mode;
    }

    key = typeof record.key === "string" && record.key.trim().length > 0 ? record.key.trim() : null;
  }

  if (mode === "auto") {
    return {
      key: autoSelectedKey ?? defaultMode.key,
      mode
    };
  }

  return {
    key: modes.some((candidate) => candidate.key === key) ? key : defaultMode.key,
    mode
  };
}

function buildArmorClassSelectionWarning(
  selectedFormula: ArmorClassFormulaOption,
  activeFormula: ArmorClassFormulaOption
): string | null {
  if (selectedFormula.isApplicable) {
    return null;
  }

  const reason = selectedFormula.unavailableReason ?? "Its requirements are not currently met.";
  const reasonText = reason.endsWith(".") ? reason : `${reason}.`;

  return `${selectedFormula.label} is selected, but it doesn't currently apply. ${reasonText} Armor Class is using ${activeFormula.selectorLabel} instead.`;
}

export function getArmorClassResolutionForCharacter(character: Character): ArmorClassResolution {
  const modes = getArmorClassModeStates(character);
  const shieldBonus = getHeldShieldBonus(character);
  const featureContext = {
    hasWornBodyArmor: modes[0]?.key !== "base-unarmored",
    hasShieldEquipped: shieldBonus > 0
  };
  const featureBonuses = [
    ...getArmorClassBonusesForCharacter(character, featureContext),
    ...getSpellArmorClassBonusesForCharacter(character),
    ...getFeatArmorClassBonusesForCharacter(character, featureContext)
  ];
  const formulas = modes.map((mode) =>
    buildArmorClassFormulaOption(character, mode, shieldBonus, featureBonuses)
  );
  const defaultFormula = formulas[0];

  if (!defaultFormula) {
    throw new Error("Unable to resolve Armor Class formulas.");
  }

  const selection = normalizeArmorClassFormulaSelection(
    character.armorClassFormulaSelection,
    character
  );
  const selectedFormula =
    formulas.find((formula) => formula.key === selection.key) ?? defaultFormula;
  const activeFormula = selectedFormula.isApplicable ? selectedFormula : defaultFormula;

  return {
    formulas,
    defaultFormula,
    selectedFormula,
    activeFormula,
    selection,
    warning: buildArmorClassSelectionWarning(selectedFormula, activeFormula)
  };
}

export function setArmorClassFormulaSelectionForCharacter(
  character: Character,
  formulaKey: string
): Character {
  const modes = getArmorClassModeStates(character);

  if (!modes.some((mode) => mode.key === formulaKey)) {
    return character;
  }

  return {
    ...character,
    armorClassFormulaSelection: {
      key: formulaKey,
      mode: "manual"
    }
  };
}

export function getArmorClassBreakdownForCharacter(character: Character): ArmorClassBreakdown {
  return getArmorClassResolutionForCharacter(character).activeFormula.breakdown;
}

export function getArmorClassForCharacter(character: Character): number {
  return getArmorClassResolutionForCharacter(character).activeFormula.breakdown.total;
}
