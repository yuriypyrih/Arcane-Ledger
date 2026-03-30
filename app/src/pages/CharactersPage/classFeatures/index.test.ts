import { describe, expect, it } from "vitest";
import { WEAPON_COMBAT_TYPE } from "../../../codex/entries";
import {
  CONDITION_NAME,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../constants";
import {
  activateFeatureActionForCharacter,
  applyLongRestToFeatureState,
  applyShortRestToFeatureState,
  advanceFeatureStateForNewRound,
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureActionsForCharacter,
  getFeatureDamageBonusesForWeaponAction,
  getFeatureReactionEntriesForCharacter,
  markFeatureWeaponBonusUseForCharacter
} from "./index";
import type { Character } from "../../../types";
import { normalizeCharacter } from "../storage";
import { createCharacterStatusEntry, hasStatusCondition } from "../traits";

function createCharacter(overrides: Partial<Character>): Character {
  const normalizedCharacter = normalizeCharacter({
    id: 1,
    ...createEmptyCharacter(),
    name: "Test Hero",
    species: "Human",
    className: "Bard",
    background: "Entertainer",
    abilities: {
      ...createDefaultAbilities(),
      CHA: 16
    },
    ...overrides
  });

  if (!normalizedCharacter) {
    throw new Error("Expected test character to normalize successfully.");
  }

  return normalizedCharacter;
}

describe("class feature state reducers", () => {
  it("restores bardic inspiration on short rest when the feature qualifies", () => {
    const character = createCharacter({
      className: "Bard",
      level: 5,
      classFeatureState: {
        bard: {
          bardicInspirationUsesExpended: 3
        }
      }
    });

    const restedCharacter = applyShortRestToFeatureState(character);

    expect(restedCharacter.classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(0);
  });

  it("resets rogue turn flags when a new round starts", () => {
    const character = createCharacter({
      className: "Rogue",
      background: "Criminal / Spy",
      classFeatureState: {
        rogue: {
          sneakAttackUsedThisTurn: true,
          steadyAimActive: true
        }
      }
    });

    const advancedCharacter = advanceFeatureStateForNewRound(character);

    expect(advancedCharacter.classFeatureState?.rogue?.sneakAttackUsedThisTurn).toBe(false);
    expect(advancedCharacter.classFeatureState?.rogue?.steadyAimActive).toBe(false);
  });

  it("tracks barbarian reckless attack and frenzy through a turn", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      subclassId: "barbarian-path-of-the-berserker",
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true
        }
      }
    });

    const recklessCharacter = activateFeatureActionForCharacter(
      character,
      "barbarian-reckless-attack"
    );
    const derivedStatuses = getDerivedFeatureStatusEntriesForCharacter(recklessCharacter);
    const damageBonuses = getFeatureDamageBonusesForWeaponAction(recklessCharacter, {
      name: "Greataxe",
      ability: "STR",
      attackKind: "weapon",
      combatType: WEAPON_COMBAT_TYPE.MELEE
    });

    expect(recklessCharacter.classFeatureState?.rage?.recklessAttackUsedThisTurn).toBe(true);
    expect(recklessCharacter.classFeatureState?.rage?.recklessAttackRoundsRemaining).toBe(2);
    expect(recklessCharacter.classFeatureState?.rage?.frenzyPending).toBe(true);
    expect(derivedStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-reckless-attack",
          value: "Reckless Attack"
        })
      ])
    );
    expect(damageBonuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Rage",
          value: 2
        }),
        expect.objectContaining({
          label: "Frenzy",
          formula: "2d6"
        })
      ])
    );

    const frenzyConsumedCharacter = markFeatureWeaponBonusUseForCharacter(
      recklessCharacter,
      "Frenzy"
    );
    const nextRoundCharacter = advanceFeatureStateForNewRound(frenzyConsumedCharacter);

    expect(frenzyConsumedCharacter.classFeatureState?.rage?.frenzyPending).toBe(false);
    expect(nextRoundCharacter.classFeatureState?.rage?.recklessAttackUsedThisTurn).toBe(false);
    expect(nextRoundCharacter.classFeatureState?.rage?.recklessAttackRoundsRemaining).toBe(1);
    expect(nextRoundCharacter.classFeatureState?.rage?.frenzyPending).toBe(false);
  });

  it("removes charmed and frightened when a berserker enters rage with mindless rage", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 6,
      subclassId: "barbarian-path-of-the-berserker",
      background: "Criminal / Spy",
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.CONDITIONS,
          value: CONDITION_NAME.CHARMED,
          source: "Test",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
        }),
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.CONDITIONS,
          value: CONDITION_NAME.FRIGHTENED,
          source: "Test",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
        })
      ]
    });

    const ragingCharacter = activateFeatureActionForCharacter(character, "barbarian-rage");
    const derivedStatuses = getDerivedFeatureStatusEntriesForCharacter(ragingCharacter);

    expect(hasStatusCondition(ragingCharacter.statusEntries, CONDITION_NAME.CHARMED)).toBe(false);
    expect(hasStatusCondition(ragingCharacter.statusEntries, CONDITION_NAME.FRIGHTENED)).toBe(
      false
    );
    expect(derivedStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: STATUS_ENTRY_GROUP.IMMUNITIES,
          value: CONDITION_NAME.CHARMED,
          source: "Mindless Rage"
        }),
        expect.objectContaining({
          group: STATUS_ENTRY_GROUP.IMMUNITIES,
          value: CONDITION_NAME.FRIGHTENED,
          source: "Mindless Rage"
        })
      ])
    );
  });

  it("adds berserker retaliation to the reactions list at level 10", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 10,
      subclassId: "barbarian-path-of-the-berserker",
      background: "Criminal / Spy"
    });

    const reactionEntries = getFeatureReactionEntriesForCharacter(character);

    expect(reactionEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "reaction-berserker-retaliation",
          name: "Retaliation",
          sourceLabel: "Path of the Berserker"
        })
      ])
    );
  });

  it("spends intimidating presence first, then falls back to rage charges", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-berserker",
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: false
        }
      }
    });

    const initialAction = getFeatureActionsForCharacter(character).find(
      (action) => action.key === "barbarian-intimidating-presence"
    );
    expect(initialAction).toEqual(
      expect.objectContaining({
        usesRemaining: 1,
        usesTotal: 1,
        usesInlineLabel: undefined
      })
    );

    const featureChargeCharacter = activateFeatureActionForCharacter(
      character,
      "barbarian-intimidating-presence"
    );

    expect(featureChargeCharacter.classFeatureState?.rage?.intimidatingPresenceUsesExpended).toBe(1);
    expect(featureChargeCharacter.classFeatureState?.rage?.usesExpended).toBe(1);

    const rageFallbackAction = getFeatureActionsForCharacter(featureChargeCharacter).find(
      (action) => action.key === "barbarian-intimidating-presence"
    );
    expect(rageFallbackAction).toEqual(
      expect.objectContaining({
        usesRemaining: 0,
        usesInlineLabel: "| Uses Rage Charges"
      })
    );

    const rageChargeCharacter = activateFeatureActionForCharacter(
      featureChargeCharacter,
      "barbarian-intimidating-presence"
    );

    expect(rageChargeCharacter.classFeatureState?.rage?.usesExpended).toBe(2);
    expect(rageChargeCharacter.classFeatureState?.rage?.intimidatingPresenceUsesExpended).toBe(1);

    const restedCharacter = applyLongRestToFeatureState(rageChargeCharacter);

    expect(restedCharacter.classFeatureState?.rage?.usesExpended).toBe(0);
    expect(restedCharacter.classFeatureState?.rage?.intimidatingPresenceUsesExpended).toBe(0);
  });
});
