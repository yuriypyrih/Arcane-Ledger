import { createElement, type ReactNode } from "react";
import {
  type SpellDescriptionEntry,
} from "../../codex/entries";
import CurrencyInlineDisplay from "../../components/CurrencyInlineDisplay";
import type { ItemRecord } from "../../types";
import { formatEquipmentWeight, formatWeaponType } from "../../utils/codex";
import {
  adaptItemWeapon,
  type AdaptedItemWeaponRecord
} from "../../utils/items/adaptItemWeapon";
import { normalizeItemDecimalString, parseItemCost } from "../../utils/items/cost";

type DetailCell = {
  label: string;
  value: ReactNode;
  note?: ReactNode;
};

export type AdaptedItemWeaponPreview = AdaptedItemWeaponRecord & {
  is_magic_item: boolean;
  is_attunement_needed: boolean;
  typeLabel: string;
  propertiesLabel: string;
  masteryLabel: string;
};

export type AdaptedItemArmorPreview = {
  typeLabel: string;
  armorBaseLabel: string;
};

export type ItemDetailPresentation = {
  name: string;
  categoryLabel: string;
  rarityLabel: string;
  sourceLabel: string;
  description: SpellDescriptionEntry[];
  stapleCells: DetailCell[];
  weapon: AdaptedItemWeaponPreview | null;
  weaponCells: DetailCell[];
  armor: AdaptedItemArmorPreview | null;
  armorCells: DetailCell[];
};

function normalizeItemDescriptionInlineMarkup(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\*\*_([\s\S]+?)_\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/__\*([\s\S]+?)\*__/g, "<strong><em>$1</em></strong>")
    .replace(/(?<!\*)\*\*(?!\*)([\s\S]+?)(?<!\*)\*\*(?!\*)/g, "<strong>$1</strong>")
    .replace(/(?<!_)__(?!_)([\s\S]+?)(?<!_)__(?!_)/g, "<strong>$1</strong>")
    .replace(/(?<![\w_])_(?!_)([\s\S]+?)(?<!_)_(?![\w_])/g, "<em>$1</em>")
    .replace(/(?<![\w*])\*(?!\*)([\s\S]+?)(?<!\*)\*(?![\w*])/g, "<em>$1</em>");
}

function formatDescription(value: string | null | undefined): SpellDescriptionEntry[] {
  if (!value) {
    return [];
  }

  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => normalizeItemDescriptionInlineMarkup(paragraph));
}

function formatWeight(value: string | null | undefined, unit: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const weight = Number(value);

  if (Number.isFinite(weight)) {
    return formatEquipmentWeight(weight);
  }

  const normalized = normalizeItemDecimalString(value);
  return unit ? `${normalized ?? value} ${unit}` : normalized ?? value;
}

function formatCost(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const parsedCost = parseItemCost(value);

  if (parsedCost) {
    return createElement(CurrencyInlineDisplay, {
      cost: parsedCost
    });
  }

  return normalizeItemDecimalString(value) ?? value;
}

function formatMagicAttunement(item: ItemRecord) {
  const magicLabel = item.is_magic_item ? "Yes" : "No";
  const attunementLabel = item.requires_attunement ? "Yes" : "No";

  return {
    value: `${magicLabel} / ${attunementLabel}`,
    note: item.attunement_detail?.trim() || null
  };
}

function formatArmorType(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[\s_-]+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function buildWeaponPresentation(item: ItemRecord): AdaptedItemWeaponPreview | null {
  const adaptedWeapon = adaptItemWeapon(item);

  if (!adaptedWeapon) {
    return null;
  }

  return {
    ...adaptedWeapon,
    is_magic_item: Boolean(item.is_magic_item),
    is_attunement_needed: Boolean(item.requires_attunement),
    typeLabel: formatWeaponType(adaptedWeapon.type),
    propertiesLabel: adaptedWeapon.propertyLabels.join(", ") || "None",
    masteryLabel: adaptedWeapon.masteryLabels.join(", ") || "None"
  };
}

function buildArmorPresentation(item: ItemRecord): AdaptedItemArmorPreview | null {
  const armor = item.armor;

  if (!armor) {
    return null;
  }

  return {
    typeLabel: formatArmorType(armor.category),
    armorBaseLabel: String(armor.ac_base)
  };
}

export function buildItemDetailPresentation(item: ItemRecord): ItemDetailPresentation {
  const sourceLabel = item.document?.display_name ?? item.document?.name ?? "Unknown source";
  const rarityLabel = item.rarity?.name ?? "No rarity";
  const magicAttunement = formatMagicAttunement(item);
  const weapon = buildWeaponPresentation(item);
  const armor = buildArmorPresentation(item);

  return {
    name: item.name ?? item.key ?? "Unknown Item",
    categoryLabel: item.category?.name ?? "Item",
    rarityLabel,
    sourceLabel,
    description: formatDescription(item.desc),
    stapleCells: [
      { label: "Weight", value: formatWeight(item.weight, item.weight_unit) },
      { label: "Cost", value: formatCost(item.cost) },
      {
        label: "Magic / Attunement",
        value: magicAttunement.value,
        note: magicAttunement.note
      }
    ],
    weapon,
    weaponCells: weapon
      ? [
          { label: "Type", value: weapon.typeLabel },
          { label: "Damage", value: weapon.damageLabel },
          { label: "Properties", value: weapon.propertiesLabel },
          { label: "Mastery", value: weapon.masteryLabel }
        ]
      : [],
    armor,
    armorCells: armor
      ? [
          { label: "Type", value: armor.typeLabel },
          { label: "Armor Base", value: armor.armorBaseLabel }
        ]
      : []
  };
}
