import type { SpellEntry } from "../../../../codex/entries";
import { FEATS, MAGIC_SCHOOL } from "../../../../codex/entries/enums";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import { getFeatDefinition, getFeatLabel } from "../catalog";
import { filterDescriptionEntries } from "./descriptionMatchers";
import { featResource } from "./resources/counter";
import { collectFeatDerivedState } from "./state";

export const powerSurgeEffectId = "feat-arcane-overload-power-surge";

export const powerSurgeResource = featResource(
  FEATS.ARCANE_OVERLOAD,
  "arcaneOverload",
  "powerSurgeExpended",
  "Power Surge",
  (character) => {
    const entries = collectFeatDerivedState(character).featsByFeat.get(FEATS.ARCANE_OVERLOAD);
    if (!entries?.length) return null;

    const expended = entries.some((entry) => entry.arcaneOverload?.powerSurgeExpended);
    return { usesTotal: 1, usesRemaining: expended ? 0 : 1 };
  }
);

export function isPowerSurgeSpell(spell: Partial<Pick<SpellEntry, "magicSchool">>): boolean {
  return spell.magicSchool === MAGIC_SCHOOL.EVOCATION;
}

export function appendPowerSurgeSpellDescription(spell: SpellEntry): SpellEntry {
  if (!isPowerSurgeSpell(spell)) return spell;

  const description = filterDescriptionEntries(
    getFeatDefinition(FEATS.ARCANE_OVERLOAD)?.description ?? [],
    (entry) => entry.startsWith("<strong>Power Surge.</strong>")
  );
  return description.length > 0
    ? appendSourcedDescriptionAddition(spell, getFeatLabel(FEATS.ARCANE_OVERLOAD), description)
    : spell;
}
