import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ModEffectsEditor from "../../src/components/CharactersPage/CharacterSheetPage/ModEffectsEditor";
import {
  createCustomTraitEffectDraft,
  createCustomTraitEffectDraftFromEntry,
  customTraitTargetOptions,
  isCustomTraitEffectDraftEmpty,
  normalizeCustomTraitEffectDraftValueForTarget,
  parseCustomTraitEffectDraft
} from "../../src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/TraitsConditionsWidget/customTraitDraft";
import { hardSet } from "../fixtures/custom-effects";

const callbacks = () => ({
  onAddEffect: vi.fn(),
  onEffectTargetChange: vi.fn(),
  onEffectValueChange: vi.fn(),
  onEffectValueModeChange: vi.fn(),
  onEffectRollModeChange: vi.fn(),
  onEffectWeaponFormulaTargetChange: vi.fn(),
  onRemoveEffect: vi.fn()
});

describe("shared effect editor", () => {
  it("offers 0–30 for ordinary effects, retaining dice/modifier choices and modes", async () => {
    const effect = { ...createCustomTraitEffectDraft(), target: "initiative" };
    const handlers = callbacks();
    render(<ModEffectsEditor effects={[effect]} {...handlers} />);
    const valueSelect = screen.getByRole("combobox", { name: "Value" });
    for (let value = 0; value <= 30; value++) {
      expect(within(valueSelect).getByRole("option", { name: String(value) })).toBeEnabled();
    }
    expect(within(valueSelect).queryByRole("option", { name: "31" })).not.toBeInTheDocument();
    expect(within(valueSelect).getByRole("option", { name: "D6" })).toBeEnabled();
    expect(within(valueSelect).getByRole("option", { name: "STR" })).toBeEnabled();
    expect(screen.getByRole("radiogroup", { name: "Buff or debuff" })).toBeVisible();
    expect(screen.getByRole("radiogroup", { name: "Roll mode" })).toBeVisible();
    await userEvent.selectOptions(valueSelect, "30");
    expect(handlers.onEffectValueChange).toHaveBeenCalledWith(effect.id, "30");
  });

  it("offers all six hard-set targets with only numbers and no mode selectors", () => {
    const effect = createCustomTraitEffectDraftFromEntry(hardSet("STR", 0));
    render(<ModEffectsEditor effects={[effect]} {...callbacks()} />);
    const targetSelect = screen.getByRole("combobox", { name: "Target" });
    for (const ability of ["STR", "DEX", "CON", "INT", "WIS", "CHA"]) {
      expect(
        within(targetSelect).getByRole("option", { name: `HARD SET ${ability} Ability Score` })
      ).toBeEnabled();
    }
    const valueSelect = screen.getByRole("combobox", { name: "Value" });
    expect(within(valueSelect).getAllByRole("option")).toHaveLength(31);
    expect(valueSelect).toHaveValue("0");
    expect(screen.queryByRole("radiogroup", { name: "Buff or debuff" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Roll mode" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear effect" })).toBeEnabled();
  });
});

describe("effect drafts", () => {
  it.each(
    customTraitTargetOptions.filter((option) => option.value.startsWith("hardSetAbilityScore:"))
  )(
    "$label preserves zero and 30 through editing and strips irrelevant modes",
    ({ value: target }) => {
      for (const value of ["0", "30"]) {
        const draft = {
          ...createCustomTraitEffectDraft(),
          target,
          value,
          valueMode: "debuff" as const,
          rollMode: "advantage" as const
        };
        expect(isCustomTraitEffectDraftEmpty(draft)).toBe(false);
        const effect = parseCustomTraitEffectDraft(draft)!;
        expect(effect).toEqual({
          type: "hardSetAbilityScore",
          ability: target.split(":")[1],
          value: Number(value)
        });
        expect(parseCustomTraitEffectDraft(createCustomTraitEffectDraftFromEntry(effect))).toEqual(
          effect
        );
      }
    }
  );

  it.each(["1d6", "STR", "", "NaN", "-1", "31", "18.5"])(
    "rejects %s and resets it when switching to HARD SET",
    (value) => {
      const target = "hardSetAbilityScore:STR";
      expect(
        parseCustomTraitEffectDraft({ ...createCustomTraitEffectDraft(), target, value })
      ).toBeNull();
      expect(normalizeCustomTraitEffectDraftValueForTarget(value, target)).toBe("0");
    }
  );

  it("preserves valid values when switching and still parses additive 30 and zero-as-empty", () => {
    expect(normalizeCustomTraitEffectDraftValueForTarget("18", "hardSetAbilityScore:STR")).toBe(
      "18"
    );
    expect(
      parseCustomTraitEffectDraft({
        ...createCustomTraitEffectDraft(),
        target: "armorClass",
        value: "30",
        valueMode: "debuff"
      })
    ).toEqual({ type: "armorClass", value: 30, valueMode: "debuff" });
    const empty = { ...createCustomTraitEffectDraft(), target: "abilityScore:STR" };
    expect(isCustomTraitEffectDraftEmpty(empty)).toBe(true);
    expect(parseCustomTraitEffectDraft(empty)).toBeNull();
  });
});
