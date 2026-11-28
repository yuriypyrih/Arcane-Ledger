import { describe, expect, it } from "vitest";
import {
  duplicateEncounterCreature,
  getNextCopyName,
  preserveEncounterExtras
} from "../../src/pages/DmToolsPage/encounterCreatureUtils";

const goblin = {
  id: "a",
  name: "Goblin",
  type: "humanoid",
  description: "",
  maxHitPoints: 7,
  currentHitPoints: 7,
  temporaryHitPoints: 0,
  duration: {}
} as never;

describe("encounter creature copies", () => {
  it("numbers copies from the original name and never reuses a number", () => {
    const names = [{ name: "Goblin" }];

    expect(getNextCopyName("Goblin", names)).toBe("Goblin 1");
    names.push({ name: "Goblin 1" }, { name: "Goblin 2" });
    expect(getNextCopyName("Goblin 2", names)).toBe("Goblin 3");
    expect(getNextCopyName("Ogre", names)).toBe("Ogre 1");
  });

  it("a duplicate asks the server to link it to the original instead of copying the definition itself", () => {
    const copy = duplicateEncounterCreature(goblin, [{ name: "Goblin" }]);

    expect(copy.copyOfCreatureId).toBe("a");
    expect(copy.id).not.toBe("a");
    expect(copy.name).toBe("Goblin 1");
    expect(copy.typeGroupId ?? null).toBeNull();
  });

  it("edits made through the companion-shaped editors keep the stored picture and creature type", () => {
    const stored = {
      ...(goblin as object),
      imageUrl: "https://example.test/g.png",
      typeGroupId: "g1"
    } as never;
    const edited = { ...(goblin as object), name: "Goblin Chief" } as never;
    const merged = preserveEncounterExtras(stored, edited);

    expect(merged).toMatchObject({
      name: "Goblin Chief",
      imageUrl: "https://example.test/g.png",
      typeGroupId: "g1"
    });
  });
});
