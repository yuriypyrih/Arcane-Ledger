import { describe, expect, it } from "vitest";
import { CLASS_FEATURE, TRACKER } from "../../codex/entries";
import { getClassEntries } from "../../codex/selectors";
import {
  getSubclassFeatureDetails,
  getSelectedSubclassForCharacter,
  getSubclassOptionsForClassName,
  getUnlockedSubclassFeatureRowsForCharacter
} from "./subclasses";

describe("subclass registry", () => {
  it("exposes cleric subclass options and cleric subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Cleric");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "cleric-knowledge-domain",
      "cleric-life-domain",
      "cleric-light-domain",
      "cleric-trickery-domain",
      "cleric-war-domain"
    ]);

    const knowledgeSubclass = getSelectedSubclassForCharacter({
      className: "Cleric",
      subclassId: "cleric-knowledge-domain"
    });

    expect(knowledgeSubclass?.name).toBe("Knowledge Domain");
    expect(knowledgeSubclass?.tagline).toBe("Unearth Secrets and Master the Mind");

    const knowledgeFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Cleric",
      level: 17,
      subclassId: "cleric-knowledge-domain"
    });

    expect(
      knowledgeFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.BLESSINGS_OF_KNOWLEDGE}`,
      `3:${CLASS_FEATURE.KNOWLEDGE_DOMAIN_SPELLS}`,
      `3:${CLASS_FEATURE.MIND_MAGIC}`,
      `6:${CLASS_FEATURE.UNFETTERED_MIND}`,
      `17:${CLASS_FEATURE.DIVINE_FOREKNOWLEDGE}`
    ]);

    expect(
      knowledgeFeatureRows.find(
        (row) =>
          row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.KNOWLEDGE_DOMAIN_SPELLS)
      )?.featureOverrides?.[CLASS_FEATURE.KNOWLEDGE_DOMAIN_SPELLS]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Command>Command</spell>"),
          expect.stringContaining("<spell:Mind Spike>Mind Spike</spell>"),
          expect.stringContaining("<spell:Synaptic Static>Synaptic Static</spell>")
        ])
      })
    );

    const warSubclass = getSelectedSubclassForCharacter({
      className: "Cleric",
      subclassId: "cleric-war-domain"
    });

    expect(warSubclass?.name).toBe("War Domain");
    expect(warSubclass?.tagline).toBe("Inspire Valor and Smite Foes");

    const warFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Cleric",
      level: 17,
      subclassId: "cleric-war-domain"
    });

    expect(
      warFeatureRows.flatMap((row) => row.classFeatures.map((feature) => `${row.level}:${feature}`))
    ).toEqual([
      `3:${CLASS_FEATURE.WAR_DOMAIN_SPELLS}`,
      `3:${CLASS_FEATURE.WAR_PRIEST}`,
      `3:${CLASS_FEATURE.GUIDED_STRIKE}`,
      `6:${CLASS_FEATURE.WAR_GODS_BLESSING}`,
      `17:${CLASS_FEATURE.AVATAR_OF_BATTLE}`
    ]);

    expect(
      getSubclassFeatureDetails(warSubclass ?? null, 6, CLASS_FEATURE.WAR_GODS_BLESSING)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Shield of Faith>Shield of Faith</spell>"),
          expect.stringContaining("<spell:Spiritual Weapon>Spiritual Weapon</spell>"),
          expect.stringContaining("<link:Concentration>Concentration</link>")
        ])
      })
    );
  });

  it("exposes bard subclass options and bard subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Bard");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "bard-college-of-dance",
      "bard-college-of-glamour",
      "bard-college-of-lore",
      "bard-college-of-the-moon",
      "bard-college-of-valor"
    ]);

    const glamourSubclass = getSelectedSubclassForCharacter({
      className: "Bard",
      subclassId: "bard-college-of-glamour"
    });

    expect(glamourSubclass?.name).toBe("College of Glamour");
    expect(glamourSubclass?.tagline).toBe("Weave Beguiling Fey Magic");

    const glamourFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-glamour"
    });

    expect(
      glamourFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.BEGUILING_MAGIC}`,
      `3:${CLASS_FEATURE.MANTLE_OF_INSPIRATION}`,
      `6:${CLASS_FEATURE.MANTLE_OF_MAJESTY}`,
      `14:${CLASS_FEATURE.UNBREAKABLE_MAJESTY}`
    ]);

    const beguilingMagic = glamourFeatureRows.find(
      (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.BEGUILING_MAGIC)
    )?.featureOverrides?.[CLASS_FEATURE.BEGUILING_MAGIC];

    expect(beguilingMagic).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Charm Person>Charm Person</spell>"),
          expect.stringContaining("<spell:Mirror Image>Mirror Image</spell>"),
          expect.stringContaining("<link:Charmed>Charmed</link>"),
          expect.stringContaining("<link:Frightened>Frightened</link>")
        ])
      })
    );

    const moonSubclass = getSelectedSubclassForCharacter({
      className: "Bard",
      subclassId: "bard-college-of-the-moon"
    });

    expect(moonSubclass?.name).toBe("College of the Moon");
    expect(moonSubclass?.tagline).toBe("Inspire Allies with Primal Tales");

    const moonFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Bard",
      level: 14,
      subclassId: "bard-college-of-the-moon"
    });

    expect(
      moonFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.MOONS_INSPIRATION}`,
      `3:${CLASS_FEATURE.PRIMAL_LORE}`,
      `6:${CLASS_FEATURE.BLESSING_OF_MOONLIGHT}`,
      `14:${CLASS_FEATURE.EVENTIDES_SPLENDOR}`
    ]);

    expect(
      moonFeatureRows.find(
        (row) => row.level === 6 && row.classFeatures.includes(CLASS_FEATURE.BLESSING_OF_MOONLIGHT)
      )?.featureOverrides?.[CLASS_FEATURE.BLESSING_OF_MOONLIGHT]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Moonbeam>Moonbeam</spell>"),
          expect.stringContaining("<link:long-rest>Long Rest</link>")
        ])
      })
    );

    expect(getSubclassFeatureDetails(moonSubclass, 3, CLASS_FEATURE.PRIMAL_LORE)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Animal Handling>Animal Handling</link>"),
          expect.stringContaining("<link:Perception>Perception</link>")
        ])
      })
    );
  });

  it("exposes druid subclass options and druid subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Druid");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "druid-circle-of-the-land",
      "druid-circle-of-the-moon",
      "druid-circle-of-the-sea",
      "druid-circle-of-the-stars"
    ]);

    const landSubclass = getSelectedSubclassForCharacter({
      className: "Druid",
      subclassId: "druid-circle-of-the-land"
    });

    expect(landSubclass?.name).toBe("Circle of the Land");
    expect(landSubclass?.tagline).toBe("Celebrate Connection to the Natural World");

    const landFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Druid",
      level: 14,
      subclassId: "druid-circle-of-the-land"
    });

    expect(
      landFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS}`,
      `3:${CLASS_FEATURE.LANDS_AID}`,
      `6:${CLASS_FEATURE.NATURAL_RECOVERY}`,
      `10:${CLASS_FEATURE.NATURES_WARD}`,
      `14:${CLASS_FEATURE.NATURES_SANCTUARY}`
    ]);

    expect(
      landFeatureRows.find(
        (row) =>
          row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS)
      )?.featureOverrides?.[CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Fire Bolt>Fire Bolt</spell>"),
          expect.stringContaining("<spell:Cone of Cold>Cone of Cold</spell>"),
          expect.stringContaining("<spell:Tree Stride>Tree Stride</spell>")
        ])
      })
    );

    const starsSubclass = getSelectedSubclassForCharacter({
      className: "Druid",
      subclassId: "druid-circle-of-the-stars"
    });

    expect(starsSubclass?.name).toBe("Circle of the Stars");
    expect(starsSubclass?.tagline).toBe("Harness Secrets Hidden in Constellations");

    const starsFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Druid",
      level: 14,
      subclassId: "druid-circle-of-the-stars"
    });

    expect(
      starsFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.STAR_MAP}`,
      `3:${CLASS_FEATURE.STARRY_FORM}`,
      `6:${CLASS_FEATURE.COSMIC_OMEN}`,
      `10:${CLASS_FEATURE.TWINKLING_CONSTELLATIONS}`,
      `14:${CLASS_FEATURE.FULL_OF_STARS}`
    ]);

    expect(getSubclassFeatureDetails(starsSubclass, 3, CLASS_FEATURE.STAR_MAP)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Guidance>Guidance</spell>"),
          expect.stringContaining("<spell:Guiding Bolt>Guiding Bolt</spell>"),
          expect.stringContaining("<link:short-rest>Short Rest</link>")
        ])
      })
    );
  });

  it("exposes paladin oath options and paladin subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Paladin");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "paladin-oath-of-the-ancients",
      "paladin-oath-of-devotion",
      "paladin-oath-of-glory",
      "paladin-oath-of-the-noble-genies",
      "paladin-oath-of-vengeance"
    ]);

    const devotionSubclass = getSelectedSubclassForCharacter({
      className: "Paladin",
      subclassId: "paladin-oath-of-devotion"
    });

    expect(devotionSubclass?.name).toBe("Oath of Devotion");
    expect(devotionSubclass?.tagline).toBe("Uphold the Ideals of Justice and Order");

    const devotionFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Paladin",
      level: 20,
      subclassId: "paladin-oath-of-devotion"
    });

    expect(
      devotionFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.OATH_OF_DEVOTION_SPELLS}`,
      `3:${CLASS_FEATURE.SACRED_WEAPON}`,
      `7:${CLASS_FEATURE.AURA_OF_DEVOTION}`,
      `15:${CLASS_FEATURE.SMITE_OF_PROTECTION}`,
      `20:${CLASS_FEATURE.HOLY_NIMBUS}`
    ]);

    expect(
      devotionFeatureRows.find(
        (row) =>
          row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.OATH_OF_DEVOTION_SPELLS)
      )?.featureOverrides?.[CLASS_FEATURE.OATH_OF_DEVOTION_SPELLS]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining(
            "<spell:Protection from Evil and Good>Protection from Evil and Good</spell>"
          ),
          expect.stringContaining("<spell:Flame Strike>Flame Strike</spell>")
        ])
      })
    );

    expect(
      getSubclassFeatureDetails(devotionSubclass ?? null, 7, CLASS_FEATURE.AURA_OF_DEVOTION)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Immunity>Immunity</link>"),
          expect.stringContaining("<link:Charmed>Charmed</link>")
        ])
      })
    );

    const nobleGeniesSubclass = getSelectedSubclassForCharacter({
      className: "Paladin",
      subclassId: "paladin-oath-of-the-noble-genies"
    });

    expect(nobleGeniesSubclass?.name).toBe("Oath of the Noble Genies");
    expect(nobleGeniesSubclass?.tagline).toBe("Brandish the Elemental Splendor of Genies");

    const nobleGeniesFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Paladin",
      level: 20,
      subclassId: "paladin-oath-of-the-noble-genies"
    });

    expect(
      nobleGeniesFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.ELEMENTAL_SMITE}`,
      `3:${CLASS_FEATURE.GENIE_SPELLS}`,
      `3:${CLASS_FEATURE.GENIES_SPLENDOR}`,
      `7:${CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING}`,
      `15:${CLASS_FEATURE.ELEMENTAL_REBUKE}`,
      `20:${CLASS_FEATURE.NOBLE_SCION}`
    ]);

    expect(
      getSubclassFeatureDetails(nobleGeniesSubclass, 15, CLASS_FEATURE.ELEMENTAL_REBUKE)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Dexterity Saving Throw>Dexterity saving throw</link>"),
          expect.stringContaining("<link:Acid>Acid</link>"),
          expect.stringContaining("<link:Thunder>Thunder</link>")
        ])
      })
    );
  });

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
    const animalSpeakerRow = unlockedFeatureRows.find(
      (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.ANIMAL_SPEAKER)
    );
    const powerOfTheWildsRow = unlockedFeatureRows.find(
      (row) => row.level === 14 && row.classFeatures.includes(CLASS_FEATURE.POWER_OF_THE_WILDS)
    );

    expect(animalSpeakerRow?.featureOverrides?.[CLASS_FEATURE.ANIMAL_SPEAKER]).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Beast Sense>Beast Sense</spell>"),
          expect.stringContaining("<spell:Speak with Animals>Speak with Animals</spell>")
        ])
      })
    );
    expect(
      rageOfTheWildsRow?.featureOverrides?.[CLASS_FEATURE.RAGE_OF_THE_WILDS]?.description
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<link:tracked>Tracked</link>"),
        expect.stringContaining("<link:not-tracked>Not Tracked</link>")
      ])
    );
    expect(
      rageOfTheWildsRow?.featureOverrides?.[CLASS_FEATURE.RAGE_OF_THE_WILDS]?.trackingState
    ).toBe("semi-tracked");
    expect(
      powerOfTheWildsRow?.featureOverrides?.[CLASS_FEATURE.POWER_OF_THE_WILDS]?.description
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("<strong>Falcon.</strong>"),
        expect.stringContaining("<strong>Lion.</strong>"),
        expect.stringContaining("<strong>Ram.</strong>")
      ])
    );
    expect(
      getSubclassFeatureDetails(selectedSubclass ?? null, 3, CLASS_FEATURE.RAGE_OF_THE_WILDS)
    ).toEqual(
      expect.objectContaining({
        description: expect.arrayContaining([expect.stringContaining("<strong>Bear.</strong>")])
      })
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
    expect(vitalityRow?.featureOverrides?.[CLASS_FEATURE.VITALITY_OF_THE_TREE]?.trackingState).toBe(
      TRACKER.SEMI_TRACKED
    );
    expect(
      unlockedFeatureRows.find(
        (row) => row.level === 6 && row.classFeatures.includes(CLASS_FEATURE.BRANCHES_OF_THE_TREE)
      )?.featureOverrides?.[CLASS_FEATURE.BRANCHES_OF_THE_TREE]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.SEMI_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:tracked>Tracked</link>"),
          expect.stringContaining("<link:not-tracked>Not Tracked</link>")
        ])
      })
    );
    expect(travelRow?.featureOverrides?.[CLASS_FEATURE.TRAVEL_ALONG_THE_TREE]?.description).toEqual(
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

  it("exposes fighter subclass options and representative fighter subclass feature links", () => {
    const subclassOptions = getSubclassOptionsForClassName("Fighter");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "fighter-banneret",
      "fighter-battle-master",
      "fighter-champion",
      "fighter-eldritch-knight",
      "fighter-psi-warrior"
    ]);

    const banneretSubclass = getSelectedSubclassForCharacter({
      className: "Fighter",
      subclassId: "fighter-banneret"
    });

    expect(banneretSubclass?.name).toBe("Banneret");
    expect(banneretSubclass?.tagline).toBe("Rally Fellow Heroes with Inspiring Leadership");

    const banneretFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Fighter",
      level: 18,
      subclassId: "fighter-banneret"
    });

    expect(
      banneretFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.KNIGHTLY_ENVOY}`,
      `3:${CLASS_FEATURE.GROUP_RECOVERY}`,
      `7:${CLASS_FEATURE.TEAM_TACTICS}`,
      `10:${CLASS_FEATURE.RALLYING_SURGE}`,
      `15:${CLASS_FEATURE.SHARED_RESILIENCE}`,
      `18:${CLASS_FEATURE.INSPIRING_COMMANDER}`
    ]);

    expect(getSubclassFeatureDetails(banneretSubclass, 3, CLASS_FEATURE.KNIGHTLY_ENVOY)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Comprehend Languages>Comprehend Languages</spell>"),
          expect.stringContaining("<link:Insight>Insight</link>"),
          expect.stringContaining("<link:long-rest>Long Rest</link>")
        ])
      })
    );

    const battleMasterSubclass = getSelectedSubclassForCharacter({
      className: "Fighter",
      subclassId: "fighter-battle-master"
    });

    expect(battleMasterSubclass?.name).toBe("Battle Master");
    expect(battleMasterSubclass?.tagline).toBe("Master Sophisticated Battle Maneuvers");

    expect(
      getSubclassFeatureDetails(battleMasterSubclass, 3, CLASS_FEATURE.MANEUVER_OPTIONS)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Initiative>Initiative</link>"),
          expect.stringContaining("<link:Armor Class>AC</link>"),
          expect.stringContaining("<link:Temporary Hit Points>Temporary Hit Points</link>"),
          expect.stringContaining("<link:Prone>Prone</link>")
        ])
      })
    );

    const eldritchKnightSubclass = getSelectedSubclassForCharacter({
      className: "Fighter",
      subclassId: "fighter-eldritch-knight"
    });

    expect(eldritchKnightSubclass?.name).toBe("Eldritch Knight");
    expect(eldritchKnightSubclass?.tagline).toBe("Support Combat Skills with Arcane Magic");

    expect(
      getSubclassFeatureDetails(eldritchKnightSubclass, 3, CLASS_FEATURE.SPELLCASTING)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Ray of Frost>Ray of Frost</spell>"),
          expect.stringContaining("<spell:Shield>Shield</spell>"),
          expect.stringContaining("<link:Arcane Focus>Arcane Focus</link>")
        ])
      })
    );

    const psiWarriorSubclass = getSelectedSubclassForCharacter({
      className: "Fighter",
      subclassId: "fighter-psi-warrior"
    });

    expect(psiWarriorSubclass?.name).toBe("Psi Warrior");
    expect(psiWarriorSubclass?.tagline).toBe("Augment Physical Might with Psionic Power");

    expect(
      getSubclassFeatureDetails(psiWarriorSubclass, 18, CLASS_FEATURE.TELEKINETIC_MASTER)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Telekinesis>Telekinesis</spell>"),
          expect.stringContaining("<link:Concentration>Concentration</link>"),
          expect.stringContaining("<link:INT>Intelligence</link>")
        ])
      })
    );
  });

  it("exposes monk subclass options and monk subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Monk");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "monk-warrior-of-mercy",
      "monk-warrior-of-shadow",
      "monk-warrior-of-the-elements",
      "monk-warrior-of-the-open-hand"
    ]);

    const mercySubclass = getSelectedSubclassForCharacter({
      className: "Monk",
      subclassId: "monk-warrior-of-mercy"
    });

    expect(mercySubclass?.name).toBe("Warrior of Mercy");
    expect(mercySubclass?.tagline).toBe("Manipulate Forces of Life and Death");

    const mercyFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Monk",
      level: 17,
      subclassId: "monk-warrior-of-mercy"
    });

    expect(
      mercyFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.HAND_OF_HARM}`,
      `3:${CLASS_FEATURE.HAND_OF_HEALING}`,
      `3:${CLASS_FEATURE.IMPLEMENTS_OF_MERCY}`,
      `6:${CLASS_FEATURE.PHYSICIANS_TOUCH}`,
      `11:${CLASS_FEATURE.FLURRY_OF_HEALING_AND_HARM}`,
      `17:${CLASS_FEATURE.HAND_OF_ULTIMATE_MERCY}`
    ]);

    expect(
      mercyFeatureRows.find(
        (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.IMPLEMENTS_OF_MERCY)
      )?.featureOverrides?.[CLASS_FEATURE.IMPLEMENTS_OF_MERCY]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Insight>Insight</link>"),
          expect.stringContaining("<link:Medicine>Medicine</link>")
        ])
      })
    );

    expect(getSubclassFeatureDetails(mercySubclass, 6, CLASS_FEATURE.PHYSICIANS_TOUCH)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Poisoned>Poisoned</link>"),
          expect.stringContaining("<link:Stunned>Stunned</link>")
        ])
      })
    );

    const shadowSubclass = getSelectedSubclassForCharacter({
      className: "Monk",
      subclassId: "monk-warrior-of-shadow"
    });

    expect(shadowSubclass?.name).toBe("Warrior of Shadow");
    expect(shadowSubclass?.tagline).toBe("Harness Shadow Power for Stealth and Subterfuge");

    const shadowFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Monk",
      level: 17,
      subclassId: "monk-warrior-of-shadow"
    });

    expect(
      shadowFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.SHADOW_ARTS}`,
      `6:${CLASS_FEATURE.SHADOW_STEP}`,
      `11:${CLASS_FEATURE.IMPROVED_SHADOW_STEP}`,
      `17:${CLASS_FEATURE.CLOAK_OF_SHADOWS}`
    ]);

    expect(
      shadowFeatureRows.find(
        (row) => row.level === 3 && row.classFeatures.includes(CLASS_FEATURE.SHADOW_ARTS)
      )?.featureOverrides?.[CLASS_FEATURE.SHADOW_ARTS]
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Darkness>Darkness</spell>"),
          expect.stringContaining("<spell:Minor Illusion>Minor Illusion</spell>"),
          expect.stringContaining("<link:Darkvision>Darkvision</link>")
        ])
      })
    );

    const elementsSubclass = getSelectedSubclassForCharacter({
      className: "Monk",
      subclassId: "monk-warrior-of-the-elements"
    });

    expect(elementsSubclass?.name).toBe("Warrior of the Elements");
    expect(elementsSubclass?.tagline).toBe("Wield Strikes and Bursts of Elemental Power");

    const elementsFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Monk",
      level: 17,
      subclassId: "monk-warrior-of-the-elements"
    });

    expect(
      elementsFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.ELEMENTAL_ATTUNEMENT}`,
      `3:${CLASS_FEATURE.MANIPULATE_ELEMENTS}`,
      `6:${CLASS_FEATURE.ELEMENTAL_BURST}`,
      `11:${CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS}`,
      `17:${CLASS_FEATURE.ELEMENTAL_EPITOME}`
    ]);

    expect(
      getSubclassFeatureDetails(elementsSubclass, 3, CLASS_FEATURE.ELEMENTAL_ATTUNEMENT)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Incapacitated>Incapacitated</link>"),
          expect.stringContaining("<link:Acid>Acid</link>"),
          expect.stringContaining("<link:Strength Saving Throw>Strength saving throw</link>")
        ])
      })
    );

    const openHandSubclass = getSelectedSubclassForCharacter({
      className: "Monk",
      subclassId: "monk-warrior-of-the-open-hand"
    });

    expect(openHandSubclass?.name).toBe("Warrior of the Open Hand");
    expect(openHandSubclass?.tagline).toBe("Master Unarmed Combat Techniques");

    const openHandFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Monk",
      level: 17,
      subclassId: "monk-warrior-of-the-open-hand"
    });

    expect(
      openHandFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.OPEN_HAND_TECHNIQUE}`,
      `6:${CLASS_FEATURE.WHOLENESS_OF_BODY}`,
      `11:${CLASS_FEATURE.FLEET_STEP}`,
      `17:${CLASS_FEATURE.QUIVERING_PALM}`
    ]);

    expect(getSubclassFeatureDetails(openHandSubclass, 17, CLASS_FEATURE.QUIVERING_PALM)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining(
            "<link:Constitution Saving Throw>Constitution saving throw</link>"
          ),
          expect.stringContaining("<link:Force>Force</link>")
        ])
      })
    );
  });

  it("exposes ranger subclass options and ranger subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Ranger");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "ranger-beast-master",
      "ranger-fey-wanderer",
      "ranger-gloom-stalker",
      "ranger-hunter",
      "ranger-winter-walker"
    ]);

    const beastMasterSubclass = getSelectedSubclassForCharacter({
      className: "Ranger",
      subclassId: "ranger-beast-master"
    });

    expect(beastMasterSubclass?.name).toBe("Beast Master");
    expect(beastMasterSubclass?.tagline).toBe("Bond with a Primal Beast");

    const beastMasterFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Ranger",
      level: 15,
      subclassId: "ranger-beast-master"
    });

    expect(
      beastMasterFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.PRIMAL_COMPANION}`,
      `7:${CLASS_FEATURE.EXCEPTIONAL_TRAINING}`,
      `11:${CLASS_FEATURE.BESTIAL_FURY}`,
      `15:${CLASS_FEATURE.SHARE_SPELLS}`
    ]);

    expect(getSubclassFeatureDetails(beastMasterSubclass, 11, CLASS_FEATURE.BESTIAL_FURY)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Hunter's Mark>Hunter's Mark</spell>"),
          expect.stringContaining("<link:Force>Force</link>")
        ])
      })
    );

    const winterWalkerSubclass = getSelectedSubclassForCharacter({
      className: "Ranger",
      subclassId: "ranger-winter-walker"
    });

    expect(winterWalkerSubclass?.name).toBe("Winter Walker");
    expect(winterWalkerSubclass?.tagline).toBe("Withstand the Horrors of Frigid Wastelands");

    const winterWalkerFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Ranger",
      level: 15,
      subclassId: "ranger-winter-walker"
    });

    expect(
      winterWalkerFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.FRIGID_EXPLORER}`,
      `3:${CLASS_FEATURE.HUNTERS_RIME}`,
      `3:${CLASS_FEATURE.WINTER_WALKER_SPELLS}`,
      `7:${CLASS_FEATURE.FORTIFYING_SOUL}`,
      `11:${CLASS_FEATURE.CHILLING_RETRIBUTION}`,
      `15:${CLASS_FEATURE.FROZEN_HAUNT}`
    ]);

    expect(
      getSubclassFeatureDetails(winterWalkerSubclass, 3, CLASS_FEATURE.WINTER_WALKER_SPELLS)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Ice Knife>Ice Knife</spell>"),
          expect.stringContaining("<spell:Cone of Cold>Cone of Cold</spell>")
        ])
      })
    );

    expect(getSubclassFeatureDetails(winterWalkerSubclass, 15, CLASS_FEATURE.FROZEN_HAUNT)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Immunity>Immunity</link>"),
          expect.stringContaining("<link:Emanation>Emanation</link>"),
          expect.stringContaining("<link:Grappled>Grappled</link>")
        ])
      })
    );
  });

  it("exposes rogue subclass options and rogue subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Rogue");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "rogue-arcane-trickster",
      "rogue-assassin",
      "rogue-scion-of-the-three",
      "rogue-soulknife",
      "rogue-thief"
    ]);

    const arcaneTricksterSubclass = getSelectedSubclassForCharacter({
      className: "Rogue",
      subclassId: "rogue-arcane-trickster"
    });

    expect(arcaneTricksterSubclass?.name).toBe("Arcane Trickster");
    expect(arcaneTricksterSubclass?.tagline).toBe("Enhance Stealth with Arcane Spells");

    const arcaneTricksterFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Rogue",
      level: 17,
      subclassId: "rogue-arcane-trickster"
    });

    expect(
      arcaneTricksterFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.SPELLCASTING}`,
      `3:${CLASS_FEATURE.MAGE_HAND_LEGERDEMAIN}`,
      `9:${CLASS_FEATURE.MAGICAL_AMBUSH}`,
      `13:${CLASS_FEATURE.VERSATILE_TRICKSTER}`,
      `17:${CLASS_FEATURE.SPELL_THIEF}`
    ]);

    expect(
      getSubclassFeatureDetails(arcaneTricksterSubclass, 3, CLASS_FEATURE.SPELLCASTING)
    ).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Mage Hand>Mage Hand</spell>"),
          expect.stringContaining("<spell:Mind Sliver>Mind Sliver</spell>"),
          expect.stringContaining("<spell:Charm Person>Charm Person</spell>"),
          expect.stringContaining("<link:Arcane Focus>Arcane Focus</link>")
        ])
      })
    );

    const scionSubclass = getSelectedSubclassForCharacter({
      className: "Rogue",
      subclassId: "rogue-scion-of-the-three"
    });

    expect(scionSubclass?.name).toBe("Scion of the Three");
    expect(scionSubclass?.tagline).toBe("Become a Gruesome Agent of Malice");

    const scionFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Rogue",
      level: 17,
      subclassId: "rogue-scion-of-the-three"
    });

    expect(
      scionFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.BLOODTHIRST}`,
      `3:${CLASS_FEATURE.DREAD_ALLEGIANCE}`,
      `9:${CLASS_FEATURE.STRIKE_FEAR}`,
      `13:${CLASS_FEATURE.AURA_OF_MALEVOLENCE}`,
      `17:${CLASS_FEATURE.DREAD_INCARNATE}`
    ]);

    expect(getSubclassFeatureDetails(scionSubclass, 3, CLASS_FEATURE.DREAD_ALLEGIANCE)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Minor Illusion>Minor Illusion</spell>"),
          expect.stringContaining("<spell:Blade Ward>Blade Ward</spell>"),
          expect.stringContaining("<spell:Chill Touch>Chill Touch</spell>"),
          expect.stringContaining("<link:Psychic>Psychic</link>")
        ])
      })
    );

    const soulknifeSubclass = getSelectedSubclassForCharacter({
      className: "Rogue",
      subclassId: "rogue-soulknife"
    });

    expect(soulknifeSubclass?.name).toBe("Soulknife");
    expect(soulknifeSubclass?.tagline).toBe("Strike Foes with Psionic Blades");

    const soulknifeFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Rogue",
      level: 17,
      subclassId: "rogue-soulknife"
    });

    expect(
      soulknifeFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.PSIONIC_POWER}`,
      `3:${CLASS_FEATURE.PSYCHIC_BLADES}`,
      `9:${CLASS_FEATURE.SOUL_BLADES}`,
      `13:${CLASS_FEATURE.PSYCHIC_VEIL}`,
      `17:${CLASS_FEATURE.REND_MIND}`
    ]);

    expect(getSubclassFeatureDetails(soulknifeSubclass, 17, CLASS_FEATURE.REND_MIND)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Wisdom Saving Throw>Wisdom saving throw</link>"),
          expect.stringContaining("<link:Stunned>Stunned</link>"),
          expect.stringContaining("<link:long-rest>Long Rest</link>")
        ])
      })
    );

    const thiefSubclass = getSelectedSubclassForCharacter({
      className: "Rogue",
      subclassId: "rogue-thief"
    });

    expect(thiefSubclass?.name).toBe("Thief");
    expect(thiefSubclass?.tagline).toBe("Hunt for Treasure as a Classic Adventurer");

    const thiefFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Rogue",
      level: 17,
      subclassId: "rogue-thief"
    });

    expect(
      thiefFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.FAST_HANDS}`,
      `3:${CLASS_FEATURE.SECOND_STORY_WORK}`,
      `9:${CLASS_FEATURE.SUPREME_SNEAK}`,
      `13:${CLASS_FEATURE.USE_MAGIC_DEVICE}`,
      `17:${CLASS_FEATURE.THIEFS_REFLEXES}`
    ]);

    expect(getSubclassFeatureDetails(thiefSubclass, 13, CLASS_FEATURE.USE_MAGIC_DEVICE)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:INT>Intelligence</link>"),
          expect.stringContaining("<link:Arcana>Arcana</link>")
        ])
      })
    );
  });

  it("exposes sorcerer subclass options and sorcerer subclass feature rows by level", () => {
    const subclassOptions = getSubclassOptionsForClassName("Sorcerer");

    expect(subclassOptions.map((entry) => entry.id)).toEqual([
      "sorcerer-aberrant-sorcery",
      "sorcerer-clockwork-sorcery",
      "sorcerer-draconic-sorcery",
      "sorcerer-spellfire-sorcery",
      "sorcerer-wild-magic-sorcery"
    ]);

    const aberrantSubclass = getSelectedSubclassForCharacter({
      className: "Sorcerer",
      subclassId: "sorcerer-aberrant-sorcery"
    });

    expect(aberrantSubclass?.name).toBe("Aberrant Sorcery");
    expect(aberrantSubclass?.tagline).toBe("Wield Unnatural Psionic Power");

    const aberrantFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Sorcerer",
      level: 18,
      subclassId: "sorcerer-aberrant-sorcery"
    });

    expect(
      aberrantFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.PSIONIC_SPELLS}`,
      `3:${CLASS_FEATURE.TELEPATHIC_SPEECH}`,
      `6:${CLASS_FEATURE.PSIONIC_SORCERY}`,
      `6:${CLASS_FEATURE.PSYCHIC_DEFENSES}`,
      `14:${CLASS_FEATURE.REVELATION_IN_FLESH}`,
      `18:${CLASS_FEATURE.WARPING_IMPLOSION}`
    ]);

    expect(getSubclassFeatureDetails(aberrantSubclass, 6, CLASS_FEATURE.PSYCHIC_DEFENSES)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<link:Resistance>Resistance</link>"),
          expect.stringContaining("<link:Psychic>Psychic</link>"),
          expect.stringContaining("<link:Frightened>Frightened</link>")
        ])
      })
    );

    const spellfireSubclass = getSelectedSubclassForCharacter({
      className: "Sorcerer",
      subclassId: "sorcerer-spellfire-sorcery"
    });

    expect(spellfireSubclass?.name).toBe("Spellfire Sorcery");
    expect(spellfireSubclass?.tagline).toBe("Wield Raw Magic");

    const spellfireFeatureRows = getUnlockedSubclassFeatureRowsForCharacter({
      className: "Sorcerer",
      level: 18,
      subclassId: "sorcerer-spellfire-sorcery"
    });

    expect(
      spellfireFeatureRows.flatMap((row) =>
        row.classFeatures.map((feature) => `${row.level}:${feature}`)
      )
    ).toEqual([
      `3:${CLASS_FEATURE.SPELLFIRE_BURST}`,
      `3:${CLASS_FEATURE.SPELLFIRE_SPELLS}`,
      `6:${CLASS_FEATURE.ABSORB_SPELLS}`,
      `14:${CLASS_FEATURE.HONED_SPELLFIRE}`,
      `18:${CLASS_FEATURE.CROWN_OF_SPELLFIRE}`
    ]);

    expect(getSubclassFeatureDetails(spellfireSubclass, 6, CLASS_FEATURE.ABSORB_SPELLS)).toEqual(
      expect.objectContaining({
        trackingState: TRACKER.NOT_TRACKED,
        description: expect.arrayContaining([
          expect.stringContaining("<spell:Counterspell>Counterspell</spell>"),
          expect.stringContaining("Sorcery Points")
        ])
      })
    );
  });

  it("keeps placeholder subclass features out of class progression tables", () => {
    const deprecatedSubclassPlaceholderFeatures = new Set([
      CLASS_FEATURE.ARTIFICER_SUBCLASS,
      CLASS_FEATURE.BARBARIAN_SUBCLASS,
      CLASS_FEATURE.BARD_SUBCLASS,
      CLASS_FEATURE.CLERIC_SUBCLASS,
      CLASS_FEATURE.DRUID_SUBCLASS,
      CLASS_FEATURE.FIGHTER_SUBCLASS,
      CLASS_FEATURE.MONK_SUBCLASS,
      CLASS_FEATURE.PALADIN_SUBCLASS,
      CLASS_FEATURE.RANGER_SUBCLASS,
      CLASS_FEATURE.ROGUE_SUBCLASS,
      CLASS_FEATURE.SORCERER_SUBCLASS,
      CLASS_FEATURE.WARLOCK_SUBCLASS,
      CLASS_FEATURE.WIZARD_SUBCLASS,
      CLASS_FEATURE.SUBCLASS_FEATURE
    ]);
    const classFeatures = getClassEntries().flatMap((entry) =>
      entry.features.flatMap((featureRow) => featureRow.classFeatures)
    );

    expect(
      classFeatures.every((feature) => !deprecatedSubclassPlaceholderFeatures.has(feature))
    ).toBe(true);
  });
});
