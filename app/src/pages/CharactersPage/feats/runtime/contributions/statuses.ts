import { DAMAGE_TYPE, FEATS } from "../../../../../codex/entries/enums";
import {
  CONDITION_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";

import {
  boonOfPoisonMasteryAntitoxicStatusSourceIdPrefix,
  skulkerBlindsightStatusSourceId
} from "../constants";

import {
  filterDescriptionEntries,
  isBoonOfPoisonMasteryAntitoxicDescriptionEntry
} from "../descriptionMatchers";

import type { FeatContributionBuilders } from "./types";

export const statusesBuilders: FeatContributionBuilders = {
  [FEATS.BOON_OF_POISON_MASTERY]: ({ entry, contribution, getFeatDescription }) => {
    const derivedStatusEntries = contribution.statuses!;

    const description = filterDescriptionEntries(
      getFeatDescription(FEATS.BOON_OF_POISON_MASTERY),
      isBoonOfPoisonMasteryAntitoxicDescriptionEntry
    );

    [DAMAGE_TYPE.POISON, CONDITION_NAME.POISONED].forEach((immunity) => {
      const sourceId = `${boonOfPoisonMasteryAntitoxicStatusSourceIdPrefix}${entry.id}-${immunity.toLowerCase()}`;

      derivedStatusEntries.push({
        id: sourceId,
        group: STATUS_ENTRY_GROUP.IMMUNITIES,
        value: immunity,
        source: "Boon of Poison Mastery",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId,
        description: description.join("\n")
      });
    });

    return true;
  },
  [FEATS.SKULKER]: ({ entry, contribution }) => {
    const derivedStatusEntries = contribution.statuses!;

    derivedStatusEntries.push({
      id: `${skulkerBlindsightStatusSourceId}-${entry.id}`,
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.BLINDSIGHT,
      source: "Skulker",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId: skulkerBlindsightStatusSourceId,
      rangeFeet: 10
    });

    return true;
  }
};
