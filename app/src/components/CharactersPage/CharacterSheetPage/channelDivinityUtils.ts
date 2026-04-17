import { getDivinityEntryById, type DivinityEntry } from "../../../codex/entries";
import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../pages/CharactersPage/classFeatures";

export type ChannelDivinityOptionRow = {
  action: FeatureActionCard;
  option: FeatureActionOptionCard;
  entry: DivinityEntry;
};

export function getChannelDivinityEntryForOption(optionKey: string): DivinityEntry | null {
  if (optionKey === "divine-spark") {
    return getDivinityEntryById("divinity-divine-spark");
  }

  if (optionKey === "turn-undead") {
    return getDivinityEntryById("divinity-turn-undead");
  }

  if (optionKey === "paladin-divine-sense") {
    return getDivinityEntryById("divinity-divine-sense");
  }

  return null;
}

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
