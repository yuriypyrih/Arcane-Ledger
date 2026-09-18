import { describe, expect, it } from "vitest";
import { getSpellEntryById } from "../../src/codex/selectors";
import {
  compileFeatureContributions,
  createClassContributionSource,
  createSubclassContributionSource
} from "../../src/pages/CharactersPage/featureContributions";

describe("shared class/subclass contributions", () => {
  it("combines bonuses and deduplicates granted spells without losing their sources", () => {
    const spell = getSpellEntryById("spell-bless")!;
    const result = compileFeatureContributions([
      {
        source: createClassContributionSource({ id: "priest", label: "Priest" }),
        hitPointMaximumBonus: 2,
        alwaysPreparedSpellIds: [spell.id],
        spellGrants: [{ kind: "always-prepared-spell", spell }]
      },
      {
        source: createSubclassContributionSource({ id: "healer", label: "Healer" }),
        hitPointMaximumBonus: 3,
        alwaysPreparedSpellIds: [spell.id],
        spellGrants: [{ kind: "always-prepared-spell", spell }]
      }
    ]);
    expect(result.hitPointMaximumBonus).toBe(5);
    expect(result.alwaysPreparedSpellIds).toEqual([spell.id]);
    expect(result.alwaysPreparedSpellEntries.map((s) => s.id)).toEqual([spell.id]);
    expect(result.alwaysPreparedSpellSourceMap[spell.id]).toEqual(["Priest", "Healer"]);
  });
});
