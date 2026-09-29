import { createSubclassFeatureRow } from "./featureRow";
import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type { SubclassEntry } from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_9: 9,
  LEVEL_13: 13,
  LEVEL_17: 17
} as const;

export const rogueSubclassEntries: SubclassEntry[] = [
  {
    id: "rogue-arcane-trickster",
    name: "Arcane Trickster",
    className: "Rogue",
    tagline: "Enhance Stealth with Arcane Spells",
    summary:
      "Arcane Tricksters enhance their fine-honed stealth and agility with magic, learning arcane tricks that support infiltration, distraction, and deception. Some use these talents as pickpockets and burglars, while others lean into mischief and pranks.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SPELLCASTING, {
        description: [
          "You have learned to cast spells.",
          "<strong>Cantrips.</strong> You know three cantrips: <spell:Mage Hand>Mage Hand</spell> and two other cantrips of your choice from the Wizard spell list. <spell:Mind Sliver>Mind Sliver</spell> and <spell:Minor Illusion>Minor Illusion</spell> are recommended.",
          "Whenever you gain a Rogue level, you can replace one of your cantrips, except <spell:Mage Hand>Mage Hand</spell>, with another Wizard cantrip of your choice.",
          "When you reach Rogue level 10, you learn another Wizard cantrip of your choice.",
          "<strong>Spell Slots.</strong> The Arcane Trickster Spellcasting table shows how many spell slots you have to cast your level 1+ spells. You regain all expended spell slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose three level 1 Wizard spells. <spell:Charm Person>Charm Person</spell>, <spell:Disguise Self>Disguise Self</spell>, and <spell:Fog Cloud>Fog Cloud</spell> are recommended.",
          "The number of spells on your list increases as you gain Rogue levels, as shown in the Prepared Spells column of the Arcane Trickster Spellcasting table. Whenever that number increases, choose additional Wizard spells until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you gain a Rogue level, you can replace one spell on your list with another Wizard spell for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> <link:INT>Intelligence</link> is your spellcasting ability for your Wizard spells.",
          "<strong>Spellcasting Focus.</strong> You can use an <link:Arcane Focus>Arcane Focus</link> as a Spellcasting Focus for your Wizard spells."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.MAGE_HAND_LEGERDEMAIN,
        {
          description: [
            "When you cast <spell:Mage Hand>Mage Hand</spell>, you can cast it as a Bonus Action, and you can make the spectral hand <link:Invisible>Invisible</link>.",
            "You can control the hand as a Bonus Action, and through it, you can make Dexterity (<link:Sleight of Hand>Sleight of Hand</link>) checks."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_9, CLASS_FEATURE.MAGICAL_AMBUSH, {
        description: [
          "If you have the <link:Invisible>Invisible</link> condition when you cast a spell on a creature, it has <link:Disadvantage>Disadvantage</link> on any saving throw it makes against the spell on the same turn."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_13,
        CLASS_FEATURE.VERSATILE_TRICKSTER,
        {
          description: [
            "You gain the ability to distract targets with your <spell:Mage Hand>Mage Hand</spell>.",
            "When you use the Trip option of your Cunning Strike on a creature, you can also use that option on another creature within 5 feet of the spectral hand."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.SPELL_THIEF, {
        description: [
          "You gain the ability to magically steal the knowledge of how to cast a spell from another spellcaster.",
          "Immediately after a creature casts a spell that targets you or includes you in its area of effect, you can take a Reaction to force the creature to make an <link:Intelligence Saving Throw>Intelligence saving throw</link>. The DC equals your spell save DC.",
          "On a failed save, you negate the spell's effect against you, and you steal the knowledge of the spell if it is at least level 1 and of a level you can cast. It doesn't need to be a Wizard spell.",
          "For the next 8 hours, you have the spell prepared. The creature can't cast it until the 8 hours have passed.",
          "Once you steal a spell with this feature, you can't use this feature again until you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "rogue-assassin",
    name: "Assassin",
    className: "Rogue",
    tagline: "Practice the Grim Art of Death",
    summary:
      "Assassins focus their training on stealth, poison, and disguise to eliminate foes with ruthless efficiency. Some are killers-for-hire, spies, or bounty hunters, while others use the same methods against monstrous enemies in adventuring life.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ASSASSINATE, {
        description: [
          "You're adept at ambushing a target, granting you the following benefits.",
          "<strong>Initiative.</strong> You have <link:Advantage>Advantage</link> on <link:Initiative>Initiative</link> rolls.",
          "<strong>Surprising Strikes.</strong> During the first round of each combat, you have <link:Advantage>Advantage</link> on attack rolls against any creature that hasn't taken a turn. If your Sneak Attack hits any target during that round, the target takes extra damage of the weapon's type equal to your Rogue level."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ASSASSINS_TOOLS, {
        description: [
          "You gain a <link:Disguise Kit>Disguise Kit</link> and a Poisoner's Kit, and you have proficiency with them.",
          "(Add the tools yourself to your inventory)"
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.INFILTRATION_EXPERTISE,
        {
          description: [
            "You are expert at techniques that aid your infiltrations.",
            "<strong>Masterful Mimicry.</strong> You can unerringly mimic another person's speech, handwriting, or both if you have spent at least 1 hour studying them.",
            "<strong>Roving Aim.</strong> Your <link:Speed>Speed</link> isn't reduced to 0 by using Steady Aim."
          ],
          trackingState: TRACKER.SEMI_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_13, CLASS_FEATURE.ENVENOM_WEAPONS, {
        description: [
          "When you use the Poison option of your Cunning Strike, the target also takes <strong>2d6</strong> <link:Poison>Poison</link> damage whenever it fails the saving throw.",
          "This damage ignores <link:Resistance>Resistance</link> to Poison damage."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.DEATH_STRIKE, {
        description: [
          "When you hit with your Sneak Attack on the first round of a combat, the target must succeed on a <link:Constitution Saving Throw>Constitution saving throw</link> (DC 8 plus your <link:DEX>Dexterity</link> modifier and <link:Proficiency Bonus>Proficiency Bonus</link>), or the attack's damage is doubled against the target."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  },
  {
    id: "rogue-scion-of-the-three",
    name: "Scion of the Three",
    className: "Rogue",
    tagline: "Become a Gruesome Agent of Malice",
    summary:
      "Scions of the Three draw power from the Dead Three: Bane, Bhaal, and Myrkul. Some serve those gods willingly, while others are pulled onto this path by curses, channeling occult gifts and an uncanny talent for terrifying, violent strikes.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.BLOODTHIRST, {
        description: [
          "When an enemy you can see within 30 feet of yourself takes damage and is Bloodied after taking that damage but not killed outright, you can take a Reaction and teleport to an unoccupied space you can see within 5 feet of that enemy.",
          "You can then make one melee attack.",
          "You can use this feature a number of times equal to your <link:INT>Intelligence</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DREAD_ALLEGIANCE, {
        description: [
          "Choose one of the Dead Three: Bane, Bhaal, or Myrkul. You gain <link:Resistance>Resistance</link> to one damage type and the ability to cast a cantrip based on that choice. <link:INT>Intelligence</link> is your spellcasting ability for the cantrip. When you finish a <link:long-rest>Long Rest</link>, you can change your choice.",
          "<strong>Bane.</strong> <link:Psychic>Psychic</link> resistance and <spell:Minor Illusion>Minor Illusion</spell>.",
          "<strong>Bhaal.</strong> <link:Poison>Poison</link> resistance and <spell:Blade Ward>Blade Ward</spell>.",
          "<strong>Myrkul.</strong> <link:Necrotic>Necrotic</link> resistance and <spell:Chill Touch>Chill Touch</spell>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_9, CLASS_FEATURE.STRIKE_FEAR, {
        description: [
          "You gain the following Cunning Strike option.",
          "<strong>Terrify (Cost: 1d6).</strong> The target must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link>, or it has the <link:Frightened>Frightened</link> condition for 1 minute.",
          "While the target is Frightened in this way, you have <link:Advantage>Advantage</link> on attack rolls against the target.",
          "The Frightened target repeats the save at the end of each of its turns, ending the effect on itself on a success."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_13,
        CLASS_FEATURE.AURA_OF_MALEVOLENCE,
        {
          description: [
            "You radiate malignant power associated with one of the Dead Three.",
            "When you use Bloodthirst and teleport, each creature of your choice within 10 feet of either the space you left or your destination space takes damage equal to your <link:INT>Intelligence</link> modifier.",
            "The damage type is the same as the damage <link:Resistance>Resistance</link> granted by your choice in Dread Allegiance, and damage dealt by this feature ignores Resistance."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.DREAD_INCARNATE, {
        description: [
          "You gain the following benefits.",
          "<strong>Cutthroat.</strong> You regain one expended use of Bloodthirst when you finish a <link:short-rest>Short Rest</link>.",
          "<strong>Murderous Intent.</strong> When you roll for your Sneak Attack damage, you can treat a roll of 1 or 2 on the die as a 3."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "rogue-soulknife",
    name: "Soulknife",
    className: "Rogue",
    tagline: "Strike Foes with Psionic Blades",
    summary:
      "Soulknives channel psionic power into subtle, deadly weapons of the mind. Some discover that talent under stress or during adventure, while others train with psychic adepts until their inner power can cut through both physical and mental defenses.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PSIONIC_POWER, {
        description: [
          "You harbor a wellspring of psionic energy within yourself. It is represented by your Psionic Energy Dice, which fuel certain powers you have from this subclass.",
          "The Soulknife Energy Dice table shows the die size and number of these dice you have when you reach certain Rogue levels: level 3, four <strong>d6s</strong>; level 5, six <strong>d8s</strong>; level 9, eight <strong>d8s</strong>; level 11, eight <strong>d10s</strong>; level 13, ten <strong>d10s</strong>; level 17, twelve <strong>d12s</strong>.",
          "Any features in this subclass that use a Psionic Energy Die use only the dice from this subclass. Some of your powers expend a Psionic Energy Die as specified in a power's description, and you can't use a power if it requires you to use a die when all your Psionic Energy Dice are expended.",
          "You regain one of your expended Psionic Energy Dice when you finish a <link:short-rest>Short Rest</link>, and you regain all of them when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Psi-Bolstered Knack.</strong> If you fail an ability check using a skill or tool with which you have proficiency, you can roll one Psionic Energy Die and add the number rolled to the check, potentially turning failure into success. The die is expended only if the roll then succeeds. (Remove the Psionic die manually)",
          "<strong>Psychic Whispers.</strong> As a Magic action, choose one or more creatures you can see, up to a number of creatures equal to your <link:Proficiency Bonus>Proficiency Bonus</link>, and then roll one Psionic Energy Die.",
          "For a number of hours equal to the number rolled, the chosen creatures can speak telepathically with you, and you can speak telepathically with them as long as you and the other creature are within 1 mile of each other.",
          "The first time you use Psychic Whispers after each <link:long-rest>Long Rest</link>, you don't expend the Psionic Energy Die. All other times you use the power, you expend the die."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PSYCHIC_BLADES, {
        description: [
          "You can manifest shimmering blades of <link:Psychic>Psychic</link> energy.",
          "Whenever you take the Attack action or make an Opportunity Attack, you can manifest a Psychic Blade in your free hand and make the attack with that blade.",
          "The blade is a Simple Melee weapon that deals <strong>1d6</strong> Psychic damage and has the <link:Finesse>Finesse</link> and <link:Thrown>Thrown</link> (60/120 ft.) properties.",
          "It also has Mastery: Vex, which you can use, and it doesn't count against the number of properties you can use with Weapon Mastery.",
          "The blade vanishes immediately after it hits or misses its target, and it leaves no mark if it deals damage.",
          "After you attack with the blade on your turn, you can make a melee or ranged attack with a second psychic blade as a Bonus Action on the same turn if your other hand is free to create it. The damage die of this bonus attack is <strong>1d4</strong> instead of <strong>1d6</strong>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_9, CLASS_FEATURE.SOUL_BLADES, {
        description: [
          "You can now use the following powers with your Psychic Blades.",
          "<strong>Homing Strikes.</strong> If you make an attack roll with your Psychic Blade and miss the target, you can roll one Psionic Energy Die and add the number rolled to the attack roll. If this causes the attack to hit, the die is expended.",
          "<strong>Psychic Teleportation.</strong> As a Bonus Action, you manifest a Psychic Blade, expend one Psionic Energy Die and roll it, and throw the blade at an unoccupied space you can see up to a number of feet away equal to 10 times the number rolled. You then teleport to that space, and the blade vanishes."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_13, CLASS_FEATURE.PSYCHIC_VEIL, {
        description: [
          "As a Magic action, you gain the <link:Invisible>Invisible</link> condition for 1 hour or until you dismiss this effect, no action required.",
          "This invisibility ends early immediately after you deal damage to a creature or force a creature to make a saving throw.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.REND_MIND, {
        description: [
          "When you use your Psychic Blades to deal Sneak Attack damage to a creature, you can force that target to make a <link:Wisdom Saving Throw>Wisdom saving throw</link> (DC 8 plus your <link:DEX>Dexterity</link> modifier and <link:Proficiency Bonus>Proficiency Bonus</link>).",
          "If the save fails, the target has the <link:Stunned>Stunned</link> condition for 1 minute.",
          "The Stunned target repeats the save at the end of each of its turns, ending the effect on itself on a success.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link> unless you expend one Psionic Energy Die, no action required, to restore your use of it."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "rogue-thief",
    name: "Thief",
    className: "Rogue",
    tagline: "Hunt for Treasure as a Classic Adventurer",
    summary:
      "Thieves are classic adventurers: burglars, treasure hunters, and explorers who thrive on agility, stealth, and daring expeditions. Their talents help them delve into dangerous places and get the most out of the treasures and magic items they uncover.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.FAST_HANDS, {
        description: [
          "As a Bonus Action, you can do one of the following.",
          "<strong>Sleight of Hand.</strong> Make a Dexterity (<link:Sleight of Hand>Sleight of Hand</link>) check to pick a lock or disarm a trap with Thieves' Tools or to pick a pocket.",
          "<strong>Use an Object.</strong> Take the Utilize action, or take the Magic action to use a magic item that requires that action."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SECOND_STORY_WORK, {
        description: [
          "You've trained to get into especially hard-to-reach places, granting you these benefits.",
          "<strong>Climber.</strong> You gain a Climb Speed equal to your <link:Speed>Speed</link>.",
          "<strong>Jumper.</strong> You can determine your jump distance using your <link:DEX>Dexterity</link> rather than your <link:STR>Strength</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_9, CLASS_FEATURE.SUPREME_SNEAK, {
        description: [
          "You gain the following Cunning Strike option.",
          "<strong>Stealth Attack (Cost: 1d6).</strong> If you have the Hide action's <link:Invisible>Invisible</link> condition, this attack doesn't end that condition on you if you end the turn behind Three-Quarters Cover or Total Cover."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_13, CLASS_FEATURE.USE_MAGIC_DEVICE, {
        description: [
          "You've learned how to maximize use of magic items, granting you the following benefits.",
          "<strong>Attunement.</strong> You can attune to up to four magic items at once.",
          "<strong>Charges.</strong> Whenever you use a magic item property that expends charges, roll <strong>1d6</strong>. On a roll of 6, you use the property without expending the charges.",
          "<strong>Scrolls.</strong> You can use any Spell Scroll, using <link:INT>Intelligence</link> as your spellcasting ability for the spell.",
          "If the spell is a cantrip or a level 1 spell, you can cast it reliably. If the scroll contains a higher-level spell, you must first succeed on an <link:INT>Intelligence</link> (<link:Arcana>Arcana</link>) check (DC 10 plus the spell's level). On a successful check, you cast the spell from the scroll. On a failed check, the scroll disintegrates."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The Charges and Scrolls part of this class feature are not being tracked. You have to remember them during play."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.THIEFS_REFLEXES, {
        description: [
          "You are adept at laying ambushes and quickly escaping danger.",
          "You can take two turns during the first round of any combat. You take your first turn at your normal <link:Initiative>Initiative</link> and your second turn at your Initiative minus 10."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    // RHW reference: https://5e.tools/classes.html#rogue_xphb,state:sub_phantom_rhw=b1
    id: "rogue-phantom",
    name: "Phantom",
    className: "Rogue",
    tagline: "Borrow Power from Departed Souls",
    summary:
      "Phantoms move between the worlds of the living and the dead. They gather knowledge from spirits, wield deathly energy, and pass through obstacles like ghosts.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.WAILS_FROM_THE_GRAVE,
        {
          description: [
            "Immediately after dealing Sneak Attack damage on your turn, choose a second creature you can see within 30 feet of the first. Roll half your Sneak Attack dice, rounded up; the second creature takes that much Necrotic damage.",
            "You have uses equal to your <link:Dexterity>Dexterity</link> modifier, with a minimum of one. Recover all uses after a <link:long-rest>Long Rest</link>."
          ],
          trackingState: TRACKER.NOT_TRACKED
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.WHISPERS_OF_THE_DEAD,
        {
          description: [
            "After finishing a Short or <link:long-rest>Long Rest</link>, choose a skill or tool proficiency you do not have and gain it. Choosing a different proficiency with this feature replaces the previous one."
          ],
          trackingState: TRACKER.NOT_TRACKED
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_9,
        CLASS_FEATURE.TOKENS_OF_THE_DEPARTED,
        {
          description: [
            "Gain two soul trinkets. Each is a Tiny object whose appearance is chosen by the DM or rolled on the Trinkets table. A trinket more than 30 feet from you immediately teleports onto your person.",
            "<strong>Death's Knell.</strong> When you deal Sneak Attack damage on your turn, destroy one trinket to immediately use Wails from the Grave without spending a use.",
            "<strong>Life Essence.</strong> Having at least one soul trinket gives you <link:Advantage>Advantage</link> on Death Saving Throws and <link:Constitution>Constitution</link> saving throws.",
            "<strong>Spirit Query.</strong> As a Magic action, destroy a trinket and cast <spell:Augury>Augury</spell> without components, using <link:Constitution>Constitution</link> for spellcasting. If you know the creature associated with the trinket, you may instead ask its spirit one question. It appears and answers concisely in a language it knew in life.",
            "<strong>Gaining Trinkets.</strong> When a creature you can see within 30 feet dies, you may use a Reaction to create a trinket on your person from its spirit. Your maximum is two trinkets, increasing to three at Rogue level 13 and four at level 17. Creating one at your maximum destroys and replaces an existing trinket.",
            "After a <link:long-rest>Long Rest</link>, if you have fewer than two soul trinkets, gain enough to bring your total to two."
          ],
          trackingState: TRACKER.NOT_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_9, CLASS_FEATURE.VOICE_OF_DEATH, {
        description: [
          "Cast <spell:Speak with Dead>Speak with Dead</spell> once without a slot or components, using <link:Dexterity>Dexterity</link> for spellcasting. Recover this casting after a Short or <link:long-rest>Long Rest</link>.",
          "When casting the spell, you may target a soul trinket instead of a corpse, speaking with the spirit associated with it."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_13, CLASS_FEATURE.GHOST_WALK, {
        description: [
          "Use a Bonus Action to become spectral for 10 minutes; you can end the form without an action. Recover the use after a <link:long-rest>Long Rest</link>, or destroy a soul trinket without an action to restore it.",
          "<strong>Flight.</strong> Gain a Fly Speed of 10 feet and the ability to hover.",
          "<strong>Hazy Form.</strong> Attack rolls against you have <link:Disadvantage>Disadvantage</link>.",
          "<strong>Incorporeal Movement.</strong> Move through creatures and objects as Difficult Terrain. Ending your turn inside one deals <strong>1d10</strong> Force damage to you."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.DEATHS_FRIEND, {
        description: [
          "<strong>Death's Lament.</strong> Wails from the Grave can deal its Necrotic damage to both the original creature and the second target.",
          "<strong>Draw of Death.</strong> When you roll <link:Initiative>Initiative</link> with no soul trinkets, gain one."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  }
];
