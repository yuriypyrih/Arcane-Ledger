import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import CharacterForm from "../../src/components/CharactersPage/CharacterForm/CharacterForm";
import { createEmptyCharacter } from "../../src/pages/CharactersPage/constants";
import { setGuestSession, store } from "../../src/store";

function mountForm(isEditing = false) {
  store.dispatch(setGuestSession());
  const onSubmit = vi.fn();
  const rendered = render(
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CharacterForm
          isEditing={isEditing}
          initialValues={{
            ...createEmptyCharacter(),
            name: "Guide Hero",
            className: "Fighter",
            subclassId: "fighter-champion",
            species: "Human",
            background: "Soldier",
            level: 3,
            xp: 900
          }}
          onSubmit={onSubmit}
          onBack={vi.fn()}
        />
      </MemoryRouter>
    </Provider>
  );
  return { ...rendered, onSubmit };
}

it("opening and dismissing the multiclass guide preserves unsaved profile values without submitting", async () => {
  const user = userEvent.setup();
  const { container, onSubmit } = mountForm();
  const formSubmit = vi.fn();
  container.querySelector("form")!.addEventListener("submit", formSubmit);
  fireEvent.change(screen.getByLabelText("Character name", { exact: true }), {
    target: { value: "Guide Draft" }
  });
  fireEvent.change(screen.getByLabelText("Level", { exact: true }), { target: { value: "5" } });
  const subclass = (screen.getByLabelText("Subclass", { exact: true }) as HTMLSelectElement).value;
  const open = screen.getByRole("button", { name: "Open multiclass guide" });

  await user.click(open);
  const guide = screen.getByRole("dialog", { name: "Multiclass Guide" });
  expect(within(guide).getAllByRole("listitem")).toHaveLength(3);
  expect(guide).toHaveTextContent("Arcane Ledger now supports proper multiclassing!");
  expect(guide).toHaveTextContent("Build Section and press Edit");
  await user.click(within(guide).getByRole("button", { name: "Close multiclass guide" }));
  expect(screen.queryByRole("dialog", { name: "Multiclass Guide" })).not.toBeInTheDocument();
  await user.click(open);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: "Multiclass Guide" })).not.toBeInTheDocument();

  expect(screen.getByLabelText("Character name", { exact: true })).toHaveValue("Guide Draft");
  expect(screen.getByLabelText("Level", { exact: true })).toHaveValue(5);
  expect(screen.getByLabelText("Class", { exact: true })).toHaveValue("Fighter");
  expect(screen.getByLabelText("Subclass", { exact: true })).toHaveValue(subclass);
  expect(formSubmit).not.toHaveBeenCalled();
  expect(onSubmit).not.toHaveBeenCalled();
});

it("does not show the creation-only guide when editing an existing character", () => {
  mountForm(true);
  expect(screen.queryByRole("button", { name: "Open multiclass guide" })).not.toBeInTheDocument();
});
