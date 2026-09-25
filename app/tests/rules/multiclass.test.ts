import { multiclassFixture } from "../fixtures/multiclass";
import { getSpellEntryById, CLASS_FEATURE, FEATS } from "../../src/codex/entries";
import { scaleCantripForCharacter } from "../../src/pages/CharactersPage/characterRuntime/spellImplementations/cantripScaling";
import { getEffectiveHitPointMaximumForCharacter } from "../../src/pages/CharactersPage/traits";
import { getArmorClassForCharacter } from "../../src/pages/CharactersPage/armor";
import { startRoundTrackerTurn } from "../../src/pages/CharactersPage/combat";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../src/pages/CharactersPage/actionEconomy";
import {
  consumeSharedEconomyMultiForCharacterAction,
  getSharedEconomyMultiCountForCharacterAction
} from "../../src/pages/CharactersPage/classFeatures/economyMulti";
import {
  applySpellcastingClassChange,
  getSpellcastingClassView
} from "../../src/pages/CharactersPage/multiclassSpellcasting";
import { getSpellcastingAbilityForCharacter } from "../../src/pages/CharactersPage/shared/spellcastingAbility";
import {
  createFeatEditorDraft,
  upsertFeatInDraft
} from "../../src/components/CharactersPage/CharacterSheetPage/ClassFeaturesAndFeats/featDrafts";
import {
  activateWarlockMagicalCunning,
  consumeWarlockEldritchSmitePactMagicSlot
} from "../../src/pages/CharactersPage/classFeatures/warlock/warlock";
import { normalizeCustomClassConfig } from "../../src/pages/CharactersPage/customClass";
import { describe, expect, it } from "vitest";
import { characterFixture } from "../fixtures/character";

import {
  createMulticlassDraft,
  applyClassProgression
} from "../../src/pages/CharactersPage/multiclassProgression";
import {
  getCharacterLevel,
  getClassLevel,
  getClassEditorCharacter,
  applyClassEditorChange
} from "../../src/pages/CharactersPage/multiclass";
import {
  getCharacterSpellSlotPools,
  recoverSlotPools,
  setSlotPoolExpended
} from "../../src/pages/CharactersPage/multiclassSpellcasting";
import { getAutomaticMaxHitPointsForCharacter } from "../../src/pages/CharactersPage/gameplay";
import { getHitDicePools } from "../../src/pages/CharactersPage/hitDice";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import {
  getFeatureActionsForCharacter,
  activateFeatureActionForCharacter
} from "../../src/pages/CharactersPage/classFeatures";

describe("multiclass progression and saved characters", () => {
  it("keeps single-class saves on v2 and preserves identity, wounds and spent resources on conversion", () => {
    const legacy = characterFixture({
      className: "Fighter",
      level: 3,
      xp: 0,
      hitPoints: 31,
      currentHitPoints: 7,
      hitDiceRemaining: 1
    });
    const before = createPortableCharacterSheet(legacy);
    expect(before.schemaVersion).toBe(2);
    const converted = applyClassProgression(legacy, createMulticlassDraft(legacy));
    expect(converted).toMatchObject({
      id: legacy.id,
      name: legacy.name,
      hitPoints: 31,
      currentHitPoints: 7
    });
    expect(getHitDicePools(converted)).toEqual([{ die: "d10", total: 3, remaining: 1 }]);
    const saved = createPortableCharacterSheet(converted);
    expect(saved.schemaVersion).toBe(3);
    expect(normalizeCharacter(saved)?.multiclass).toEqual(converted.multiclass);
    expect(createPortableCharacterSheet(legacy)).toEqual(before);
  });
  it("uses own class levels for unlocks and total level for the character", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 3 },
      { className: "Rogue", level: 2 }
    ]);
    expect(getCharacterLevel(character)).toBe(5);
    expect(getClassLevel(character, "Rogue")).toBe(2);
    expect(getClassLevel(character, "Wizard")).toBe(0);
    const rogue = getClassEditorCharacter(character, character.multiclass!.classes[1]);
    expect(rogue.level).toBe(2);
    expect(getCharacterLevel(rogue)).toBe(5);
    expect(getFeatureActionsForCharacter(character).map((action) => action.name)).toEqual(
      expect.arrayContaining(["Second Wind", "Action Surge", "Sneak Attack"])
    );
  });
  it("executes secondary-class actions and retains their counters after saving", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Fighter", level: 2 }
    ]);
    const spent = activateFeatureActionForCharacter(character, "fighter-second-wind");
    expect(spent.classFeatureState?.fighter?.secondWindUsesExpended).toBe(1);
    const restored = normalizeCharacter(createPortableCharacterSheet(spent))!;
    expect(restored.classFeatureState?.fighter?.secondWindUsesExpended).toBe(1);
  });
  it("saves an edited secondary build without replacing the starting class or other build", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Cleric", level: 3 }
    ]);
    const next = applyClassEditorChange(character, "class-1", (view) => ({
      ...view,
      subclassId: "cleric-life-domain",
      preparedSpellIds: ["spell-healing-word"]
    }));
    expect(next.className).toBe("Wizard");
    expect(next.level).toBe(6);
    expect(next.multiclass!.classes[0]).toEqual(character.multiclass!.classes[0]);
    expect(
      normalizeCharacter(createPortableCharacterSheet(next))!.multiclass!.classes[1]
    ).toMatchObject({ subclassId: "cleric-life-domain", preparedSpellIds: ["spell-healing-word"] });
  });
  it("allows a new class regardless of ability prerequisites without an override", () => {
    const character = characterFixture({
      abilities: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }
    });
    const draft = createMulticlassDraft(character);
    draft.classes.push({ id: "wizard", className: "Wizard", level: 1 });
    expect(applyClassProgression(character, draft).multiclass!.classes).toHaveLength(2);
  });
});

describe("multiclass HP and Hit Dice", () => {
  it.each([
    ["Fighter", "Wizard", 40],
    ["Wizard", "Fighter", 38]
  ] as const)("starts as %s, then adds %s: %i HP at CON 14", (first, second, expected) => {
    const character = multiclassFixture(
      [
        { className: first, level: first === "Fighter" ? 3 : 2 },
        { className: second, level: second === "Fighter" ? 3 : 2 }
      ],
      { abilities: { STR: 13, DEX: 13, CON: 14, INT: 13, WIS: 13, CHA: 13 }, background: "" }
    );
    expect(getAutomaticMaxHitPointsForCharacter(character)).toBe(expected);
    const stronger = { ...character, abilities: { ...character.abilities, CON: 16 } };
    expect(getAutomaticMaxHitPointsForCharacter(stronger)).toBe(expected + 5);
  });
});

describe("independent spell sources and shared slots", () => {
  it.each([
    [
      [
        { className: "Wizard", level: 3 },
        { className: "Cleric", level: 2 }
      ],
      [4, 3, 2]
    ],
    [
      [
        { className: "Paladin", level: 1 },
        { className: "Ranger", level: 1 }
      ],
      [3, 0, 0]
    ],
    [
      [
        { className: "Fighter", level: 3, subclassId: "fighter-eldritch-knight" },
        { className: "Wizard", level: 2 }
      ],
      [4, 2, 0]
    ]
  ] as const)("combines caster contributions with 2024 rounding: %j", (entries, expected) => {
    expect(
      getCharacterSpellSlotPools(multiclassFixture([...entries]))[0].totals.slice(0, 3)
    ).toEqual(expected);
  });
  it("keeps Pact slots separate, restores only those on a short rest, and preserves both through save/load", () => {
    let character = multiclassFixture([
      { className: "Wizard", level: 2 },
      { className: "Warlock", level: 3 }
    ]);
    const pools = getCharacterSpellSlotPools(character);
    expect(pools.map((pool) => pool.totals.slice(0, 3))).toEqual([
      [3, 0, 0],
      [0, 2, 0]
    ]);
    character = setSlotPoolExpended(
      setSlotPoolExpended(character, "standard", [2]),
      "pact:class-1",
      [0, 1]
    );
    character = normalizeCharacter(createPortableCharacterSheet(character))!;
    expect(getCharacterSpellSlotPools(character).map((pool) => pool.expended.slice(0, 2))).toEqual([
      [2, 0],
      [0, 1]
    ]);
    expect(
      getCharacterSpellSlotPools(recoverSlotPools(character, "short-rest")).map((pool) =>
        pool.expended.slice(0, 2)
      )
    ).toEqual([
      [2, 0],
      [0, 0]
    ]);
    expect(
      getCharacterSpellSlotPools(recoverSlotPools(character, "long-rest")).every((pool) =>
        pool.expended.every((value) => value === 0)
      )
    ).toBe(true);
  });
  it("does not allow shared higher-level slots to unlock higher-level preparations", () => {
    const character = multiclassFixture([
      {
        className: "Wizard",
        level: 3,
        spellbookSpellIds: ["spell-shield", "spell-fireball"],
        preparedSpellIds: ["spell-shield", "spell-fireball"]
      },
      { className: "Cleric", level: 2, preparedSpellIds: ["spell-healing-word", "spell-revivify"] }
    ]);
    expect(character.multiclass!.classes[0].preparedSpellIds).toEqual(["spell-shield"]);
    expect(character.multiclass!.classes[1].preparedSpellIds).toEqual(["spell-healing-word"]);
    expect(getCharacterSpellSlotPools(character)[0].totals[2]).toBe(2);
  });
});

// Exercise the normalization boundary with every ordered pair: either class can
// be the original character, including two casters and a caster added to a martial.
it("round-trips every ordered built-in class pair without losing either class's state", () => {
  const names = [
    "Artificer",
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Wizard"
  ];
  for (const first of names)
    for (const second of names) {
      if (first === second) continue;
      const character = multiclassFixture([
        { className: first, level: 3 },
        { className: second, level: 2 }
      ]);
      const restored = normalizeCharacter(createPortableCharacterSheet(character))!;
      expect(restored.id, `${first}/${second} identity`).toBe(character.id);
      expect(restored.multiclass, `${first}/${second} progression`).toEqual(character.multiclass);
      expect(restored.classFeatureState, `${first}/${second} resources`).toEqual(
        character.classFeatureState
      );
      expect(restored.currentHitPoints).toBe(character.currentHitPoints);
      expect(
        new Set(getFeatureActionsForCharacter(restored).map((action) => action.key)).size
      ).toBe(getFeatureActionsForCharacter(restored).length);
    }
});

describe("multiclass interactions", () => {
  it.each([5, 11, 20])("does not stack Extra Attack for Fighter %i / Ranger 5", (level) => {
    let character = multiclassFixture([
      { className: "Fighter", level },
      { className: "Ranger", level: 5 }
    ]);
    character = { ...character, roundTracker: startRoundTrackerTurn() };
    const context = {
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.ATTACK,
      attackKind: "weapon" as const
    };
    character = consumeSharedEconomyMultiForCharacterAction(character, context);
    const attacks = level === 20 ? 3 : level === 11 ? 2 : 1;
    expect(getSharedEconomyMultiCountForCharacterAction(character, context)).toBe(attacks);
    for (let index = attacks; index > 0; index--) {
      character = consumeSharedEconomyMultiForCharacterAction(character, context);
      expect(getSharedEconomyMultiCountForCharacterAction(character, context)).toBe(index - 1);
    }
    expect(consumeSharedEconomyMultiForCharacterAction(character, context)).toBe(character);
  });
  it("uses alternative Unarmored Defense calculations without adding them together", () => {
    const character = multiclassFixture(
      [
        { className: "Barbarian", level: 1 },
        { className: "Monk", level: 1 }
      ],
      {
        abilities: { STR: 13, DEX: 14, CON: 16, INT: 10, WIS: 14, CHA: 10 },
        inventoryItems: [],
        equipment: [],
        background: "",
        feats: []
      }
    );
    expect(getArmorClassForCharacter(character)).toBe(15);
  });
  it("scales cantrip damage and Tough with total level even from a level-one caster view", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 4 },
      { className: "Wizard", level: 1 }
    ]);
    const view = getClassEditorCharacter(character, character.multiclass!.classes[1]);
    const fireBolt = getSpellEntryById("spell-fire-bolt")!;
    expect(scaleCantripForCharacter(view, fireBolt).damage).toHaveLength(2);
    expect(
      scaleCantripForCharacter(view, scaleCantripForCharacter(view, fireBolt)).damage
    ).toHaveLength(2);
    const tough = {
      ...view,
      feats: [
        { id: "tough", feat: FEATS.TOUGH, takenAtLevel: 1, source: { type: "manual" as const } }
      ]
    };
    expect(getEffectiveHitPointMaximumForCharacter(tough)).toBe(
      getEffectiveHitPointMaximumForCharacter({ ...view, feats: [] }) + 10
    );
  });
  it("retains two independent class-level-four feat choices, then removes only the lowered class's choice", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 4 },
      { className: "Rogue", level: 4 }
    ]);
    const firstSource = {
      type: "class-feature" as const,
      classEntryId: character.multiclass!.startingClassId,
      level: 4,
      feature: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT
    };
    const secondSource = { ...firstSource, classEntryId: "class-1" };
    let draft = upsertFeatInDraft(
      createFeatEditorDraft(character),
      { id: "fighter-feat", feat: FEATS.ALERT, takenAtLevel: 4, source: firstSource },
      firstSource
    );
    draft = upsertFeatInDraft(
      draft,
      { id: "rogue-feat", feat: FEATS.TOUGH, takenAtLevel: 8, source: secondSource },
      secondSource
    );
    expect(draft.feats).toHaveLength(2);
    const withFeats = { ...character, feats: draft.feats };
    const progression = createMulticlassDraft(withFeats);
    progression.classes[1].level = 3;
    expect(applyClassProgression(withFeats, progression).feats!.map((feat) => feat.id)).toEqual([
      "fighter-feat"
    ]);
  });
  it("uses INT and WIS independently and redirects a Wizard cast paid with Pact Magic", () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Cleric", level: 2 },
      { className: "Warlock", level: 3 }
    ]);
    const wizardId = character.multiclass!.startingClassId;
    expect(
      getSpellcastingAbilityForCharacter(getSpellcastingClassView(character, wizardId, "standard"))
    ).toBe("INT");
    expect(
      getSpellcastingAbilityForCharacter(getSpellcastingClassView(character, "class-1", "standard"))
    ).toBe("WIS");
    const cast = applySpellcastingClassChange(character, wizardId, "pact:class-2", (view) => ({
      ...view,
      spellSlotsExpended: [0, 1]
    }));
    expect(cast.spellSlotsExpended?.[1] ?? 0).toBe(0);
    expect(cast.multiclass!.slotPoolsExpended!["pact:class-2"][1]).toBe(1);
    expect(cast.multiclass!.classes).toEqual(character.multiclass!.classes);
  });
  it("Magical Cunning and Eldritch Smite affect the Warlock's Pact pool only", () => {
    let character = multiclassFixture([
      { className: "Wizard", level: 5 },
      { className: "Warlock", level: 5 }
    ]);
    character = setSlotPoolExpended(
      setSlotPoolExpended(character, "standard", [2, 1]),
      "pact:class-1",
      [0, 0, 2]
    );
    const recovered = activateWarlockMagicalCunning(character);
    expect(recovered.spellSlotsExpended).toEqual(character.spellSlotsExpended);
    expect(recovered.multiclass!.slotPoolsExpended!["pact:class-1"][2]).toBe(1);
    const spent = consumeWarlockEldritchSmitePactMagicSlot(recovered);
    expect(spent.spellSlotsExpended).toEqual(character.spellSlotsExpended);
    expect(spent.multiclass!.slotPoolsExpended!["pact:class-1"][2]).toBe(2);
  });
  it("removing Barbarian removes its active Rage while preserving another class", () => {
    const character = multiclassFixture([
      { className: "Fighter", level: 3 },
      { className: "Barbarian", level: 2 }
    ]);
    const raging = activateFeatureActionForCharacter(
      activateFeatureActionForCharacter(character, "barbarian-rage"),
      "barbarian-reckless-attack"
    );
    expect(raging.classFeatureState?.rage?.active).toBe(true);
    expect(
      raging.statusEntries?.some((entry) => entry.sourceId === "feature-barbarian-reckless-attack")
    ).toBe(true);
    const draft = createMulticlassDraft(raging);
    draft.classes = draft.classes.slice(0, 1);
    const changed = applyClassProgression(raging, draft);
    expect(
      changed.statusEntries?.some((entry) => entry.sourceId === "feature-barbarian-reckless-attack")
    ).toBe(false);
    expect(
      getFeatureActionsForCharacter(changed).some((entry) => entry.name === "Second Wind")
    ).toBe(true);
  });
  it("supports five classes and distinct custom casting progressions with independent slots", () => {
    const custom = normalizeCustomClassConfig({
      id: "custom-full",
      name: "Scholar",
      castingProgression: "full"
    });
    const other = normalizeCustomClassConfig({
      id: "custom-pact",
      name: "Binder",
      castingProgression: "pact"
    });
    const character = multiclassFixture([
      { className: "Fighter", level: 1 },
      { className: "Wizard", level: 1 },
      { className: "Cleric", level: 1 },
      { className: "Custom", level: 2, customClass: custom },
      { className: "Custom", level: 3, customClass: other }
    ]);
    expect(
      normalizeCharacter(createPortableCharacterSheet(character))!.multiclass!.classes
    ).toHaveLength(5);
    expect(getCharacterSpellSlotPools(character).map((pool) => pool.totals.slice(0, 3))).toEqual([
      [4, 3, 0],
      [0, 2, 0]
    ]);
  });
});
