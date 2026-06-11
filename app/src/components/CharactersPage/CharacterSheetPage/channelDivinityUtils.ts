import { getSpellEntryById, type DivinityEntry, type SpellEntry } from "../../../codex/entries";
import type { Character } from "../../../types";
import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../pages/CharactersPage/classFeatures";
import {
  getAlwaysPreparedSpellIdsForCharacter,
  getSpellEntryForCharacter
} from "../../../pages/CharactersPage/classFeatures";
import {
  canUseClericMindMagicForSpell,
  canUseClericWarGodsBlessingForSpell,
  getClericMindMagicSpellEntry
} from "../../../pages/CharactersPage/classFeatures/cleric/cleric";
import { getChannelDivinityEntryForOption } from "../../../pages/CharactersPage/classFeatures/channelDivinity";
import {
  clericChannelDivinityOptionKeys,
  paladinChannelDivinityOptionKeys
} from "../../../pages/CharactersPage/classFeatures/channelDivinity";
import { getSpellLevel } from "../../../pages/CharactersPage/spellcasting";

export type ChannelDivinityOptionRow = {
  action: FeatureActionCard;
  option: FeatureActionOptionCard;
  entry: DivinityEntry;
};

export type ChannelDivinityGuidedFlow = "spell" | "elemental-smite" | null;

const warGodsBlessingSpellIds = ["spell-shield-of-faith", "spell-spiritual-weapon"] as const;

export function createChannelDivinityOptionRows(
  action: FeatureActionCard | null,
  options: FeatureActionOptionCard[]
): ChannelDivinityOptionRow[] {
  if (!action) {
    return [];
  }

  return options
    .map((option) => {
      const entry = getChannelDivinityEntryForOption(option.key);

      if (!entry) {
        return null;
      }

      return {
        action,
        option,
        entry
      } satisfies ChannelDivinityOptionRow;
    })
    .filter((row): row is ChannelDivinityOptionRow => row !== null);
}

export function getChannelDivinityGuidedFlow(optionKey: string): ChannelDivinityGuidedFlow {
  if (
    optionKey === clericChannelDivinityOptionKeys.mindMagic ||
    optionKey === clericChannelDivinityOptionKeys.warGodsBlessing
  ) {
    return "spell";
  }

  if (optionKey === paladinChannelDivinityOptionKeys.elementalSmite) {
    return "elemental-smite";
  }

  return null;
}

function getPreparedLeveledSpellIds(character: Character): string[] {
  return [
    ...new Set([
      ...(character.preparedSpellIds ?? []),
      ...getAlwaysPreparedSpellIdsForCharacter(character)
    ])
  ];
}

export function getChannelDivinityGuidedSpellOptions(
  character: Character,
  optionKey: string
): SpellEntry[] {
  if (optionKey === clericChannelDivinityOptionKeys.mindMagic) {
    return getPreparedLeveledSpellIds(character)
      .map((spellId) => getSpellEntryById(spellId))
      .filter(
        (spell): spell is SpellEntry =>
          spell !== null &&
          getSpellLevel(spell) > 0 &&
          canUseClericMindMagicForSpell(character, spell, true)
      )
      .map((spell) => getClericMindMagicSpellEntry(character, spell, true))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  if (optionKey === clericChannelDivinityOptionKeys.warGodsBlessing) {
    return warGodsBlessingSpellIds
      .map((spellId) => getSpellEntryById(spellId))
      .filter(
        (spell): spell is SpellEntry =>
          spell !== null && canUseClericWarGodsBlessingForSpell(character, spell)
      )
      .map((spell) => getSpellEntryForCharacter(character, spell))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  return [];
}
