import {
  CLASS_FEATURE,
  SPELL_LIST_CLASS,
  WEAPON_COMBAT_TYPE,
  WEAPON_TRAINING,
  type SpellEntry
} from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { adaptItemWeapon } from "../../../../../utils/items/adaptItemWeapon";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  hasInventoryItemSpellcastingFocusSource,
  INVENTORY_SPELLCASTING_FOCUS_SOURCE_ARCANE_FIREARM,
  setArcaneFirearmInventoryItemById
} from "../../../inventoryItems";
import { getEffectiveInventoryItemRecord } from "../../../itemMods";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { FeatureActionCard, FeatureDamageBonus, SpellFeatureContext } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";
import { artilleristSubclassId } from "./artificerArtilleristEldritchCannon";

export const artificerArcaneFirearmActionKey = "artificer-artillerist-arcane-firearm";

const arcaneFirearmName = "Arcane Firearm";
const arcaneFirearmItemCategoryKeys = new Set(["rod", "staff", "wand"]);

export type ArtificerArcaneFirearmItemOption = {
  stackId: string;
  label: string;
};

type ArtificerArcaneFirearmCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "inventoryItems" | "level" | "subclassId">>;

function isArcaneFirearmEligibleItem(
  item: ReturnType<typeof getEffectiveInventoryItemRecord>
): boolean {
  if (item.category?.key && arcaneFirearmItemCategoryKeys.has(item.category.key)) {
    return true;
  }

  const adaptedWeapon = adaptItemWeapon(item);

  return (
    adaptedWeapon?.type.combat === WEAPON_COMBAT_TYPE.RANGED &&
    adaptedWeapon.type.training === WEAPON_TRAINING.MARTIAL
  );
}

function spellSupportsArtificerArcaneFirearm(
  spell: Pick<SpellEntry, "id" | "damage" | "spellLists"> | null,
  additionalArtificerSpellIds: readonly string[] = []
): boolean {
  if (!spell || spell.damage.length <= 0) {
    return false;
  }

  return (
    spell.spellLists.includes(SPELL_LIST_CLASS.ARTIFICER) ||
    additionalArtificerSpellIds.includes(spell.id)
  );
}

export function hasArtificerArcaneFirearmFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, artilleristSubclassId, 5);
}

export function getArtificerArcaneFirearmItemOptions(
  character: ArtificerArcaneFirearmCharacter
): ArtificerArcaneFirearmItemOption[] {
  if (!hasArtificerArcaneFirearmFeature(character)) {
    return [];
  }

  return (character.inventoryItems ?? []).flatMap((entry) => {
    const item = getEffectiveInventoryItemRecord(entry);

    if (!isArcaneFirearmEligibleItem(item)) {
      return [];
    }

    const itemName = item.name ?? "Unnamed item";

    return [
      {
        stackId: entry.id,
        label: itemName
      }
    ];
  });
}

export function hasActiveArtificerArcaneFirearm(
  character: Pick<Character, "inventoryItems"> | Partial<Pick<Character, "inventoryItems">>
): boolean {
  return (character.inventoryItems ?? []).some((entry) =>
    hasInventoryItemSpellcastingFocusSource(
      entry,
      INVENTORY_SPELLCASTING_FOCUS_SOURCE_ARCANE_FIREARM
    )
  );
}

export function getArtificerArcaneFirearmAction(
  character: ArtificerArcaneFirearmCharacter
): FeatureActionCard | null {
  if (!hasArtificerArcaneFirearmFeature(character)) {
    return null;
  }

  const itemOptions = getArtificerArcaneFirearmItemOptions(character);
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ARCANE_FIREARM);
  const disabledReason =
    itemOptions.length <= 0
      ? "Add a rod, staff, wand, or martial ranged weapon to your inventory first."
      : undefined;

  return {
    key: artificerArcaneFirearmActionKey,
    name: arcaneFirearmName,
    sourceFeature: CLASS_FEATURE.ARCANE_FIREARM,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Carve sigils into an eligible item.",
    detail: "Choose a rod, staff, wand, or martial ranged weapon.",
    breakdown: "Mark spellcasting focus",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "custom-form",
      eyebrow: "Artillerist",
      description,
      formKind: "artificer-arcane-firearm",
      blockedReason: disabledReason
    },
    execute: {
      kind: "custom-form",
      formKind: "artificer-arcane-firearm"
    }
  };
}

export function setArtificerArcaneFirearmForCharacter(
  character: Character,
  stackId: string
): Character {
  if (!hasArtificerArcaneFirearmFeature(character)) {
    return character;
  }

  if (
    !getArtificerArcaneFirearmItemOptions(character).some(
      (option) => option.stackId === stackId
    )
  ) {
    return character;
  }

  return {
    ...character,
    inventoryItems: setArcaneFirearmInventoryItemById(character.inventoryItems ?? [], stackId)
  };
}

export function getArtificerArcaneFirearmSpellDamageBonuses(
  character: ArtificerArcaneFirearmCharacter,
  { spell }: SpellFeatureContext,
  additionalArtificerSpellIds: readonly string[] = []
): FeatureDamageBonus[] {
  if (
    !hasArtificerArcaneFirearmFeature(character) ||
    !hasActiveArtificerArcaneFirearm(character) ||
    !spellSupportsArtificerArcaneFirearm(spell, additionalArtificerSpellIds)
  ) {
    return [];
  }

  return [
    {
      label: arcaneFirearmName,
      formula: "1d8",
      formulaSourceLabel: arcaneFirearmName
    }
  ];
}
