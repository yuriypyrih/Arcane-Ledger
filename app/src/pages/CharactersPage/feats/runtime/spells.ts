import {
  FEATS,
  SPELL_LIST_CLASS,
  getSpellEntryById,
  type SpellEntry
} from "../../../../codex/entries";
import { getSpellEntriesForSpellListClass } from "../../../../codex/classes/spellAccess";
import type { CharacterFeatEntry, MagicInitiateChoice } from "../../../../types";
import {
  emeraldEnclaveFledglingSpeakWithAnimalsSpellId,
  feyTouchedMistyStepSpellId,
  shadowTouchedInvisibilitySpellId,
  telekineticMageHandSpellId,
  telepathicDetectThoughtsSpellId
} from "./constants";

const blessedWarriorCantripOptionsById = new Map(
  getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.CLERIC)
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => [spell.id, spell] as const)
);

const druidicWarriorCantripOptionsById = new Map(
  getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.DRUID)
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => [spell.id, spell] as const)
);

const magicInitiateSpellLists = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
] as const;

const magicInitiateCantripOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellLists.map((spellList) => [
    spellList,
    new Map(
      getSpellEntriesForSpellListClass(spellList)
        .filter((spell) => spell.spellLevel === 0)
        .map((spell) => [spell.id, spell] as const)
    )
  ])
);

const magicInitiateLevelOneSpellOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellLists.map((spellList) => [
    spellList,
    new Map(
      getSpellEntriesForSpellListClass(spellList)
        .filter((spell) => spell.spellLevel === 1)
        .map((spell) => [spell.id, spell] as const)
    )
  ])
);

export function getFeatCantripEntries(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat === FEATS.BLESSED_WARRIOR && entry.blessedWarrior) {
    return entry.blessedWarrior.cantripIds.flatMap((cantripId) => {
      const cantrip = blessedWarriorCantripOptionsById.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  if (entry.feat === FEATS.DRUIDIC_WARRIOR && entry.druidicWarrior) {
    return entry.druidicWarrior.cantripIds.flatMap((cantripId) => {
      const cantrip = druidicWarriorCantripOptionsById.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  if (entry.feat === FEATS.MAGIC_INITIATE && entry.magicInitiate) {
    const cantripOptionsById = magicInitiateCantripOptionsBySpellListAndId.get(
      entry.magicInitiate.spellList
    );

    return entry.magicInitiate.cantripIds.flatMap((cantripId) => {
      const cantrip = cantripOptionsById?.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  return [];
}

export function getMagicInitiateLevelOneSpellEntry(
  entry: CharacterFeatEntry
): SpellEntry | null {
  if (entry.feat !== FEATS.MAGIC_INITIATE || !entry.magicInitiate) {
    return null;
  }

  return (
    magicInitiateLevelOneSpellOptionsBySpellListAndId
      .get(entry.magicInitiate.spellList)
      ?.get(entry.magicInitiate.levelOneSpellId) ?? null
  );
}

export function getEmeraldEnclaveFledglingSpellEntry(
  entry: CharacterFeatEntry
): SpellEntry | null {
  if (entry.feat !== FEATS.EMERALD_ENCLAVE_FLEDGLING || !entry.emeraldEnclaveFledgling) {
    return null;
  }

  return getSpellEntryById(emeraldEnclaveFledglingSpeakWithAnimalsSpellId);
}

export function getFeyTouchedSpellEntries(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat !== FEATS.FEY_TOUCHED || !entry.feyTouched) {
    return [];
  }

  return [entry.feyTouched.spellId, feyTouchedMistyStepSpellId].flatMap((spellId) => {
    const spell = getSpellEntryById(spellId);

    return spell ? [spell] : [];
  });
}

export function getRitualCasterSpellEntries(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat !== FEATS.RITUAL_CASTER || !entry.ritualCaster) {
    return [];
  }

  return entry.ritualCaster.spellIds.flatMap((spellId) => {
    const spell = getSpellEntryById(spellId);

    return spell && spell.spellLevel === 1 && spell.ritual === true ? [spell] : [];
  });
}

export function getShadowTouchedSpellEntries(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat !== FEATS.SHADOW_TOUCHED || !entry.shadowTouched) {
    return [];
  }

  return [entry.shadowTouched.spellId, shadowTouchedInvisibilitySpellId].flatMap((spellId) => {
    const spell = getSpellEntryById(spellId);

    return spell ? [spell] : [];
  });
}

export function getTelekineticMageHandSpellEntry(
  entry: CharacterFeatEntry
): SpellEntry | null {
  if (entry.feat !== FEATS.TELEKINETIC || !entry.telekinetic) {
    return null;
  }

  return getSpellEntryById(telekineticMageHandSpellId);
}

export function getTelepathicDetectThoughtsSpellEntry(
  entry: CharacterFeatEntry
): SpellEntry | null {
  if (entry.feat !== FEATS.TELEPATHIC || !entry.telepathic) {
    return null;
  }

  return getSpellEntryById(telepathicDetectThoughtsSpellId);
}
