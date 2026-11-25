import type { SpellEntry } from "../../../../codex/entries";
import { FEATS } from "../../../../codex/entries/enums";
import { ECONOMY_TYPE } from "../../actionEconomy";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import { createChargesCardUsage } from "../../classFeatures/cardUsage";
import type {
  FeatureSpellActionPathContribution,
  FeatureSpellCastEffectContribution
} from "../../featureContributions";
import { getProficiencyBonus } from "../../proficiencyBonus";
import { arcaneCantripFeats } from "../arcaneCantripChoices";
import { getFeatDefinition, getFeatLabel } from "../catalog";
import { filterDescriptionEntries } from "./descriptionMatchers";
import { featResource } from "./resources/counter";
import { collectFeatDerivedState, hasFeatForCharacter } from "./state";
import type { FeatRuntimeCharacter } from "./types";

const resistanceSpellId = arcaneCantripFeats[FEATS.ARCANE_SAFEGUARD].cantripId;
export const arcaneSafeguardResistanceBonusActionId = "feat-arcane-safeguard-resistance";

export const arcaneSafeguardResource = featResource(
  FEATS.ARCANE_SAFEGUARD,
  "arcaneSafeguard",
  "resistanceBonusActionUsesExpended",
  "Arcane Safeguard",
  (character) => {
    const feat = collectFeatDerivedState(character).featsByFeat.get(FEATS.ARCANE_SAFEGUARD)?.[0];
    if (!feat) return null;

    const usesTotal = Math.max(0, Math.floor(getProficiencyBonus(character)));
    return {
      usesTotal,
      usesRemaining: Math.max(
        0,
        usesTotal - (feat.arcaneSafeguard?.resistanceBonusActionUsesExpended ?? 0)
      )
    };
  },
  "number"
);

export const arcaneSafeguardResistancePath: FeatureSpellActionPathContribution = {
  id: arcaneSafeguardResistanceBonusActionId,
  spellId: resistanceSpellId,
  economyType: ECONOMY_TYPE.BONUS_ACTION,
  actionLabel: "Cast as Bonus Action",
  getDisabledReason: ({ character }) =>
    arcaneSafeguardResource.remaining(character) > 0
      ? null
      : "Arcane Safeguard has no Bonus Action casts remaining.",
  getUsage: ({ character }) =>
    createChargesCardUsage(
      arcaneSafeguardResource.remaining(character),
      arcaneSafeguardResource.total(character),
      arcaneSafeguardResource
    ),
  spellCastEffectIds: [arcaneSafeguardResistanceBonusActionId]
};

export const arcaneSafeguardResistanceCastEffect: FeatureSpellCastEffectContribution = {
  id: arcaneSafeguardResistanceBonusActionId,
  apply: (character, { spell, spellActionPathId }) =>
    spell.id === resistanceSpellId && spellActionPathId === arcaneSafeguardResistanceBonusActionId
      ? arcaneSafeguardResource.spendOne(character)
      : character
};

export function appendArcaneSafeguardSpellDescription(spell: SpellEntry): SpellEntry {
  if (spell.id !== resistanceSpellId) return spell;

  const description = filterDescriptionEntries(
    getFeatDefinition(FEATS.ARCANE_SAFEGUARD)?.description ?? [],
    (entry) => entry.startsWith("<strong>Cantrip.</strong>")
  );
  return description.length > 0
    ? appendSourcedDescriptionAddition(spell, getFeatLabel(FEATS.ARCANE_SAFEGUARD), description)
    : spell;
}

export function appendArcaneSafeguardSpellDescriptionForCharacter(
  character: FeatRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return spell.id === resistanceSpellId && hasFeatForCharacter(character, FEATS.ARCANE_SAFEGUARD)
    ? appendArcaneSafeguardSpellDescription(spell)
    : spell;
}
