import { characterFixture } from "../fixtures/character";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Character } from "../../src/types";
import { store } from "../../src/store";
import HitPointsWidget from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/HitPointsWidget";
import CampButton from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/CampButton";
import HeroicInspirationWidget from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/HeroicInspirationWidget";

function GameplayHarness({ initial }: { initial: Character }) {
  const [character, setCharacter] = useState(initial);
  return (
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HitPointsWidget character={character} onPersistCharacter={setCharacter} />
        <HeroicInspirationWidget character={character} onPersistCharacter={setCharacter} />
        <CampButton character={character} onPersistCharacter={setCharacter} />
        <output aria-label="Saved health">{character.currentHitPoints}</output>
        <output aria-label="Saved temporary health">{character.temporaryHitPoints}</output>
      </MemoryRouter>
    </Provider>
  );
}
describe("sheet gameplay interactions with real rules", () => {
  it("damages temporary HP first, then actual health, and caps healing", async () => {
    const user = userEvent.setup();
    render(<GameplayHarness initial={characterFixture({ temporaryHitPoints: 2 })} />);
    await user.click(screen.getByRole("button", { name: "Deal 1 hit points" }));
    expect(screen.getByLabelText("Saved temporary health")).toHaveTextContent("1");
    expect(screen.getByLabelText("Saved health")).toHaveTextContent("30");
    await user.click(screen.getByRole("button", { name: "Deal 1 hit points" }));
    await user.click(screen.getByRole("button", { name: "Deal 1 hit points" }));
    expect(screen.getByLabelText("Saved health")).toHaveTextContent("29");
    await user.click(screen.getByRole("button", { name: "Heal 1 hit points" }));
    await user.click(screen.getByRole("button", { name: "Heal 1 hit points" }));
    expect(screen.getByLabelText("Saved health")).toHaveTextContent("30");
  });
  it("closing a rest without confirming changes nothing", async () => {
    const user = userEvent.setup();
    render(<GameplayHarness initial={characterFixture({ currentHitPoints: 8 })} />);
    await user.click(screen.getByRole("button", { name: "Camp" }));
    await user.click(screen.getByText("Long Rest", { exact: true }));
    await user.click(screen.getByRole("button", { name: "Close rest options" }));
    expect(screen.getByLabelText("Saved health")).toHaveTextContent("8");
  });
  it("a confirmed long rest restores health and closes the camp modal", async () => {
    const user = userEvent.setup();
    render(<GameplayHarness initial={characterFixture({ currentHitPoints: 8 })} />);
    await user.click(screen.getByRole("button", { name: "Camp" }));
    const dialog = screen.getByRole("dialog", { name: "Choose your rest" });
    await user.click(within(dialog).getByText("Long Rest", { exact: true }));
    await user.click(within(dialog).getByRole("button", { name: "Rest" }));
    expect(screen.getByLabelText("Saved health")).toHaveTextContent("30");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
