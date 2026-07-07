import {
  FEATS,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterFeatEntry,
  type CharacterStatusEntry
} from "../../../../types";
import {
  filterDescriptionEntries,
  isDragonscarredDamageResistanceDescriptionEntry
} from "./descriptionMatchers";

const dragonscarredSource = "Dragonscarred";
const dragonscarredDamageResistanceSourceId = "feat-dragonscarred-damage-resistance";

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];

function getDragonscarredDamageResistanceDescription(
  getFeatDescription: FeatDescriptionGetter
): string {
  return filterDescriptionEntries(
    getFeatDescription(FEATS.DRAGONSCARRED),
    isDragonscarredDamageResistanceDescriptionEntry
  ).join("\n");
}

export function getDragonscarredResistanceStatusEntries(
  normalizedFeats: CharacterFeatEntry[],
  getFeatDescription: FeatDescriptionGetter
): CharacterStatusEntry[] {
  const dragonscarredEntries = normalizedFeats.filter(
    (entry) => entry.feat === FEATS.DRAGONSCARRED && entry.dragonscarred
  );

  if (dragonscarredEntries.length <= 0) {
    return [];
  }

  const description = getDragonscarredDamageResistanceDescription(getFeatDescription);

  return dragonscarredEntries.flatMap((entry) => {
    if (!entry.dragonscarred) {
      return [];
    }

    const damageType = entry.dragonscarred.damageType;
    const sourceId = `${dragonscarredDamageResistanceSourceId}-${entry.id}-${damageType.toLowerCase()}`;

    return [{
      id: sourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: dragonscarredSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId,
      description
    }];
  });
}
