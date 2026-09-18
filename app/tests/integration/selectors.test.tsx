import { characterFixture } from "../fixtures/character";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, expect, it } from "vitest";
import {
  store,
  useAppSelector,
  setActiveCharacterSheet,
  commitActiveCharacterSheet
} from "../../src/store";
import {
  selectGameplayCharacter,
  selectStatsCharacter,
  selectSpellcastingCharacter
} from "../../src/pages/CharactersPage/CharacterSheetPage/selectors";
import { getAbilityModifierForCharacter } from "../../src/pages/CharactersPage/abilities";
function Sections() {
  const stats = useAppSelector(selectStatsCharacter)!;
  const gameplay = useAppSelector(selectGameplayCharacter)!;
  const spells = useAppSelector(selectSpellcastingCharacter)!;
  return (
    <>
      <output aria-label="Health">{gameplay.currentHitPoints}</output>
      <output aria-label="Strength modifier">{getAbilityModifierForCharacter(stats, "STR")}</output>
      <output aria-label="Spent slots">{spells.spellSlotsExpended?.[0] ?? 0}</output>
    </>
  );
}
beforeEach(() =>
  store.dispatch(setActiveCharacterSheet({ character: characterFixture(), characterId: 101 }))
);
it("propagates isolated resource, profile and spell edits without changing unrelated values", () => {
  render(
    <Provider store={store}>
      <Sections />
    </Provider>
  );
  const character = store.getState().activeCharacterSheet.activeCharacter!;
  act(() => {
    store.dispatch(
      commitActiveCharacterSheet({
        character: { ...character, currentHitPoints: 12 },
        domains: ["resources"]
      })
    );
  });
  expect(screen.getByLabelText("Health")).toHaveTextContent("12");
  expect(screen.getByLabelText("Strength modifier")).toHaveTextContent("3");
  expect(screen.getByLabelText("Spent slots")).toHaveTextContent("0");
  act(() => {
    const current = store.getState().activeCharacterSheet.activeCharacter!;
    store.dispatch(
      commitActiveCharacterSheet({
        character: { ...current, abilities: { ...current.abilities, STR: 20 } },
        domains: ["profile"]
      })
    );
  });
  expect(screen.getByLabelText("Strength modifier")).toHaveTextContent("5");
  expect(screen.getByLabelText("Health")).toHaveTextContent("12");
  expect(screen.getByLabelText("Spent slots")).toHaveTextContent("0");
  act(() => {
    const current = store.getState().activeCharacterSheet.activeCharacter!;
    store.dispatch(
      commitActiveCharacterSheet({
        character: { ...current, spellSlotsExpended: [1, 0, 0, 0, 0, 0, 0, 0, 0] },
        domains: ["spells"]
      })
    );
  });
  expect(screen.getByLabelText("Spent slots")).toHaveTextContent("1");
  expect(screen.getByLabelText("Health")).toHaveTextContent("12");
  expect(screen.getByLabelText("Strength modifier")).toHaveTextContent("5");
});
it("replaces all selected data when moving to another character", () => {
  render(
    <Provider store={store}>
      <Sections />
    </Provider>
  );
  act(() => {
    store.dispatch(
      setActiveCharacterSheet({
        character: characterFixture({ id: 102, currentHitPoints: 3 }),
        characterId: 102
      })
    );
  });
  expect(screen.getByLabelText("Health")).toHaveTextContent("3");
});
