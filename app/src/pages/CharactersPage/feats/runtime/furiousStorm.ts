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

const boonOfFuriousStormSource = "Boon of the Furious Storm";
const boonOfFuriousStormEyeOfTheStormSourceId =
  "feat-boon-of-furious-storm-eye-of-the-storm";
const boonOfFuriousStormDamageTypes = [DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.THUNDER] as const;

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];

function isBoonOfFuriousStormEyeOfTheStormDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Eye of the Storm.</strong>");
}

function getBoonOfFuriousStormEyeOfTheStormDescription(
  getFeatDescription: FeatDescriptionGetter
): string {
  return filterDescriptionEntries(
    getFeatDescription(FEATS.BOON_OF_FURIOUS_STORM),
    isBoonOfFuriousStormEyeOfTheStormDescriptionEntry
  ).join("\n");
}

export function getBoonOfFuriousStormResistanceStatusEntries(
  normalizedFeats: CharacterFeatEntry[],
  getFeatDescription: FeatDescriptionGetter
): CharacterStatusEntry[] {
  if (!normalizedFeats.some((entry) => entry.feat === FEATS.BOON_OF_FURIOUS_STORM)) {
    return [];
  }

  const description = getBoonOfFuriousStormEyeOfTheStormDescription(getFeatDescription);

  return boonOfFuriousStormDamageTypes.map((damageType) => {
    const sourceId = `${boonOfFuriousStormEyeOfTheStormSourceId}-resistance-${damageType.toLowerCase()}`;

    return {
      id: sourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: boonOfFuriousStormSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId,
      description
    };
  });
}

export function getBoonOfFuriousStormBloodiedImmunityStatusEntries(
  getFeatDescription: FeatDescriptionGetter
): CharacterStatusEntry[] {
  const description = getBoonOfFuriousStormEyeOfTheStormDescription(getFeatDescription);

  return boonOfFuriousStormDamageTypes.map((damageType) => {
    const sourceId = `${boonOfFuriousStormEyeOfTheStormSourceId}-immunity-${damageType.toLowerCase()}`;

    return {
      id: sourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: damageType,
      source: boonOfFuriousStormSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId,
      description
    };
  });
}
