import { describe, expect, it } from "vitest";
import {
  consumeRoundTrackerResource,
  startRoundTrackerTurn,
  finishRoundTrackerTurn,
  setRoundTrackerCombatState
} from "../../src/pages/CharactersPage/combat";
import { getEconomyShapeState } from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/gameplayWidgetUtils";
import { characterFixture } from "../fixtures/character";
import { activateFeatureActionForCharacter } from "../../src/pages/CharactersPage/classFeatures";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../src/pages/CharactersPage/actionEconomy";
import {
  getSharedEconomyMultiCountForCharacterAction,
  consumeSharedEconomyMultiForCharacterAction
} from "../../src/pages/CharactersPage/classFeatures/economyMulti";
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
