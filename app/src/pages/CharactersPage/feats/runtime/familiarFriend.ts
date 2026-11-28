import { FEATS } from "../../../../codex/entries/enums";
import { featResource } from "./resources/counter";
import { collectFeatDerivedState } from "./state";

export const faithfulCompanionSpellId = "spell-find-familiar";

export const faithfulCompanionResource = featResource(
  FEATS.FAMILIAR_FRIEND,
  "familiarFriend",
  "faithfulCompanionExpended",
  "Faithful Companion",
  (character) => {
    const entries = collectFeatDerivedState(character).featsByFeat.get(FEATS.FAMILIAR_FRIEND);
    if (!entries?.length) return null;

    const expended = entries.some((entry) => entry.familiarFriend?.faithfulCompanionExpended);
    return { usesTotal: 1, usesRemaining: expended ? 0 : 1 };
  }
);
