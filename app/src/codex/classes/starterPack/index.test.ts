import { describe, expect, it } from "vitest";
import { getCodexEntryById } from "../../selectors";
import { SKILL } from "../../../types";
import { barbarianStarterPack } from "./barbarian";
import { getClassStarterPack } from "./index";

describe("class starter packs", () => {
  it("defines the barbarian starter pack with codex-backed equipment choices", () => {
    expect(barbarianStarterPack.primaryAbility).toBe("STR");
    expect(barbarianStarterPack.skillProficiencySelectionCount).toBe(2);
    expect(barbarianStarterPack.recommendedSkillProficiencies).toEqual([
      SKILL.ATHLETICS,
      SKILL.INTIMIDATION
    ]);
    expect(barbarianStarterPack.recommendedStartingEquipmentIndex).toBe(0);
    expect(barbarianStarterPack.recommendedAbilityScores).toEqual({
      STR: 15,
      DEX: 14,
      CON: 15,
      INT: 8,
      WIS: 10,
      CHA: 8
    });
    expect(barbarianStarterPack.startingEquipment).toEqual([
      [
        expect.objectContaining({
          type: "entry",
          entryId: "weapon-greataxe"
        }),
        expect.objectContaining({
          type: "entry",
          entryId: "weapon-handaxe",
          quantity: 4
        }),
        expect.objectContaining({
          type: "entry",
          entryId: "item-explorers-pack"
        }),
        expect.objectContaining({
          type: "currency",
          amount: 15
        })
      ],
      [
        expect.objectContaining({
          type: "currency",
          amount: 75
        })
      ]
    ]);

    expect(getCodexEntryById("item-explorers-pack")).toEqual(
      expect.objectContaining({
        name: "Explorer's Pack"
      })
    );

    expect(getClassStarterPack("Barbarian")).toBe(barbarianStarterPack);
  });
});
