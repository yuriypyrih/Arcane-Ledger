import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character, CharacterArtificerFeatureState, ItemRecord } from "../../../../types";
import { getAbilityModifierForCharacter } from "../../abilities";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import {
  INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC,
  INVENTORY_CONJURED_DURATION_LONG_REST,
  addConjuredInventoryItemCopies
} from "../../inventoryItems";
import { ACTION_CARD_THEME } from "../../actionCardTheme";
import { createChargesCardUsage } from "../cardUsage";
import type { FeatureActionCard, FeatureActionOptionCard } from "../types";

export const artificerTinkersMagicActionKey = "artificer-tinkers-magic";

const tinkersMagicName = "Tinker's Magic";
const tinkersMagicActionDescription = [
  "As a Magic action while holding Tinker's Tools, you can create one item in an unoccupied space within 5 feet of yourself, choosing from the following list.",
  "See the item's rules in the Player's Handbook. The item lasts until you finish a <link:long-rest>Long Rest</link>, at which point it vanishes.",
  "You can use this feature a number of times equal to your <link:Intelligence>Intelligence</link> modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
];

type ArtificerTinkersMagicCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries">>;

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

export function hasArtificerTinkersMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 1;
}

export function getArtificerTinkersMagicUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "statusEntries">>
): number {
  const intelligenceModifier = getAbilityModifierForCharacter(
    {
      abilities: character.abilities,
      statusEntries: character.statusEntries
    },
    "INT"
  );

  return hasArtificerTinkersMagicFeature(character) ? Math.max(1, intelligenceModifier) : 0;
}

export function normalizeArtificerTinkersMagicState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "statusEntries">>
): CharacterArtificerFeatureState {
  if (!hasArtificerTinkersMagicFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const usesTotal = getArtificerTinkersMagicUsesTotal(character);

  return {
    tinkersMagicUsesExpended: normalizeUsesExpended(record.tinkersMagicUsesExpended, usesTotal)
  };
}

export function getArtificerTinkersMagicUsesRemaining(
  character: ArtificerTinkersMagicCharacter
): number {
  const usesTotal = getArtificerTinkersMagicUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.tinkersMagicUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function getArtificerTinkersMagicAction(
  character: ArtificerTinkersMagicCharacter
): FeatureActionCard | null {
  if (!hasArtificerTinkersMagicFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerTinkersMagicUsesTotal(character);
  const usesRemaining = getArtificerTinkersMagicUsesRemaining(character);

  return {
    key: artificerTinkersMagicActionKey,
    name: tinkersMagicName,
    sourceFeature: CLASS_FEATURE.TINKERS_MAGIC,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Create simple adventuring gear.",
    detail: "Use Tinker's Tools to conjure one listed mundane item nearby.",
    breakdown: "Conjure an item",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    description: tinkersMagicActionDescription,
    drawer: {
      kind: "custom-form",
      description: tinkersMagicActionDescription,
      formKind: "tinkers-magic"
    },
    execute: {
      kind: "custom-form",
      formKind: "tinkers-magic"
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0 ? "Tinker's Magic recharges when you finish a Long Rest." : undefined
  };
}

export function getArtificerFeatureActions(
  character: ArtificerTinkersMagicCharacter
): FeatureActionCard[] {
  const tinkersMagicAction = getArtificerTinkersMagicAction(character);

  return tinkersMagicAction ? [tinkersMagicAction] : [];
}

export function getArtificerFeatureActionOptions(
  _character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): Partial<Record<string, FeatureActionOptionCard[]>> {
  return {};
}

export function consumeArtificerTinkersMagicUse(character: Character): Character {
  const usesTotal = getArtificerTinkersMagicUsesTotal(character);
  const usesRemaining = getArtificerTinkersMagicUsesRemaining(character);

  if (usesTotal <= 0 || usesRemaining <= 0) {
    return character;
  }

  const artificerState = normalizeArtificerTinkersMagicState(
    character.classFeatureState?.artificer,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        tinkersMagicUsesExpended: (artificerState.tinkersMagicUsesExpended ?? 0) + 1
      }
    }
  };
}

export function addArtificerTinkersMagicItemToInventory(
  character: Character,
  item: ItemRecord
): Character {
  return {
    ...character,
    inventoryItems: addConjuredInventoryItemCopies(character.inventoryItems ?? [], item, 1, {
      conjuredSource: INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC,
      conjuredDuration: INVENTORY_CONJURED_DURATION_LONG_REST
    })
  };
}

export function restoreArtificerTinkersMagicOnLongRest(character: Character): Character {
  if (!hasArtificerTinkersMagicFeature(character)) {
    return character;
  }

  const artificerState = normalizeArtificerTinkersMagicState(
    character.classFeatureState?.artificer,
    character
  );

  if ((artificerState.tinkersMagicUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        tinkersMagicUsesExpended: 0
      }
    }
  };
}
