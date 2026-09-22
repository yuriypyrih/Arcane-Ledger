import { act, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { FEATS } from "../../src/codex/entries/enums";
import { PROF_LEVEL, SKILL_PROFICIENCY, type Character } from "../../src/types";
import {
  store,
  setGuestSession,
  setActiveCharacterSheet,
  commitActiveCharacterSheet
} from "../../src/store";
import CharacterSheetPage from "../../src/pages/CharactersPage/CharacterSheetPage/CharacterSheetPage";
import { upsertTrustedCharacter } from "../../src/pages/CharactersPage/storage";
import { clearRawStoredCharacters } from "../../src/pages/CharactersPage/portableCharacterSheetStorage";
import { upsertManualSkillEntry } from "../../src/pages/CharactersPage/proficiency";
import { normalizeCharacterCompanions } from "../../src/pages/CharactersPage/companions";
import { createCharacterInventoryItem } from "../../src/pages/CharactersPage/inventoryItems";
import type { CharacterSheetDomain } from "../../src/pages/CharactersPage/CharacterSheetPage/domains";
import { characterFixture } from "../fixtures/character";
import { magicInitiateFeat } from "../fixtures/feats";

beforeEach(() => {
  clearRawStoredCharacters();
  store.dispatch(setGuestSession());
  store.dispatch(setActiveCharacterSheet({ character: null, characterId: null }));
});
async function mountSheet() {
  upsertTrustedCharacter(characterFixture({ level: 4, xp: 2700 }));
  vi.useFakeTimers();
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={["/characters/101"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route element={<Outlet context={{ isBroadLayoutActive: false }} />}>
            <Route path="/characters/:characterId" element={<CharacterSheetPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  vi.useRealTimers();
  await screen.findByRole("button", { name: "Camp" });
}
function update(updater: (character: Character) => Character, domain: CharacterSheetDomain) {
  act(() => {
    const character = updater(store.getState().activeCharacterSheet.activeCharacter!);
    store.dispatch(commitActiveCharacterSheet({ character, domains: [domain] }));
  });
}

describe("the real character sheet with independent section updates", () => {
  it("a feat-only update changes maximum HP without changing health or saved base HP", async () => {
    await mountSheet();
    expect(screen.getByText("30/30 HP", { exact: true })).toBeVisible();
    update(
      (c) => ({
        ...c,
        feats: [{ id: "tough", feat: FEATS.TOUGH, source: { type: "manual" }, takenAtLevel: 1 }]
      }),
      "features"
    );
    expect(screen.getByText("30/38 HP", { exact: true })).toBeVisible();
    expect(store.getState().activeCharacterSheet.activeCharacter?.hitPoints).toBe(30);
    update((c) => ({ ...c, feats: [] }), "features");
    expect(screen.getByText("30/30 HP", { exact: true })).toBeVisible();
  });
  it("a proficiency-only update and then an ability-only update change the rendered skill modifier", async () => {
    await mountSheet();
    const row = () => screen.getByRole("button", { name: "Arcana" }).closest("li")!;
    expect(within(row()).getByText("+3", { exact: true })).toBeVisible();
    update(
      (c) => ({
        ...c,
        skillProficiencies: upsertManualSkillEntry(
          c.skillProficiencies,
          SKILL_PROFICIENCY.ARCANA,
          PROF_LEVEL.EXPERT
        )
      }),
      "proficiencies"
    );
    expect(within(row()).getByText("+7", { exact: true })).toBeVisible();
    update((c) => ({ ...c, abilities: { ...c.abilities, INT: 20 } }), "profile");
    expect(within(row()).getByText("+9", { exact: true })).toBeVisible();
    expect(screen.getByLabelText("INT score 20")).toBeVisible();
  });
  it("an inventory-only update changes the profile AC and equipment list", async () => {
    await mountSheet();
    expect(screen.getByRole("button", { name: /^Armor Class\s*12$/ })).toBeVisible();
    const armor = createCharacterInventoryItem(
      {
        id: "test-chain",
        key: "test-chain",
        name: "Test Chain Mail",
        category: { key: "heavy-armor", name: "Heavy Armor" },
        armor: {
          category: "heavy",
          ac_base: 16,
          ac_display: "16",
          ac_add_dexmod: false,
          ac_cap_dexmod: 0,
          grants_stealth_disadvantage: true,
          strength_score_required: 13
        }
      },
      { id: "chain" }
    );
    update((c) => ({ ...c, inventoryItems: [{ ...armor, worn: true }] }), "inventory");
    expect(screen.getByRole("button", { name: /^Armor Class\s*16$/ })).toBeVisible();
    expect(screen.getByText("Test Chain Mail", { exact: true })).toBeVisible();
  });
  it("adding a spell-granting feat makes the conditional spellcasting section appear", async () => {
    await mountSheet();
    expect(
      screen.queryByRole("button", { name: "Open spellcasting guide" })
    ).not.toBeInTheDocument();
    update((c) => ({ ...c, feats: [magicInitiateFeat()] }), "features");
    expect(screen.getByRole("button", { name: "Open spellcasting guide" })).toBeVisible();
    const spellSection = screen
      .getByRole("button", { name: "Open spellcasting guide" })
      .closest("article")!;
    expect(within(spellSection).getByText("Shield", { exact: true })).toBeVisible();
    expect(screen.getByRole("region", { name: "Spellcasting" })).toBeVisible();
    update((c) => ({ ...c, feats: [] }), "features");
    expect(
      screen.queryByRole("button", { name: "Open spellcasting guide" })
    ).not.toBeInTheDocument();
  });
  it("a companion-only update creates and removes the companion section", async () => {
    await mountSheet();
    update(
      (c) => ({
        ...c,
        companions: normalizeCharacterCompanions([
          { id: "owl", name: "Scout Owl", maxHitPoints: 12, currentHitPoints: 7 }
        ])
      }),
      "companions"
    );
    expect(screen.getByText("Scout Owl", { exact: true })).toBeVisible();
    update((c) => ({ ...c, companions: [] }), "companions");
    expect(screen.queryByText("Scout Owl", { exact: true })).not.toBeInTheDocument();
  });
});
