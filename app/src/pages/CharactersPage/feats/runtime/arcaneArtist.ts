import type { SpellEntry } from "../../../../codex/entries";
import { FEATS, MAGIC_SCHOOL } from "../../../../codex/entries/enums";
import type { Character } from "../../../../types";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import type { CounterResourceTarget } from "../../resourceManagement";
import { getFeatDefinition, getFeatLabel } from "../catalog";
import { filterDescriptionEntries } from "./descriptionMatchers";
import { updateFeatEntries } from "./resources/stateAdapter";
import { collectFeatDerivedState } from "./state";

export const inspiringMagicEffectId = "feat-arcane-artist-inspiring-magic";

export function isInspiringMagicSpell(spell: Partial<Pick<SpellEntry, "magicSchool">>) {
  return spell.magicSchool === MAGIC_SCHOOL.ILLUSION;
}

export function appendInspiringMagicSpellDescription(spell: SpellEntry): SpellEntry {
  if (!isInspiringMagicSpell(spell)) return spell;

  const description = filterDescriptionEntries(
    getFeatDefinition(FEATS.ARCANE_ARTIST)?.description ?? [],
    (entry) => entry.includes("<strong>Inspiring Magic.</strong>")
  );
  return description.length > 0
    ? appendSourcedDescriptionAddition(spell, getFeatLabel(FEATS.ARCANE_ARTIST), description)
    : spell;
}

function getInspiringMagicUsesRemaining(character: Character): number {
  const entries = collectFeatDerivedState(character).featsByFeat.get(FEATS.ARCANE_ARTIST);
  if (!entries?.length) return 0;
  return entries.some((entry) => entry.arcaneArtist?.inspiringMagicExpended) ? 0 : 1;
}

function spendInspiringMagic(character: Character): Character {
  if (getInspiringMagicUsesRemaining(character) === 0) return character;

  return updateFeatEntries(
    character,
    collectFeatDerivedState(character).normalizedFeats,
    (entry) =>
      entry.feat === FEATS.ARCANE_ARTIST
        ? { ...entry, arcaneArtist: { ...entry.arcaneArtist, inspiringMagicExpended: true } }
        : entry,
    true
  );
}

function restoreInspiringMagic(character: Character): Character {
  return updateFeatEntries(
    character,
    collectFeatDerivedState(character).normalizedFeats,
    (entry) =>
      entry.feat === FEATS.ARCANE_ARTIST && entry.arcaneArtist?.inspiringMagicExpended
        ? { ...entry, arcaneArtist: { ...entry.arcaneArtist, inspiringMagicExpended: undefined } }
        : entry
  );
}

export const inspiringMagicResource: CounterResourceTarget = {
  kind: "counter",
  id: inspiringMagicEffectId,
  label: "Inspiring Magic",
  total: (character) => Number(collectFeatDerivedState(character).featSet.has(FEATS.ARCANE_ARTIST)),
  remaining: getInspiringMagicUsesRemaining,
  spendOne: spendInspiringMagic,
  restoreOne: restoreInspiringMagic,
  restoreAll: restoreInspiringMagic
};
