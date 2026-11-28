import { FEATS } from "../../../../codex/entries/enums";
import type { Character, CharacterFeatEntry } from "../../../../types";
import type { CounterResourceTarget } from "../../resourceManagement";
import { borrowedEyesSpellIds } from "../featBenefitChoices";
import { faithfulCompanionResource, faithfulCompanionSpellId } from "./familiarFriend";
import { featResource } from "./resources/counter";
import { collectFeatDerivedState } from "./state";

export const spiritWhispersSpellId = "spell-augury";
export const alternateFormSpellId = "spell-alter-self";

function singleCastResource<K extends keyof CharacterFeatEntry>(
  feat: FEATS,
  stateKey: K,
  field: keyof NonNullable<CharacterFeatEntry[K]>,
  label: string,
  isExpended: (entry: CharacterFeatEntry) => boolean,
  spellId?: string
) {
  return featResource(
    feat,
    stateKey,
    field,
    label,
    (character) => {
      const entries = collectFeatDerivedState(character).featsByFeat.get(feat);
      return entries?.length
        ? { usesTotal: 1, usesRemaining: entries.some(isExpended) ? 0 : 1 }
        : null;
    },
    spellId ? "spell" : "boolean",
    spellId
  );
}

type FeatSpellFreeCast = {
  spellId: string;
  resource: CounterResourceTarget;
  components?: "material" | "all";
  withoutConcentration?: boolean;
};

export const featSpellFreeCasts: FeatSpellFreeCast[] = [
  {
    spellId: faithfulCompanionSpellId,
    resource: faithfulCompanionResource,
    components: "material"
  },
  {
    spellId: spiritWhispersSpellId,
    resource: singleCastResource(
      FEATS.GATHERED_WHISPERS,
      "gatheredWhispers",
      "spiritWhispersExpended",
      "Spirit Whispers",
      (entry) => entry.gatheredWhispers?.spiritWhispersExpended === true
    ),
    components: "all"
  },
  {
    spellId: alternateFormSpellId,
    resource: singleCastResource(
      FEATS.SECOND_SKIN,
      "secondSkin",
      "alternateFormExpended",
      "Alternate Form",
      (entry) => entry.secondSkin?.alternateFormExpended === true
    ),
    components: "all",
    withoutConcentration: true
  },
  ...borrowedEyesSpellIds.map((spellId) => ({
    spellId,
    resource: singleCastResource(
      FEATS.WATCHERS,
      "watchers",
      "borrowedEyesExpendedSpellIds",
      spellId === borrowedEyesSpellIds[0]
        ? "Borrowed Eyes (Beast Sense)"
        : "Borrowed Eyes (Speak with Animals)",
      (entry) => entry.watchers?.borrowedEyesExpendedSpellIds?.includes(spellId) === true,
      spellId
    )
  }))
];

export function getFeatSpellFreeCast(character: Character, spellId: string) {
  return featSpellFreeCasts.find(
    (option) => option.spellId === spellId && option.resource.total(character) > 0
  );
}
