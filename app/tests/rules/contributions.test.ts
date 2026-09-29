import { describe, expect, it } from "vitest";
import { getSpellEntryById } from "../../src/codex/selectors";
import {
  compileFeatureContributions,
  getFeatureDescriptionAdditions,
  createClassContributionSource,
  createSubclassContributionSource
} from "../../src/pages/CharactersPage/featureContributions";

describe("shared class/subclass contributions", () => {
  it("matches exact, wildcard and predicate descriptions in source order without skipping dynamic context", () => {
    const compiled = compileFeatureContributions([
      {
        source: createClassContributionSource({ id: "source", label: "Source" }),
        descriptionAdditions: [
          { id: "wildcard", target: "spell", descriptionEntries: ["Always"] },
          { id: "other", target: "weaponAction", descriptionEntries: ["Weapon"] },
          { id: "exact", target: "spell", targetKey: "fire", descriptionEntries: ["Fire"] },
          {
            id: "predicate",
            target: "spell",
            targetKey: "ice",
            targetPredicateId: "fire",
            getDescriptionAdditions: ({ target }) => [[String(target)]]
          }
        ]
      }
    ]);
    expect(
      getFeatureDescriptionAdditions(compiled, "spell", { targetKey: "fire", target: "First" })
    ).toEqual([["Always"], ["Fire"], ["First"]]);
    expect(
      getFeatureDescriptionAdditions(compiled, "spell", { targetKey: "fire", target: "Changed" })
    ).toEqual([["Always"], ["Fire"], ["Changed"]]);
    expect(getFeatureDescriptionAdditions(compiled, "spell", { targetKey: "unmatched" })).toEqual([
      ["Always"]
    ]);
    expect(getFeatureDescriptionAdditions(compiled, "spell", { target: "All" })).toEqual([
      ["Always"],
      ["Fire"],
      ["All"]
    ]);
  });
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
