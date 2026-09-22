import { createChannelDivinityRestOptions } from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/channelDivinityRestOptions";
import { applyLifeAndDeathRelentlessRageRollResultForCharacter } from "../../src/pages/CharactersPage/classFeatures/lifeAndDeathLedger";
import { getPrimalBeastTemplate } from "../../src/pages/CharactersPage/companionPrimalBeasts";
import { getMonsterHitPoints } from "../../src/utils/monsters";
import {
  getGameplayClassContext,
  applyGameplayClassChange
} from "../../src/pages/CharactersPage/multiclassSpellcasting";
import {
  convertSpellSlotToSorceryPoints,
  createSpellSlotFromSorceryPoints
} from "../../src/pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import { describe, expect, it, vi } from "vitest";
import { multiclassFixture } from "../fixtures/multiclass";
import { characterFixture } from "../fixtures/character";
import { ELDRITCH_INVOCATION, FEATS, getSpellEntryById } from "../../src/codex/entries";
import { TOOL_PROFICIENCY } from "../../src/types";
import {
  applyClassEditorChange,
  getClassEditorCharacter,
  getSpellFeatureCharacter
} from "../../src/pages/CharactersPage/multiclass";
import {
  applyClassProgression,
  createMulticlassDraft,
  preservePreMulticlassCharacter
} from "../../src/pages/CharactersPage/multiclassProgression";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCustomClassConfig } from "../../src/pages/CharactersPage/customClass";
import { activateFeatureActionForCharacter } from "../../src/pages/CharactersPage/classFeatures";
import {
  getHitDicePools,
  getHitDiceTotalForCharacter,
  spendHitDice
} from "../../src/pages/CharactersPage/hitDice";
import {
  consumeWarlockLifedrinkerHitDie,
  setWarlockInvocationSelectionIds,
  getWarlockInvocationOptions
} from "../../src/pages/CharactersPage/classFeatures/warlock/warlock";
import { consumeWarlockFiendPatronHurlThroughHellUse } from "../../src/pages/CharactersPage/classFeatures/warlock/subclasses/warlockFiendPatron";
import {
  getSpellcastingClassView,
  setSlotPoolExpended
} from "../../src/pages/CharactersPage/multiclassSpellcasting";
import { isInnateSorceryActiveForSpell } from "../../src/pages/CharactersPage/classFeatures/sorcerer/innateSorcerySpell";
import { startRoundTrackerTurn } from "../../src/pages/CharactersPage/combat";
import {
  consumeSharedEconomyMultiForCharacterAction,
  getSharedEconomyMultiCountForCharacterAction
} from "../../src/pages/CharactersPage/classFeatures/economyMulti";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../src/pages/CharactersPage/actionEconomy";

const attack = {
  economyType: ECONOMY_TYPE.ACTION,
  actionCategory: ACTION_CATEGORY.ATTACK,
  attackKind: "weapon" as const
};

describe("multiclass resource ownership", () => {
  it("uses Barbarian level for Relentless Rage healing", () => {
    const character = multiclassFixture(
      [
        { className: "Wizard", level: 3 },
        { className: "Barbarian", level: 11 }
      ],
      { currentHitPoints: 0 }
    );
    const saved = applyLifeAndDeathRelentlessRageRollResultForCharacter(character, 20, 10);
    expect(saved.currentHitPoints).toBe(22);
  });
  it("sizes a secondary Ranger's Primal Beast by Ranger level", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 5 },
      { className: "Ranger", level: 3, subclassId: "ranger-beast-master" }
    ]);
    expect(getMonsterHitPoints(getPrimalBeastTemplate("land", character)!)).toBe(20);
  });
  it("Cleric and Paladin recover their own Channel Divinity independently at camp", () => {
    const character = multiclassFixture([
      { className: "Cleric", level: 3 },
      { className: "Paladin", level: 3 }
    ]);
    character.classFeatureState = {
      ...character.classFeatureState,
      cleric: { ...character.classFeatureState?.cleric, channelDivinityUsesExpended: 2 },
      paladin: { ...character.classFeatureState?.paladin, channelDivinityUsesExpended: 2 }
    };
    const options = createChannelDivinityRestOptions(character, "short");
    expect(options.map((option) => option.label)).toEqual([
      "Restore 1 Cleric Channel Divinity",
      "Restore 1 Paladin Channel Divinity"
    ]);
    const recovered = options[0].apply(character);
    expect(recovered.classFeatureState?.cleric?.channelDivinityUsesExpended).toBe(1);
    expect(recovered.classFeatureState?.paladin?.channelDivinityUsesExpended).toBe(2);
  });
  it("an action can turn a Pact slot into Sorcery Points while preserving shared slots and the starting class", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 1 },
      { className: "Sorcerer", level: 3 },
      { className: "Warlock", level: 3 }
    ]);
    character.classFeatureState = {
      ...character.classFeatureState,
      sorcerer: { ...character.classFeatureState?.sorcerer, sorceryPointsExpended: 3 }
    };
    const view = getGameplayClassContext(character, "class-1", "pact:class-2");
    expect(view.className).toBe("Sorcerer");
    const updated = applyGameplayClassChange(character, "class-1", "pact:class-2", (current) =>
      convertSpellSlotToSorceryPoints(current, 2)
    );
    expect(updated.className).toBe("Wizard");
    expect(updated.multiclass?.slotPoolsExpended?.["pact:class-2"]?.[1]).toBe(1);
    expect(updated.spellSlotsExpended).toEqual(character.spellSlotsExpended);
    expect(updated.classFeatureState?.sorcerer?.sorceryPointsExpended).toBe(1);
    const pact = getGameplayClassContext(updated, "class-1", "pact:class-2");
    expect(createSpellSlotFromSorceryPoints(pact, 2)).toBe(pact);
  });

  it("Hurl Through Hell spends its free use first, then Pact slots, even when Wizard is the starting class", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Warlock", level: 14, subclassId: "warlock-fiend-patron" }
    ]);
    const free = consumeWarlockFiendPatronHurlThroughHellUse(character);
    expect(free.classFeatureState?.warlock?.hurlThroughHellUsesExpended).toBe(1);
    expect(free.multiclass?.slotPoolsExpended?.["pact:class-1"]).toBeUndefined();
    const fallback = consumeWarlockFiendPatronHurlThroughHellUse(free);
    expect(fallback.multiclass?.slotPoolsExpended?.["pact:class-1"]?.[4]).toBe(1);
    expect(fallback.spellSlotsExpended).toEqual(character.spellSlotsExpended);
    const exhausted = setSlotPoolExpended(fallback, "pact:class-1", [0, 0, 0, 0, 3]);
    expect(consumeWarlockFiendPatronHurlThroughHellUse(exhausted)).toBe(exhausted);
  });
  it("Lifedrinker spends one available Hit Die and persists the correct mixed pool", () => {
    const base = multiclassFixture([
      { className: "Fighter", level: 1 },
      { className: "Warlock", level: 9 }
    ]);
    const character = applyClassEditorChange(base, "class-1", (view) => {
      const blade = getWarlockInvocationOptions(view, []).find(
        (option) =>
          option.invocation.id === ELDRITCH_INVOCATION.PACT_OF_THE_BLADE &&
          option.isQualified &&
          !option.isPlaceholder
      )!;
      return setWarlockInvocationSelectionIds(view, [
        blade.selectionId,
        ELDRITCH_INVOCATION.LIFEDRINKER
      ]);
    });
    const spent = consumeWarlockLifedrinkerHitDie(character);
    expect(getHitDicePools(spent)).toEqual([
      { die: "d10", total: 1, remaining: 0 },
      { die: "d8", total: 9, remaining: 9 }
    ]);
    const next = normalizeCharacter(
      createPortableCharacterSheet(consumeWarlockLifedrinkerHitDie(spent))
    )!;
    expect(getHitDicePools(next)[1].remaining).toBe(8);
    expect(
      getHitDiceTotalForCharacter(getClassEditorCharacter(next, next.multiclass!.classes[1]))
    ).toBe(10);
  });
  it("a class-scoped update retains a Hit Die spend", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Warlock", level: 3 }
    ]);
    const updated = applyClassEditorChange(character, "class-1", (view) =>
      spendHitDice(view, "d8", 1)
    );
    expect(getHitDicePools(updated)[1].remaining).toBe(2);
  });
  it("lowering Barbarian below Reckless Attack removes the existing owned effect", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 3 },
      { className: "Barbarian", level: 2 }
    ]);
    const active = activateFeatureActionForCharacter(character, "barbarian-reckless-attack");
    expect(active.statusEntries!.some((entry) => entry.sourceClassLevel === 2)).toBe(true);
    const draft = createMulticlassDraft(active);
    draft.classes[1].level = 1;
    expect(
      applyClassProgression(active, draft).statusEntries!.some(
        (entry) => entry.sourceId === "feature-barbarian-reckless-attack"
      )
    ).toBe(false);
  });
  it("removing a class removes its invocation-granted feat without deleting a manual feat", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 3 },
      { className: "Warlock", level: 3 }
    ]);
    character.feats = [
      { id: "manual", feat: FEATS.ALERT, takenAtLevel: 1, source: { type: "manual" } },
      {
        id: "invocation",
        feat: FEATS.TOUGH,
        takenAtLevel: 3,
        source: {
          type: "eldritch-invocation",
          classEntryId: "class-1",
          invocation: ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES,
          selectionId: "lesson"
        }
      }
    ];
    const draft = createMulticlassDraft(character);
    draft.classes.pop();
    expect(applyClassProgression(character, draft).feats?.map((entry) => entry.id)).toEqual([
      "manual"
    ]);
  });
  it("custom classes retain independent extra-attack counters without stacking attacks", () => {
    const custom = (id: string, count: number) =>
      normalizeCustomClassConfig({
        id,
        name: id,
        mechanics: { extraAttacks: { enabled: true, count } }
      });
    let character = multiclassFixture([
      { className: "Fighter", level: 1 },
      { className: "Custom", level: 5, customClass: custom("Duelist", 1) },
      { className: "Custom", level: 5, customClass: custom("Champion", 2) }
    ]);
    character = { ...character, roundTracker: startRoundTrackerTurn() };
    character = consumeSharedEconomyMultiForCharacterAction(character, attack);
    expect(getSharedEconomyMultiCountForCharacterAction(character, attack)).toBe(2);
    character = consumeSharedEconomyMultiForCharacterAction(character, attack);
    expect(getSharedEconomyMultiCountForCharacterAction(character, attack)).toBe(1);
    character = normalizeCharacter(createPortableCharacterSheet(character))!;
    expect(
      character.multiclass!.classes[1].customFeatureState?.customClass
        ?.extraAttacksRemainingThisTurn
    ).toBe(0);
    expect(
      character.multiclass!.classes[2].customFeatureState?.customClass
        ?.extraAttacksRemainingThisTurn
    ).toBe(1);
    expect(
      getSharedEconomyMultiCountForCharacterAction(
        consumeSharedEconomyMultiForCharacterAction(character, attack),
        attack
      )
    ).toBe(0);
  });
  it("Innate Sorcery applies only to the Sorcerer source when two classes know the same spell", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Sorcerer", level: 3 }
    ]);
    const active = activateFeatureActionForCharacter(character, "sorcerer-innate-sorcery");
    const spell = getSpellEntryById("spell-fire-bolt")!;
    const wizard = getSpellcastingClassView(active, active.multiclass!.startingClassId, "standard");
    const sorcerer = getSpellcastingClassView(active, "class-1", "standard");
    expect(isInnateSorceryActiveForSpell(wizard, spell)).toBe(false);
    expect(isInnateSorceryActiveForSpell(sorcerer, spell)).toBe(true);
    expect(
      isInnateSorceryActiveForSpell(
        getClassEditorCharacter(getSpellFeatureCharacter(wizard), active.multiclass!.classes[1]),
        spell
      )
    ).toBe(false);
  });
});

describe("multiclass migration and editor validation", () => {
  it("new classes start with empty class choices instead of inheriting the starting class's spellbook and custom rules", () => {
    const legacy = characterFixture({
      className: "Wizard",
      level: 3,
      subclassId: "wizard-evoker",
      spellbookSpellIds: ["spell-shield"],
      preparedSpellIds: ["spell-shield"]
    });
    const draft = createMulticlassDraft(legacy);
    draft.prerequisiteOverride = true;
    draft.classes.push({ id: "cleric", className: "Cleric", level: 3 });
    const converted = applyClassProgression(legacy, draft);
    expect(converted.multiclass!.classes[0].spellbookSpellIds).toContain("spell-shield");
    expect(converted.multiclass!.classes[1].spellbookSpellIds).toEqual([]);
    expect(converted.multiclass!.classes[1].preparedSpellIds).toEqual([]);
    expect(converted.multiclass!.classes[1].subclassId).not.toBe("wizard-evoker");
  });

  it("rejects a raw HP roll larger than that class's Hit Die", () => {
    const character = characterFixture({ className: "Wizard", level: 2 });
    const draft = createMulticlassDraft(character);
    draft.classes[0].hitPointRolls = [null, 7];
    expect(() => applyClassProgression(character, draft)).toThrow(/between 1 and 6/);
  });
  it.each(["full", "half", "third", "pact"])(
    "normalizes %s custom casting as enabled without requiring a second hidden setting",
    (castingProgression) => {
      expect(
        normalizeCustomClassConfig({ castingProgression }).mechanics.spellcasting.enabled
      ).toBe(true);
      expect(
        normalizeCustomClassConfig({
          castingProgression: "none",
          mechanics: { spellcasting: { enabled: true } }
        }).mechanics.spellcasting.enabled
      ).toBe(false);
    }
  );
  it("adds only the chosen Bard multiclass skill and instrument and retains them after reload", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      {
        className: "Bard",
        level: 1,
        skillChoices: ["Performance"],
        toolChoices: [TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE]
      }
    ]);
    const reloaded = normalizeCharacter(createPortableCharacterSheet(character))!;
    expect(
      reloaded.toolProficiencies.some(
        (entry) =>
          entry.proficiency === TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE &&
          entry.sourceStr === "Bard (multiclass)"
      )
    ).toBe(true);
    expect(
      reloaded.skillProficiencies.some((entry) => entry.sourceStr === "Bard (multiclass)")
    ).toBe(true);
  });
  it("does not overwrite the original backup and reports storage quota failure", () => {
    const character = characterFixture();
    const key = `arcane-ledger.pre-multiclass.${character.id}`;
    localStorage.removeItem(key);
    preservePreMulticlassCharacter(character);
    const backup = localStorage.getItem(key);
    preservePreMulticlassCharacter({ ...character, currentHitPoints: 1 });
    expect(localStorage.getItem(key)).toBe(backup);
    localStorage.removeItem(key);
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    try {
      expect(() => preservePreMulticlassCharacter(character)).toThrow();
    } finally {
      write.mockRestore();
    }
  });
});
