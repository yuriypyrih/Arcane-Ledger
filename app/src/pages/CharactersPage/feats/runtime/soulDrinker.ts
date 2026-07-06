import {
  DAMAGE_TYPE,
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
import { filterDescriptionEntries } from "./descriptionMatchers";

const boonOfSoulDrinkerSource = "Boon of the Soul Drinker";
const boonOfSoulDrinkerGraveResistanceSourceId =
  "feat-boon-of-soul-drinker-grave-resistance";
const boonOfSoulDrinkerDamageTypes = [DAMAGE_TYPE.COLD, DAMAGE_TYPE.NECROTIC] as const;

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];

function isBoonOfSoulDrinkerGraveResistanceDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Grave Resistance.</strong>");
}

export function isBoonOfSoulDrinkerSiphonLifeDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Siphon Life.</strong>");
}

function getBoonOfSoulDrinkerGraveResistanceDescription(
  getFeatDescription: FeatDescriptionGetter
): string {
  return filterDescriptionEntries(
    getFeatDescription(FEATS.BOON_OF_SOUL_DRINKER),
    isBoonOfSoulDrinkerGraveResistanceDescriptionEntry
  ).join("\n");
}

export function getBoonOfSoulDrinkerResistanceStatusEntries(
  normalizedFeats: CharacterFeatEntry[],
  getFeatDescription: FeatDescriptionGetter
): CharacterStatusEntry[] {
  if (!normalizedFeats.some((entry) => entry.feat === FEATS.BOON_OF_SOUL_DRINKER)) {
    return [];
  }

  const description = getBoonOfSoulDrinkerGraveResistanceDescription(getFeatDescription);

  return boonOfSoulDrinkerDamageTypes.map((damageType) => {
    const sourceId = `${boonOfSoulDrinkerGraveResistanceSourceId}-${damageType.toLowerCase()}`;

    return {
      id: sourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: boonOfSoulDrinkerSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId,
      description
    };
  });
}
