import { FEATS } from "../../src/codex/entries";
import { normalizeCharacterCompanions } from "../../src/pages/CharactersPage/companions";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CharacterInspectionModal from "../../src/components/CharactersPage/CharacterInspection/CharacterInspectionModal";
import AdministrationUserModal from "../../src/pages/AuthPages/AdministrationPage/AdministrationUserModal";
import AdministrationUserCharacters from "../../src/pages/AuthPages/AdministrationPage/AdministrationUserCharacters";
import {
  getCharacterInspection,
  listUserCharactersForInspection
} from "../../src/api/characterInspection";
import { ApiRequestFailedError } from "../../src/api/client";
import type { CharacterSheetCloudDocument } from "../../src/api/characters";
import {
  setActiveCharacterSheet,
  setAuthenticatedUser,
  setGuestSession,
  store
} from "../../src/store";
import { createPortableCharacterSheet } from "../../src/pages/CharactersPage/portableCharacterSheet";
import { createCharacterInventoryItem } from "../../src/pages/CharactersPage/inventoryItems";
import { characterFixture } from "../fixtures/character";
import { multiclassFixture } from "../fixtures/multiclass";
import { getClassPageTextureUrl } from "../../src/components/CharactersPage/classSignature";
import type { CharacterBackgroundTextureMetadata } from "../../src/types";
import CharacterPortraitModal from "../../src/components/CharactersPage/CharacterSheetPage/CharacterProfileForm/CharacterPortraitModal";

vi.mock("../../src/api/characterInspection", () => ({
  getCharacterInspection: vi.fn(),
  listUserCharactersForInspection: vi.fn()
}));

const bag = createCharacterInventoryItem(
  { id: "backpack", key: "backpack", name: "Inspection Backpack", containerContents: [] },
  {
    id: "inspection-bag",
    containerContents: [
      {
        item: { id: "ruby", key: "ruby", name: "Hidden Ruby", desc: "A red gemstone." },
        quantity: 2
      }
    ]
  }
);
const character = characterFixture({
  name: "Inspected Hero",
  level: 4,
  xp: 2700,
  backgroundNotes: "A note only the owner could previously read.",
  inventoryItems: [bag]
});
function cloud(name = character.name): CharacterSheetCloudDocument {
  const sheet = createPortableCharacterSheet({ ...character, name });
  return {
    id: "remote-inspected",
    ownerId: "another-owner",
    clientId: "another-client",
    schemaVersion: sheet.schemaVersion,
    revision: 1,
    sheet,
    summary: {
      localId: character.id,
      name,
      className: character.className,
      species: character.species,
      level: character.level,
      background: character.background
    },
    avatar: null,
    backgroundTexture: null,
    createdAt: null,
    updatedAt: "2026-09-19T10:00:00.000Z"
  };
}
const target = { kind: "party" as const, partyGroupId: "party", characterId: "remote-inspected" };
function mount(onClose = vi.fn()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CharacterInspectionModal target={target} onClose={onClose} />
      </MemoryRouter>
    </Provider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  store.dispatch(setGuestSession());
  store.dispatch(
    setActiveCharacterSheet({ character: characterFixture(), characterId: character.id })
  );
  localStorage.setItem("inspection-preserve", "unsaved owner data");
  vi.mocked(getCharacterInspection).mockResolvedValue({ character: cloud() });
  vi.mocked(listUserCharactersForInspection).mockResolvedValue({ characters: [cloud()], count: 1 });
});

describe("read-only character inspection", () => {
  it("keeps portrait reset and background selection available on the owned sheet", async () => {
    const reset = vi.fn().mockResolvedValue(undefined);
    const select = vi.fn().mockResolvedValue(true);
    const close = vi.fn();
    render(
      <Provider store={store}>
        <CharacterPortraitModal
          characterName="Owned Hero"
          characterClassName="Fighter"
          backgroundTexture={{ source: "predefined", textureId: "rogue" }}
          backgroundErrorMessage={null}
          errorMessage={null}
          unavailableMessage={null}
          hasCustomPortrait
          isAuthenticated
          isUploadEnabled
          isBackgroundSaving={false}
          isSaving={false}
          portraitUrl="/owned-portrait.png"
          onBackgroundSelect={select}
          onBackgroundUploadBlob={vi.fn().mockResolvedValue(true)}
          onClearBackgroundError={vi.fn()}
          onClearError={vi.fn()}
          onClose={close}
          onReset={reset}
          onUpload={vi.fn().mockResolvedValue(true)}
        />
      </Provider>
    );
    expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Reset to default" }));
    expect(reset).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Background Texture" }));
    expect(screen.getByRole("button", { name: "Upload texture" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Class default" }));
    fireEvent.click(screen.getByRole("button", { name: "Save texture" }));
    await waitFor(() => expect(select).toHaveBeenCalledWith({ source: "default" }));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each<{
    label: string;
    texture: CharacterBackgroundTextureMetadata | null;
    expectedTexture: string | null;
  }>([
    {
      label: "class default",
      texture: null,
      expectedTexture: getClassPageTextureUrl(character.className)
    },
    {
      label: "predefined",
      texture: { source: "predefined", textureId: "rogue" },
      expectedTexture: getClassPageTextureUrl("rogue")
    },
    {
      label: "uploaded",
      texture: {
        source: "uploaded",
        objectKey: "texture",
        imageUrl: "/inspection-texture.png",
        mimeType: "image/png",
        sizeBytes: 100,
        updatedAt: "2026-09-19T10:00:00.000Z"
      },
      expectedTexture: "/inspection-texture.png"
    },
    { label: "no texture", texture: { source: "none" }, expectedTexture: null }
  ])(
    "previews the portrait and $label background without image editing or state changes",
    async ({ texture, expectedTexture }) => {
      store.dispatch(
        setAuthenticatedUser({
          id: "viewer",
          nickname: "Inspector",
          email: "inspector@example.test",
          role: "admin",
          createdAt: null,
          emailVerifiedAt: null,
          lastFeedback: null
        })
      );
      const document = cloud();
      document.avatar = {
        objectKey: "portrait",
        imageUrl: "/inspection-portrait.png",
        mimeType: "image/png",
        sizeBytes: 100,
        updatedAt: "2026-09-19T10:00:00.000Z"
      };
      document.backgroundTexture = texture;
      vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: document });
      const active = store.getState().activeCharacterSheet;
      const storage = { ...localStorage };
      const close = vi.fn();
      mount(close);
      const portrait = await screen.findByRole("button", {
        name: "Open portrait for Inspected Hero"
      });
      portrait.focus();
      fireEvent.keyDown(portrait, { key: "Enter" });
      const preview = screen.getByRole("dialog", { name: "Inspected Hero" });
      expect(
        within(preview).getByRole("img", { name: "Inspected Hero portrait preview" })
      ).toHaveAttribute("src", "/inspection-portrait.png");
      fireEvent.click(within(preview).getByRole("button", { name: "Background Texture" }));
      if (expectedTexture) {
        expect(
          within(preview).getByRole("img", { name: "Background texture preview" })
        ).toHaveAttribute("src", expectedTexture);
      } else {
        expect(within(preview).queryByRole("img")).not.toBeInTheDocument();
      }
      expect(within(preview).getAllByRole("button")).toHaveLength(3); // Close and the two preview tabs.
      expect(preview.querySelector("input")).toBeNull();
      expect(
        within(preview).queryByLabelText("Background texture choices")
      ).not.toBeInTheDocument();
      fireEvent.click(within(preview).getByRole("button", { name: "Character Portrait" }));
      expect(within(preview).getAllByRole("button")).toHaveLength(3);
      expect(preview.querySelector("input")).toBeNull();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog", { name: "Inspected Hero" })).not.toBeInTheDocument();
      expect(portrait).toHaveFocus();
      expect(close).not.toHaveBeenCalled();
      expect(store.getState().activeCharacterSheet).toBe(active);
      expect({ ...localStorage }).toEqual(storage);
    }
  );

  it("shows modified inventory snapshots and charges without equipping, using, resetting or editing", async () => {
    const item = createCharacterInventoryItem(
      { id: "charm", key: "charm", name: "Original Charm", desc: "Original description" },
      {
        id: "modified-charm",
        quantity: 1,
        chargesTotal: 3,
        usesRemaining: 1,
        mods: {
          baseCategory: "general",
          name: "Inspected Charm",
          description: "The owner's custom charm description."
        }
      }
    );
    const document = cloud();
    document.sheet = createPortableCharacterSheet({ ...character, inventoryItems: [item] });
    vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: document });
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "Inspect Inspected Charm" }));
    const drawer = screen.getByRole("dialog", { name: "Inspected Charm" });
    expect(within(drawer).getByText("The owner's custom charm description.")).toBeVisible();
    expect(within(drawer).getByText(/charges 1\/3/i)).toBeVisible();
    expect(
      within(drawer)
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"))
    ).toEqual(["Close item inspection"]);
  });

  it("shows loading, a retryable error, and an empty admin character list", async () => {
    let reject!: (reason: Error) => void;
    vi.mocked(listUserCharactersForInspection).mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        })
    );
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdministrationUserCharacters
            userId="owner"
            onInspect={vi.fn()}
            focusCharacterId={null}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading characters");
    await act(async () => {
      reject(new Error("Network unavailable"));
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Network unavailable");
    vi.mocked(listUserCharactersForInspection).mockResolvedValueOnce({ characters: [], count: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Retry characters" }));
    expect(await screen.findByText("No cloud-saved characters.")).toBeVisible();
  });

  it("shows the real sheet while blocking pointer and keyboard edits without touching the active character or storage", async () => {
    const active = store.getState().activeCharacterSheet;
    const storage = { ...localStorage };
    const { container } = mount();
    await screen.findByRole("heading", { name: "Inspected Hero" });
    const dialog = screen.getByRole("dialog", { name: "Character Inspection" });
    expect(within(dialog).queryByText(character.backgroundNotes)).not.toBeInTheDocument();
    expect(within(dialog).getByText("30/30 HP", { exact: true })).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Camp" })).toBeDisabled();
    for (const fieldset of dialog.querySelectorAll("fieldset:disabled")) {
      for (const control of fieldset.querySelectorAll("button, a, select, input")) {
        fireEvent.click(control);
        fireEvent.keyDown(control, { key: "Enter" });
      }
    }
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(store.getState().activeCharacterSheet).toBe(active);
    expect({ ...localStorage }).toEqual(storage);
    expect(container).toBeEmptyDOMElement(); // All overlays are portals, not the editable page.
    expect(getCharacterInspection).toHaveBeenCalledTimes(1);
  });

  it("inspects the full inventory and container contents without mutation controls; Escape returns one level", async () => {
    const close = vi.fn();
    mount(close);
    fireEvent.click(await screen.findByRole("button", { name: "Inspect Inspection Backpack" }));
    const bagDialog = screen.getByRole("dialog", { name: "Inspection Backpack" });
    expect(
      within(bagDialog).queryByRole("button", { name: /equip|remove|attune|sell|manage|modify/i })
    ).not.toBeInTheDocument();
    fireEvent.click(within(bagDialog).getByRole("button", { name: /Hidden Ruby/ }));
    const ruby = screen.getByRole("dialog", { name: "Hidden Ruby" });
    expect(within(ruby).getByText("Quantity: 2")).toBeVisible();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("dialog", { name: "Inspection Backpack" })).toBeVisible();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(close).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("fetches again on reopening and allows retry after denied or failed reads, without a refresh control", async () => {
    const first = mount();
    await screen.findByRole("heading", { name: "Inspected Hero" });
    expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument();
    first.unmount();
    vi.mocked(getCharacterInspection).mockRejectedValueOnce(
      new ApiRequestFailedError("Access removed", { status: 404 })
    );
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Access removed");
    expect(screen.queryByText(character.backgroundNotes)).not.toBeInTheDocument();
    vi.mocked(getCharacterInspection).mockRejectedValueOnce(new Error("Network unavailable"));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Network unavailable"));
    vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: cloud("Updated Hero") });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByRole("heading", { name: "Updated Hero" });
  });

  it("discards delayed responses after switching targets or closing", async () => {
    let resolveOld!: (value: { character: CharacterSheetCloudDocument }) => void;
    vi.mocked(getCharacterInspection).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        })
    );
    const view = mount();
    view.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <CharacterInspectionModal
            target={{ ...target, characterId: "second" }}
            onClose={vi.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
    await screen.findByRole("heading", { name: "Inspected Hero" });
    await act(async () => {
      resolveOld({ character: cloud("Old Hero") });
    });
    expect(screen.queryByRole("heading", { name: "Old Hero" })).not.toBeInTheDocument();
    expect(vi.mocked(getCharacterInspection).mock.calls[0][1]?.signal?.aborted).toBe(true);
    view.unmount();
    expect(vi.mocked(getCharacterInspection).mock.calls[1][1]?.signal?.aborted).toBe(true);
  });

  it("keeps notes, companions and build descriptions behind read-only reference controls", async () => {
    const active = store.getState().activeCharacterSheet;
    const storage = { ...localStorage };
    const document = cloud();
    document.sheet = createPortableCharacterSheet({
      ...character,
      feats: [{ id: "tough", feat: FEATS.TOUGH, source: { type: "manual" }, takenAtLevel: 1 }],
      companions: normalizeCharacterCompanions([
        {
          id: "owl",
          name: "Scout Owl",
          description: "A companion description.",
          maxHitPoints: 12,
          currentHitPoints: 7
        }
      ])
    });
    document.backgroundTexture = { source: "predefined", textureId: "wizard" };
    vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: document });
    const close = vi.fn();
    mount(close);
    await screen.findByRole("heading", { name: "Inspected Hero" });
    const modal = screen.getByRole("dialog", { name: "Character Inspection" });
    expect(screen.queryByText("A companion description.")).not.toBeInTheDocument();
    expect(
      modal.querySelector('[style*="--class-signature-page-texture"]')?.getAttribute("style")
    ).toContain("wizard.webp");
    const gameplay = within(modal).getByRole("button", { name: "Camp" }).closest("fieldset")!;
    expect(gameplay.nextElementSibling).toHaveTextContent("Character Stats");

    fireEvent.click(screen.getByRole("button", { name: "Show Character Notes" }));
    const notes = await screen.findByRole("dialog", { name: "Inspected Hero" });
    expect(within(notes).getByDisplayValue(character.backgroundNotes)).toHaveAttribute("readonly");
    expect(within(notes).queryByRole("button", { name: /edit|save/i })).not.toBeInTheDocument();
    fireEvent.click(within(notes).getByRole("button", { name: "Close character notes" }));

    const companion = screen.getAllByRole("button", { name: "Inspect Scout Owl" })[0];
    companion.focus();
    fireEvent.keyDown(companion, { key: "Enter" });
    const creature = await screen.findByRole("dialog", { name: "Scout Owl" });
    expect(within(creature).getByText("A companion description.")).toBeVisible();
    expect(
      within(creature).queryByRole("button", { name: /edit|damage|heal|roll|save/i })
    ).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(companion).toHaveFocus();
    expect(close).not.toHaveBeenCalled();

    const species = within(modal).getByRole("button", { name: /^Human Species/ });
    fireEvent.click(species);
    const speciesDrawer = await screen.findByRole("dialog", { name: "Human" });
    expect(
      within(speciesDrawer).queryByRole("button", { name: /edit|save/i })
    ).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(within(modal).getByRole("button", { name: /^Tough/ }));
    const feat = await screen.findByRole("dialog", { name: "Tough" });
    expect(
      within(feat).queryByRole("button", { name: /edit|save|remove/i })
    ).not.toBeInTheDocument();
    fireEvent.click(within(feat).getByRole("button", { name: "Close Tough reference" }));
    const feature = within(modal).getByRole("button", { name: /^Level 1: Second Wind/ });
    expect(feature).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(feature, { key: " " });
    expect(feature).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(feature);
    expect(feature).toHaveAttribute("aria-expanded", "false");
    expect(close).not.toHaveBeenCalled();
    expect(store.getState().activeCharacterSheet).toBe(active);
    expect({ ...localStorage }).toEqual(storage);
  });

  it("opens spell references without casting, preparation or editing controls", async () => {
    const document = cloud();
    document.sheet.progression = {
      className: "Wizard",
      subclassId: "wizard-evoker",
      level: 3,
      xp: 900
    };
    document.sheet.spellcasting = {
      spellbookSpellIds: ["spell-shield"],
      preparedSpellIds: ["spell-shield"],
      spellSlotsExpended: Array(9).fill(0)
    };
    vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: document });
    const close = vi.fn();
    mount(close);
    const spell = await screen.findByRole("button", { name: /^Shield/ });
    fireEvent.click(spell);
    const drawer = await screen.findByRole("dialog", { name: "Shield" });
    expect(
      within(drawer).queryByRole("button", { name: /cast|prepare|edit|roll|save/i })
    ).not.toBeInTheDocument();
    expect(within(drawer).getByText(/barrier of magical force/i)).toBeVisible();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Shield" })).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();
  });

  it("inspects every ability and core stat without rolls, formula changes or Hit Dice management", async () => {
    const inspected = characterFixture({
      name: "Inspected Hero",
      className: "Monk",
      subclassId: "monk-warrior-of-the-open-hand",
      level: 3,
      abilities: { STR: 12, DEX: 16, CON: 14, INT: 10, WIS: 16, CHA: 10 }
    });
    const document = cloud();
    document.sheet = createPortableCharacterSheet(inspected);
    vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: document });
    const active = store.getState().activeCharacterSheet;
    const storage = { ...localStorage };
    const close = vi.fn();
    mount(close);
    await screen.findByRole("heading", { name: "Inspected Hero" });
    const modal = screen.getByRole("dialog", { name: "Character Inspection" });
    const references = [
      [/^Armor Class/, "Armor Class"],
      [/^Speed/, "Speed"],
      [/^Initiative/, "Initiative"],
      [/^Passive Perception/, "Passive Perception"],
      [/^Proficiency Bonus/, "Proficiency Bonus"],
      [/^Hit Dice/, /^Hit Dice/],
      ...["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((ability) => [
        new RegExp(`^${ability} `),
        ability
      ])
    ] as const;
    for (const [cardName, title] of references) {
      const card = within(modal)
        .getAllByRole("button", { name: cardName })
        .find((element) => element.hasAttribute("data-read-only-navigation"))!;
      card.focus();
      fireEvent.keyDown(card, { key: "Enter" });
      const drawer = await screen.findByRole("dialog", { name: title });
      expect(within(drawer).getAllByRole("button")).toHaveLength(1);
      expect(within(drawer).queryByRole("combobox")).not.toBeInTheDocument();
      expect(within(drawer).queryByRole("radio")).not.toBeInTheDocument();
      if (typeof title === "string" && ["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(title)) {
        expect(within(drawer).getByText("Ability Score Formula")).toBeVisible();
        expect(within(drawer).getByText("Saving Throw Formula")).toBeVisible();
      }
      if (cardName instanceof RegExp && cardName.source.startsWith("^Hit Dice")) {
        expect(within(drawer).getByText("Monk D8")).toBeVisible();
        expect(within(drawer).getByText("3/3 remaining")).toBeVisible();
      }
      fireEvent.keyDown(window, { key: "Escape" });
      expect(card).toHaveFocus();
      expect(close).not.toHaveBeenCalled();
    }
    expect(store.getState().activeCharacterSheet).toBe(active);
    expect({ ...localStorage }).toEqual(storage);
  });

  it("shows every multiclass build and spell source without selectable tabs", async () => {
    const character = multiclassFixture([
      { className: "Wizard", level: 3 },
      { className: "Cleric", level: 3 }
    ]);
    const document = cloud();
    document.sheet = createPortableCharacterSheet(character);
    document.schemaVersion = 3;
    vi.mocked(getCharacterInspection).mockResolvedValueOnce({ character: document });
    mount();
    await screen.findByRole("heading", { name: "Wizard Features" });
    expect(screen.getByRole("heading", { name: "Cleric Features" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Wizard 3" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Cleric 3" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Spell slot pools" })).toBeVisible();
  });

  it("returns from admin inspection with the role draft intact and never submits the form when opening a character", async () => {
    const save = vi.fn();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdministrationUserModal
            error={null}
            isBusy={false}
            onClose={vi.fn()}
            onSave={save}
            user={{
              id: "owner",
              nickname: "Player",
              email: "player@example.test",
              role: "user",
              createdAt: null,
              lastActive: null
            }}
          />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "keeper" } });
    fireEvent.click(await screen.findByRole("button", { name: "Inspect Inspected Hero" }));
    await screen.findByRole("dialog", { name: "Character Inspection" });
    expect(screen.queryByRole("dialog", { name: "User Details" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close character inspection" }));
    expect(screen.getByRole("combobox")).toHaveValue("keeper");
    expect(save).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Inspect Inspected Hero" })).toHaveFocus()
    );
  });
});
