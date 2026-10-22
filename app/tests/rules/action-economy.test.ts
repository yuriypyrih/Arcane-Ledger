import { describe, expect, it } from "vitest";
import {
  consumeRoundTrackerResource,
  startRoundTrackerTurn,
  finishRoundTrackerTurn,
  setRoundTrackerCombatState
} from "../../src/pages/CharactersPage/combat";
import { getEconomyShapeState } from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/gameplayWidgetUtils";
import { characterFixture } from "../fixtures/character";
import {
  activateFeatureActionForCharacter,
  consumeWeaponAttackActionForCharacter
} from "../../src/pages/CharactersPage/classFeatures";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../src/pages/CharactersPage/actionEconomy";
import {
  getSharedEconomyMultiCountForCharacterAction,
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForSpell,
  payEconomyForCharacterAction,
  resolveEconomyPaymentForCharacterAction
} from "../../src/pages/CharactersPage/classFeatures/economyMulti";
import { multiclassFixture } from "../fixtures/multiclass";
import { getSpellEntryById, ELDRITCH_INVOCATION } from "../../src/codex/entries";
import { getSpellActionPathStates } from "../../src/components/CharactersPage/CharacterSheetPage/spellActionPaths";
import { mysticArtsFlurrySpellPathId } from "../../src/pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheMysticArts";
import { startCharacterTurn } from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/gameplayStateUtils";
import { applyClassEditorChange } from "../../src/pages/CharactersPage/multiclass";
import {
  getWarlockInvocationOptions,
  setWarlockInvocationSelectionIds
} from "../../src/pages/CharactersPage/classFeatures/warlock/warlock";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import {
  EFFECT_NAME,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  STATUS_DURATION_KIND,
  type Character
} from "../../src/types";

const attack = {
  economyType: ECONOMY_TYPE.ACTION,
  actionCategory: ACTION_CATEGORY.ATTACK,
  attackKind: "weapon" as const
};
const strike = { ...attack, key: "unarmed-strike", attackKind: "unarmed" as const };
const fireBolt = getSpellEntryById("spell-fire-bolt")!;
const magicMissile = getSpellEntryById("spell-magic-missile")!;
const cantrip = createEconomyMultiContextForSpell(fireBolt);
const remaining = (character: Character) =>
  getSharedEconomyMultiCountForCharacterAction(character, attack);
const reload = (character: Character) =>
  normalizeCharacter(createPortableCharacterSheet(character))!;

function activateFlurry(character: Character) {
  return payEconomyForCharacterAction(
    activateFeatureActionForCharacter(character, "monk-flurry-of-blows"),
    {
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE
    }
  ).character;
}

function combatant(className: Character["className"], level: number, subclassId?: string) {
  return characterFixture({
    className,
    level,
    subclassId,
    xp: 0,
    inventoryItems: [],
    equipment: [],
    roundTracker: startRoundTrackerTurn()
  });
}

describe("action economy", () => {
  it("spends only the selected resource and resets it at the next turn", () => {
    const started = startRoundTrackerTurn();
    const spent = consumeRoundTrackerResource(started, "action");
    expect(spent).toMatchObject({
      actionAvailable: false,
      bonusActionAvailable: true,
      reactionAvailable: true,
      combatRound: 1
    });
    const next = startRoundTrackerTurn(finishRoundTrackerTurn(spent));
    expect(next).toMatchObject({ actionAvailable: true, combatRound: 2 });
    expect(setRoundTrackerCombatState(spent, false)).toMatchObject({
      isInCombat: false,
      combatRound: 0,
      actionAvailable: true
    });
  });
  it("Action Surge grants one consumable non-magic action after the ordinary action is spent", () => {
    const spent = consumeRoundTrackerResource(startRoundTrackerTurn(), "action");
    expect(getEconomyShapeState("action", spent, 0).isUsable).toBe(false);
    const character = characterFixture({ roundTracker: spent });
    const surged = activateFeatureActionForCharacter(character, "fighter-action-surge");
    const context = { economyType: ECONOMY_TYPE.ACTION, actionCategory: ACTION_CATEGORY.UTILITY };
    const extra = getSharedEconomyMultiCountForCharacterAction(surged, context);
    expect(extra).toBe(1);
    expect(getEconomyShapeState("action", surged.roundTracker!, extra).isUsable).toBe(true);
    expect(
      getSharedEconomyMultiCountForCharacterAction(surged, {
        ...context,
        actionCategory: ACTION_CATEGORY.MAGIC
      })
    ).toBe(0);
    const used = consumeSharedEconomyMultiForCharacterAction(surged, context);
    expect(getSharedEconomyMultiCountForCharacterAction(used, context)).toBe(0);
    expect(used.roundTracker?.actionAvailable).toBe(false);
    expect(activateFeatureActionForCharacter(used, "fighter-action-surge")).toEqual(used);
  });
  it("does not consume round resources outside combat", () => {
    expect(consumeRoundTrackerResource(undefined, "action").actionAvailable).toBe(true);
  });
});

describe("shared attack payments", () => {
  it.each([
    ["Fighter", 4, "", 1],
    ["Fighter", 5, "", 2],
    ["Fighter", 11, "", 3],
    ["Fighter", 20, "", 4],
    ["Paladin", 5, "", 2],
    ["Ranger", 5, "", 2],
    ["Barbarian", 5, "", 2],
    ["Monk", 5, "", 2],
    ["Rogue", 5, "", 1],
    ["Cleric", 5, "", 1],
    ["Druid", 5, "", 1],
    ["Sorcerer", 5, "", 1],
    ["Warlock", 5, "", 1],
    ["Wizard", 5, "wizard-evoker", 1],
    ["Bard", 5, "bard-college-of-lore", 1],
    ["Bard", 6, "bard-college-of-valor", 2],
    ["Wizard", 6, "wizard-bladesinger", 2],
    ["Artificer", 5, "artificer-armorer", 2],
    ["Artificer", 5, "artificer-battle-smith", 2]
  ] as const)(
    "%s %i %s pays for exactly %i attacks across reload and resets next turn",
    (name, level, subclass, total) => {
      let character = combatant(name, level, subclass);
      for (let i = 0; i < total; i++) {
        const paid = payEconomyForCharacterAction(character, attack);
        expect(paid.status).toBe("paid");
        character = reload(paid.character);
        expect(remaining(character)).toBe(total - i - 1);
      }
      expect(payEconomyForCharacterAction(character, attack)).toEqual({
        status: "unavailable",
        character
      });
      character = startCharacterTurn(character);
      expect(payEconomyForCharacterAction(character, attack).status).toBe("paid");
    }
  );

  it("Action Surge opens a new cantrip replacement after the first Attack action", () => {
    let character = combatant("Fighter", 7, "fighter-eldritch-knight");
    character = payEconomyForCharacterAction(character, cantrip).character;
    character = payEconomyForCharacterAction(character, attack).character;
    character = activateFeatureActionForCharacter(character, "fighter-action-surge");
    character = payEconomyForCharacterAction(character, attack).character;
    expect(payEconomyForCharacterAction(character, cantrip).status).toBe("paid");
    character = payEconomyForCharacterAction(character, cantrip).character;
    expect(payEconomyForCharacterAction(character, cantrip).status).toBe("unavailable");
  });

  it("Action Surge starts a full Attack action after the first pool is exhausted, but cannot buy Magic", () => {
    let character = combatant("Fighter", 11);
    for (let i = 0; i < 3; i++)
      character = payEconomyForCharacterAction(character, attack).character;
    character = activateFeatureActionForCharacter(character, "fighter-action-surge");
    expect(payEconomyForCharacterAction(character, cantrip).status).toBe("unavailable");
    for (let i = 0; i < 3; i++) {
      const paid = payEconomyForCharacterAction(character, attack);
      expect(paid.status).toBe("paid");
      character = paid.character;
      expect(remaining(character)).toBe(2 - i);
    }
    expect(character.classFeatureState?.fighter?.actionSurgeExtraActionsRemainingThisTurn).toBe(0);
    expect(payEconomyForCharacterAction(character, attack).status).toBe("unavailable");
  });

  it.each([
    ["Fighter", 7, "fighter-eldritch-knight"],
    ["Bard", 6, "bard-college-of-valor"],
    ["Wizard", 6, "wizard-bladesinger"]
  ] as const)(
    "%s can cast its replacement cantrip first or second without gaining another attack",
    (name, level, subclass) => {
      for (const sequence of [
        [cantrip, attack],
        [attack, cantrip]
      ]) {
        let character = combatant(name, level, subclass);
        for (const context of sequence) {
          const paid = payEconomyForCharacterAction(character, context);
          expect(paid.status).toBe("paid");
          character = paid.character;
        }
        expect(payEconomyForCharacterAction(character, cantrip).status).toBe("unavailable");
        expect(remaining(character)).toBe(0);
      }
    }
  );

  it("Mystic cantrips share the Action pool in either order, including two cantrips", () => {
    for (const sequence of [
      [cantrip, cantrip],
      [cantrip, attack],
      [attack, cantrip]
    ]) {
      let character = combatant("Monk", 6, "monk-warrior-of-the-mystic-arts");
      for (const context of sequence) {
        const paid = payEconomyForCharacterAction(character, context);
        expect(paid.status).toBe("paid");
        character = paid.character;
      }
      expect(payEconomyForCharacterAction(character, cantrip).status).toBe("unavailable");
    }
    const beforeUnlock = payEconomyForCharacterAction(
      combatant("Monk", 5, "monk-warrior-of-the-mystic-arts"),
      cantrip
    ).character;
    expect(remaining(beforeUnlock)).toBe(0);
  });

  it.each([2, 10, 17])(
    "Monk %i Flurry strikes stay separate from its Action and ordinary Bonus Action",
    (level) => {
      let character = combatant("Monk", level, "monk-warrior-of-the-open-hand");
      character = activateFlurry(character);
      const bonus = { ...strike, economyType: ECONOMY_TYPE.BONUS_ACTION };
      const strikes = level >= 10 ? 3 : 2;
      for (let i = 0; i < strikes; i++) {
        const paid = consumeWeaponAttackActionForCharacter(character, bonus);
        expect(paid.classFeatureState?.monk?.flurryOfBlowsAttacksRemainingThisTurn).toBe(
          strikes - i - 1
        );
        expect(paid.roundTracker?.actionAvailable).toBe(true);
        character = paid;
      }
      expect(character.classFeatureState?.monk?.focusPointsExpended).toBe(1);
      expect(consumeWeaponAttackActionForCharacter(character, bonus)).toBe(character);
      character = startCharacterTurn(character);
      expect(
        consumeWeaponAttackActionForCharacter(character, bonus).roundTracker?.bonusActionAvailable
      ).toBe(false);
    }
  );

  it("Mystic two-strike spells use only an activated Flurry and retain normal Action casting", () => {
    let character = combatant("Monk", 17, "monk-warrior-of-the-mystic-arts");
    const spell = createEconomyMultiContextForSpell(magicMissile, {
      id: mysticArtsFlurrySpellPathId,
      economyType: ECONOMY_TYPE.BONUS_ACTION
    });
    const paths = (c: Character) => getSpellActionPathStates(c, magicMissile, c.roundTracker!);
    expect(paths(character).map((path) => path.id)).not.toContain(mysticArtsFlurrySpellPathId);
    expect(payEconomyForCharacterAction(character, spell).status).toBe("unavailable");
    character = activateFlurry(character);
    const outOfCombat = {
      ...character,
      roundTracker: setRoundTrackerCombatState(character.roundTracker, false)
    };
    expect(payEconomyForCharacterAction(outOfCombat, spell).status).toBe("unavailable");
    expect(
      paths(character).find((path) => path.id === mysticArtsFlurrySpellPathId)?.shapeState.isUsable
    ).toBe(true);
    character = payEconomyForCharacterAction(character, spell).character;
    expect(character.classFeatureState?.monk?.flurryOfBlowsAttacksRemainingThisTurn).toBe(1);
    expect(character.roundTracker?.actionAvailable).toBe(true);
    expect(
      paths(character).find((path) => path.id === mysticArtsFlurrySpellPathId)?.shapeState.isUsable
    ).toBe(false);
    expect(payEconomyForCharacterAction(character, spell)).toEqual({
      status: "unavailable",
      character
    });
    expect(
      payEconomyForCharacterAction(character, createEconomyMultiContextForSpell(magicMissile))
        .status
    ).toBe("paid");
    character = consumeWeaponAttackActionForCharacter(character, {
      ...strike,
      economyType: ECONOMY_TYPE.BONUS_ACTION
    });
    expect(paths(character).map((path) => path.id)).not.toContain(mysticArtsFlurrySpellPathId);
  });

  it("a pact/ordinary/pact sequence cannot stack Fighter and Warlock attacks", () => {
    let character = multiclassFixture(
      [
        { className: "Fighter", level: 5 },
        { className: "Warlock", level: 5 }
      ],
      {
        roundTracker: startRoundTrackerTurn()
      }
    );
    character = applyClassEditorChange(character, "class-1", (view) => {
      const blade = getWarlockInvocationOptions(view, []).find(
        (option) =>
          option.invocation.id === ELDRITCH_INVOCATION.PACT_OF_THE_BLADE &&
          option.isQualified &&
          !option.isPlaceholder
      )!;
      return setWarlockInvocationSelectionIds(view, [
        blade.selectionId,
        ELDRITCH_INVOCATION.THIRSTING_BLADE
      ]);
    });
    const pact = { ...attack, weaponInventoryFeatureTags: ["pact-of-the-blade" as const] };
    character = payEconomyForCharacterAction(character, pact).character;
    character = reload(payEconomyForCharacterAction(character, attack).character);
    expect(payEconomyForCharacterAction(character, pact).status).toBe("unavailable");
    expect(character.classFeatureState?.warlock?.extraAttacksRemainingThisTurn).toBe(0);
  });

  it("a secondary Fighter's Action Surge restarts the Paladin Attack action", () => {
    let character = multiclassFixture(
      [
        { className: "Paladin", level: 5 },
        { className: "Fighter", level: 2 }
      ],
      { roundTracker: startRoundTrackerTurn() }
    );
    for (let i = 0; i < 2; i++)
      character = payEconomyForCharacterAction(character, attack).character;
    character = activateFeatureActionForCharacter(character, "fighter-action-surge");
    for (let i = 0; i < 2; i++) {
      const paid = payEconomyForCharacterAction(character, attack);
      expect(paid.status).toBe("paid");
      character = paid.character;
    }
    expect(payEconomyForCharacterAction(character, attack).status).toBe("unavailable");
  });

  it("Retaliation is independent of the Barbarian's two ordinary attacks", () => {
    let character = combatant("Barbarian", 10, "barbarian-path-of-the-berserker");
    character = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rage: { ...character.classFeatureState!.rage!, retaliationAttacksRemaining: 1 }
      }
    };
    character = consumeWeaponAttackActionForCharacter(character, strike);
    expect(character.roundTracker?.actionAvailable).toBe(true);
    expect(character.classFeatureState?.rage?.retaliationAttacksRemaining).toBe(0);
    for (let i = 0; i < 2; i++)
      character = consumeWeaponAttackActionForCharacter(character, strike);
    expect(consumeWeaponAttackActionForCharacter(character, strike)).toBe(character);
  });

  it("Rogue attacks consume Steady Aim and preserve the separate Bloodthirst grant", () => {
    let character = combatant("Rogue", 3, "rogue-scion-of-the-three");
    character = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rogue: {
          ...character.classFeatureState?.rogue,
          steadyAimAttackAdvantageAvailable: true,
          bloodthirstMeleeAttacksRemainingThisTurn: 1
        }
      }
    };
    character = consumeWeaponAttackActionForCharacter(character, strike);
    expect(character.classFeatureState?.rogue?.steadyAimAttackAdvantageAvailable).toBe(false);
    expect(character.classFeatureState?.rogue?.bloodthirstMeleeAttacksRemainingThisTurn).toBe(1);
    character = consumeWeaponAttackActionForCharacter(character, strike);
    expect(character.classFeatureState?.rogue?.bloodthirstMeleeAttacksRemainingThisTurn).toBe(0);
    expect(consumeWeaponAttackActionForCharacter(character, strike)).toBe(character);
  });

  it("Improved Shadow Step grants one independent strike and consumes its attack advantage", () => {
    let character = combatant("Monk", 11, "monk-warrior-of-shadow");
    character = {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "bonusAction"),
      classFeatureState: {
        ...character.classFeatureState,
        monk: {
          ...character.classFeatureState?.monk,
          warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn: 1,
          warriorOfShadowShadowStepAdvantageActive: true
        }
      }
    };
    const bonus = { ...strike, economyType: ECONOMY_TYPE.BONUS_ACTION };
    character = consumeWeaponAttackActionForCharacter(character, bonus);
    expect(character.roundTracker?.actionAvailable).toBe(true);
    expect(character.classFeatureState?.monk).toMatchObject({
      warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn: 0,
      warriorOfShadowShadowStepAdvantageActive: false
    });
    expect(consumeWeaponAttackActionForCharacter(character, bonus)).toBe(character);
  });

  it.each(["spell-tensers-transformation", "spell-tashas-otherworldly-guise"])(
    "%s requires an actual Attack action and preserves a pending attack across reload",
    (spellId) => {
      let character = combatant("Wizard", 11, "wizard-evoker");
      character = {
        ...character,
        statusEntries: [
          {
            id: "transformation",
            group: STATUS_ENTRY_GROUP.EFFECTS,
            value: EFFECT_NAME.CONCENTRATION,
            source: spellId,
            sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
            duration: { kind: STATUS_DURATION_KIND.INFINITE },
            sourceSpellId: spellId,
            sourceId:
              spellId === "spell-tashas-otherworldly-guise"
                ? "spell-tashas-otherworldly-guise-upper-planes"
                : undefined
          }
        ]
      };
      const dashed = payEconomyForCharacterAction(character, {
        economyType: ECONOMY_TYPE.ACTION,
        actionCategory: ACTION_CATEGORY.UTILITY
      }).character;
      expect(remaining(dashed)).toBe(0);
      character = reload(payEconomyForCharacterAction(character, attack).character);
      expect(remaining(character)).toBe(1);
      character = payEconomyForCharacterAction(character, attack).character;
      expect(remaining(character)).toBe(0);
      expect(resolveEconomyPaymentForCharacterAction(character, attack).payment).toBeNull();
    }
  );
});
