import { describe, expect, it } from "vitest";
import { codexRepository } from ".";

describe("codexRepository", () => {
  it("loads entries by id without loading the whole codex at the call site", async () => {
    const entry = await codexRepository.getEntryById("spell-guidance");

    expect(entry?.id).toBe("spell-guidance");
    expect(entry?.name).toBe("Guidance");
  });

  it("filters spell access by class name", async () => {
    const clericSpells = await codexRepository.getSpellEntriesForClassName("Cleric");

    expect(clericSpells.some((spell) => spell.id === "spell-guidance")).toBe(true);
    expect(clericSpells.some((spell) => spell.id === "spell-healing-word")).toBe(true);
  });
});
