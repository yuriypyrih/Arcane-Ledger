import { describe, expect, it } from "vitest";
import { createEmptyCharacter } from "../../src/pages/CharactersPage/constants";
import {
  applyProfileClassProgression,
  getProfileClassProgression
} from "../../src/pages/CharactersPage/characterProfileMulticlass";
import { getCharacterSpellSlotPools } from "../../src/pages/CharactersPage/multiclassSpellcasting";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import type { CharacterDraft } from "../../src/types";

function builderDraft(): CharacterDraft {
  const draft: CharacterDraft = {
    ...createEmptyCharacter(),
    name: "Creation test",
    className: "Wizard",
    level: 3,
    xp: 900,
    species: "Human",
    abilities: { STR: 14, DEX: 14, CON: 14, INT: 16, WIS: 14, CHA: 14 },
    maxHitPointsMode: "automatic"
  };
  const state = getProfileClassProgression(draft);
  draft.multiclass = {
    ...state,
    classes: [...state.classes, { id: "cleric", className: "Cleric", level: 2 }]
  };
  draft.level = 5;
  draft.xp = 6500;
  return draft;
}

describe("multiclass profile editing", () => {
  it("preserves the saved split when the profile Level field contains the total", () => {
    const result = applyProfileClassProgression(builderDraft());
    expect(result.level).toBe(5);
    expect(result.xp).toBe(6500);
    expect(result.multiclass?.classes.map((entry) => entry.level)).toEqual([3, 2]);
    expect(result.multiclass?.hitPointsAdjustment).toBe(0);
    expect(result.hitPoints).toBe(34); // Wizard 8 + 6 + 6, Cleric 7 + 7.
    expect(result.currentHitPoints).toBe(34);
    const loaded = normalizeCharacter({ ...result, id: 321 })!;
    expect(createPortableCharacterSheet(loaded).schemaVersion).toBe(3);
    expect(getCharacterSpellSlotPools(loaded)[0].totals.slice(0, 3)).toEqual([4, 3, 2]);
  });
  it("updates starting-class choices without assigning the total level to that class", () => {
    const draft = builderDraft();
    draft.level = 5;
    draft.subclassId = "wizard-abjurer";
    draft.spellbookSpellIds = ["spell-mage-armor"];
    const state = getProfileClassProgression(draft);
    expect(state.classes[0]).toMatchObject({
      level: 3,
      subclassId: "wizard-abjurer",
      spellbookSpellIds: ["spell-mage-armor"]
    });
    expect(state.classes[1].level).toBe(2);
  });
  it("allows multiclass profile editing below the usual ability prerequisites without an override", () => {
    const draft = builderDraft();
    draft.abilities.WIS = 8;
    expect(applyProfileClassProgression(draft).level).toBe(5);
  });
  it("does not silently drop an unfinished class row", () => {
    const draft = builderDraft();
    draft.multiclass!.classes[1].className = "";
    expect(() => applyProfileClassProgression(draft)).toThrow(
      "Every progression entry must have a class"
    );
  });
  it("preserves manual HP and does not convert a single-class draft", () => {
    const single = createEmptyCharacter();
    expect(applyProfileClassProgression(single)).toBe(single);
    const draft = builderDraft();
    draft.maxHitPointsMode = "custom";
    draft.hitPoints = 41;
    expect(applyProfileClassProgression(draft).currentHitPoints).toBe(41);
  });
  it("editing an existing split preserves XP, wounds, and the secondary class's slot usage", () => {
    const draft = builderDraft();
    draft.multiclass!.classes[1] = { id: "warlock", className: "Warlock", level: 2 };
    const created = applyProfileClassProgression(draft);
    const previous = created.multiclass!;
    previous.slotPoolsExpended = { "pact:warlock": [1] };
    const editing = { ...created, level: 5, xp: 7000, currentHitPoints: 12 };
    const saved = applyProfileClassProgression(editing, { isEditing: true, previous });
    expect(saved.level).toBe(5);
    expect(saved.xp).toBe(7000);
    expect(saved.currentHitPoints).toBe(12);
    expect(saved.multiclass?.slotPoolsExpended?.["pact:warlock"]?.[0]).toBe(1);
  });
});
