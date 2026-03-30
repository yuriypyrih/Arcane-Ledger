import { describe, expect, it } from "vitest";
import { WEAPON_COMBAT_TYPE } from "../../../codex/entries";
import {
  CONDITION_NAME,
  SKILL,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../constants";
import {
  activateFeatureActionForCharacter,
  applyPersistentRageOnInitiativeForCharacter,
  applyLongRestToFeatureState,
  applyShortRestToFeatureState,
  advanceFeatureStateForNewRound,
  consumeWeaponAttackActionForCharacter,
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureActionsForCharacter,
  getFeatureActionOptionsForCharacter,
  getFeatureDamageBonusesForWeaponAction,
  getFeatureReactionEntriesForCharacter,
  getSpellcastingStateForCharacter,
  markFeatureWeaponBonusUseForCharacter
} from "./index";
import type { Character } from "../../../types";
import { normalizeCharacter } from "../storage";
import { createCharacterStatusEntry, hasStatusCondition } from "../traits";
import { getPassivePerceptionForCharacter } from "../gameplay";
import { getSkillRowsByAbility } from "../skills";

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
    expect(recklessCharacter.classFeatureState?.rage?.recklessAttackRoundsRemaining).toBe(1);
    expect(recklessCharacter.classFeatureState?.rage?.frenzyPending).toBe(true);
    expect(derivedStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-reckless-attack",
          value: "Reckless Attack",
          duration: expect.objectContaining({
            amount: 1,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
          })
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
    expect(nextRoundCharacter.classFeatureState?.rage?.recklessAttackRoundsRemaining).toBe(0);
    expect(nextRoundCharacter.classFeatureState?.rage?.frenzyPending).toBe(false);
  });

  it("adds instinctive pounce as a round-end trait when rage starts", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 7,
      background: "Criminal / Spy"
    });

    const ragingCharacter = activateFeatureActionForCharacter(character, "barbarian-rage");
    const derivedStatuses = getDerivedFeatureStatusEntriesForCharacter(ragingCharacter);

    expect(ragingCharacter.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-instinctive-pounce",
          value: "Instinctive Pounce",
          duration: expect.objectContaining({
            amount: 1,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
          })
        })
      ])
    );
    expect(derivedStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-rage",
          value: "Rage"
        })
      ])
    );
  });

  it("grants barbarian extra attack from the first attack action each turn", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 5,
      background: "Criminal / Spy"
    });

    const firstAttackCharacter = consumeWeaponAttackActionForCharacter(character, {
      key: "weapon-greataxe",
      economyType: "action",
      attackKind: "weapon"
    });
    const secondAttackCharacter = consumeWeaponAttackActionForCharacter(firstAttackCharacter, {
      key: "weapon-greataxe",
      economyType: "action",
      attackKind: "weapon"
    });

    expect(firstAttackCharacter.roundTracker?.actionAvailable).toBe(false);
    expect(firstAttackCharacter.classFeatureState?.rage?.extraAttacksRemainingThisTurn).toBe(1);
    expect(secondAttackCharacter.roundTracker?.actionAvailable).toBe(false);
    expect(secondAttackCharacter.classFeatureState?.rage?.extraAttacksRemainingThisTurn).toBe(0);
  });

  it("arms and consumes brutal strike once per reckless attack", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 9,
      background: "Criminal / Spy"
    });

    const beforeRecklessActions = getFeatureActionsForCharacter(character);
    const brutalStrikeBeforeReckless = beforeRecklessActions.find(
      (action) => action.key === "barbarian-brutal-strike"
    );
    const recklessCharacter = activateFeatureActionForCharacter(
      character,
      "barbarian-reckless-attack"
    );
    const afterRecklessActions = getFeatureActionsForCharacter(recklessCharacter);
    const brutalStrikeAfterReckless = afterRecklessActions.find(
      (action) => action.key === "barbarian-brutal-strike"
    );
    const armedCharacter = activateFeatureActionForCharacter(
      recklessCharacter,
      "barbarian-brutal-strike"
    );
    const armedDamageBonuses = getFeatureDamageBonusesForWeaponAction(armedCharacter, {
      name: "Greataxe",
      ability: "STR",
      attackKind: "weapon",
      combatType: WEAPON_COMBAT_TYPE.MELEE
    });
    const consumedCharacter = markFeatureWeaponBonusUseForCharacter(
      armedCharacter,
      "Brutal Strike"
    );
    const afterConsumeActions = getFeatureActionsForCharacter(consumedCharacter);
    const brutalStrikeAfterConsume = afterConsumeActions.find(
      (action) => action.key === "barbarian-brutal-strike"
    );

    expect(brutalStrikeBeforeReckless).toEqual(
      expect.objectContaining({
        disabled: true
      })
    );
    expect(brutalStrikeAfterReckless).toEqual(
      expect.objectContaining({
        disabled: false,
        interaction: "select"
      })
    );
    expect(armedCharacter.classFeatureState?.rage?.brutalStrikePending).toBe(true);
    expect(armedCharacter.classFeatureState?.rage?.brutalStrikeUsedThisTurn).toBe(true);
    expect(armedDamageBonuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Brutal Strike",
          formula: "1d10"
        })
      ])
    );
    expect(consumedCharacter.classFeatureState?.rage?.brutalStrikePending).toBe(false);
    expect(consumedCharacter.classFeatureState?.rage?.brutalStrikeUsedThisTurn).toBe(true);
    expect(brutalStrikeAfterConsume).toEqual(
      expect.objectContaining({
        disabled: true
      })
    );
  });

  it("shows base brutal strike effects at level 9 and improved effects at level 13", () => {
    const level9Character = createCharacter({
      className: "Barbarian",
      level: 9,
      background: "Criminal / Spy"
    });
    const level13Character = createCharacter({
      className: "Barbarian",
      level: 13,
      background: "Criminal / Spy"
    });

    const level9Options = getFeatureActionOptionsForCharacter(
      level9Character,
      "barbarian-brutal-strike"
    );
    const level13Options = getFeatureActionOptionsForCharacter(
      level13Character,
      "barbarian-brutal-strike"
    );

    expect(level9Options.map((option) => option.name)).toEqual(["Forceful Blow", "Hamstring Blow"]);
    expect(level13Options.map((option) => option.name)).toEqual([
      "Forceful Blow",
      "Hamstring Blow",
      "Staggering Blow",
      "Sundering Blow"
    ]);
  });

  it("upgrades brutal strike to 2d10 and up to two effects at level 17", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 17,
      background: "Criminal / Spy"
    });

    const recklessCharacter = activateFeatureActionForCharacter(
      character,
      "barbarian-reckless-attack"
    );
    const brutalStrikeAction = getFeatureActionsForCharacter(recklessCharacter).find(
      (action) => action.key === "barbarian-brutal-strike"
    );
    const armedCharacter = activateFeatureActionForCharacter(
      recklessCharacter,
      "barbarian-brutal-strike"
    );
    const armedDamageBonuses = getFeatureDamageBonusesForWeaponAction(armedCharacter, {
      name: "Greataxe",
      ability: "STR",
      attackKind: "weapon",
      combatType: WEAPON_COMBAT_TYPE.MELEE
    });

    expect(brutalStrikeAction).toEqual(
      expect.objectContaining({
        breakdown: "2d10 + up to 2 effects"
      })
    );
    expect(armedDamageBonuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Brutal Strike",
          formula: "2d10"
        })
      ])
    );
  });

  it("tracks relentless rage dc while raging and resets it on rests", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 11,
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true
        }
      }
    });

    const initialAction = getFeatureActionsForCharacter(character).find(
      (action) => action.key === "barbarian-relentless-rage"
    );
    const firstUseCharacter = activateFeatureActionForCharacter(
      character,
      "barbarian-relentless-rage"
    );
    const secondUseCharacter = activateFeatureActionForCharacter(
      firstUseCharacter,
      "barbarian-relentless-rage"
    );
    const updatedAction = getFeatureActionsForCharacter(secondUseCharacter).find(
      (action) => action.key === "barbarian-relentless-rage"
    );
    const afterShortRest = applyShortRestToFeatureState(secondUseCharacter);

    expect(initialAction).toEqual(
      expect.objectContaining({
        valueLabel: "Current DC 10",
        disabled: false
      })
    );
    expect(firstUseCharacter.classFeatureState?.rage?.relentlessRageDcBonus).toBe(5);
    expect(secondUseCharacter.classFeatureState?.rage?.relentlessRageDcBonus).toBe(10);
    expect(updatedAction).toEqual(
      expect.objectContaining({
        valueLabel: "Current DC 20"
      })
    );
    expect(afterShortRest.classFeatureState?.rage?.relentlessRageDcBonus).toBe(0);
    expect(
      applyLongRestToFeatureState(secondUseCharacter).classFeatureState?.rage?.relentlessRageDcBonus
    ).toBe(0);
  });

  it("recharges rage on initiative by consuming persistent rage", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 15,
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 4,
          active: false,
          persistentRageUsesExpended: 0
        }
      }
    });

    const refreshedCharacter = applyPersistentRageOnInitiativeForCharacter(character);
    const afterLongRest = applyLongRestToFeatureState(refreshedCharacter);

    expect(refreshedCharacter.classFeatureState?.rage?.usesExpended).toBe(0);
    expect(refreshedCharacter.classFeatureState?.rage?.persistentRageUsesExpended).toBe(1);
    expect(afterLongRest.classFeatureState?.rage?.persistentRageUsesExpended).toBe(0);
  });

  it("uses Strength for primal knowledge skills while raging", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      background: "Acolyte",
      abilities: {
        ...createDefaultAbilities(),
        STR: 18,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8
      },
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true
        }
      }
    });

    const skillRows = getSkillRowsByAbility(character, character.skillProficiencies);
    const allRows = skillRows.flatMap((group) => group.rows);
    const acrobaticsRow = allRows.find((row) => row.name === SKILL.ACROBATICS);
    const perceptionRow = allRows.find((row) => row.name === SKILL.PERCEPTION);
    const intimidationRow = allRows.find((row) => row.name === SKILL.INTIMIDATION);

    expect(acrobaticsRow).toEqual(
      expect.objectContaining({
        ability: "STR",
        abilityLabel: "STR (Primal Knowledge)",
        abilityModifier: 4,
        totalModifier: 4,
        bonusEntries: []
      })
    );
    expect(perceptionRow).toEqual(
      expect.objectContaining({
        ability: "STR",
        abilityLabel: "STR (Primal Knowledge)",
        abilityModifier: 4,
        totalModifier: 4,
        bonusEntries: []
      })
    );
    expect(intimidationRow).toEqual(
      expect.objectContaining({
        ability: "STR",
        abilityLabel: "STR (Primal Knowledge)",
        abilityModifier: 4,
        totalModifier: 4,
        bonusEntries: []
      })
    );
    expect(getPassivePerceptionForCharacter(character)).toBe(14);
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

    expect(featureChargeCharacter.classFeatureState?.rage?.intimidatingPresenceUsesExpended).toBe(
      1
    );
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

  it("tracks nature's veil as a round-end invisible effect", () => {
    const character = createCharacter({
      className: "Ranger",
      level: 14,
      background: "Criminal / Spy"
    });

    const veiledCharacter = activateFeatureActionForCharacter(character, "ranger-natures-veil");

    expect(veiledCharacter.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: CONDITION_NAME.INVISIBLE,
          source: "Nature's Veil",
          duration: expect.objectContaining({
            kind: "ROUNDS",
            amount: 2,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
          })
        })
      ])
    );
  });

  it("blocks barbarian spellcasting during rage and marks rage resistances with Rage as the source", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true
        }
      }
    });

    const spellcastingState = getSpellcastingStateForCharacter(character);
    const rageAction = getFeatureActionsForCharacter(character).find(
      (action) => action.key === "barbarian-rage"
    );
    const rageResistanceEntries = getDerivedFeatureStatusEntriesForCharacter(character).filter(
      (entry) => entry.group === STATUS_ENTRY_GROUP.RESISTANCES
    );

    expect(spellcastingState).toEqual({
      blocked: true,
      reason: "You can't cast spells while Rage is active."
    });
    expect(rageAction).toEqual(
      expect.objectContaining({
        breakdown: "Rage Active",
        breakdownTone: "danger"
      })
    );
    expect(rageResistanceEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: "BLUDGEONING",
          source: "Rage"
        }),
        expect.objectContaining({
          value: "PIERCING",
          source: "Rage"
        }),
        expect.objectContaining({
          value: "SLASHING",
          source: "Rage"
        })
      ])
    );
  });
});
