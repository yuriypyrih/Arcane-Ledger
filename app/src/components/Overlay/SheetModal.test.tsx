import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SheetModal from "./SheetModal";

describe("SheetModal", () => {
  it("dismisses on backdrop click and Escape while keeping dialog clicks inside", () => {
    const onClose = vi.fn();

    render(
      <SheetModal titleId="test-modal-title" onClose={onClose}>
        <div>
          <h2 id="test-modal-title">Delete character?</h2>
          <p>Modal body</p>
        </div>
      </SheetModal>
    );

    const dialog = screen.getByRole("dialog", {
      name: "Delete character?"
    });

    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
