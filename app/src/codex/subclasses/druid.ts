import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_6: 6,
  LEVEL_10: 10,
  LEVEL_14: 14
} as const;

function createSubclassFeatureRow(
  level: SubclassFeatureLevel,
  feature: CLASS_FEATURE,
  details: FeatureMapEntry
): SubclassFeatureClassObj {
  return {
    level,
    classFeatures: [feature],
    featureOverrides: {
      [feature]: details
    }
  };
}

const notTracked = { trackingState: TRACKER.NOT_TRACKED } as const;
export const naturesSanctuaryDescription = [
  "As a Magic action, you can expend a use of your Wild Shape and cause spectral trees and vines to appear in a 15-foot Cube on the ground within 120 feet of yourself.",
  "They last there for 1 minute or until you have the <link:Incapacitated>Incapacitated</link> condition or die.",
  "You and your allies have Half Cover while in that area, and your allies gain the current Resistance of your Nature's Ward while there.",
  "As a Bonus Action, you can move the Cube up to 60 feet to ground within 120 feet of yourself."
] as const;

function createWrathOfTheSeaDescription(emanationLabel: string) {
  return [
    `As a Bonus Action, you can expend a use of your Wild Shape to manifest a ${emanationLabel} <link:Emanation>Emanation</link> that takes the form of ocean spray that surrounds you for 10 minutes.`,
    "It ends early if you dismiss it (no action required), manifest it again, or have the <link:Incapacitated>Incapacitated</link> condition.",
    "When you manifest the Emanation and as a Bonus Action on your subsequent turns, you can choose another creature you can see in the Emanation.",
    "The target must succeed on a <link:Constitution Saving Throw>Constitution saving throw</link> against your spell save DC or take Cold damage and, if the creature is Large or smaller, be pushed up to 15 feet away from you.",
    "To determine this damage, roll a number of d6s equal to your <link:WIS>Wisdom</link> modifier (minimum of one die)."
  ] as const;
}

export const wrathOfTheSeaDescription = createWrathOfTheSeaDescription("5-foot");
export const aquaticAffinityWrathOfTheSeaDescription = createWrathOfTheSeaDescription(
  "<strong>10-foot</strong>"
);
export const stormbornWrathOfTheSeaDescription = [
  ...aquaticAffinityWrathOfTheSeaDescription,
  "<strong>Flight.</strong> While Wrath of the Sea is active, you gain a Fly Speed equal to your <link:Speed>Speed</link>.",
  "<strong>Resistance.</strong> While Wrath of the Sea is active, you have <link:Resistance>Resistance</link> to Cold, Lightning, and Thunder damage."
] as const;
export const starMapDescription = [
  "You've created a star chart as part of your heavenly studies. It is a Tiny object, and you can use it as a Spellcasting Focus for your Druid spells.",
  "You determine its form by rolling on the Star Map table or by choosing one.",
  "While holding the map, you have the <spell:Guidance>Guidance</spell> and <spell:Guiding Bolt>Guiding Bolt</spell> spells prepared, and you can cast Guiding Bolt without expending a spell slot.",
  "You can cast it in that way a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
  "If you lose the map, you can perform a 1-hour ceremony to magically create a replacement. This ceremony can be performed during a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>, and it destroys the previous map.",
  "<strong>Star Map Forms.</strong>",
  "1. A scroll bearing depictions of constellations.",
  "2. A stone tablet with fine holes drilled through it.",
  "3. An owlbear hide tooled with stellar symbols.",
  "4. A collection of maps bound in an ebony cover.",
  "5. A crystal engraved with starry patterns.",
  "6. A glass disk etched with constellations."
] as const;
export const starryFormDescription = [
  "As a Bonus Action, you can expend a use of your Wild Shape feature to take on a starry form rather than shape-shifting.",
  "While in your starry form, you retain your game statistics, but your body becomes luminous, your joints glimmer like stars, and glowing lines connect them as on a star chart.",
  "This form sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet.",
  "The form lasts for 10 minutes. It ends early if you dismiss it (no action required), have the <link:Incapacitated>Incapacitated</link> condition, or use this feature again.",
  "Whenever you assume your starry form, choose which of the following constellations glimmers on your body.",
  "<strong>Archer.</strong> When you activate this form and as a Bonus Action on your subsequent turns while it lasts, you can make a ranged spell attack, hurling a luminous arrow that targets one creature within 60 feet of yourself. On a hit, the attack deals <link:Radiant>Radiant</link> damage equal to 1d8 plus your <link:WIS>Wisdom</link> modifier.",
  "<strong>Chalice.</strong> Whenever you cast a spell using a spell slot that restores Hit Points to a creature, you or another creature within 30 feet of you can regain Hit Points equal to 1d8 plus your Wisdom modifier.",
  "<strong>Dragon.</strong> When you make an Intelligence or a Wisdom check or a <link:Constitution Saving Throw>Constitution saving throw</link> to maintain <link:Concentration>Concentration</link>, you can treat a roll of 9 or lower on the d20 as a 10."
] as const;

export const druidSubclassEntries: SubclassEntry[] = [
  {
    id: "druid-circle-of-the-land",
    name: "Circle of the Land",
    className: "Druid",
    tagline: "Celebrate Connection to the Natural World",
    summary:
      "The Circle of the Land comprises mystics and sages who safeguard ancient knowledge and rites. These Druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle's wisest members preside as the chief priests of their communities.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS,
        {
          description: [
            "Choose one type of land: Arid Land, Polar Land, Temperate Land, or Tropical Land. You always have the listed spells for your chosen land and Druid level prepared.",
            "<strong>Arid Land.</strong> <strong>Level 3.</strong> <spell:Blur>Blur</spell>, <spell:Burning Hands>Burning Hands</spell>, <spell:Fire Bolt>Fire Bolt</spell> <strong>Level 5.</strong> <spell:Fireball>Fireball</spell> <strong>Level 7.</strong> <spell:Blight>Blight</spell> <strong>Level 9.</strong> <spell:Wall of Stone>Wall of Stone</spell>",
            "<strong>Polar Land.</strong> <strong>Level 3.</strong> <spell:Fog Cloud>Fog Cloud</spell>, <spell:Hold Person>Hold Person</spell>, <spell:Ray of Frost>Ray of Frost</spell> <strong>Level 5.</strong> <spell:Sleet Storm>Sleet Storm</spell> <strong>Level 7.</strong> <spell:Ice Storm>Ice Storm</spell> <strong>Level 9.</strong> <spell:Cone of Cold>Cone of Cold</spell>",
            "<strong>Temperate Land.</strong> <strong>Level 3.</strong> <spell:Misty Step>Misty Step</spell>, <spell:Shocking Grasp>Shocking Grasp</spell>, <spell:Sleep>Sleep</spell> <strong>Level 5.</strong> <spell:Lightning Bolt>Lightning Bolt</spell> <strong>Level 7.</strong> <spell:Freedom of Movement>Freedom of Movement</spell> <strong>Level 9.</strong> <spell:Tree Stride>Tree Stride</spell>",
            "<strong>Tropical Land.</strong> <strong>Level 3.</strong> <spell:Acid Splash>Acid Splash</spell>, <spell:Ray of Sickness>Ray of Sickness</spell>, <spell:Web>Web</spell> <strong>Level 5.</strong> <spell:Stinking Cloud>Stinking Cloud</spell> <strong>Level 7.</strong> <spell:Polymorph>Polymorph</spell> <strong>Level 9.</strong> <spell:Insect Plague>Insect Plague</spell>"
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.LANDS_AID, {
        description: [
          "As a Magic action, you can expend a use of your Wild Shape and choose a point within 60 feet of yourself.",
          "Vitality-giving flowers and life-draining thorns appear for a moment in a 10-foot-radius Sphere centered on that point.",
          "Each creature of your choice in the area must make a <link:Constitution Saving Throw>Constitution saving throw</link> against your spell save DC, taking 2d6 <link:Necrotic>Necrotic</link> damage on a failed save or half as much damage on a successful one.",
          "One creature of your choice in that area regains 2d6 Hit Points.",
          "The damage and healing increase by 1d6 when you reach Druid levels 10 (3d6) and 14 (4d6)."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.NATURAL_RECOVERY, {
        description: [
          "You can cast one of the level 1+ spells that you have prepared from your Circle Spells feature without expending a spell slot, and you must finish a <link:long-rest>Long Rest</link> before you do so again.",
          "In addition, when you finish a <link:short-rest>Short Rest</link>, you can choose expended spell slots to recover.",
          "The spell slots can have a combined level that is equal to or less than half your Druid level (round up), and none of them can be level 6+.",
          "Once you recover spell slots with this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.NATURES_WARD, {
        description: [
          "You are immune to the <link:Poisoned>Poisoned</link> condition, and you have <link:Resistance>Resistance</link> to a damage type associated with your current land choice in Circle of the Land Spells.",
          "<strong>Arid.</strong> Fire",
          "<strong>Polar.</strong> Cold",
          "<strong>Temperate.</strong> Lightning",
          "<strong>Tropical.</strong> Poison"
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.NATURES_SANCTUARY, {
        description: [...naturesSanctuaryDescription],
        ...notTracked
      })
    ]
  },
  {
    id: "druid-circle-of-the-moon",
    name: "Circle of the Moon",
    className: "Druid",
    tagline: "Adopt Animal Forms to Guard the Wilds",
    summary:
      "Druids of the Circle of the Moon draw on lunar magic to transform themselves. Their order gathers under the moon to share news and perform rituals. Changeable as the moon, a Druid of this circle might prowl as a great cat one night, soar over the treetops as an eagle the next day, and then crash through undergrowth as a bear to drive off a trespassing monster.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.CIRCLE_OF_THE_MOON_SPELLS,
        {
          description: [
            "When you reach a Druid level specified in the Circle of the Moon Spells table, you thereafter always have the listed spells prepared.",
            "You can also cast the spells from this feature while you're in a Wild Shape form.",
            "<strong>Level 3.</strong> <spell:Cure Wounds>Cure Wounds</spell>, <spell:Moonbeam>Moonbeam</spell>, <spell:Starry Wisp>Starry Wisp</spell>",
            "<strong>Level 5.</strong> <spell:Conjure Animals>Conjure Animals</spell>",
            "<strong>Level 7.</strong> <spell:Fount of Moonlight>Fount of Moonlight</spell>",
            "<strong>Level 9.</strong> <spell:Mass Cure Wounds>Mass Cure Wounds</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.CIRCLE_FORMS, {
        description: [
          "You can channel lunar magic when you assume a Wild Shape form, granting you the benefits below.",
          "<strong>Challenge Rating.</strong> The maximum Challenge Rating for the form equals your Druid level divided by 3 (round down).",
          "<strong>Armor Class.</strong> Until you leave the form, your <link:Armor Class>AC</link> equals 13 plus your <link:WIS>Wisdom</link> modifier if that total is higher than the Beast's AC.",
          "<strong>Temporary Hit Points.</strong> You gain a number of <link:Temporary Hit Points>Temporary Hit Points</link> equal to three times your Druid level."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.IMPROVED_CIRCLE_FORMS,
        {
          description: [
            "While in a Wild Shape form, you gain the following benefits.",
            "<strong>Lunar Radiance.</strong> Each of your attacks in a Wild Shape form can deal its normal damage type or <link:Radiant>Radiant</link> damage. You make this choice each time you hit with those attacks.",
            "<strong>Increased Toughness.</strong> You can add your <link:WIS>Wisdom</link> modifier to your <link:Constitution Saving Throw>Constitution saving throws</link>."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.MOONLIGHT_STEP, {
        description: [
          "You magically transport yourself, reappearing amid a burst of moonlight.",
          "As a Bonus Action, you teleport up to 30 feet to an unoccupied space you can see, and you have <link:Advantage>Advantage</link> on the next attack roll you make before the end of this turn.",
          "You can use this feature a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "You can also regain uses by expending a level 2+ spell slot for each use you want to restore (no action required)."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.LUNAR_FORM, {
        description: [
          "The power of the moon suffuses you, granting you the following benefits.",
          "<strong>Improved Lunar Radiance.</strong> Once per turn, you can deal an extra 2d10 <link:Radiant>Radiant</link> damage to a target you hit with a Wild Shape form's attack.",
          "<strong>Shared Moonlight.</strong> Whenever you use Moonlight Step, you can also teleport one willing creature. That creature must be within 10 feet of you, and you teleport it to an unoccupied space you can see within 10 feet of your destination space."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "druid-circle-of-the-sea",
    name: "Circle of the Sea",
    className: "Druid",
    tagline: "Become One with Tides and Storms",
    summary:
      "Druids of the Circle of the Sea draw on the tempestuous forces of oceans and storms. Some view themselves as embodiments of nature's wrath, seeking vengeance against those who despoil nature. Others seek mystical unity with nature by attuning themselves to the ebb and flow of the tides.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.CIRCLE_OF_THE_SEA_SPELLS,
        {
          description: [
            "When you reach a Druid level specified in the Circle of the Sea Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Fog Cloud>Fog Cloud</spell>, <spell:Gust of Wind>Gust of Wind</spell>, <spell:Ray of Frost>Ray of Frost</spell>, <spell:Shatter>Shatter</spell>, <spell:Thunderwave>Thunderwave</spell>",
            "<strong>Level 5.</strong> <spell:Lightning Bolt>Lightning Bolt</spell>, <spell:Water Breathing>Water Breathing</spell>",
            "<strong>Level 7.</strong> <spell:Control Water>Control Water</spell>, <spell:Ice Storm>Ice Storm</spell>",
            "<strong>Level 9.</strong> <spell:Conjure Elemental>Conjure Elemental</spell>, <spell:Hold Monster>Hold Monster</spell>"
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WRATH_OF_THE_SEA, {
        description: [...wrathOfTheSeaDescription],
        ...notTracked
      }),
      {
        level: SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        classFeatures: [CLASS_FEATURE.AQUATIC_AFFINITY],
        featureOverrides: {
          [CLASS_FEATURE.AQUATIC_AFFINITY]: {
            description: [
              "The size of the Emanation created by your Wrath of the Sea increases to 10 feet.",
              "In addition, you gain a Swim Speed equal to your <link:Speed>Speed</link>."
            ],
            ...notTracked
          },
          [CLASS_FEATURE.WRATH_OF_THE_SEA]: {
            description: [...aquaticAffinityWrathOfTheSeaDescription],
            ...notTracked
          }
        }
      },
      {
        level: SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        classFeatures: [CLASS_FEATURE.STORMBORN],
        featureOverrides: {
          [CLASS_FEATURE.STORMBORN]: {
            description: [
              "Your Wrath of the Sea confers two more benefits while active.",
              "<strong>Flight.</strong> You gain a Fly Speed equal to your <link:Speed>Speed</link>.",
              "<strong>Resistance.</strong> You have <link:Resistance>Resistance</link> to Cold, Lightning, and Thunder damage."
            ],
            ...notTracked
          },
          [CLASS_FEATURE.WRATH_OF_THE_SEA]: {
            description: [...stormbornWrathOfTheSeaDescription],
            ...notTracked
          }
        }
      },
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.OCEANIC_GIFT, {
        description: [
          "Instead of manifesting the Emanation of Wrath of the Sea around yourself, you can manifest it around one willing creature within 60 feet of yourself.",
          "That creature gains all the benefits of the Emanation and uses your spell save DC and <link:WIS>Wisdom</link> modifier for it.",
          "In addition, you can manifest the Emanation around both the other creature and yourself if you expend two uses of your Wild Shape instead of one when manifesting it."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "druid-circle-of-the-stars",
    name: "Circle of the Stars",
    className: "Druid",
    tagline: "Harness Secrets Hidden in Constellations",
    summary:
      "The Circle of the Stars has tracked heavenly patterns since time immemorial, discovering secrets hidden amid the constellations. By understanding these secrets, the Druids of this circle seek to harness the powers of the cosmos.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.STAR_MAP, {
        description: [...starMapDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.STARRY_FORM, {
        description: [...starryFormDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.COSMIC_OMEN, {
        description: [
          "Whenever you finish a <link:long-rest>Long Rest</link>, you can consult your Star Map for omens and roll a die.",
          "Until you finish your next Long Rest, you gain access to a special Reaction based on whether you rolled an even or an odd number on the die.",
          "<strong>Weal (even).</strong> Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a Reaction to roll 1d6 and add the number rolled to the total.",
          "<strong>Woe (odd).</strong> Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a Reaction to roll 1d6 and subtract the number rolled from the total.",
          "You can use this Reaction a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.TWINKLING_CONSTELLATIONS,
        {
          description: [
            "The constellations of your Starry Form improve.",
            "The 1d8 of the Archer and the Chalice becomes 2d8, and while the Dragon is active, you have a Fly Speed of 20 feet and can hover.",
            "Moreover, at the start of each of your turns while in your Starry Form, you can change which constellation glimmers on your body."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.FULL_OF_STARS, {
        description: [
          "While in your Starry Form, you become partially incorporeal, giving you <link:Resistance>Resistance</link> to <link:Bludgeoning>Bludgeoning</link>, <link:Piercing>Piercing</link>, and <link:Slashing>Slashing</link> damage."
        ],
        ...notTracked
      })
    ]
  }
];
