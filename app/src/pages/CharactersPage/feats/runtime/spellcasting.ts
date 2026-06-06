import { FEATS, type SpellEntry } from "../../../../codex/entries";
import type { AbilityKey } from "../../../../types";
import type { SpellSourceMap } from "../../classFeatures/types";
import {
  emeraldEnclaveFledglingSpeakWithAnimalsSpellId
} from "./constants";
import { collectFeatDerivedState } from "./state";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

export function transformFeatSpellEntryForCharacter(
  character: FeatRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return transformFeatSpellEntry(collectFeatDerivedState(character), spell);
}

export function transformFeatSpellEntry(
  derivedState: FeatDerivedState,
  spell: SpellEntry
): SpellEntry {
  return derivedState.spellTransforms.reduce<SpellEntry>(
    (currentSpell, contribution) => contribution.transform(currentSpell),
    spell
  );
}

export function getFeatGrantedCantripEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).grantedCantripEntries;
}

export function getFeatAlwaysPreparedCantripEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).alwaysPreparedCantripEntries;
}

export function getFeatAlwaysPreparedSpellEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).alwaysPreparedSpellEntries;
}

export function getFeatAlwaysPreparedSpellSourceMapForCharacter(
  character: FeatRuntimeCharacter
): SpellSourceMap {
  return collectFeatDerivedState(character).alwaysPreparedSpellSourceMap;
}

export function getMagicInitiateSpellcastingAbilityForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  return collectFeatDerivedState(character).spellcastingAbilityBySpellId.get(spellId) ?? null;
}

export function canUseEmeraldEnclaveFledglingSpeakWithAnimalsForSpell(
  character: FeatRuntimeCharacter,
  spellId: string
): boolean {
  const derivedState = collectFeatDerivedState(character);

  return (
    spellId === emeraldEnclaveFledglingSpeakWithAnimalsSpellId &&
    derivedState.normalizedFeats.some(
      (entry) =>
        entry.feat === FEATS.EMERALD_ENCLAVE_FLEDGLING && Boolean(entry.emeraldEnclaveFledgling)
    )
  );
}

export function getMagicInitiateFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).magicInitiateFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getFeyTouchedFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).feyTouchedFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getShadowTouchedFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).shadowTouchedFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getTelepathicDetectThoughtsFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).telepathicDetectThoughtsFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getRitualCasterQuickRitualStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasRitualCaster || derivedState.ritualCasterQuickRitualTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.ritualCasterQuickRitualRemaining > 0,
    expended: derivedState.ritualCasterQuickRitualRemaining <= 0,
    usesRemaining: derivedState.ritualCasterQuickRitualRemaining,
    usesTotal: derivedState.ritualCasterQuickRitualTotal
  };
}
