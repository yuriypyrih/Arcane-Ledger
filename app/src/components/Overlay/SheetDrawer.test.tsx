import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SheetDrawer from "./SheetDrawer";

describe("SheetDrawer", () => {
  it("dismisses on backdrop click and Escape while keeping drawer clicks inside", () => {
    const onClose = vi.fn();

    render(
      <SheetDrawer titleId="test-drawer-title" onClose={onClose}>
        <div>
          <h2 id="test-drawer-title">Spell details</h2>
          <p>Drawer body</p>
        </div>
      </SheetDrawer>
    );

    const dialog = screen.getByRole("dialog", {
      name: "Spell details"
    });

    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
