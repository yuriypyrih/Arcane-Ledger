import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FEATS } from "../../codex/entries";
import SpellDescriptionContent from "./SpellDescriptionContent";

describe("SpellDescriptionContent", () => {
  it("renders rich codex markup and opens interactive references", async () => {
    const user = userEvent.setup();
    const onOpenKeyword = vi.fn();
    const onOpenSpell = vi.fn();
    const onOpenDivinity = vi.fn();
    const onOpenFeat = vi.fn();

    render(
      <SpellDescriptionContent
        description={[
          "Gain <strong>power</strong>, <link:tracked>Tracked</link>, <spell:Guidance>Guidance</spell>, <divinity:Divine Spark>Divine Spark</divinity>, and <feat:BLESSED_WARRIOR>Blessed Warrior</feat>."
        ]}
        onOpenKeyword={onOpenKeyword}
        onOpenSpell={onOpenSpell}
        onOpenDivinity={onOpenDivinity}
        onOpenFeat={onOpenFeat}
      />
    );

    expect(screen.getByText("power", { selector: "strong" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tracked" }));
    expect(onOpenKeyword).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "tracked",
        title: "Tracked"
      })
    );

    await user.click(screen.getByRole("button", { name: "Guidance" }));
    expect(onOpenSpell).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Guidance"
      })
    );

    await user.click(screen.getByRole("button", { name: "Divine Spark" }));
    expect(onOpenDivinity).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Divine Spark"
      })
    );

    await user.click(screen.getByRole("button", { name: "Blessed Warrior" }));
    expect(onOpenFeat).toHaveBeenCalledWith(FEATS.BLESSED_WARRIOR, "Blessed Warrior");
  });
});
