import { sorcererFeatureMap } from "../../../../codex/classes";
import {
  CLASS_FEATURE,
  SPELL_LIST_CLASS,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../actionModalDescriptions";
import { hasActiveInnateSorcery } from "./sorcerer";

type InnateSorcerySpellCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId" | "statusEntries" | "classFeatureState" | "feats">>;

type InnateSorcerySpellCandidate = Pick<
  SpellEntry,
  "isAttackSpell" | "isSavingThrowSpell" | "spellLists"
>;

function getInnateSorceryDescription(): SpellDescriptionEntry[] {
  return (sorcererFeatureMap[CLASS_FEATURE.INNATE_SORCERY]?.description ?? []).filter(
    (entry) => typeof entry === "string"
  );
}

export function isInnateSorcerySpellCandidate(spell: InnateSorcerySpellCandidate): boolean {
  return (
    spell.spellLists.includes(SPELL_LIST_CLASS.SORCERER) &&
    (spell.isSavingThrowSpell === true || spell.isAttackSpell === true)
  );
}

export function isInnateSorceryActiveForSpell(
  character: InnateSorcerySpellCharacter,
  spell: InnateSorcerySpellCandidate
): boolean {
  return hasActiveInnateSorcery(character) && isInnateSorcerySpellCandidate(spell);
}

export function getSorcererSpellEntry(
  character: InnateSorcerySpellCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!isInnateSorceryActiveForSpell(character, spell)) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.INNATE_SORCERY,
    getInnateSorceryDescription(),
    "Innate Sorcery"
  );
}
