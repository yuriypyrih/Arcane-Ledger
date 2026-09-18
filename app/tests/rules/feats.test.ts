import { getFeatDefinition } from "../../src/pages/CharactersPage/feats";
import { getFeatEligibilityForCharacter } from "../../src/pages/CharactersPage/feats/eligibility";
import {
  getFeatAlwaysPreparedSpellEntriesForCharacter,
  getFeatGrantedCantripEntriesForCharacter,
  getFeatSpellcastingAbilityForCharacter,
  getMagicInitiateFreeCastStateForCharacter
} from "../../src/pages/CharactersPage/feats/runtime/spellcasting";
import {
  consumeMagicInitiateFreeCastForCharacter,
  restoreMagicInitiateFreeCastsForCharacter
} from "../../src/pages/CharactersPage/feats/runtime/resources";
import { magicInitiateFeat } from "../fixtures/feats";
import { characterFixture } from "../fixtures/character";
import { describe, expect, it } from "vitest";
import { FEATS } from "../../src/codex/entries/enums";
import { getAbilityScoreForCharacter } from "../../src/pages/CharactersPage/abilities";
import { getEffectiveHitPointMaximumForCharacter } from "../../src/pages/CharactersPage/traits";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";

describe("feat choices alter derived character stats", () => {
  it("Tough adds two maximum HP per level and removing it removes the bonus", () => {
    const base = characterFixture();
    const tough = characterFixture({
      feats: [{ id: "tough", feat: FEATS.TOUGH, takenAtLevel: 1, source: { type: "manual" } }]
    });
    expect(getEffectiveHitPointMaximumForCharacter(tough)).toBe(
      getEffectiveHitPointMaximumForCharacter(base) + 6
    );
    expect(getEffectiveHitPointMaximumForCharacter({ ...tough, feats: [] })).toBe(
      getEffectiveHitPointMaximumForCharacter(base)
    );
  });
  it("a split ability improvement affects both scores and survives save/load", () => {
    const character = characterFixture({
      level: 4,
      xp: 2700,
      feats: [
        {
          id: "asi",
          feat: FEATS.ABILITY_SCORE_IMPROVEMENT,
          takenAtLevel: 4,
          source: { type: "manual" },
          abilityScoreImprovement: { mode: "split", primaryAbility: "STR", secondaryAbility: "DEX" }
        }
      ]
    });
    const restored = normalizeCharacter(createPortableCharacterSheet(character))!;
    expect(getAbilityScoreForCharacter(restored, "STR")).toBe(17);
    expect(getAbilityScoreForCharacter(restored, "DEX")).toBe(15);
    expect(restored.abilities.STR).toBe(16); // The saved base score must not absorb the derived bonus.
  });
  it("ordinary ability improvements cannot raise a score above 20", () => {
    const character = characterFixture({
      level: 4,
      xp: 2700,
      abilities: { STR: 19, DEX: 14, CON: 14, INT: 16, WIS: 12, CHA: 10 },
      feats: [
        {
          id: "asi",
          feat: FEATS.ABILITY_SCORE_IMPROVEMENT,
          takenAtLevel: 4,
          source: { type: "manual" },
          abilityScoreImprovement: { mode: "single", primaryAbility: "STR" }
        }
      ]
    });
    expect(getAbilityScoreForCharacter(character, "STR")).toBe(20);
  });
});

describe("feat prerequisites and spell grants", () => {
  it.each([
    ["Fighter", 3, false],
    ["Fighter", 4, true]
  ] as const)("Skill Expert eligibility for %s level %i is %s", (className, level, eligible) => {
    const character = characterFixture({ className, level, xp: 0 });
    expect(
      getFeatEligibilityForCharacter(character, getFeatDefinition(FEATS.SKILL_EXPERT)!).isEligible
    ).toBe(eligible);
  });
  it.each([
    ["Fighter", "fighter-champion", false],
    ["Wizard", "wizard-evoker", true],
    ["Fighter", "fighter-eldritch-knight", true]
  ] as const)("War Caster requires spellcasting for %s / %s", (className, subclassId, eligible) => {
    const character = characterFixture({ className, subclassId, level: 4, xp: 2700 });
    expect(
      getFeatEligibilityForCharacter(character, getFeatDefinition(FEATS.WAR_CASTER)!).isEligible
    ).toBe(eligible);
  });
  it("Magic Initiate grants unique spells with the chosen ability without using manual preparation", () => {
    const character = characterFixture({ feats: [magicInitiateFeat()] });
    expect(getFeatAlwaysPreparedSpellEntriesForCharacter(character).map((s) => s.id)).toEqual([
      "spell-shield"
    ]);
    expect(
      getFeatGrantedCantripEntriesForCharacter(character)
        .map((s) => s.id)
        .sort()
    ).toEqual(["spell-fire-bolt", "spell-mage-hand"]);
    expect(getFeatSpellcastingAbilityForCharacter(character, "spell-shield")).toBe("INT");
    expect(character.preparedSpellIds).toEqual([]);
    expect(getFeatAlwaysPreparedSpellEntriesForCharacter({ ...character, feats: [] })).toEqual([]);
  });
  it("spends a Magic Initiate free cast once, persists exhaustion, and restores it", () => {
    const character = characterFixture({ feats: [magicInitiateFeat()] });
    expect(consumeMagicInitiateFreeCastForCharacter(character, "spell-bless")).toBe(character);
    const spent = consumeMagicInitiateFreeCastForCharacter(character, "spell-shield");
    expect(getMagicInitiateFreeCastStateForCharacter(spent, "spell-shield")).toMatchObject({
      available: false,
      usesRemaining: 0,
      usesTotal: 1
    });
    expect(consumeMagicInitiateFreeCastForCharacter(spent, "spell-shield")).toBe(spent);
    expect(spent.spellSlotsExpended).toEqual(character.spellSlotsExpended);
    const restored = normalizeCharacter(createPortableCharacterSheet(spent))!;
    expect(getMagicInitiateFreeCastStateForCharacter(restored, "spell-shield")?.available).toBe(
      false
    );
    expect(
      getMagicInitiateFreeCastStateForCharacter(
        restoreMagicInitiateFreeCastsForCharacter(restored),
        "spell-shield"
      )?.usesRemaining
    ).toBe(1);
    expect(getMagicInitiateFreeCastStateForCharacter(character, "spell-shield")?.available).toBe(
      true
    );
  });
});
