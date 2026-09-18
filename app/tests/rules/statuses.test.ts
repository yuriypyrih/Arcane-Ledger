import { describe, expect, it } from "vitest";
import { DURATION } from "../../src/codex/entries/enums";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND as Kind,
  STATUS_DURATION_ROUND_TICK as Tick,
  STATUS_ENTRY_GROUP as Group
} from "../../src/types";
import {
  applySpellConcentrationToStatusEntries,
  createCharacterStatusEntry,
  removeCharacterStatusEntry,
  advanceCharacterStatusEntries,
  applyShortRestToCharacterStatusEntries,
  applyLongRestToCharacterStatusEntries
} from "../../src/pages/CharactersPage/statusEntries";

function effect(
  value: string,
  duration: Parameters<typeof createCharacterStatusEntry>[0]["duration"]
) {
  return createCharacterStatusEntry({ group: Group.EFFECTS, value, source: "Test", duration });
}
const spell = (name: string) => ({
  id: `spell-${name.toLowerCase()}`,
  name,
  duration: [DURATION.CONCENTRATION, "up to 1 minute"]
});
describe("concentration and timed effects", () => {
  it("replaces concentration and its linked effects while preserving unrelated conditions", () => {
    const poison = createCharacterStatusEntry({
      group: Group.CONDITIONS,
      value: CONDITION_NAME.POISONED,
      source: "Trap"
    });
    const linked = effect("Bless benefit", { kind: Kind.CONCENTRATION });
    const initial = [...applySpellConcentrationToStatusEntries([poison], spell("Bless")), linked];
    const replaced = applySpellConcentrationToStatusEntries(initial, spell("Bane"));
    expect(replaced.map((e) => e.value)).toEqual([
      CONDITION_NAME.POISONED,
      EFFECT_NAME.CONCENTRATION
    ]);
    expect(replaced.find((e) => e.value === EFFECT_NAME.CONCENTRATION)?.source).toBe("Bane");
    expect(initial).toHaveLength(3);
  });
  it("removes dependent effects when concentration ends manually", () => {
    const initial = applySpellConcentrationToStatusEntries([], spell("Bless"));
    initial.push(effect("Bless benefit", { kind: Kind.CONCENTRATION }));
    expect(removeCharacterStatusEntry(initial, initial[0].id)).toEqual([]);
  });
  it("ticks only at the configured round boundary and removes expired effects", () => {
    const initial = [effect("One turn", { kind: Kind.ROUNDS, amount: 1, tickOn: Tick.ROUND_END })];
    expect(advanceCharacterStatusEntries(initial, Tick.ROUND_START)).toHaveLength(1);
    expect(advanceCharacterStatusEntries(initial, Tick.ROUND_END)).toEqual([]);
  });
  it("short rest preserves long-rest effects; long rest removes them", () => {
    const initial = [
      effect("Short", { kind: Kind.SHORT_REST }),
      effect("Long", { kind: Kind.LONG_REST }),
      effect("Passive", { kind: Kind.INFINITE })
    ];
    expect(applyShortRestToCharacterStatusEntries(initial).map((e) => e.value)).toEqual([
      "Long",
      "Passive"
    ]);
    expect(applyLongRestToCharacterStatusEntries(initial).map((e) => e.value)).toEqual(["Passive"]);
  });
});
