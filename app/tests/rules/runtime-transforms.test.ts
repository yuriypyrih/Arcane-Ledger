import { getWeaponActionsForCharacter } from "../../src/pages/CharactersPage/gameplay";
import { getWeaponActionDrawerDescriptionAdditions } from "../../src/pages/CharactersPage/weaponActionDrawerDescriptions";
import { getWeaponEntries } from "../../src/codex/selectors";
import { describe, expect, it } from "vitest";
import { FEATS, DAMAGE_TYPE } from "../../src/codex/entries/enums";
import { getSpellEntryById } from "../../src/codex/selectors";
import { getCharacterRuntime } from "../../src/pages/CharactersPage/characterRuntime/characterRuntime";
import {
  getSpellEntryForCharacter,
  getSpellbookSpellEntryForCharacter
} from "../../src/pages/CharactersPage/classFeatures";
import { characterFixture } from "../fixtures/character";
import { multiclassFixture } from "../fixtures/multiclass";

describe("character spell projections and sourced descriptions", () => {
  it("retains class and feat injection without mutating the codex or leaking removed benefits", () => {
    const spell = getSpellEntryById("spell-fireball")!;
    const original = structuredClone(spell);
    const character = characterFixture({
      className: "Wizard",
      subclassId: "wizard-evoker",
      level: 10,
      xp: 64000,
      feats: [
        {
          id: "war-caster",
          feat: FEATS.WAR_CASTER,
          takenAtLevel: 4,
          source: { type: "manual" },
          warCaster: { ability: "INT" }
        }
      ]
    });
    const projected =
      getCharacterRuntime(character).spellEntryTransformer.transformSpellbookSpellEntry(spell);
    expect(projected).toEqual(getSpellbookSpellEntryForCharacter(character, spell));
    expect(getCharacterRuntime(character).spellEntryTransformer.transformSpellEntry(spell)).toEqual(
      getSpellEntryForCharacter(character, spell)
    );
    const additions = JSON.stringify(projected.descriptionAdditions);
    expect(additions).toContain("Sculpt Spells");
    expect(additions).toContain("War Caster: Somatic Components");
    expect(
      getCharacterRuntime(character).spellEntryTransformer.transformSpellbookSpellEntry(projected)
        .descriptionAdditions
    ).toEqual(projected.descriptionAdditions);
    const withoutFeat = getCharacterRuntime({
      ...character,
      feats: []
    }).spellEntryTransformer.transformSpellbookSpellEntry(spell);
    expect(JSON.stringify(withoutFeat.descriptionAdditions)).not.toContain("War Caster");
    expect(JSON.stringify(withoutFeat.descriptionAdditions)).toContain("Sculpt Spells");
    expect(spell).toEqual(original);
  });

  it("a secondary Wizard has the same spellbook benefits through public and snapshot paths", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 2 },
      { className: "Wizard", level: 10, subclassId: "wizard-evoker" }
    ]);
    const spell = getSpellEntryById("spell-fireball")!;
    const publicEntry = getSpellbookSpellEntryForCharacter(character, spell);
    expect(JSON.stringify(publicEntry.descriptionAdditions)).toContain("Sculpt Spells");
    expect(
      getCharacterRuntime(character).spellEntryTransformer.transformSpellbookSpellEntry(spell)
    ).toEqual(publicEntry);
  });

  it("custom spells sharing an ID keep distinct descriptions and damage", () => {
    const character = characterFixture({ className: "Wizard", subclassId: "wizard-evoker" });
    const spell = getSpellEntryById("spell-fireball")!;
    const custom: typeof spell = {
      ...spell,
      name: "Custom fireball",
      description: ["Custom reference"],
      damage: [[42, DAMAGE_TYPE.COLD]]
    };
    const transformer = getCharacterRuntime(character).spellEntryTransformer;
    expect(transformer.transformSpellEntry(custom).description).toEqual(["Custom reference"]);
    expect(transformer.transformSpellEntry(spell).description).toEqual(spell.description);
    expect(transformer.transformSpellEntry(custom).name).toBe("Custom fireball");
    expect(transformer.transformSpellEntry(custom).damage).toEqual([[42, DAMAGE_TYPE.COLD]]);
    expect(transformer.transformSpellEntry(spell).damage).toEqual(spell.damage);
  });
});

it("weapon drawers preserve ordered class and feat references, and discard removed benefits", () => {
  const base = getWeaponEntries().find((entry) => entry.name === "Greatsword")!;
  const original = structuredClone(base);
  const character = characterFixture({
    level: 6,
    xp: 14000,
    equipment: [{ name: "Greatsword", onHand: true, worn: false }],
    feats: [
      {
        id: "slasher",
        feat: FEATS.SLASHER,
        takenAtLevel: 4,
        source: { type: "manual" },
        slasher: { ability: "STR" }
      },
      { id: "gwm", feat: FEATS.GREAT_WEAPON_MASTER, takenAtLevel: 6, source: { type: "manual" } }
    ]
  });
  const action = getWeaponActionsForCharacter(character).find(
    (action) => action.name === "Greatsword"
  )!;
  const additions = getWeaponActionDrawerDescriptionAdditions(character, action);
  const text = JSON.stringify(additions);
  expect(text).toContain("Extra Attack");
  expect(text).toContain("Slasher");
  expect(text).toContain("Great Weapon Master");
  expect(text.indexOf("Slasher")).toBeLessThan(text.indexOf("Great Weapon Master"));
  expect(new Set(additions.map((section) => JSON.stringify(section))).size).toBe(additions.length);
  expect(getWeaponActionDrawerDescriptionAdditions(character, action)).toEqual(additions);
  const removed = { ...character, feats: [] };
  const removedAction = getWeaponActionsForCharacter(removed).find(
    (action) => action.name === "Greatsword"
  )!;
  const withoutFeats = JSON.stringify(
    getWeaponActionDrawerDescriptionAdditions(removed, removedAction)
  );
  expect(withoutFeats).not.toContain("Slasher");
  expect(withoutFeats).not.toContain("Great Weapon Master");
  expect(withoutFeats).toContain("Extra Attack");
  expect(base).toEqual(original);
});
