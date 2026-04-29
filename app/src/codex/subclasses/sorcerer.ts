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
  LEVEL_14: 14,
  LEVEL_18: 18
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

export const sorcererSubclassEntries: SubclassEntry[] = [
  {
    id: "sorcerer-aberrant-sorcery",
    name: "Aberrant Sorcery",
    className: "Sorcerer",
    tagline: "Wield Unnatural Psionic Power",
    summary:
      "An alien influence has wrapped its tendrils around your mind, giving you psionic power. You can now touch other minds with that power and alter the world around you, whether as a beacon of strange hope or as a terror whose thoughts cut like a blade.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PSIONIC_SPELLS, {
        description: [
          "When you reach a Sorcerer level specified in the Psionic Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Arms of Hadar>Arms of Hadar</spell>, <spell:Calm Emotions>Calm Emotions</spell>, <spell:Detect Thoughts>Detect Thoughts</spell>, <spell:Dissonant Whispers>Dissonant Whispers</spell>, <spell:Mind Sliver>Mind Sliver</spell>",
          "<strong>Level 5.</strong> <spell:Hunger of Hadar>Hunger of Hadar</spell>, <spell:Sending>Sending</spell>",
          "<strong>Level 7.</strong> <spell:Evard's Black Tentacles>Evard's Black Tentacles</spell>, <spell:Summon Aberration>Summon Aberration</spell>",
          "<strong>Level 9.</strong> <spell:Rary's Telepathic Bond>Rary's Telepathic Bond</spell>, <spell:Telekinesis>Telekinesis</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.TELEPATHIC_SPEECH, {
        description: [
          "You can form a telepathic connection between your mind and the mind of another.",
          "As a Bonus Action, choose one creature you can see within 30 feet of yourself.",
          "You and the chosen creature can communicate telepathically with each other while the two of you are within a number of miles of each other equal to your <link:CHA>Charisma</link> modifier (minimum of 1 mile).",
          "To understand each other, you each must mentally use a language the other knows.",
          "The telepathic connection lasts for a number of minutes equal to your Sorcerer level.",
          "It ends early if you use this ability to form a connection with a different creature."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.PSIONIC_SORCERY, {
        description: [
          "When you cast any level 1+ spell from your Psionic Spells feature, you can cast it by expending a spell slot as normal or by spending a number of Sorcery Points equal to the spell's level.",
          "If you cast the spell using Sorcery Points, it requires no Verbal or Somatic components, and it requires no Material components unless they are consumed by the spell or have a cost specified in it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.PSYCHIC_DEFENSES, {
        description: [
          "You have <link:Resistance>Resistance</link> to <link:Psychic>Psychic</link> damage.",
          "You also have <link:Advantage>Advantage</link> on saving throws to avoid or end the <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> condition."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.REVELATION_IN_FLESH,
        {
          description: [
            "You can unleash the aberrant truth hidden within yourself.",
            "As a Bonus Action, you can spend 1 Sorcery Point or more to magically alter your body for 10 minutes.",
            "For each Sorcery Point you spend, you gain one of the following benefits of your choice, the effects of which last until the alteration ends.",
            "<strong>Aquatic Adaptation.</strong> You gain a Swim Speed equal to twice your <link:Speed>Speed</link>, and you can breathe underwater. Gills grow from your neck or flare behind your ears, and your fingers become webbed or you grow wriggling cilia.",
            "<strong>Glistening Flight.</strong> You gain a Fly Speed equal to your <link:Speed>Speed</link>, and you can hover. As you fly, your skin glistens with mucus or otherworldly light.",
            "<strong>See the Invisible.</strong> You can see any <link:Invisible>Invisible</link> creature within 60 feet of yourself that isn't behind Total Cover. Your eyes also turn black or become writhing sensory tendrils.",
            "<strong>Wormlike Movement.</strong> Your body, along with any equipment you are wearing or carrying, becomes slimy and pliable. You can move through any space as narrow as 1 inch, and you can spend 5 feet of movement to escape from nonmagical restraints or the <link:Grappled>Grappled</link> condition."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.WARPING_IMPLOSION, {
        description: [
          "You can unleash a space-warping anomaly.",
          "As a Magic action, you teleport to an unoccupied space you can see within 120 feet of yourself.",
          "Immediately after you disappear, each creature within 30 feet of the space you left must make a <link:Strength Saving Throw>Strength saving throw</link> against your spell save DC.",
          "On a failed save, a creature takes <strong>3d10</strong> <link:Force>Force</link> damage and is pulled straight toward the space you left, ending in an unoccupied space as close to your former space as possible.",
          "On a successful save, the creature takes half as much damage only.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link> unless you spend 5 Sorcery Points (no action required) to restore your use of it."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "sorcerer-clockwork-sorcery",
    name: "Clockwork Sorcery",
    className: "Sorcerer",
    tagline: "Channel Cosmic Forces of Order",
    summary:
      "The cosmic force of order has suffused you with magic. Whether that power stems from Mechanus, a connection to modrons, or some other perfectly ordered influence, your sorcery now feels like one moving part in a vast and glorious design.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.CLOCKWORK_SPELLS, {
        description: [
          "When you reach a Sorcerer level specified in the Clockwork Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Aid>Aid</spell>, <spell:Alarm>Alarm</spell>, <spell:Lesser Restoration>Lesser Restoration</spell>, <spell:Protection from Evil and Good>Protection from Evil and Good</spell>",
          "<strong>Level 5.</strong> <spell:Dispel Magic>Dispel Magic</spell>, <spell:Protection from Energy>Protection from Energy</spell>",
          "<strong>Level 7.</strong> <spell:Freedom of Movement>Freedom of Movement</spell>, <spell:Summon Construct>Summon Construct</spell>",
          "<strong>Level 9.</strong> <spell:Greater Restoration>Greater Restoration</spell>, <spell:Wall of Force>Wall of Force</spell>",
          "In addition, consult the Manifestations of Order table and choose or randomly determine a way your connection to order manifests while you are casting any of your Sorcerer spells.",
          "<strong>Manifestations of Order.</strong>",
          "1. Spectral cogwheels hover behind you.",
          "2. The hands of a clock spin in your eyes.",
          "3. Your skin glows with a brassy sheen.",
          "4. Floating equations and geometric objects overlay your body.",
          "5. Your Spellcasting Focus temporarily takes the form of a Tiny clockwork mechanism.",
          "6. The ticking of gears or ringing of a clock can be heard by you and those affected by your magic."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.RESTORE_BALANCE, {
        description: [
          "Your connection to the plane of absolute order allows you to equalize chaotic moments.",
          "When a creature you can see within 60 feet of yourself is about to roll a <strong>d20</strong> with <link:Advantage>Advantage</link> or <link:Disadvantage>Disadvantage</link>, you can take a Reaction to prevent the roll from being affected by Advantage and Disadvantage.",
          "You can use this feature a number of times equal to your <link:CHA>Charisma</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.BASTION_OF_LAW, {
        description: [
          "You can tap into the grand equation of existence to imbue a creature with a shimmering shield of order.",
          "As a Magic action, you can expend 1 to 5 Sorcery Points to create a magical ward around yourself or another creature you can see within 30 feet of yourself.",
          "The ward is represented by a number of <strong>d8s</strong> equal to the number of Sorcery Points spent to create it. (The app does not track the stored d8s dice)",
          "When the warded creature takes damage, it can expend a number of those dice, roll them, and reduce the damage taken by the total rolled on those dice.",
          "The ward lasts until you finish a <link:long-rest>Long Rest</link> or until you use this feature again."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.TRANCE_OF_ORDER, {
        description: [
          "You gain the ability to align your consciousness with the endless calculations of Mechanus.",
          "As a Bonus Action, you can enter this state for 1 minute.",
          "For the duration, attack rolls against you can't benefit from <link:Advantage>Advantage</link>, and whenever you make a <strong>D20</strong> Test, you can treat a roll of 9 or lower on the <strong>d20</strong> as a 10. (Not Tracked yet)",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you spend 5 Sorcery Points (no action required) to restore your use of it."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_18,
        CLASS_FEATURE.CLOCKWORK_CAVALCADE,
        {
          description: [
            "You momentarily summon spirits of order to expunge disorder around you.",
            "As a Magic action, you summon the spirits in a 30-foot Cube originating from you.",
            "The spirits look like modrons or other Constructs of your choice.",
            "The spirits are intangible and invulnerable, and they create the effects below within the Cube before vanishing.",
            "Once you use this action, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you spend 7 Sorcery Points (no action required) to restore your use of it.",
            "<strong>Heal.</strong> The spirits restore up to 100 Hit Points, divided as you choose among any number of creatures of your choice in the Cube.",
            "<strong>Repair.</strong> Any damaged objects entirely in the Cube are repaired instantly.",
            "<strong>Dispel.</strong> Every spell of level 6 and lower ends on creatures and objects of your choice in the Cube."
          ],
          trackingState: TRACKER.SEMI_TRACKED
        }
      )
    ]
  },
  {
    id: "sorcerer-draconic-sorcery",
    name: "Draconic Sorcery",
    className: "Sorcerer",
    tagline: "Breathe the Magic of Dragons",
    summary:
      "Your innate magic comes from the gift of a dragon. Whether it passed to you through blood, place, treasure, or the last boon of a dying wyrm, draconic power now courses through your body and shapes both your magic and your form.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DRACONIC_RESILIENCE, {
        description: [
          "The magic in your body manifests physical traits of your draconic gift.",
          "Your Hit Point maximum increases by 3, and it increases by 1 whenever you gain another Sorcerer level.",
          "Parts of you are also covered by dragon-like scales.",
          "While you aren't wearing armor, your base <link:Armor Class>Armor Class</link> equals 10 plus your <link:DEX>Dexterity</link> and <link:CHA>Charisma</link> modifiers."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DRACONIC_SPELLS, {
        description: [
          "When you reach a Sorcerer level specified in the Draconic Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Alter Self>Alter Self</spell>, <spell:Chromatic Orb>Chromatic Orb</spell>, <spell:Command>Command</spell>, <spell:Dragon's Breath>Dragon's Breath</spell>",
          "<strong>Level 5.</strong> <spell:Fear>Fear</spell>, <spell:Fly>Fly</spell>",
          "<strong>Level 7.</strong> <spell:Arcane Eye>Arcane Eye</spell>, <spell:Charm Monster>Charm Monster</spell>",
          "<strong>Level 9.</strong> <spell:Legend Lore>Legend Lore</spell>, <spell:Summon Dragon>Summon Dragon</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.ELEMENTAL_AFFINITY, {
        description: [
          "Your draconic magic has an affinity with a damage type associated with dragons.",
          "Choose one of those types: <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Poison>Poison</link>.",
          "You have <link:Resistance>Resistance</link> to that damage type, and when you cast a spell that deals damage of that type, you can add your <link:CHA>Charisma</link> modifier to one damage roll of that spell."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.DRAGON_WINGS, {
        description: [
          "As a Bonus Action, you can cause draconic wings to appear on your back.",
          "The wings last for 1 hour or until you dismiss them (no action required).",
          "For the duration, you have a Fly Speed of 60 feet.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you spend 3 Sorcery Points (no action required) to restore your use of it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.DRAGON_COMPANION, {
        description: [
          "You can cast <spell:Summon Dragon>Summon Dragon</spell> without a Material component.",
          "You can also cast it once without a spell slot, and you regain the ability to cast it in this way when you finish a <link:long-rest>Long Rest</link>.",
          "Whenever you start casting the spell, you can modify it so that it doesn't require <link:Concentration>Concentration</link>.",
          "If you do so, the spell's duration becomes 1 minute for that casting."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  },
  {
    id: "sorcerer-spellfire-sorcery",
    name: "Spellfire Sorcery",
    className: "Sorcerer",
    tagline: "Wield Raw Magic",
    summary:
      "Your innate power stems from the source of magic itself: the Weave. That rare talent manifests as spellfire, letting you burst with radiant magic, heal allies, scorch enemies, and even absorb hostile spells into your own burning reserve.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SPELLFIRE_BURST, {
        description: [
          "When you spend at least 1 Sorcery Point as part of the Magic action or a Bonus Action on your turn, you can unleash one of the following magical effects of your choice.",
          "You can do so only once per turn.",
          "<strong>Bolstering Flames.</strong> You or one creature you can see within 30 feet of yourself gains <link:Temporary Hit Points>Temporary Hit Points</link> equal to <strong>1d4</strong> plus your <link:CHA>Charisma</link> modifier.",
          "<strong>Radiant Fire.</strong> One creature you can see within 30 feet of yourself takes <strong>1d4</strong> <link:Fire>Fire</link> or <link:Radiant>Radiant</link> damage (your choice)."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SPELLFIRE_SPELLS, {
        description: [
          "When you reach a Sorcerer level specified in the Spellfire Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Cure Wounds>Cure Wounds</spell>, <spell:Guiding Bolt>Guiding Bolt</spell>, <spell:Lesser Restoration>Lesser Restoration</spell>, <spell:Scorching Ray>Scorching Ray</spell>",
          "<strong>Level 5.</strong> <spell:Aura of Vitality>Aura of Vitality</spell>, <spell:Dispel Magic>Dispel Magic</spell>",
          "<strong>Level 7.</strong> <spell:Fire Shield>Fire Shield</spell>, <spell:Wall of Fire>Wall of Fire</spell>",
          "<strong>Level 9.</strong> <spell:Greater Restoration>Greater Restoration</spell>, <spell:Flame Strike>Flame Strike</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.ABSORB_SPELLS, {
        description: [
          "You always have <spell:Counterspell>Counterspell</spell> prepared.",
          "Additionally, whenever a target fails the saving throw against a <spell:Counterspell>Counterspell</spell> you cast, you regain <strong>1d4</strong> Sorcery Points. (Not Tracked)"
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.HONED_SPELLFIRE, {
        description: [
          "Your Spellfire Burst improves.",
          "You add your Sorcerer level to the <link:Temporary Hit Points>Temporary Hit Points</link> gained from Bolstering Flames, and the damage of Radiant Fire increases to <strong>1d8</strong>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.CROWN_OF_SPELLFIRE, {
        description: [
          "When you use Innate Sorcery, you can alter it and infuse yourself with the essence of spellfire, gaining the following benefits while this use of Innate Sorcery is active.",
          "Once you use this feature to alter Innate Sorcery, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you spend 5 Sorcery Points (no action required) to restore your use of it.",
          "<strong>Burning Life Force.</strong> Once per turn when you are hit by an attack roll, you can expend a number of Hit Point Dice, up to a maximum equal to your <link:CHA>Charisma</link> modifier (minimum of one). Roll the expended dice, and reduce the amount of damage from that attack equal to the total rolled.",
          "<strong>Flight.</strong> You gain a Fly Speed of 60 feet and can hover.",
          "<strong>Spell Avoidance.</strong> When you're subjected to a spell or magical effect that allows you to make a saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail. You can't use this benefit if you have the <link:Incapacitated>Incapacitated</link> condition."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  },
  {
    id: "sorcerer-wild-magic-sorcery",
    name: "Wild Magic Sorcery",
    className: "Sorcerer",
    tagline: "Unleash Chaotic Magic",
    summary:
      "Your innate magic stems from the forces of chaos that underlie creation. Whether it came from a planar portal, a fey blessing, a demonic mark, or pure accident, that unstable power churns within you and strains to burst free.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WILD_MAGIC_SURGE, {
        description: [
          "Your spellcasting can unleash surges of untamed magic.",
          "Once per turn, you can roll <strong>1d20</strong> immediately after you cast a Sorcerer spell with a spell slot.",
          "If you roll a 20, roll on the Wild Magic Surge table to create a magical effect.",
          "If the magical effect is a spell, it is too wild to be affected by your <link:Metamagic>Metamagic</link>.",
          "<strong>Wild Magic Surge.</strong> (The magical effects are not tracked)",
          "01-04. Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls.",
          "05-08. A creature that is Friendly toward you appears in a random unoccupied space within 60 feet of you. The creature is under the DM's control and disappears 1 minute later. Roll <strong>1d4</strong> to determine the creature: on a 1, a Modron Duodrone appears; on a 2, a Flumph appears; on a 3, a Modron Monodrone appears; on a 4, a Unicorn appears. See the Monster Manual for the creature's stat block.",
          "09-12. For the next minute, you regain 5 Hit Points at the start of each of your turns.",
          "13-16. Creatures have <link:Disadvantage>Disadvantage</link> on saving throws against the next spell you cast in the next minute that involves a saving throw.",
          "17-20. You are subjected to an effect that lasts for 1 minute unless its description says otherwise. Roll <strong>1d8</strong> to determine the effect: on a 1, you're surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; on a 2, your size increases by one size category; on a 3, you grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; on a 4, you must shout when you speak; on a 5, illusory butterflies flutter in the air within 10 feet of you; on a 6, an eye appears on your forehead, granting you <link:Advantage>Advantage</link> on Wisdom (<link:Perception>Perception</link>) checks; on a 7, pink bubbles float out of your mouth whenever you speak; on an 8, your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a <spell:Remove Curse>Remove Curse</spell> spell.",
          "21-24. For the next minute, all your spells with a casting time of an action have a casting time of a Bonus Action.",
          "25-28. You are transported to the Astral Plane until the end of your next turn. You then return to the space you previously occupied or the nearest unoccupied space if that space is occupied.",
          "29-32. The next time you cast a spell that deals damage within the next minute, don't roll the spell's damage dice for the damage. Instead use the highest number possible for each damage die.",
          "33-36. You have <link:Resistance>Resistance</link> to all damage for the next minute.",
          "37-40. You turn into a potted plant until the start of your next turn. While you're a plant, you have the <link:Incapacitated>Incapacitated</link> condition and have <link:Vulnerability>Vulnerability</link> to all damage. If you drop to 0 Hit Points, your pot breaks, and your form reverts.",
          "41-44. For the next minute, you can teleport up to 20 feet as a Bonus Action on each of your turns.",
          "45-48. You and up to three creatures you choose within 30 feet of you have the <link:Invisible>Invisible</link> condition for 1 minute. This invisibility ends on a creature immediately after it makes an attack roll, deals damage, or casts a spell.",
          "49-52. A spectral shield hovers near you for the next minute, granting you a +2 bonus to AC and immunity to <spell:Magic Missile>Magic Missile</spell>.",
          "53-56. You can take one extra action on this turn.",
          "57-60. You cast a random spell. If the spell normally requires <link:Concentration>Concentration</link>, it doesn't require Concentration in this case; the spell lasts for its full duration. Roll <strong>1d10</strong> to determine the spell: on a 1, <spell:Confusion>Confusion</spell>; on a 2, <spell:Fireball>Fireball</spell>; on a 3, <spell:Fog Cloud>Fog Cloud</spell>; on a 4, <spell:Fly>Fly</spell> (cast on a random creature within 60 feet of you); on a 5, <spell:Grease>Grease</spell>; on a 6, <spell:Levitate>Levitate</spell> (cast on yourself); on a 7, <spell:Magic Missile>Magic Missile</spell> (cast as a level 5 spell); on an 8, <spell:Mirror Image>Mirror Image</spell>; on a 9, <spell:Polymorph>Polymorph</spell> (cast on yourself), and if you fail the saving throw, you turn into a Goat (see appendix B); on a 10, <spell:See Invisibility>See Invisibility</spell>.",
          "61-64. For the next minute, any flammable, nonmagical object you touch that isn't being worn or carried by another creature bursts into flame, takes <strong>1d4</strong> <link:Fire>Fire</link> damage, and is burning.",
          "65-68. If you die within the next hour, you immediately revive as if by the <spell:Reincarnate>Reincarnate</spell> spell.",
          "69-72. You have the <link:Frightened>Frightened</link> condition until the end of your next turn. The DM determines the source of your fear.",
          "73-76. You teleport up to 60 feet to an unoccupied space you can see.",
          "77-80. A random creature within 60 feet of you has the <link:Poisoned>Poisoned</link> condition for <strong>1d4</strong> hours.",
          "81-84. You radiate Bright Light in a 30-foot radius for the next minute. Any creature that ends its turn within 5 feet of you has the <link:Blinded>Blinded</link> condition until the end of its next turn.",
          "85-88. Up to three creatures of your choice that you can see within 30 feet of you take <strong>1d10</strong> <link:Necrotic>Necrotic</link> damage. You regain Hit Points equal to the sum of the Necrotic damage dealt.",
          "89-92. Up to three creatures of your choice that you can see within 30 feet of you take <strong>4d10</strong> <link:Lightning>Lightning</link> damage.",
          "93-96. You and all creatures within 30 feet of you have <link:Vulnerability>Vulnerability</link> to <link:Piercing>Piercing</link> damage for the next minute.",
          "97-00. Roll <strong>1d6</strong>. On a 1, you regain <strong>2d10</strong> Hit Points; on a 2, one ally of your choice within 300 feet of you regains <strong>2d10</strong> Hit Points; on a 3, you regain your lowest-level expended spell slot; on a 4, one ally of your choice within 300 feet of you regains their lowest-level expended spell slot; on a 5, you regain all your expended Sorcery Points; on a 6, all the effects of row 17-20 affect you simultaneously."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.TIDES_OF_CHAOS, {
        description: [
          "You can manipulate chaos itself to give yourself <link:Advantage>Advantage</link> on one <strong>D20</strong> Test before you roll the <strong>d20</strong>.",
          "Once you do so, you must cast a Sorcerer spell with a spell slot or finish a <link:long-rest>Long Rest</link> before you can use this feature again.",
          "If you do cast a Sorcerer spell with a spell slot before you finish a Long Rest, you automatically roll on the Wild Magic Surge table."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.BEND_LUCK, {
        description: [
          "You have the ability to twist fate using your wild magic.",
          "Immediately after another creature you can see rolls the <strong>d20</strong> for a <strong>D20</strong> Test, you can take a Reaction and spend 1 Sorcery Point to roll <strong>1d4</strong> and apply the number rolled as a bonus or penalty (your choice) to the <strong>d20</strong> roll."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.CONTROLLED_CHAOS, {
        description: [
          "You gain a modicum of control over the surges of your wild magic.",
          "Whenever you roll on the Wild Magic Surge table, you can roll twice and use either number."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.TAMED_SURGE, {
        description: [
          "Immediately after you cast a Sorcerer spell with a spell slot, you can create an effect of your choice from the Wild Magic Surge table instead of rolling on that table.",
          "You can choose any effect in the table except for the final row, and if the chosen effect involves a roll, you must make it.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  }
];
