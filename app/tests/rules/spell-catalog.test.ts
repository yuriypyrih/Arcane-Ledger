import { describe, expect, it } from "vitest";
import { getSpellEntryById, getSpellEntryByName } from "../../src/codex/spells";
import { getSpellEntries } from "../../src/codex/selectors";
import {
  getPreparedSpellSelectionOptionsForCharacter,
  normalizeSpellbookSpellIds,
  normalizeTrackedSpellIds,
  normalizePreparedSpellIds
} from "../../src/pages/CharactersPage/spellcasting";

import { getSpellSummonDefinitionConfig } from "../../src/pages/CharactersPage/spellSummons";

const removedSpellNames = [
  "Encode Thoughts",
  "On/Off",
  "Virtue",
  "Arcane Weapon",
  "Guiding Hand",
  "Healing Elixir",
  "Id Insinuation",
  "Infallible Relay",
  "Puppet",
  "Remote Access",
  "Sense Emotion",
  "Sudden Awakening",
  "Unearthly Chorus",
  "Wild Cunning",
  "Arcane Hacking",
  "Digital Phantom",
  "Find Vehicle",
  "Mental Barrier",
  "Mind Thrust",
  "Thought Shield",
  "Conjure Lesser Demon",
  "Haywire",
  "House of Cards",
  "Invisibility To Cameras",
  "Protection from Ballistics",
  "Psionic Blast",
  "Summon Warrior Spirit",
  "Conjure Barlgura",
  "Conjure Knowbot",
  "Conjure Shadow Demon",
  "Synchronicity",
  "System Backdoor",
  "Commune with City"
];

describe("spell catalog corrections", () => {
  it.each(removedSpellNames)("removes %s without consuming saved selection capacity", (name) => {
    const id = "spell-" + name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
    expect(getSpellEntryById(id)).toBeNull();
    expect(getSpellEntryByName(name)).toBeNull();
    expect(getSpellSummonDefinitionConfig(id)).toBeNull();
    const entries = getSpellEntries();
    expect(normalizePreparedSpellIds([id, "spell-cure-wounds"], entries, 1)).toEqual([
      "spell-cure-wounds"
    ]);
    expect(normalizeSpellbookSpellIds([id, "spell-shield"], entries)).toEqual(["spell-shield"]);
    expect(normalizeTrackedSpellIds([id, "spell-fire-bolt"], entries, 1)).toEqual([
      "spell-fire-bolt"
    ]);
    for (const className of [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]) {
      expect(
        getPreparedSpellSelectionOptionsForCharacter(className, 20).map((spell) => spell.id)
      ).not.toContain(id);
    }
  });

  it("preserves other demon summoning spells and their companion configuration", () => {
    for (const id of ["spell-summon-lesser-demons", "spell-summon-greater-demon"]) {
      expect(getSpellEntryById(id)).not.toBeNull();
      expect(getSpellSummonDefinitionConfig(id)).not.toBeNull();
    }
  });

  it("finds Bigby's Hand by name while preserving existing saved spell IDs", () => {
    const spell = getSpellEntryByName("Bigby's Hand");
    expect(spell).not.toBeNull();
    expect(getSpellEntryById("spell-arcane-hand")).toBe(spell);
    expect(getSpellEntries().filter((entry) => entry.name === "Bigby's Hand")).toHaveLength(1);
    expect(getSpellEntryByName("Arcane Hand")).toBeNull();
    expect(normalizePreparedSpellIds(["spell-arcane-hand"], getSpellEntries(), 1)).toEqual([
      "spell-arcane-hand"
    ]);
  });

  it("includes the four hand effects and their 2024 rules", () => {
    const description = getSpellEntryById("spell-arcane-hand")!.description.join(" ");
    for (const effect of ["Clenched Fist", "Forceful Hand", "Grasping Hand", "Interposing Hand"]) {
      expect(description).toContain(`<strong>${effect}.</strong>`);
    }
    for (const rule of [
      "5d8",
      "4d6",
      "Strength saving throw",
      "Dexterity saving throw",
      "spell save DC",
      "Half Cover",
      "Difficult Terrain",
      "2d8",
      "2d6"
    ]) {
      expect(description).toContain(rule);
    }
  });
});
