import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getReactionEntryById } from "../../../../../codex/entries";
import ReactionEntryDrawer from "./ReactionEntryDrawer";

describe("ReactionEntryDrawer", () => {
  it("shows the reaction action badge on the Take Reaction button", async () => {
    const user = userEvent.setup();
    const reaction = getReactionEntryById("reaction-countercharm");

    if (!reaction) {
      throw new Error("Expected Countercharm reaction entry to exist.");
    }

    const onCast = vi.fn();

    render(
      <ReactionEntryDrawer
        reaction={reaction}
        actionWarning={null}
        onCast={onCast}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Take Reaction/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Reaction action state" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Take Reaction/ }));

    expect(onCast).toHaveBeenCalledTimes(1);
  });
});
