import {
  activateFeatureActionForCharacter,
  getFeatureActionByKeyForCharacter
} from "../../src/pages/CharactersPage/classFeatures";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { getSheetSpellSlotTotals } from "../../src/pages/CharactersPage/multiclassSpellcasting";
import { characterFixture } from "../fixtures/character";
import { FEATS } from "../../src/codex/entries/enums";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import {
  consumeTelepathicDetectThoughtsFreeCastForCharacter,
  restoreTelepathicDetectThoughtsFreeCastForCharacter,
  spendMageSlayerGuardedMindForCharacter,
  restoreMageSlayerGuardedMindForCharacter
} from "../../src/pages/CharactersPage/feats/runtime/resources";
import { getMageSlayerGuardedMindStateForCharacter } from "../../src/pages/CharactersPage/feats/runtime/descriptionAdditions";
import { getTelepathicDetectThoughtsFreeCastStateForCharacter } from "../../src/pages/CharactersPage/feats/runtime/spellcasting";
import { describe, expect, it } from "vitest";
import {
  getMonkFocusPointsRemainingForCharacter,
  expendMonkFocusPointForCharacter,
  applyShortRestToFeatureState,
  getBarbarianRageUsesRemainingForCharacter,
  expendBarbarianRageUseForCharacter,
  applyLongRestToFeatureState
} from "../../src/pages/CharactersPage/classFeatures";
import {
  getFighterSecondWindUsesRemainingForCharacter,
  consumeFighterSecondWindUseForCharacter,
  restoreFighterSecondWindOnShortRestForCharacter,
  restoreFighterSecondWindOnLongRestForCharacter
} from "../../src/pages/CharactersPage/classFeatures/resources";
import {
  createShortRestOptions,
  createLongRestOptions
} from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/restOptions";

describe("spending and recovering class resources", () => {
  it("Focus cannot go below zero and a short rest restores the pool", () => {
    let monk = characterFixture({
      className: "Monk",
      subclassId: "monk-warrior-of-the-open-hand",
      level: 5,
      xp: 6500
    });
    expect(getMonkFocusPointsRemainingForCharacter(monk)).toBe(5);
    for (let i = 0; i < 8; i++) monk = expendMonkFocusPointForCharacter(monk);
    expect(getMonkFocusPointsRemainingForCharacter(monk)).toBe(0);
    expect(getMonkFocusPointsRemainingForCharacter(applyShortRestToFeatureState(monk))).toBe(5);
  });
  it("Second Wind restores one use on a short rest and all uses on a long rest", () => {
    let fighter = characterFixture();
    expect(getFighterSecondWindUsesRemainingForCharacter(fighter)).toBe(2);
    for (let i = 0; i < 3; i++) fighter = consumeFighterSecondWindUseForCharacter(fighter);
    expect(getFighterSecondWindUsesRemainingForCharacter(fighter)).toBe(0);
    expect(
      getFighterSecondWindUsesRemainingForCharacter(
        restoreFighterSecondWindOnShortRestForCharacter(fighter)
      )
    ).toBe(1);
    expect(
      getFighterSecondWindUsesRemainingForCharacter(
        restoreFighterSecondWindOnLongRestForCharacter(fighter)
      )
    ).toBe(2);
    expect(createShortRestOptions(fighter).some((o) => /Second Wind/i.test(o.label))).toBe(true);
    expect(createLongRestOptions(fighter).some((o) => /Second Wind/i.test(o.label))).toBe(true);
  });
  it("Rage spending preserves other fields and a long rest recovers the pool", () => {
    const barbarian = characterFixture({
      className: "Barbarian",
      subclassId: "barbarian-berserker"
    });
    expect(getBarbarianRageUsesRemainingForCharacter(barbarian)).toBe(3);
    const spent = expendBarbarianRageUseForCharacter(barbarian);
    expect(getBarbarianRageUsesRemainingForCharacter(spent)).toBe(2);
    expect(spent.currentHitPoints).toBe(barbarian.currentHitPoints);
    expect(getBarbarianRageUsesRemainingForCharacter(applyLongRestToFeatureState(spent))).toBe(3);
  });
});

describe("feat ability choices retain their spent resources across normalization and reload", () => {
  it("Mage Slayer stays exhausted after a second attempt and only recovers when restored", () => {
    const character = characterFixture({
      feats: [
        {
          id: "mage-slayer",
          feat: FEATS.MAGE_SLAYER,
          takenAtLevel: 4,
          source: { type: "manual" },
          mageSlayer: { ability: "STR" }
        }
      ]
    });
    const spent = spendMageSlayerGuardedMindForCharacter(character);
    const reloaded = normalizeCharacter(
      JSON.parse(JSON.stringify(createPortableCharacterSheet(spent)))
    )!;
    expect(getMageSlayerGuardedMindStateForCharacter(reloaded)?.available).toBe(false);
    expect(reloaded.feats?.[0].mageSlayer).toEqual({ ability: "STR", guardedMindExpended: true });
    expect(spendMageSlayerGuardedMindForCharacter(reloaded)).toBe(reloaded);
    const restored = restoreMageSlayerGuardedMindForCharacter(reloaded);
    expect(getMageSlayerGuardedMindStateForCharacter(restored)?.usesRemaining).toBe(1);
    expect(restored.feats?.[0].mageSlayer?.ability).toBe("STR");
  });

  it("Telepathic retains its spell grant while its free cast stays spent after reload", () => {
    const spellId = "spell-detect-thoughts";
    const character = characterFixture({
      feats: [
        {
          id: "telepathic",
          feat: FEATS.TELEPATHIC,
          takenAtLevel: 4,
          source: { type: "manual" },
          telepathic: { ability: "INT" }
        }
      ]
    });
    const spent = consumeTelepathicDetectThoughtsFreeCastForCharacter(character, spellId);
    const reloaded = normalizeCharacter(
      JSON.parse(JSON.stringify(createPortableCharacterSheet(spent)))
    )!;
    expect(getTelepathicDetectThoughtsFreeCastStateForCharacter(reloaded, spellId)).toMatchObject({
      available: false,
      usesRemaining: 0,
      usesTotal: 1
    });
    expect(reloaded.feats?.[0].telepathic).toEqual({
      ability: "INT",
      detectThoughtsExpended: true
    });
    expect(consumeTelepathicDetectThoughtsFreeCastForCharacter(reloaded, spellId)).toBe(reloaded);
    const restored = restoreTelepathicDetectThoughtsFreeCastForCharacter(reloaded);
    expect(
      getTelepathicDetectThoughtsFreeCastStateForCharacter(restored, spellId)?.usesRemaining
    ).toBe(1);
    expect(restored.feats?.[0].telepathic?.ability).toBe("INT");
  });
});

describe("Paladin timed activations through the sheet action dispatcher", () => {
  it.each([
    ["devotion", "holy-nimbus", "holyNimbusUsesExpended"],
    ["glory", "living-legend", "livingLegendUsesExpended"],
    ["the-ancients", "elder-champion", "elderChampionUsesExpended"],
    ["vengeance", "avenging-angel", "avengingAngelUsesExpended"],
    ["the-noble-genies", "noble-scion", "nobleScionUsesExpended"]
  ] as const)(
    "%s pays the ordinary use first, prevents repeated confirmation, and retains fallback payment after reload",
    (oath, feature, counter) => {
      const character = characterFixture({
        className: "Paladin",
        subclassId: `paladin-oath-of-${oath}`,
        level: 20,
        xp: 355000
      });
      const key = `paladin-${feature}`;
      const slots = character.spellSlotsExpended;
      const activated = activateFeatureActionForCharacter(character, key);
      expect(activated.classFeatureState?.paladin?.[counter]).toBe(1);
      expect(activated.spellSlotsExpended).toEqual(slots);
      expect(activated.statusEntries!.length).toBeGreaterThan(character.statusEntries?.length ?? 0);
      const activeStatus = activated.statusEntries!.at(-1)!;
      expect(activeStatus.duration).toBeDefined();
      expect(activateFeatureActionForCharacter(activated, key)).toEqual(activated);
      const reloaded = normalizeCharacter(JSON.parse(JSON.stringify(activated)))!;
      expect(reloaded.classFeatureState?.paladin?.[counter]).toBe(1);
      expect(reloaded.statusEntries).toEqual(activated.statusEntries);
      const inactive = {
        ...reloaded,
        statusEntries: reloaded.statusEntries!.filter((entry) => entry.id !== activeStatus.id)
      };
      expect(getFeatureActionByKeyForCharacter(inactive, key)?.disabled).not.toBe(true);
      const fallback = activateFeatureActionForCharacter(inactive, key);
      expect(fallback.classFeatureState?.paladin?.[counter]).toBe(1);
      expect(fallback.spellSlotsExpended?.[4]).toBe((inactive.spellSlotsExpended?.[4] ?? 0) + 1);
      const exhausted = { ...inactive, spellSlotsExpended: getSheetSpellSlotTotals(inactive) };
      expect(activateFeatureActionForCharacter(exhausted, key)).toEqual(exhausted);
      expect(getFeatureActionByKeyForCharacter(exhausted, key)?.disabled).toBe(true);
      expect(
        createLongRestOptions(exhausted).some((option) =>
          option.label.toLowerCase().includes(feature.replaceAll("-", " "))
        )
      ).toBe(true);
    }
  );
});
