import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { BODY_SIZE } from "../../src/codex/entries/enums";
import CharacterForm from "../../src/components/CharactersPage/CharacterForm/CharacterForm";
import { createEmptyCharacter } from "../../src/pages/CharactersPage/constants";
import { setGuestSession, store } from "../../src/store";
import type { CharacterDraft } from "../../src/types";

function mountCreationForm() {
  store.dispatch(setGuestSession());
  const onSubmit = vi.fn<(draft: CharacterDraft) => void>();
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={["/characters/new"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <CharacterForm
          isEditing={false}
          initialValues={createEmptyCharacter()}
          onSubmit={onSubmit}
          onBack={vi.fn()}
        />
      </MemoryRouter>
    </Provider>
  );
  return { onSubmit };
}

it("lets a randomized character change species, clear choices, and revisit customization", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0.4);
  const user = userEvent.setup();
  const { onSubmit } = mountCreationForm();

  await user.click(screen.getByRole("button", { name: "Randomize" }));
  await user.selectOptions(screen.getByLabelText("Class", { exact: true }), "Fighter");
  await user.selectOptions(screen.getByLabelText("Background", { exact: true }), "Soldier");
  await user.selectOptions(screen.getByLabelText("Species", { exact: true }), "Dragonborn");
  await user.selectOptions(screen.getByLabelText("Species", { exact: true }), "Human");
  fireEvent.change(screen.getByLabelText("Character name", { exact: true }), {
    target: { value: "Randomized Draft" }
  });
  await user.click(screen.getByRole("button", { name: "Customize based on your needs" }));

  const bodySize = await screen.findByRole("group", { name: "Body Size" });
  expect(within(bodySize).getByRole("radio", { name: "Small" })).not.toBeChecked();
  expect(within(bodySize).getByRole("radio", { name: "Medium" })).not.toBeChecked();
  const skill = screen.getByLabelText("Skillful Proficiency", { exact: true });
  await user.selectOptions(skill, "Arcana");
  await user.selectOptions(skill, "");
  expect(skill).toHaveValue("");
  await user.click(within(bodySize).getByRole("radio", { name: "Small" }));
  expect(within(bodySize).getByRole("radio", { name: "Small" })).toBeChecked();

  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByLabelText("Character name", { exact: true })).toHaveValue("Randomized Draft");
  await user.selectOptions(screen.getByLabelText("Species", { exact: true }), "Dragonborn");
  await user.click(screen.getByRole("button", { name: "Customize based on your needs" }));
  const ancestry = await screen.findByLabelText("Draconic Ancestry", { exact: true });
  expect(screen.queryByRole("group", { name: "Body Size" })).not.toBeInTheDocument();
  expect(ancestry).toHaveValue("");
  await user.selectOptions(ancestry, "red");
  await user.selectOptions(ancestry, "");
  expect(ancestry).toHaveValue("");
  expect(onSubmit).not.toHaveBeenCalled();
});

it("submits the latest profile edits after repeated randomization", async () => {
  const random = vi.spyOn(Math, "random").mockReturnValue(0.2);
  const user = userEvent.setup();
  const { onSubmit } = mountCreationForm();
  // Keep equipment lookup isolated; this scenario exercises profile submission.
  vi.mocked(fetch).mockImplementation(
    async () => new Response(JSON.stringify({ items: [] }), { status: 200 })
  );

  await user.click(screen.getByRole("button", { name: "Randomize" }));
  fireEvent.change(screen.getByLabelText("Character name", { exact: true }), {
    target: { value: "Discarded Draft" }
  });
  await user.selectOptions(screen.getByLabelText("Species", { exact: true }), "Human");
  random.mockReturnValue(0.8);
  await user.click(screen.getByRole("button", { name: "Randomize" }));
  expect(screen.getByLabelText("Character name", { exact: true })).not.toHaveValue(
    "Discarded Draft"
  );
  expect(onSubmit).not.toHaveBeenCalled();

  await user.selectOptions(screen.getByLabelText("Class", { exact: true }), "Fighter");
  await user.selectOptions(screen.getByLabelText("Subclass", { exact: true }), "fighter-champion");
  await user.selectOptions(screen.getByLabelText("Background", { exact: true }), "Sage");
  await user.selectOptions(screen.getByLabelText("Background", { exact: true }), "Soldier");
  await user.selectOptions(screen.getByLabelText("Species", { exact: true }), "Dwarf");
  fireEvent.change(screen.getByLabelText("Character name", { exact: true }), {
    target: { value: "Final Randomized Hero" }
  });
  fireEvent.change(screen.getByLabelText("Level", { exact: true }), { target: { value: "3" } });
  await user.click(screen.getByRole("button", { name: "Create with recommended build" }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  const draft = onSubmit.mock.calls[0][0];
  expect(draft).toMatchObject({
    name: "Final Randomized Hero",
    className: "Fighter",
    subclassId: "fighter-champion",
    background: "Soldier",
    species: "Dwarf",
    level: 3
  });
  expect(draft.speciesChoices).toEqual({ bodySize: BODY_SIZE.MEDIUM });
  expect(draft.feats?.some((feat) => feat.source?.type === "species")).toBe(false);
});
