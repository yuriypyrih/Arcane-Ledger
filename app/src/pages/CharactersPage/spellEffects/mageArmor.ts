import type { SpellEntry } from "../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../types";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../statusEntries";
import type { ArmorClassFeatureContext, FeatureArmorClassMode } from "../classFeatures";

export const mageArmorSpellId = "spell-mage-armor";
export const mageArmorStatusSourceId = "spell-mage-armor-self";
export const mageArmorStatusValue = "Mage Armor";

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

export function applyMageArmorSelfCastForCharacter(
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
