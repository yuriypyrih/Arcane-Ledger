import { describe, expect, it } from "vitest";
import {
  consumeRoundTrackerResource,
  startRoundTrackerTurn,
  finishRoundTrackerTurn,
  setRoundTrackerCombatState
} from "../../src/pages/CharactersPage/combat";
import { getEconomyShapeState } from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/gameplayWidgetUtils";
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
  it("permits an extra action after the ordinary action is spent", () => {
    const spent = consumeRoundTrackerResource(startRoundTrackerTurn(), "action");
    expect(getEconomyShapeState("action", spent, 0).isUsable).toBe(false);
    expect(getEconomyShapeState("action", spent, 1).isUsable).toBe(true);
  });
  it("does not consume round resources outside combat", () => {
    expect(consumeRoundTrackerResource(undefined, "action").actionAvailable).toBe(true);
  });
});
