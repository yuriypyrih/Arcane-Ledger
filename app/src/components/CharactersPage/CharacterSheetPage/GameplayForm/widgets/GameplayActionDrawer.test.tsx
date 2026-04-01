import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GameplayActionDrawer from "./GameplayActionDrawer";

describe("GameplayActionDrawer", () => {
  it("renders rich descriptions with bold text, lists, and interactive links", async () => {
    const user = userEvent.setup();

    render(
      <GameplayActionDrawer
        title="Action Details"
        eyebrow="Test"
        badges={["Action", "Feature"]}
        description={[
          "Gain <strong>power</strong> and <link:tracked>Tracked</link>.",
          {
            type: "list",
            style: "bullet",
            items: [
              "<spell:Guidance>Guidance</spell>",
              "<feat:SKILLED>Skilled</feat>"
            ]
          }
        ]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog", { name: "Action Details" })).toBeInTheDocument();
    expect(screen.getByText("power", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tracked" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guidance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skilled" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tracked" }));

    expect(screen.getByRole("dialog", { name: "Tracked" })).toBeInTheDocument();
  });
});
