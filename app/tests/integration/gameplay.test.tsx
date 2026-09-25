import { characterFixture } from "../fixtures/character";
import { multiclassFixture } from "../fixtures/multiclass";
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
import { normalizeCustomClassConfig } from "../../src/pages/CharactersPage/customClass";

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
  it("the multiclass HP editor shows the range and arithmetic, including recorded rolls and adjustments", async () => {
    const user = userEvent.setup();
    const character = multiclassFixture([
      { className: "Wizard", level: 2, hitPointRolls: [null, 2] },
      { className: "Fighter", level: 1 }
    ]);
    character.abilities.CON = 14;
    character.multiclass!.hitPointsAdjustment = 3;
    character.maxHitPointsMode = "automatic";
    render(<GameplayHarness initial={character} />);
    await user.click(screen.getByRole("button", { name: /^Edit$/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(
      "18~27 MAX HP = 6 Wizard D6 + 2 CON + 2 Wizard D6 roll + 2 CON + 1 × (1d10 Fighter + 2 CON) + 3 Adjustment"
    );
    // 8 at Wizard 1, a raw roll of 2 + CON at Wizard 2, 6 + CON at Fighter 1, plus 3.
    expect(within(dialog).getByLabelText("Max Base HP")).toHaveValue(23);
    expect(dialog).toHaveTextContent("[= 23 Base HP]");
    await user.click(within(dialog).getByRole("button", { name: "Manual" }));
    expect(within(dialog).getByText("Roll yourself", { exact: true })).toBeVisible();
    expect(dialog).not.toHaveTextContent("Manual maximum");
    expect(within(dialog).getByLabelText("Max Base HP")).toBeEnabled();
    await user.click(within(dialog).getByRole("button", { name: "Auto" }));
    expect(dialog).toHaveTextContent("[= 23 Base HP]");
    expect(within(dialog).queryByText("Roll yourself", { exact: true })).not.toBeInTheDocument();
  });
  it.each([false, true])(
    "the HP range respects each level's minimum gain (multiclass: %s)",
    async (multiclass) => {
      const user = userEvent.setup();
      const character = multiclass
        ? multiclassFixture([
            { className: "Wizard", level: 2 },
            { className: "Fighter", level: 1 }
          ])
        : characterFixture({ className: "Wizard", level: 3 });
      character.abilities.CON = 2;
      if (character.multiclass) character.multiclass.hitPointsAdjustment = -1;
      character.maxHitPointsMode = "automatic";
      render(<GameplayHarness initial={character} />);
      await user.click(screen.getByRole("button", { name: /^Edit$/ }));
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveTextContent(
        multiclass
          ? "3~9 MAX HP = 6 Wizard D6 - 4 CON + 1 × (max(1, 1d6 Wizard - 4 CON)) + 1 × (max(1, 1d10 Fighter - 4 CON)) - 1 Adjustment"
          : "4~6 MAX HP = 6 Wizard D6 - 4 CON + 2 × (max(1, 1d6 Wizard - 4 CON))"
      );
      expect(within(dialog).getByLabelText("Max Base HP")).toHaveValue(4);
      expect(dialog).toHaveTextContent("[= 4 Base HP]");
    }
  );
  it("the HP formula uses custom Hit Dice and omits inactive classes", async () => {
    const user = userEvent.setup();
    const character = multiclassFixture([
      { className: "Fighter", level: 1 },
      {
        className: "Custom",
        level: 2,
        customClass: normalizeCustomClassConfig({ name: "Sentinel", hitDie: "d12" })
      },
      { className: "Wizard", level: 0 }
    ]);
    character.maxHitPointsMode = "automatic";
    render(<GameplayHarness initial={character} />);
    await user.click(screen.getByRole("button", { name: /^Edit$/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(
      "18~40 MAX HP = 10 Fighter D10 + 2 CON + 2 × (1d12 Sentinel + 2 CON)"
    );
    expect(dialog).not.toHaveTextContent("1d6");
    expect(within(dialog).getByLabelText("Max Base HP")).toHaveValue(30);
  });
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
