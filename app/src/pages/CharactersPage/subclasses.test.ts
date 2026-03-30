import { describe, expect, it } from "vitest";
import { CLASS_FEATURE } from "../../codex/entries";
import {
  getSelectedSubclassForCharacter,
  getSubclassOptionsForClassName,
  getUnlockedSubclassFeatureRowsForCharacter
} from "./subclasses";

describe("subclass registry", () => {
  it("exposes barbarian subclass options and unlocked berserker features by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Barbarian");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "barbarian-path-of-the-berserker",
      "barbarian-path-of-the-wild-heart",
      "barbarian-path-of-the-world-tree",
      "barbarian-path-of-the-zealot"
    ]);

    const selectedSubclass = getSelectedSubclassForCharacter({
      className: "Barbarian",
      subclassId: "barbarian-path-of-the-berserker"
    });

    expect(selectedSubclass?.name).toBe("Path of the Berserker");

    const unlockedFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Barbarian",
      level: 10,
      subclassId: "barbarian-path-of-the-berserker"
    });

    expect(unlockedFeatureRows.map((row) => row.level)).toEqual([3, 6, 10]);
    expect(unlockedFeatureRows.flatMap((row) => row.classFeatures)).toEqual([
      CLASS_FEATURE.FRENZY,
      CLASS_FEATURE.MINDLESS_RAGE,
      CLASS_FEATURE.RETALIATION
    ]);

    const retaliationRow = unlockedFeatureRows.find((row) => row.level === 10);
    const retaliationDetails = retaliationRow?.featureOverrides?.[CLASS_FEATURE.RETALIATION];
    const intimidatingPresenceRow = unlockedFeatureRows.find((row) => row.level === 14);
    const intimidatingPresenceDetails =
      intimidatingPresenceRow?.featureOverrides?.[CLASS_FEATURE.INTIMIDATING_PRESENCE];

    expect(retaliationDetails?.trackingState).toBe("semi-tracked");
    expect(retaliationDetails?.description).toEqual([
      expect.stringContaining("<link:tracked>Tracked</link>"),
      expect.stringContaining("<link:not-tracked>Not Tracked</link>")
    ]);
    expect(intimidatingPresenceDetails).toBeUndefined();
  });

  it("exposes wild heart as a barbarian subclass with its codex feature rows", () => {
    const selectedSubclass = getSelectedSubclassForCharacter({
      className: "Barbarian",
      subclassId: "barbarian-path-of-the-wild-heart"
    });

    expect(selectedSubclass?.name).toBe("Path of the Wild Heart");
    expect(selectedSubclass?.tagline).toBe("Walk in Community with the Animal World");

    const unlockedFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-wild-heart"
    });

    expect(
      unlockedFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.ANIMAL_SPEAKER}`,
      `3:${CLASS_FEATURE.RAGE_OF_THE_WILDS}`,
      `6:${CLASS_FEATURE.ASPECT_OF_THE_WILDS}`,
      `10:${CLASS_FEATURE.NATURE_SPEAKER}`,
      `14:${CLASS_FEATURE.POWER_OF_THE_WILDS}`
    ]);

    const rageOfTheWildsRow = unlockedFeatureRows.find(
      (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.RAGE_OF_THE_WILDS)
    );
    const powerOfTheWildsRow = unlockedFeatureRows.find(
      (row) => row.level === 14 && row.classFeatures.includes(CLASS_FEATURE.POWER_OF_THE_WILDS)
    );

    expect(rageOfTheWildsRow?.featureOverrides?.[CLASS_FEATURE.RAGE_OF_THE_WILDS]?.description).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Bear.</strong>"),
        expect.stringContaining("<strong>Eagle.</strong>"),
        expect.stringContaining("<strong>Wolf.</strong>")
      ])
    );
    expect(
      powerOfTheWildsRow?.featureOverrides?.[CLASS_FEATURE.POWER_OF_THE_WILDS]?.description
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Falcon.</strong>"),
        expect.stringContaining("<strong>Lion.</strong>"),
        expect.stringContaining("<strong>Ram.</strong>")
      ])
    );
  });

  it("exposes world tree as a barbarian subclass with its codex feature rows", () => {
    const selectedSubclass = getSelectedSubclassForCharacter({
      className: "Barbarian",
      subclassId: "barbarian-path-of-the-world-tree"
    });

    expect(selectedSubclass?.name).toBe("Path of the World Tree");
    expect(selectedSubclass?.tagline).toBe("Trace the Roots and Branches of the Multiverse");

    const unlockedFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-world-tree"
    });

    expect(
      unlockedFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.VITALITY_OF_THE_TREE}`,
      `6:${CLASS_FEATURE.BRANCHES_OF_THE_TREE}`,
      `10:${CLASS_FEATURE.BATTERING_ROOTS}`,
      `14:${CLASS_FEATURE.TRAVEL_ALONG_THE_TREE}`
    ]);

    const vitalityRow = unlockedFeatureRows.find(
      (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.VITALITY_OF_THE_TREE)
    );
    const travelRow = unlockedFeatureRows.find(
      (row) => row.level === 14 && row.classFeatures.includes(CLASS_FEATURE.TRAVEL_ALONG_THE_TREE)
    );

    expect(
      vitalityRow?.featureOverrides?.[CLASS_FEATURE.VITALITY_OF_THE_TREE]?.description
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Vitality Surge.</strong>"),
        expect.stringContaining("<strong>Life-Giving Force.</strong>")
      ])
    );
    expect(
      travelRow?.featureOverrides?.[CLASS_FEATURE.TRAVEL_ALONG_THE_TREE]?.description
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("teleport up to 60 feet"),
        expect.stringContaining("once per Rage"),
        expect.stringContaining("up to six willing creatures")
      ])
    );
  });

  it("exposes zealot as a barbarian subclass with its codex feature rows", () => {
    const selectedSubclass = getSelectedSubclassForCharacter({
      className: "Barbarian",
      subclassId: "barbarian-path-of-the-zealot"
    });

    expect(selectedSubclass?.name).toBe("Path of the Zealot");
    expect(selectedSubclass?.tagline).toBe("Rage in Ecstatic Union with a God");

    const unlockedFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Barbarian",
      level: 14,
      subclassId: "barbarian-path-of-the-zealot"
    });

    expect(
      unlockedFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.DIVINE_FURY}`,
      `3:${CLASS_FEATURE.WARRIOR_OF_THE_GODS}`,
      `6:${CLASS_FEATURE.FANATICAL_FOCUS}`,
      `10:${CLASS_FEATURE.ZEALOUS_PRESENCE}`,
      `14:${CLASS_FEATURE.RAGE_OF_THE_GODS}`
    ]);

    const divineFuryRow = unlockedFeatureRows.find(
      (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.DIVINE_FURY)
    );
    const rageOfTheGodsRow = unlockedFeatureRows.find(
      (row) => row.level === 14 && row.classFeatures.includes(CLASS_FEATURE.RAGE_OF_THE_GODS)
    );

    expect(divineFuryRow?.featureOverrides?.[CLASS_FEATURE.DIVINE_FURY]?.description).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<link:Necrotic>Necrotic</link>"),
        expect.stringContaining("<link:Radiant>Radiant</link>")
      ])
    );
    expect(
      rageOfTheGodsRow?.featureOverrides?.[CLASS_FEATURE.RAGE_OF_THE_GODS]?.description
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Flight.</strong>"),
        expect.stringContaining("<strong>Resistance.</strong>"),
        expect.stringContaining("<strong>Revivification.</strong>")
      ])
    );
  });
});
