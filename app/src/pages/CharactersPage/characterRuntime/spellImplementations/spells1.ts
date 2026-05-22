import type { SpellEntry } from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import type { ArmorClassFeatureContext, FeatureArmorClassMode } from "../../classFeatures";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../../statusEntries";
import type {
  SpellImplementation,
  SpellImplementationApplyContext,
  SpellImplementationCastOptionsContext
} from "./types";

export const mageArmorSpellId = "spell-mage-armor";
export const mageArmorStatusSourceId = "spell-mage-armor-self";
export const mageArmorStatusValue = "Mage Armor";
export const mageArmorCastOnSelfOptionId = "castOnSelf";

export function isMageArmorSelfStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId" | "value">
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceId === mageArmorStatusSourceId &&
    entry.value === mageArmorStatusValue
  );
}

export function hasMageArmorSelfStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(isMageArmorSelfStatusEntry);
}

function applyMageArmorSelfCastForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "name" | "description">
): Character {
  if (spell.id !== mageArmorSpellId) {
    return character;
  }

  const normalizedStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = [
    ...normalizedStatusEntries.filter((entry) => !isMageArmorSelfStatusEntry(entry)),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: mageArmorStatusValue,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.HOURS,
        amount: 8
      },
      sourceId: mageArmorStatusSourceId,
      sourceSpellId: spell.id,
      description: spell.description.join("\n")
    })
  ];

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

function getMageArmorCastOptions(context: SpellImplementationCastOptionsContext) {
  const forceSelfCast = context.forcedOptions?.[mageArmorCastOnSelfOptionId] === true;

  return [
    {
      id: mageArmorCastOnSelfOptionId,
      label: "Cast on myself",
      defaultChecked: forceSelfCast,
      disabled: forceSelfCast
    }
  ];
}

export function applyMageArmorSpellImplementation(
  context: SpellImplementationApplyContext
): Character {
  if (context.options[mageArmorCastOnSelfOptionId] !== true) {
    return context.character;
  }

  return applyMageArmorSelfCastForCharacter(context.character, context.spell);
}

const mageArmorSpellImplementation: SpellImplementation = {
  spellId: mageArmorSpellId,
  getCastOptions: getMageArmorCastOptions,
  applyOnCast: applyMageArmorSpellImplementation
};

export function getMageArmorArmorClassModes(
  character: Partial<Pick<Character, "statusEntries">>,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (!hasMageArmorSelfStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      key: "spell-mage-armor",
      label: mageArmorStatusValue,
      baseValue: 13,
      abilityModifiers: ["DEX"],
      shieldAllowed: true,
      isApplicable: !context.hasWornBodyArmor,
      unavailableReason: context.hasWornBodyArmor
        ? "Requires you to wear no body armor."
        : undefined,
      detail: "Mage Armor spell"
    }
  ];
}

export const spellImplementations1: SpellImplementation[] = [mageArmorSpellImplementation];
