import { describe, expect, it } from "vitest";
import { ACTION_TYPE, DAMAGE_TYPE, WEAPON_COMBAT_TYPE, WEAPON_PROPERTY, getSpellEntryById } from "../../../codex/entries";
import {
  ARMOR_PROFICIENCY,
  CONDITION_NAME,
  EFFECT_NAME,
  PROF_LEVEL,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  SAVING_THROW_PROFICIENCY,
  SENSE,
  SKILL,
  SKILL_PROFICIENCY,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY
} from "../../../types";
import { createDefaultAbilities, createEmptyCharacter } from "../constants";
import {
  activateFeatureActionForCharacter,
  activateFeatureActionOptionForCharacter,
  applyBardBattleMagicAfterSpellCastForCharacter,
  applyPersistentRageOnInitiativeForCharacter,
  applyInspiredEclipseStatusForCharacter,
  applyLongRestToFeatureState,
  applyShortRestToFeatureState,
  advanceFeatureStateForNewRound,
  canUseBardValorActionCantripForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeBardValorActionCantripForCharacter,
  consumeBarbarianWarriorOfTheGodsChargesForCharacter,
  consumeWeaponAttackActionForCharacter,
  getBardPrimalLoreCantripOptionsForCharacter,
  getAdditionalWeaponMasteriesForCharacter,
  getBardMagicalDiscoveriesSpellOptionsForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureActionsForCharacter,
  getFeatureActionOptionsForCharacter,
  getFeatureArmorProficiencyEntriesForCharacter,
  getFeatureDamageBonusesForWeaponAction,
  getFeatureLanguageProficiencyEntriesForCharacter,
  getFeatureReactionEntriesForCharacter,
  getFeatureSavingThrowProficiencyEntriesForCharacter,
  getFeatureSkillProficiencyEntriesForCharacter,
  getFeatureWeaponProficiencyEntriesForCharacter,
  hasBattleMagicBonusWeaponAttackForCharacter,
  getSpellEntryForCharacter,
  getSavingThrowIndicatorsForCharacter,
  getSkillIndicatorsForCharacter,
  getAlwaysPreparedSpellIdsForCharacter,
  getAbilityCheckIndicatorsForCharacter,
  getCoreStatIndicatorsForCharacter,
  getSpellcastingStateForCharacter,
  markFeatureWeaponBonusUseForCharacter
} from "./index";
import type { Character } from "../../../types";
import { normalizeCharacter } from "../storage";
import {
  createCharacterStatusEntry,
  hasStatusCondition,
  resolveCharacterStatusEntries
} from "../traits";
import { getPassivePerceptionForCharacter } from "../gameplay";
import { getWeaponActionsForCharacter } from "../gameplay";
import { getSkillRowsByAbility } from "../skills";
import { activateBarbarianRage, activateBarbarianWildHeartRage } from "./barbarian";
import { createCharacterEquipmentItem } from "../inventory";
import {
  getDamageRangeLabel,
  getWeaponActionBreakdown
} from "../../../components/CharactersPage/CharacterSheetPage/GameplayForm/gameplayWidgetUtils";
import { getMovementSpeedBreakdownsForCharacter } from "../speed";
import { getArmorClassBreakdownForCharacter } from "../armor";

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

  it("formats bardic inspiration as a music-backed tracked action", () => {
    const character = createCharacter({
      className: "Bard",
      level: 15,
      classFeatureState: {
        bard: {
          bardicInspirationUsesExpended: 1
        }
      }
    });

    const bardicInspirationAction = getFeatureActionsForCharacter(character).find(
      (action) => action.name === "Bardic Inspiration"
    );

    expect(bardicInspirationAction).toEqual(
      expect.objectContaining({
        usesRemaining: 2,
        usesTotal: 3,
        hideUsesTrackerOnCard: true,
        usesInlineLabel: "Use 1",
        usesInlineIcon: "music",
        usesSupplementaryLabel: undefined,
        drawer: expect.objectContaining({
          resources: expect.arrayContaining([
            expect.objectContaining({
              kind: "tracker",
              label: "Uses",
              icon: "music",
              cost: 1
            })
          ])
        })
      })
    );
  });

  it("formats channel divinity as a pyromancy-backed tracked action", () => {
    const character = createCharacter({
      className: "Cleric",
      level: 3
    });

    const channelDivinityAction = getFeatureActionsForCharacter(character).find(
      (action) => action.name === "Channel Divinity"
    );

    expect(channelDivinityAction?.hideUsesTrackerOnCard).toBe(true);
    expect(channelDivinityAction?.usesInlineLabel).toBe("Use 1");
    expect(channelDivinityAction?.usesInlineIcon).toBe("pyromancy");
    expect(channelDivinityAction?.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "tracker",
          label: "Uses",
          icon: "pyromancy",
          cost: 1
        })
      ])
    );
  });

  it("adds Preserve Life as a life domain action that spends Channel Divinity", () => {
    const lifeCleric = createCharacter({
      className: "Cleric",
      level: 3,
      subclassId: "cleric-life-domain"
    });

    const preserveLifeAction = getFeatureActionsForCharacter(lifeCleric).find(
      (action) => action.name === "Preserve Life"
    );
    const activatedCharacter = activateFeatureActionForCharacter(lifeCleric, "cleric-preserve-life");

    expect(preserveLifeAction).toEqual(
      expect.objectContaining({
        usesInlineLabel: "Use 1",
        usesInlineIcon: "pyromancy",
        description: expect.arrayContaining([
          expect.stringContaining("evoke healing energy")
        ]),
        drawer: expect.objectContaining({
          confirmLabel: "Use Preserve Life"
        })
      })
    );
    expect(activatedCharacter.classFeatureState?.cleric?.channelDivinityUsesExpended).toBe(1);
  });

  it("adds inspired eclipse details to bardic inspiration and applies the linked invisibility status", () => {
    const moonBard = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-the-moon"
    });
    const bardicInspirationAction = getFeatureActionsForCharacter(moonBard).find(
      (action) => action.name === "Bardic Inspiration"
    );
    const characterWithInspiredEclipse = applyInspiredEclipseStatusForCharacter(moonBard);

    expect(bardicInspirationAction?.description).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Inspired Eclipse.</strong>")
      ])
    );
    expect(characterWithInspiredEclipse.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: "Inspired Eclipse",
          sourceId: "feature-bard-inspired-eclipse",
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: 1,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
          }
        }),
        expect.objectContaining({
          value: CONDITION_NAME.INVISIBLE,
          sourceId: "feature-bard-inspired-eclipse-invisible",
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: "Inspired Eclipse"
          }
        })
      ])
    );
  });

  it("adds shadow of the new moon to bardic inspiration at level 14", () => {
    const moonBard = createCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-the-moon"
    });
    const bardicInspirationAction = getFeatureActionsForCharacter(moonBard).find(
      (action) => action.name === "Bardic Inspiration"
    );

    expect(bardicInspirationAction?.description).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Inspired Eclipse.</strong>"),
        expect.stringContaining("<strong>Shadow of the New Moon.</strong>")
      ])
    );
  });

  it("labels the default unarmed strike damage as bludgeoning", () => {
    const character = createCharacter({
      className: "Fighter",
      level: 1,
      background: "Soldier"
    });

    const unarmedStrike = getWeaponActionsForCharacter(character).find(
      (action) => action.name === "Unarmed Strike"
    );

    expect(unarmedStrike?.damageLabel).toContain("Bludgeoning");
    expect(
      getDamageRangeLabel(
        unarmedStrike?.damageLabel ?? "",
        unarmedStrike?.totalModifier ?? 0,
        unarmedStrike?.rollFormula ?? "0"
      )
    ).toContain("Bludgeoning");
  });

  it("applies college of dance dazzling footwork to performance, armor class, bardic inspiration, and unarmed strike", () => {
    const character = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-dance",
      abilities: {
        ...createDefaultAbilities(),
        STR: 12,
        DEX: 16,
        CHA: 18
      }
    });

    const skillIndicators = getSkillIndicatorsForCharacter(character);
    const armorClassBreakdown = getArmorClassBreakdownForCharacter(character);
    const bardicInspirationAction = getFeatureActionsForCharacter(character).find(
      (action) => action.name === "Bardic Inspiration"
    );
    const unarmedStrike = getWeaponActionsForCharacter(character).find(
      (action) => action.name === "Unarmed Strike"
    );

    expect(skillIndicators[SKILL.PERFORMANCE]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Advantage",
          source: "Dazzling Footwork"
        })
      ])
    );
    expect(armorClassBreakdown.total).toBe(17);
    expect(armorClassBreakdown.source).toBe("Unarmored Defense");
    expect(bardicInspirationAction?.description).toContain(
      "Agile Strikes: You can make one Unarmed Strike as part of this action."
    );
    expect(unarmedStrike).toEqual(
      expect.objectContaining({
        ability: "DEX",
        damageAbility: "DEX",
        damageAbilityModifier: 3,
        damageFormula: "1d6",
        damageLabel: "1d6 Bludgeoning",
        rollFormula: "1d6+3"
      })
    );
    expect(
      getDamageRangeLabel(
        unarmedStrike?.damageLabel ?? "",
        unarmedStrike?.totalModifier ?? 0,
        unarmedStrike?.rollFormula ?? "0"
      )
    ).toContain("1d6 Bludgeoning + 3");
  });

  it("adds inspiring movement to bard college of dance reactions at level 6", () => {
    const character = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-dance"
    });

    expect(getFeatureReactionEntriesForCharacter(character)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "reaction-inspiring-movement",
          name: "Inspiring Movement",
          sourceLabel: "College of Dance"
        })
      ])
    );
  });

  it("adds cutting words to bard college of lore reactions at level 3", () => {
    const character = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-lore"
    });

    expect(getFeatureReactionEntriesForCharacter(character)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "reaction-cutting-words",
          name: "Cutting Words",
          sourceLabel: "College of Lore"
        })
      ])
    );
  });

  it("grants bard college of lore bonus proficiencies from the selected skills", () => {
    const character = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-lore",
      classFeatureState: {
        bard: {
          loreBonusProficiencies: [SKILL.ARCANA, SKILL.HISTORY, SKILL.INSIGHT]
        }
      }
    });

    expect(getFeatureSkillProficiencyEntriesForCharacter(character)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceStr: "College of Lore: Bonus Proficiencies",
          proficiencyLevel: "PROFICIENT"
        })
      ])
    );
    expect(
      getFeatureSkillProficiencyEntriesForCharacter(character).filter(
        (entry) => entry.sourceStr === "College of Lore: Bonus Proficiencies"
      )
    ).toHaveLength(3);
  });

  it("adds moon bard primal lore language, skill, and cantrip benefits", () => {
    const character = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-the-moon",
      classFeatureState: {
        bard: {
          primalLoreCantripId: "spell-guidance",
          primalLoreSkill: SKILL.NATURE
        }
      }
    });

    expect(getBardPrimalLoreCantripOptionsForCharacter(character).map((spell) => spell.id)).toContain(
      "spell-guidance"
    );
    expect(
      getBardPrimalLoreCantripOptionsForCharacter(character).map((spell) => spell.id)
    ).not.toContain("spell-fireball");
    expect(getAlwaysPreparedSpellIdsForCharacter(character)).toContain("spell-guidance");
    expect(
      getFeatureSkillProficiencyEntriesForCharacter(character).some(
        (entry) =>
          entry.sourceStr === "College of the Moon: Primal Lore" &&
          entry.proficiencyLevel === "PROFICIENT"
      )
    ).toBe(true);
    expect(
      getFeatureLanguageProficiencyEntriesForCharacter(character).some(
        (entry) =>
          entry.sourceStr === "College of the Moon: Primal Lore" &&
          entry.proficiencyLevel === "PROFICIENT"
      )
    ).toBe(true);
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

  it("applies divine fury once per turn while a zealot barbarian is raging", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      subclassId: "barbarian-path-of-the-zealot",
      background: "Criminal / Spy",
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      },
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true
        }
      }
    });

    const damageBonuses = getFeatureDamageBonusesForWeaponAction(character, {
      name: "Greataxe",
      ability: "STR",
      attackKind: "weapon",
      combatType: WEAPON_COMBAT_TYPE.MELEE
    });

    expect(damageBonuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Divine Fury",
          formula: "1d6+1",
          displayLabel: "1d6 + 1 Necrotic/Radiant"
        })
      ])
    );

    const consumedCharacter = markFeatureWeaponBonusUseForCharacter(character, "Divine Fury");
    const nextRoundCharacter = advanceFeatureStateForNewRound(consumedCharacter);

    expect(consumedCharacter.classFeatureState?.rage?.divineFuryUsedThisTurn).toBe(true);
    expect(nextRoundCharacter.classFeatureState?.rage?.divineFuryUsedThisTurn).toBe(false);
  });

  it("adds fanatical focus when a zealot barbarian enters rage", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 6,
      subclassId: "barbarian-path-of-the-zealot",
      background: "Criminal / Spy"
    });

    const ragingCharacter = activateFeatureActionForCharacter(character, "barbarian-rage");

    expect(ragingCharacter.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-fanatical-focus",
          value: "Fanatical Focus",
          source: "Path of the Zealot",
          duration: expect.objectContaining({
            kind: STATUS_DURATION_KIND.LINKED,
            linkedValue: EFFECT_NAME.RAGE
          })
        })
      ])
    );
  });

  it("shows warrior of the gods charges for a zealot barbarian and spends them on use", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 6,
      subclassId: "barbarian-path-of-the-zealot",
      background: "Criminal / Spy"
    });

    const warriorOfTheGodsAction = getFeatureActionsForCharacter(character).find(
      (action) => action.key === "barbarian-warrior-of-the-gods"
    );

    expect(warriorOfTheGodsAction).toEqual(
      expect.objectContaining({
        name: "Warrior of the Gods",
        usesLabel: "5/5 charges",
        breakdown: "Use a 1d6 + 3 to heal yourself."
      })
    );

    const spentCharacter = consumeBarbarianWarriorOfTheGodsChargesForCharacter(character, 2);

    expect(spentCharacter.classFeatureState?.rage?.warriorOfTheGodsUsesExpended).toBe(2);
  });

  it("shows zealous presence and falls back to rage charges after its main charge is spent", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 10,
      subclassId: "barbarian-path-of-the-zealot",
      background: "Criminal / Spy"
    });

    const zealousPresenceAction = getFeatureActionsForCharacter(character).find(
      (action) => action.key === "barbarian-zealous-presence"
    );

    expect(zealousPresenceAction).toEqual(
      expect.objectContaining({
        name: "Zealous Presence",
        usesLabel: "1/1 charge",
        breakdown: "Divine infused Battle Cry"
      })
    );

    const firstUseCharacter = activateFeatureActionForCharacter(
      character,
      "barbarian-zealous-presence"
    );
    const fallbackAction = getFeatureActionsForCharacter(firstUseCharacter).find(
      (action) => action.key === "barbarian-zealous-presence"
    );

    expect(firstUseCharacter.classFeatureState?.rage?.zealousPresenceUsesExpended).toBe(1);
    expect(fallbackAction).toEqual(
      expect.objectContaining({
        usesInlineLabel: "Use 1",
        usesInlineIcon: "flame"
      })
    );

    const secondUseCharacter = activateFeatureActionForCharacter(
      firstUseCharacter,
      "barbarian-zealous-presence"
    );

    expect(secondUseCharacter.classFeatureState?.rage?.usesExpended).toBe(1);
  });

  it("only adds rage of the gods when the zealot barbarian opts into it", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-zealot",
      background: "Criminal / Spy"
    });

    const regularRagingCharacter = activateFeatureActionForCharacter(character, "barbarian-rage");
    const ragingCharacter = activateBarbarianRage(character, {
      useRageOfTheGods: true
    });
    const derivedStatuses = getDerivedFeatureStatusEntriesForCharacter(ragingCharacter);
    const resolvedStatuses = resolveCharacterStatusEntries(
      ragingCharacter.statusEntries,
      derivedStatuses
    );
    const movement = getMovementSpeedBreakdownsForCharacter(ragingCharacter);

    expect(regularRagingCharacter.statusEntries).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods"
        })
      ])
    );
    expect(ragingCharacter.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods",
          value: "Rage of the Gods",
          source: "Path of the Zealot",
          duration: expect.objectContaining({
            kind: STATUS_DURATION_KIND.MINUTES,
            amount: 1
          })
        })
      ])
    );
    expect(resolvedStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods",
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Rage of the Gods"
        })
      ])
    );
    expect(derivedStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods",
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.NECROTIC
        }),
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods",
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.PSYCHIC
        }),
        expect.objectContaining({
          sourceId: "feature-barbarian-rage-of-the-gods",
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.RADIANT
        })
      ])
    );
    expect(ragingCharacter.classFeatureState?.rage?.rageOfTheGodsUsesExpended).toBe(1);
    expect(movement.fly.total).toBe(40);
    expect(movement.fly.baseExpression).toEqual(
      expect.objectContaining({
        kind: "walk",
        sourceLabel: "Rage of the Gods"
      })
    );
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
        disabledReason: undefined,
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

  it("grants wild heart animal speaker spells as always prepared", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      subclassId: "barbarian-path-of-the-wild-heart",
      background: "Criminal / Spy"
    });

    expect(getAlwaysPreparedSpellIdsForCharacter(character)).toEqual([
      "spell-beast-sense",
      "spell-speak-with-animals"
    ]);
  });

  it("adds nature speaker to wild heart always prepared spells at level 10", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 10,
      subclassId: "barbarian-path-of-the-wild-heart",
      background: "Criminal / Spy"
    });

    expect(getAlwaysPreparedSpellIdsForCharacter(character)).toEqual([
      "spell-beast-sense",
      "spell-speak-with-animals",
      "spell-commune-with-nature"
    ]);
  });

  it("grants glamour bard beguiling magic spells as always prepared", () => {
    const character = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-glamour"
    });

    expect(getAlwaysPreparedSpellIdsForCharacter(character)).toEqual(
      expect.arrayContaining(["spell-charm-person", "spell-mirror-image"])
    );
  });

  it("adds mantle of inspiration as a glamour bard bonus action that spends bardic inspiration", () => {
    const character = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-glamour",
      classFeatureState: {
        bard: {
          bardicInspirationUsesExpended: 0
        }
      }
    });

    const mantleOfInspiration = getFeatureActionsForCharacter(character).find(
      (action) => action.name === "Mantle of Inspiration"
    );
    const activatedCharacter = activateFeatureActionForCharacter(
      character,
      "bard-mantle-of-inspiration"
    );

    expect(mantleOfInspiration).toEqual(
      expect.objectContaining({
        economyType: "bonus_action",
        usesInlineLabel: "Use 1",
        usesInlineIcon: "music",
        breakdown: "Grant TempHP to creatures",
        drawer: expect.objectContaining({
          confirmLabel: "Roll Bardic Dice"
        }),
        execute: expect.objectContaining({
          kind: "activate",
          effectKind: "bardic-inspiration-roll"
        })
      })
    );
    expect(activatedCharacter.classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(1);
  });

  it("spends beguiling magic first, then bardic inspiration, and restores the free use on long rest", () => {
    const glamourBard = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-glamour",
      classFeatureState: {
        bard: {
          bardicInspirationUsesExpended: 0,
          beguilingMagicUsesExpended: 0
        }
      }
    });

    const afterFirstUse = consumeBeguilingMagicOrBardicInspirationForCharacter(glamourBard);
    const afterSecondUse = consumeBeguilingMagicOrBardicInspirationForCharacter(afterFirstUse);
    const afterLongRest = applyLongRestToFeatureState(afterSecondUse);

    expect(getBeguilingMagicUsesRemainingForCharacter(afterFirstUse)).toBe(0);
    expect(afterFirstUse.classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(0);
    expect(afterSecondUse.classFeatureState?.bard?.bardicInspirationUsesExpended).toBe(1);
    expect(getBeguilingMagicUsesRemainingForCharacter(afterLongRest)).toBe(1);
  });

  it("adds mantle of majesty, prepares command, and transforms command while the mantle is active", () => {
    const glamourBard = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-glamour",
      statusEntries: [
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: EFFECT_NAME.CONCENTRATION,
          source: "Mantle of Majesty",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: 10,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
          },
          sourceId: "feature-bard-mantle-of-majesty-concentration"
        }),
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Mantle of Majesty",
          source: "College of Glamour",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.CONCENTRATION
          },
          sourceId: "feature-bard-mantle-of-majesty"
        })
      ]
    });
    const mantleOfMajesty = getFeatureActionsForCharacter(glamourBard).find(
      (action) => action.name === "Mantle of Majesty"
    );
    const command = getSpellEntryById("spell-command");

    if (!command) {
      throw new Error("Expected Command to exist.");
    }

    const transformedCommand = getSpellEntryForCharacter(glamourBard, command);

    expect(getAlwaysPreparedSpellIdsForCharacter(glamourBard)).toEqual(
      expect.arrayContaining(["spell-command"])
    );
    expect(mantleOfMajesty).toEqual(
      expect.objectContaining({
        breakdown: "Command as the Majesty you are.",
        execute: expect.objectContaining({
          kind: "spell",
          effectKind: "mantle-of-majesty",
          spellId: "spell-command"
        }),
        isActive: true
      })
    );
    expect(transformedCommand.castingTime).toEqual([ACTION_TYPE.BONUS_ACTION]);
  });

  it("grants valor bard martial training proficiencies", () => {
    const valorBard = createCharacter({
      className: "Bard",
      level: 3,
      subclassId: "bard-college-of-valor"
    });

    expect(getFeatureWeaponProficiencyEntriesForCharacter(valorBard)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceStr: "College of Valor: Martial Training",
          proficiency: WEAPON_PROFICIENCY.MARTIAL
        })
      ])
    );
    expect(getFeatureArmorProficiencyEntriesForCharacter(valorBard)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceStr: "College of Valor: Martial Training",
          proficiency: ARMOR_PROFICIENCY.MEDIUM
        }),
        expect.objectContaining({
          sourceStr: "College of Valor: Martial Training",
          proficiency: ARMOR_PROFICIENCY.SHIELD
        })
      ])
    );
  });

  it("lets valor bard replace one extra attack with an action cantrip", () => {
    const viciousMockery = getSpellEntryById("spell-vicious-mockery");

    if (!viciousMockery) {
      throw new Error("Expected Vicious Mockery to exist.");
    }

    const valorBard = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-valor"
    });
    const afterFirstAttack = consumeWeaponAttackActionForCharacter(valorBard, {
      key: "weapon-rapier",
      economyType: "action",
      attackKind: "weapon"
    });
    const afterCantrip = consumeBardValorActionCantripForCharacter(afterFirstAttack);
    const nextRoundCharacter = advanceFeatureStateForNewRound(afterCantrip);

    expect(afterFirstAttack.roundTracker?.actionAvailable).toBe(false);
    expect(afterFirstAttack.classFeatureState?.bard?.extraAttacksRemainingThisTurn).toBe(1);
    expect(canUseBardValorActionCantripForCharacter(afterFirstAttack, viciousMockery)).toBe(true);
    expect(afterCantrip.classFeatureState?.bard?.extraAttacksRemainingThisTurn).toBe(0);
    expect(afterCantrip.classFeatureState?.bard?.valorCantripReplacementUsedThisTurn).toBe(true);
    expect(canUseBardValorActionCantripForCharacter(afterCantrip, viciousMockery)).toBe(false);
    expect(nextRoundCharacter.classFeatureState?.bard?.extraAttacksRemainingThisTurn).toBe(0);
    expect(nextRoundCharacter.classFeatureState?.bard?.valorCantripReplacementUsedThisTurn).toBe(false);
  });

  it("grants and consumes battle magic bonus attacks for valor bards", () => {
    const viciousMockery = getSpellEntryById("spell-vicious-mockery");

    if (!viciousMockery) {
      throw new Error("Expected Vicious Mockery to exist.");
    }

    const valorBard = createCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-valor",
      roundTracker: {
        turnStarted: true,
        actionAvailable: false,
        bonusActionAvailable: true,
        reactionAvailable: true
      },
      classFeatureState: {
        bard: {
          extraAttacksRemainingThisTurn: 1
        }
      }
    });
    const afterSpellCast = applyBardBattleMagicAfterSpellCastForCharacter(valorBard, viciousMockery);
    const afterFirstAttack = consumeWeaponAttackActionForCharacter(afterSpellCast, {
      key: "weapon-rapier",
      economyType: "action",
      attackKind: "weapon"
    });
    const afterSecondAttack = consumeWeaponAttackActionForCharacter(afterFirstAttack, {
      key: "weapon-rapier",
      economyType: "action",
      attackKind: "weapon"
    });

    expect(hasBattleMagicBonusWeaponAttackForCharacter(afterSpellCast, "weapon")).toBe(true);
    expect(afterFirstAttack.classFeatureState?.bard?.extraAttacksRemainingThisTurn).toBe(0);
    expect(afterFirstAttack.classFeatureState?.bard?.battleMagicBonusAttackAvailable).toBe(true);
    expect(afterFirstAttack.roundTracker?.bonusActionAvailable).toBe(true);
    expect(afterSecondAttack.classFeatureState?.bard?.battleMagicBonusAttackAvailable).toBe(false);
    expect(afterSecondAttack.roundTracker?.bonusActionAvailable).toBe(false);
  });

  it("adds lore magical discoveries as always-prepared spells and limits options to current spell access", () => {
    const loreBard = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-lore",
      classFeatureState: {
        bard: {
          magicalDiscoveriesSpellIds: ["spell-guidance", "spell-fireball", "spell-stoneskin"]
        }
      }
    });

    const magicalDiscoveryOptions = getBardMagicalDiscoveriesSpellOptionsForCharacter(loreBard);

    expect(magicalDiscoveryOptions.map((spell) => spell.id)).toContain("spell-guidance");
    expect(magicalDiscoveryOptions.map((spell) => spell.id)).toContain("spell-fireball");
    expect(magicalDiscoveryOptions.map((spell) => spell.id)).not.toContain("spell-stoneskin");
    expect(getAlwaysPreparedSpellIdsForCharacter(loreBard)).toEqual(
      expect.arrayContaining(["spell-guidance", "spell-fireball"])
    );
    expect(getAlwaysPreparedSpellIdsForCharacter(loreBard)).not.toContain("spell-stoneskin");
  });

  it("adds moonbeam as always prepared and appends blessing of moonlight to moonbeam", () => {
    const moonBard = createCharacter({
      className: "Bard",
      level: 6,
      subclassId: "bard-college-of-the-moon"
    });
    const moonbeam = getSpellEntryById("spell-moonbeam");

    if (!moonbeam) {
      throw new Error("Expected Moonbeam to exist.");
    }

    const transformedMoonbeam = getSpellEntryForCharacter(moonBard, moonbeam);

    expect(getAlwaysPreparedSpellIdsForCharacter(moonBard)).toContain("spell-moonbeam");
    expect(
      transformedMoonbeam.description.some(
        (entry) =>
          typeof entry === "string" &&
          entry.includes("<strong>Blessing of Moonlight.</strong>")
      )
    ).toBe(true);
    expect(
      transformedMoonbeam.description.some(
        (entry) =>
          typeof entry === "string" &&
          entry.includes("you can't use it again until you finish a <link:long-rest>Long Rest</link>")
      )
    ).toBe(true);
  });

  it("grants cleric domain spells as always prepared based on subclass and cleric level", () => {
    const knowledgeCleric = createCharacter({
      className: "Cleric",
      level: 9,
      subclassId: "cleric-knowledge-domain"
    });
    const lifeCleric = createCharacter({
      className: "Cleric",
      level: 9,
      subclassId: "cleric-life-domain"
    });
    const lightCleric = createCharacter({
      className: "Cleric",
      level: 9,
      subclassId: "cleric-light-domain"
    });
    const trickeryCleric = createCharacter({
      className: "Cleric",
      level: 9,
      subclassId: "cleric-trickery-domain"
    });
    const warCleric = createCharacter({
      className: "Cleric",
      level: 9,
      subclassId: "cleric-war-domain"
    });

    expect(getAlwaysPreparedSpellIdsForCharacter(knowledgeCleric)).toEqual([
      "spell-command",
      "spell-comprehend-languages",
      "spell-detect-magic",
      "spell-detect-thoughts",
      "spell-identify",
      "spell-mind-spike",
      "spell-dispel-magic",
      "spell-nondetection",
      "spell-tongues",
      "spell-arcane-eye",
      "spell-banishment",
      "spell-confusion",
      "spell-legend-lore",
      "spell-scrying",
      "spell-synaptic-static"
    ]);
    expect(getAlwaysPreparedSpellIdsForCharacter(lifeCleric)).toEqual([
      "spell-aid",
      "spell-bless",
      "spell-cure-wounds",
      "spell-lesser-restoration",
      "spell-mass-healing-word",
      "spell-revivify",
      "spell-aura-of-life",
      "spell-death-ward",
      "spell-greater-restoration",
      "spell-mass-cure-wounds"
    ]);
    expect(getAlwaysPreparedSpellIdsForCharacter(lightCleric)).toEqual([
      "spell-burning-hands",
      "spell-faerie-fire",
      "spell-scorching-ray",
      "spell-see-invisibility",
      "spell-daylight",
      "spell-fireball",
      "spell-arcane-eye",
      "spell-wall-of-fire",
      "spell-flame-strike",
      "spell-scrying"
    ]);
    expect(getAlwaysPreparedSpellIdsForCharacter(trickeryCleric)).toEqual([
      "spell-charm-person",
      "spell-disguise-self",
      "spell-invisibility",
      "spell-pass-without-trace",
      "spell-hypnotic-pattern",
      "spell-nondetection",
      "spell-confusion",
      "spell-dimension-door",
      "spell-dominate-person",
      "spell-modify-memory"
    ]);
    expect(getAlwaysPreparedSpellIdsForCharacter(warCleric)).toEqual([
      "spell-guiding-bolt",
      "spell-magic-weapon",
      "spell-shield-of-faith",
      "spell-spiritual-weapon",
      "spell-crusaders-mantle",
      "spell-spirit-guardians",
      "spell-fire-shield",
      "spell-freedom-of-movement",
      "spell-hold-monster",
      "spell-steel-wind-strike"
    ]);
  });

  it("grants Knowledge Domain expertise picks and locks Unfettered Mind to INT when needed", () => {
    const knowledgeCleric = createCharacter({
      className: "Cleric",
      level: 6,
      subclassId: "cleric-knowledge-domain",
      classFeatureState: {
        cleric: {
          knowledgeBlessingsSkills: [SKILL.ARCANA, SKILL.HISTORY]
        }
      }
    });

    expect(getFeatureSkillProficiencyEntriesForCharacter(knowledgeCleric)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceStr: "Blessings of Knowledge",
          proficiency: SKILL_PROFICIENCY.ARCANA,
          proficiencyLevel: PROF_LEVEL.PROFICIENT
        }),
        expect.objectContaining({
          sourceStr: "Blessings of Knowledge",
          proficiency: SKILL_PROFICIENCY.ARCANA,
          proficiencyLevel: PROF_LEVEL.EXPERT
        }),
        expect.objectContaining({
          sourceStr: "Blessings of Knowledge",
          proficiency: SKILL_PROFICIENCY.HISTORY,
          proficiencyLevel: PROF_LEVEL.PROFICIENT
        }),
        expect.objectContaining({
          sourceStr: "Blessings of Knowledge",
          proficiency: SKILL_PROFICIENCY.HISTORY,
          proficiencyLevel: PROF_LEVEL.EXPERT
        })
      ])
    );
    expect(getFeatureSavingThrowProficiencyEntriesForCharacter(knowledgeCleric)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceStr: "Unfettered Mind",
          proficiency: "INT",
          proficiencyLevel: PROF_LEVEL.PROFICIENT
        })
      ])
    );
  });

  it("lets Knowledge Domain choose a different save when INT is already proficient and applies Divine Foreknowledge", () => {
    const knowledgeCleric = createCharacter({
      className: "Cleric",
      level: 17,
      subclassId: "cleric-knowledge-domain",
      savingThrowProficiencies: [
        {
          source: PROFICIENCY_SOURCE.MANUAL,
          proficiency: SAVING_THROW_PROFICIENCY.INT,
          proficiencyLevel: PROF_LEVEL.PROFICIENT,
          overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
        }
      ],
      classFeatureState: {
        cleric: {
          knowledgeBlessingsSkills: [SKILL.NATURE, SKILL.RELIGION],
          unfetteredMindSavingThrow: SAVING_THROW_PROFICIENCY.DEX
        }
      }
    });

    const divineForeknowledgeAction = getFeatureActionsForCharacter(knowledgeCleric).find(
      (action) => action.name === "Divine Foreknowledge"
    );
    const activatedCharacter = activateFeatureActionForCharacter(
      knowledgeCleric,
      "cleric-divine-foreknowledge"
    );

    expect(getFeatureSavingThrowProficiencyEntriesForCharacter(knowledgeCleric)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceStr: "Unfettered Mind",
          proficiency: "DEX",
          proficiencyLevel: PROF_LEVEL.PROFICIENT
        })
      ])
    );
    expect(getAbilityCheckIndicatorsForCharacter(activatedCharacter)).toEqual({
      STR: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }],
      DEX: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }],
      CON: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }],
      INT: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }],
      WIS: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }],
      CHA: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }]
    });
    expect(getCoreStatIndicatorsForCharacter(activatedCharacter)).toEqual({
      initiative: [{ label: "Advantage", tone: "advantage", source: "Divine Foreknowledge" }]
    });
    expect(divineForeknowledgeAction).toEqual(
      expect.objectContaining({
        usesLabel: "1/1 use",
        usesInlineLabel: "| Use 6+ Spell Slot",
        description: expect.arrayContaining([
          expect.stringContaining("magically expand your mind to the future")
        ])
      })
    );
    expect(activatedCharacter.statusEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: "Divine Foreknowledge",
          sourceId: "feature-cleric-divine-foreknowledge",
          duration: {
            kind: STATUS_DURATION_KIND.HOURS,
            amount: 1
          }
        })
      ])
    );
    expect(getSkillIndicatorsForCharacter(activatedCharacter)[SKILL.ARCANA]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Advantage",
          source: "Divine Foreknowledge"
        })
      ])
    );
    expect(getSavingThrowIndicatorsForCharacter(activatedCharacter).DEX).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Advantage",
          source: "Divine Foreknowledge"
        })
      ])
    );
  });

  it("adds unbreakable majesty at level 14 and restores its use on short rest", () => {
    const glamourBard = createCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-glamour",
      classFeatureState: {
        bard: {
          unbreakableMajestyUsesExpended: 1
        }
      }
    });

    const unbreakableMajesty = getFeatureActionsForCharacter(glamourBard).find(
      (action) => action.name === "Unbreakable Majesty"
    );
    const afterShortRest = applyShortRestToFeatureState(glamourBard);

    expect(unbreakableMajesty).toEqual(
      expect.objectContaining({
        breakdown: "Assume magically majestic presense",
        execute: expect.objectContaining({
          kind: "activate"
        }),
        usesRemaining: 0,
        usesTotal: 1
      })
    );
    expect(afterShortRest.classFeatureState?.bard?.unbreakableMajestyUsesExpended).toBe(0);
  });

  it("grants owl darkvision from aspect of the wilds", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 6,
      subclassId: "barbarian-path-of-the-wild-heart",
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 0,
          active: false,
          wildHeartAspect: "owl"
        }
      }
    });

    expect(getDerivedFeatureStatusEntriesForCharacter(character)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: STATUS_ENTRY_GROUP.SENSES,
          value: SENSE.DARKVISION,
          source: "Aspect of the Wilds",
          rangeFeet: 60
        })
      ])
    );
  });

  it("requires a rage of the wilds choice and applies bear resistances during rage", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      subclassId: "barbarian-path-of-the-wild-heart",
      background: "Criminal / Spy"
    });

    const rageAction = getFeatureActionsForCharacter(character).find(
      (action) => action.key === "barbarian-rage"
    );
    const rageOptions = getFeatureActionOptionsForCharacter(character, "barbarian-rage");
    const ragingCharacter = activateFeatureActionOptionForCharacter(
      character,
      "barbarian-rage",
      "bear"
    );
    const resistanceEntries = getDerivedFeatureStatusEntriesForCharacter(ragingCharacter).filter(
      (entry) => entry.group === STATUS_ENTRY_GROUP.RESISTANCES
    );

    expect(rageAction).toEqual(
      expect.objectContaining({
        interaction: "select"
      })
    );
    expect(rageOptions.map((option) => option.name)).toEqual(["Bear", "Eagle", "Wolf"]);
    expect(ragingCharacter.classFeatureState?.rage?.active).toBe(true);
    expect(ragingCharacter.classFeatureState?.rage?.wildHeartRageOption).toBe("bear");
    expect(resistanceEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: DAMAGE_TYPE.ACID, source: "Rage of the Wilds" }),
        expect.objectContaining({ value: DAMAGE_TYPE.COLD, source: "Rage of the Wilds" }),
        expect.objectContaining({ value: DAMAGE_TYPE.FIRE, source: "Rage of the Wilds" }),
        expect.objectContaining({ value: DAMAGE_TYPE.LIGHTNING, source: "Rage of the Wilds" }),
        expect.objectContaining({ value: DAMAGE_TYPE.POISON, source: "Rage of the Wilds" }),
        expect.objectContaining({ value: DAMAGE_TYPE.THUNDER, source: "Rage of the Wilds" })
      ])
    );
  });

  it("stores both wild heart rage choices and exposes them as active feature traits", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-wild-heart",
      background: "Criminal / Spy"
    });

    const ragingCharacter = activateBarbarianWildHeartRage(character, "bear", "falcon");
    const effectEntries = getDerivedFeatureStatusEntriesForCharacter(ragingCharacter).filter(
      (entry) => entry.group === STATUS_ENTRY_GROUP.EFFECTS
    );

    expect(ragingCharacter.classFeatureState?.rage?.active).toBe(true);
    expect(ragingCharacter.classFeatureState?.rage?.wildHeartRageOption).toBe("bear");
    expect(ragingCharacter.classFeatureState?.rage?.wildHeartPowerOption).toBe("falcon");
    expect(effectEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "Bear", source: "Rage of the Wilds" }),
        expect.objectContaining({ value: "Falcon", source: "Power of the Wilds" })
      ])
    );
  });

  it("grants vitality of the tree temporary hit points when a world tree barbarian enters rage", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy",
      temporaryHitPoints: 0
    });

    const ragingCharacter = activateFeatureActionForCharacter(character, "barbarian-rage");

    expect(ragingCharacter.classFeatureState?.rage?.active).toBe(true);
    expect(ragingCharacter.temporaryHitPoints).toBe(3);
    expect(ragingCharacter.temporaryHitPointsSource).toBe("Vitality Surge");
  });

  it("does not replace a higher temporary hit point total with vitality of the tree", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 3,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy",
      temporaryHitPoints: 7,
      temporaryHitPointsSource: "Tireless"
    });

    const ragingCharacter = activateFeatureActionForCharacter(character, "barbarian-rage");

    expect(ragingCharacter.temporaryHitPoints).toBe(7);
    expect(ragingCharacter.temporaryHitPointsSource).toBe("Tireless");
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

  it("adds branches of the tree to the reactions list at level 6", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 6,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy"
    });

    const reactionEntries = getFeatureReactionEntriesForCharacter(character);

    expect(reactionEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "reaction-world-tree-branches-of-the-tree",
          name: "Branches of the Tree",
          sourceLabel: "Path of the World Tree"
        })
      ])
    );
  });

  it("adds battering roots to eligible melee weapon actions during the turn and exposes push mastery", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 10,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy",
      roundTracker: {
        turnStarted: true,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      },
      equipment: [createCharacterEquipmentItem("Greataxe", true)]
    });

    const greataxeAction = getWeaponActionsForCharacter(character).find(
      (action) => action.name === "Greataxe"
    );
    const additionalMasteries = getAdditionalWeaponMasteriesForCharacter(character, {
      attackKind: "weapon",
      combatType: WEAPON_COMBAT_TYPE.MELEE,
      properties: [WEAPON_PROPERTY.HEAVY, WEAPON_PROPERTY.TWO_HANDED]
    });

    expect(greataxeAction).toEqual(
      expect.objectContaining({
        hasBatteringRootsBonus: true
      })
    );
    expect(getWeaponActionBreakdown(greataxeAction!)).toContain("+ Battering Roots");
    expect(additionalMasteries).toEqual([
      expect.objectContaining({
        mastery: "PUSH",
        source: "Battering Roots"
      })
    ]);
  });

  it("does not add battering roots to weapon actions outside your turn", () => {
    const character = createCharacter({
      className: "Barbarian",
      level: 10,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy",
      roundTracker: {
        turnStarted: false,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true
      },
      equipment: [createCharacterEquipmentItem("Greataxe", true)]
    });

    const greataxeAction = getWeaponActionsForCharacter(character).find(
      (action) => action.name === "Greataxe"
    );

    expect(greataxeAction).toEqual(
      expect.objectContaining({
        hasBatteringRootsBonus: false
      })
    );
    expect(getWeaponActionBreakdown(greataxeAction!)).not.toContain("+ Battering Roots");
  });

  it("adds travel along the tree as a rage-only bonus action that spends rage charges", () => {
    const inactiveCharacter = createCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: false
        }
      }
    });

    const inactiveAction = getFeatureActionsForCharacter(inactiveCharacter).find(
      (action) => action.key === "barbarian-travel-along-the-tree"
    );

    expect(inactiveAction).toEqual(
      expect.objectContaining({
        name: "Travel Along the Tree",
        usesLabel: "Use 1",
        usesIcon: "flame",
        breakdown: "Teleport while in Rage.",
        economyType: "bonus_action",
        disabled: true
      })
    );

    const ragingCharacter = createCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-world-tree",
      background: "Criminal / Spy",
      classFeatureState: {
        rage: {
          usesExpended: 1,
          active: true
        }
      }
    });

    const activeAction = getFeatureActionsForCharacter(ragingCharacter).find(
      (action) => action.key === "barbarian-travel-along-the-tree"
    );
    const teleportedCharacter = activateFeatureActionForCharacter(
      ragingCharacter,
      "barbarian-travel-along-the-tree"
    );

    expect(activeAction).toEqual(
      expect.objectContaining({
        disabled: false
      })
    );
    expect(teleportedCharacter.classFeatureState?.rage?.usesExpended).toBe(2);
    expect(teleportedCharacter.classFeatureState?.rage?.active).toBe(true);
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
        usesInlineLabel: "Use 1",
        usesInlineIcon: "flame"
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
