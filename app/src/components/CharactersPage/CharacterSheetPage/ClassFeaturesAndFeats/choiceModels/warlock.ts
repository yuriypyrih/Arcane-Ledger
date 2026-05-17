import { DAMAGE_TYPE, type SpellEntry } from "../../../../../codex/entries";
import {
  getWarlockFiendishResilienceDamageTypeSelectionForCharacter,
  getWarlockMysticArcanumSpellIdForCharacter,
  getWarlockMysticArcanumSpellOptionsForCharacter,
  setWarlockFiendishResilienceDamageTypeSelectionForCharacter,
  setWarlockMysticArcanumSpellIdForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import type { ClassFeatureChoiceModelArgs } from "./shared";

export function createWarlockFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function getWarlockFiendishResilienceDamageTypeSelection(): DAMAGE_TYPE | null {
    return getWarlockFiendishResilienceDamageTypeSelectionForCharacter(character);
  }

  function updateWarlockFiendishResilienceDamageTypeSelection(choice: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setWarlockFiendishResilienceDamageTypeSelectionForCharacter(currentCharacter, choice)
    );
  }

  function isWarlockFiendishResilienceInputRequired(): boolean {
    return getWarlockFiendishResilienceDamageTypeSelection() === null;
  }

  function getWarlockMysticArcanumSpellLevel(level: number): 6 | 7 | 8 | 9 | null {
    if (level === 11) {
      return 6;
    }

    if (level === 13) {
      return 7;
    }

    if (level === 15) {
      return 8;
    }

    if (level === 17) {
      return 9;
    }

    return null;
  }

  function getWarlockMysticArcanumSelection(level: number): string {
    const spellLevel = getWarlockMysticArcanumSpellLevel(level);
    return spellLevel
      ? (getWarlockMysticArcanumSpellIdForCharacter(character, spellLevel) ?? "")
      : "";
  }

  function getAvailableWarlockMysticArcanumSpells(level: number): SpellEntry[] {
    const spellLevel = getWarlockMysticArcanumSpellLevel(level);
    return spellLevel ? getWarlockMysticArcanumSpellOptionsForCharacter(character, spellLevel) : [];
  }

  function updateWarlockMysticArcanumSelection(level: number, nextValue: string) {
    const spellLevel = getWarlockMysticArcanumSpellLevel(level);

    if (!spellLevel) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      setWarlockMysticArcanumSpellIdForCharacter(
        currentCharacter,
        spellLevel,
        nextValue.trim().length > 0 ? nextValue : null
      )
    );
  }

  function isWarlockMysticArcanumInputRequired(level: number): boolean {
    return getWarlockMysticArcanumSelection(level).trim().length <= 0;
  }

  return {
    getAvailableWarlockMysticArcanumSpells,
    getWarlockFiendishResilienceDamageTypeSelection,
    getWarlockMysticArcanumSelection,
    getWarlockMysticArcanumSpellLevel,
    isWarlockFiendishResilienceInputRequired,
    isWarlockMysticArcanumInputRequired,
    updateWarlockFiendishResilienceDamageTypeSelection,
    updateWarlockMysticArcanumSelection
  };
}
