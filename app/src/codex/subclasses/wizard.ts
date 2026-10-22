import { createSubclassFeatureRow } from "./featureRow";
import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type { SubclassEntry } from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_6: 6,
  LEVEL_10: 10,
  LEVEL_14: 14
} as const;

function createSchoolSavantDescription(schoolName: string): string[] {
  return [
    `Choose two Wizard spells from the ${schoolName} school, each of which must be no higher than level 2, and add them to your spellbook for free.`,
    `In addition, whenever you gain access to a new level of spell slots in this class, you can add one Wizard spell from the ${schoolName} school to your spellbook for free. The chosen spell must be of a level for which you have spell slots.`
  ];
}

export const wizardSubclassEntries: SubclassEntry[] = [
  {
    id: "wizard-abjurer",
    name: "Abjurer",
    className: "Wizard",
    tagline: "Shield Companions and Banish Foes",
    summary:
      "Your study of magic is focused on spells that block, banish, or protect, ending harmful effects, banishing evil influences, and protecting the weak. Abjurers are sought when baleful spirits require exorcism, when locations must be guarded against magical spying, and when portals to other planes of existence must be closed. Adventuring parties value Abjurers for the protection they provide against a variety of hostile magic and other attacks.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ABJURATION_SAVANT, {
        description: createSchoolSavantDescription("Abjuration"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ARCANE_WARD, {
        description: [
          "You can weave magic around yourself for protection. When you cast an Abjuration spell with a spell slot, you can simultaneously use a strand of the spell's magic to create a magical ward on yourself that lasts until you finish a <link:long-rest>Long Rest</link>.",
          "The ward has a Hit Point maximum equal to twice your Wizard level plus your <link:INT>Intelligence</link> modifier.",
          "Whenever you take damage, the ward takes the damage instead, and if you have any <link:Resistance>Resistances</link> or <link:Vulnerability>Vulnerabilities</link>, apply them before reducing the ward's Hit Points.",
          "If the damage reduces the ward to 0 Hit Points, you take any remaining damage.",
          "While the ward has 0 Hit Points, it can't absorb damage, but its magic remains.",
          "Whenever you cast an Abjuration spell with a spell slot, the ward regains a number of Hit Points equal to twice the level of the spell slot.",
          "Alternatively, as a Bonus Action, you can expend a spell slot, and the ward regains a number of Hit Points equal to twice the level of the spell slot expended.",
          "Once you create the ward, you can't create it again until you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.PROJECTED_WARD, {
        description: [
          "When a creature that you can see within 30 feet of yourself takes damage, you can take a Reaction to cause your Arcane Ward to absorb that damage.",
          "If this damage reduces the ward to 0 Hit Points, the warded creature takes any remaining damage.",
          "If that creature has any <link:Resistance>Resistances</link> or <link:Vulnerability>Vulnerabilities</link>, apply them before reducing the ward's Hit Points."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.SPELL_BREAKER, {
        description: [
          "You always have the <spell:Counterspell>Counterspell</spell> and <spell:Dispel Magic>Dispel Magic</spell> spells prepared.",
          "In addition, you can cast <spell:Dispel Magic>Dispel Magic</spell> as a Bonus Action, and you can add your <link:Proficiency Bonus>Proficiency Bonus</link> to its ability check.",
          "When you cast either spell with a spell slot, that slot isn't expended if the spell fails to stop a spell."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.SPELL_RESISTANCE, {
        description: [
          "You have <link:Advantage>Advantage</link> on saving throws against spells, and you have <link:Resistance>Resistance</link> to the damage of spells."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "wizard-bladesinger",
    name: "Bladesinger",
    className: "Wizard",
    tagline: "Wield Weapon and Wizardry in Elegant Tandem",
    summary:
      "Bladesingers master a tradition of wizardry that incorporates swordplay and dance. In combat, a Bladesinger uses intricate, elegant maneuvers that fend off harm and allow the Bladesinger to channel magic into devastating attacks and a cunning defense. Many who have observed a Bladesinger at work remember the display as one of the more beautiful experiences in their life, a glorious dance accompanied by a singing blade.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.BLADESONG, {
        description: [
          "As a Bonus Action, you invoke an elven magic called the Bladesong, provided you aren't wearing armor or using a <link:Shield>Shield</link>.",
          "The Bladesong lasts for 1 minute and ends early if you have the <link:Incapacitated>Incapacitated</link> condition, if you don armor or a <link:Shield>Shield</link>, or if you use two hands to make an attack with a weapon.",
          "You can dismiss the Bladesong at any time (no action required).",
          "While the Bladesong is active, you gain the following benefits.",
          "You can invoke the Bladesong a number of times equal to your <link:INT>Intelligence</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "You regain one expended use when you use Arcane Recovery.",
          "<strong>Agility.</strong> You gain a bonus to your <link:Armor Class>AC</link> equal to your <link:INT>Intelligence</link> modifier (minimum of +1), and your <link:Speed>Speed</link> increases by 10 feet.",
          "In addition, you have <link:Advantage>Advantage</link> on Dexterity (<link:Acrobatics>Acrobatics</link>) checks.",
          "<strong>Bladework.</strong> Whenever you attack with a weapon with which you have proficiency, you can use your <link:INT>Intelligence</link> modifier for the attack and damage rolls instead of using Strength or Dexterity.",
          "<strong>Focus.</strong> When you make a <link:Constitution Saving Throw>Constitution saving throw</link> to maintain <link:Concentration>Concentration</link>, you can add your <link:INT>Intelligence</link> modifier to the total."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TRAINING_IN_WAR_AND_SONG,
        {
          description: [
            "You gain proficiency with all Melee <link:Martial weapons>Martial weapons</link> that don't have the <link:Two-Handed>Two-Handed</link> or <link:Heavy>Heavy</link> property.",
            "You can use a Melee weapon with which you have proficiency as a Spellcasting Focus for your Wizard spells.",
            "You also gain proficiency in one of the following skills of your choice: <link:Acrobatics>Acrobatics</link>, <link:Athletics>Athletics</link>, <link:Performance>Performance</link>, or <link:Persuasion>Persuasion</link>."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.EXTRA_ATTACK, {
        description: [
          "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
          "Moreover, you can cast one of your Wizard cantrips that has a casting time of an action in place of one of those attacks."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.SONG_OF_DEFENSE, {
        description: [
          "When you take damage while your Bladesong is active, you can take a Reaction to expend one spell slot and reduce the damage taken by an amount equal to five times the spell slot's level."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.SONG_OF_VICTORY, {
        description: [
          "After you cast a spell that has a casting time of an action, you can make one attack with a weapon as a Bonus Action."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "wizard-diviner",
    name: "Diviner",
    className: "Wizard",
    tagline: "Learn the Secrets of the Multiverse",
    summary:
      "The counsel of a Diviner is sought by those who want a clearer understanding of the past, present, and future. As a Diviner, you strive to part the veils of space, time, and consciousness. You work to master spells of discernment, remote viewing, supernatural knowledge, and foresight.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DIVINATION_SAVANT, {
        description: createSchoolSavantDescription("Divination"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PORTENT, {
        description: [
          "Glimpses of the future begin to press on your awareness.",
          "Whenever you finish a <link:long-rest>Long Rest</link>, roll two <strong>d20s</strong> and record the numbers rolled.",
          "You can replace any <strong>D20</strong> Test made by you or a creature that you can see with one of these foretelling rolls.",
          "You must choose to do so before the roll, and you can replace a roll in this way only once per turn.",
          "Each foretelling roll can be used only once.",
          "When you finish a <link:long-rest>Long Rest</link>, you lose any unused foretelling rolls."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.EXPERT_DIVINATION, {
        description: [
          "Casting Divination spells comes so easily to you that it expends only a fraction of your spellcasting efforts.",
          "When you cast a Divination spell using a level 2+ spell slot, you regain one expended spell slot.",
          "The slot you regain must be of a level lower than the slot you expended and can't be higher than level 5.",
          "(You have to manually add the lower spell slot)."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.THE_THIRD_EYE, {
        description: [
          "You can increase your powers of perception.",
          "As a Bonus Action, choose one of the following benefits, which lasts until you start a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
          "You can't use this feature again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
          "<strong>Darkvision.</strong> You gain <link:Darkvision>Darkvision</link> with a range of 120 feet.",
          "<strong>Greater Comprehension.</strong> You can read any language.",
          "<strong>See Invisibility.</strong> You can cast <spell:See Invisibility>See Invisibility</spell> without expending a spell slot. (Not Tracked)"
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.GREATER_PORTENT, {
        description: [
          "The visions in your dreams intensify and paint a more accurate picture in your mind of what is to come.",
          "Roll three <strong>d20s</strong> for your Portent feature rather than two."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "wizard-evoker",
    name: "Evoker",
    className: "Wizard",
    tagline: "Create Explosive Elemental Effects",
    summary:
      "Your studies focus on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Some Evokers find employment in military forces, serving as artillery to blast armies from afar. Others use their power to protect others, while some seek their own gain.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.EVOCATION_SAVANT, {
        description: createSchoolSavantDescription("Evocation"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.POTENT_CANTRIP, {
        description: [
          "Your damaging cantrips affect even creatures that avoid the brunt of the effect.",
          "When you cast a cantrip at a creature and you miss with the attack roll or the target succeeds on a saving throw against the cantrip, the target takes half the cantrip's damage (if any) but suffers no additional effect from the cantrip."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.SCULPT_SPELLS, {
        description: [
          "You can create pockets of relative safety within the effects of your evocations.",
          "When you cast an Evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 plus the spell's level.",
          "The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.EMPOWERED_EVOCATION,
        {
          description: [
            "Whenever you cast a Wizard spell from the Evocation school, you can add your <link:INT>Intelligence</link> modifier to one damage roll of that spell."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.OVERCHANNEL, {
        description: [
          "You can increase the power of your spells.",
          "When you cast a Wizard spell with a spell slot of levels 1-5 that deals damage, you can deal maximum damage with that spell on the turn you cast it.",
          "The first time you do so, you suffer no adverse effect.",
          "If you use this feature again before you finish a <link:long-rest>Long Rest</link>, you take <strong>2d12</strong> <link:Necrotic>Necrotic</link> damage for each level of the spell slot immediately after you cast it.",
          "This damage ignores <link:Resistance>Resistance</link> and <link:Immunity>Immunity</link>.",
          "Each time you use this feature again before finishing a <link:long-rest>Long Rest</link>, the Necrotic damage per spell level increases by <strong>1d12</strong>."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "wizard-illusionist",
    name: "Illusionist",
    className: "Wizard",
    tagline: "Weave Subtle Spells of Deception",
    summary:
      "You specialize in magic that dazzles the senses and tricks the mind, and the illusions you craft make the impossible seem real.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ILLUSION_SAVANT, {
        description: createSchoolSavantDescription("Illusion"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.IMPROVED_ILLUSIONS, {
        description: [
          "You can cast Illusion spells without providing <link:v>Verbal</link> components, and if an Illusion spell you cast has a range of 10+ feet, the range increases by 60 feet.",
          "You also know the <spell:Minor Illusion>Minor Illusion</spell> cantrip.",
          "If you already know it, you learn a different Wizard cantrip of your choice.",
          "The cantrip doesn't count against your number of cantrips known.",
          "You can create both a sound and an image with a single casting of <spell:Minor Illusion>Minor Illusion</spell>, and you can cast it as a Bonus Action."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.PHANTASMAL_CREATURES,
        {
          description: [
            "You always have the <spell:Summon Beast>Summon Beast</spell> and <spell:Summon Fey>Summon Fey</spell> spells prepared.",
            "Whenever you cast either spell, you can change its school to Illusion, which causes the summoned creature to appear spectral.",
            "You can cast the Illusion version of each spell without expending a spell slot, but casting it without a slot halves the creature's Hit Points.",
            "Once you cast either spell without a spell slot, you must finish a <link:long-rest>Long Rest</link> before you can cast the spell in that way again."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.ILLUSORY_SELF, {
        description: [
          "When a creature hits you with an attack roll, you can take a Reaction to interpose an illusory duplicate of yourself between the attacker and yourself.",
          "The attack automatically misses you, then the illusion dissipates.",
          "Once you use this feature, you can't use it again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending a level 2+ spell slot (no action required)."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.ILLUSORY_REALITY, {
        description: [
          "You have learned to weave shadow magic into your illusions to give them a semi-reality.",
          "When you cast an Illusion spell with a spell slot, you can choose one inanimate, nonmagical object that is part of the illusion and make that object real.",
          "You can do this on your turn as a Bonus Action while the spell is ongoing.",
          "The object remains real for 1 minute, during which it can't deal damage or give any conditions.",
          "For example, you can create an illusion of a bridge over a chasm and then make it real and cross it."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    // AU reference: https://5e.tools/classes.html#wizard_xphb,state:sub_necromancer_au=b1
    id: "wizard-necromancer",
    name: "Necromancer",
    className: "Wizard",
    tagline: "Study Life, Death, and Undeath",
    summary:
      "Necromancers study the forces that animate living and undead creatures. Secrets recorded in their spellbooks grant them growing influence over death, though their purposes need not be evil.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.NECROMANCY_SAVANT, {
        description: createSchoolSavantDescription("Necromancy"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.NECROMANCY_SPELLBOOK,
        {
          description: [
            "<strong>Necrotic Resistance.</strong> Gain <link:Resistance>Resistance</link> to Necrotic damage.",
            "<strong>Undead Familiar.</strong> Add <spell:Find Familiar>Find Familiar</spell> to your spellbook. When casting it, you may choose a Skeleton or Zombie instead of its normal forms. A normal form can be Undead. During your Attack action, forgo one attack to let the familiar use its Reaction to make an attack.",
            "<strong>Undead Vitality.</strong> When spending a slot to cast a Necromancy spell, you may heal an Undead you can see within 60 feet for Hit Points equal to the slot's level plus your Wizard level."
          ],
          trackingState: TRACKER.SEMI_TRACKED,
          trackingMessage:
            "Adds Find Familiar to your spellbook and grants Necrotic resistance. Undead Vitality optionally restores your own Hit Points when you spend a spell slot. Familiar forms and attacks are managed manually."
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.GRAVE_POWER, {
        description: [
          "While holding your spellbook, gain these benefits.",
          "<strong>Grave Resilience.</strong> Using Arcane Recovery reduces your <link:Exhaustion>Exhaustion</link> by one level, if you have any.",
          "<strong>Overwhelming Necrosis.</strong> Damage from your Wizard spells and features ignores <link:Resistance>Resistance</link> to Necrotic damage."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Arcane Recovery reduces Exhaustion by one level. Overwhelming Necrosis is shown on spells that deal Necrotic damage; apply its resistance bypass manually."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.UNDEAD_THRALLS, {
        description: [
          "<spell:Animate Dead>Animate Dead</spell> is always prepared, and you may cast it once without a slot, recovering that casting after a <link:long-rest>Long Rest</link>. Each time you start casting it, you may increase its effective spell level by 1.",
          "While holding your spellbook, you also gain these benefits.",
          "<strong>Undead Fortitude.</strong> An Undead created or summoned by your Necromancy spell gains current and maximum Hit Points equal to your <link:Intelligence>Intelligence</link> modifier plus half your Wizard level, rounded down.",
          "<strong>Withering Strike.</strong> When an Undead you control within 60 feet hits a creature with an attack roll, add Necrotic damage equal to your <link:Intelligence>Intelligence</link> modifier, minimum 1."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Animate Dead is always prepared and has one optional free casting per Long Rest. The effective spell-level increase, Undead Fortitude, and Withering Strike are managed manually."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.HARVEST_UNDEAD, {
        description: [
          "Immediately after damage makes you Bloodied without reducing you to 0 Hit Points, you may use a Reaction to set a controlled Undead you can see to 0 Hit Points. You then regain Hit Points equal to your Wizard level."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The Reaction is available while Bloodied and above 0 HP and restores HP equal to your Wizard level. Sacrificing the controlled Undead is managed manually."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.DEATHS_MASTER, {
        description: [
          "While holding your spellbook, gain these benefits.",
          "<strong>Bolster Undead.</strong> As a Bonus Action, choose any number of Undead within 60 feet that you created or summoned using a Necromancy spell. Give each <link:Temporary Hit Points>Temporary Hit Points</link> equal to your Wizard level. Recover this Bonus Action after a <link:long-rest>Long Rest</link>.",
          "<strong>Extinguish Undead.</strong> When an Undead you can see falls to 0 Hit Points, you may make it explode. Roll d6s equal to half its unexpended Hit Dice, rounded up, minimum <strong>1d6</strong>. Every creature in a 10-foot <link:Emanation>Emanation</link> from it makes a <link:Dexterity>Dexterity</link> saving throw. Failure: Necrotic damage equal to the roll and no Reactions until its next turn starts. Success: half damage only. If the exploding Undead is not under your control, you must spend a Reaction and a level 5+ spell slot."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Bolster Undead grants Wizard-level temporary HP to all Undead companions once per Long Rest. Extinguish Undead spends a Reaction and a selected level 5+ spell slot; resolve the explosion manually."
      })
    ]
  },
  {
    // AU reference: https://5e.tools/classes.html#wizard_xphb,state:sub_transmuter_au=b1
    id: "wizard-transmuter",
    name: "Transmuter",
    className: "Wizard",
    tagline: "Reshape Matter and Energy",
    summary:
      "Transmuters study how magic alters matter and energy. Their discoveries support inventive experiments, changed forms, and transformations of the world around them.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TRANSMUTATION_SAVANT,
        {
          description: createSchoolSavantDescription("Transmutation"),
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.TRANSMUTERS_STONE, {
        description: [
          "After a <link:long-rest>Long Rest</link>, you may create a Tiny magic stone that lasts until you create another. You can use it as a Wizard Spellcasting Focus. Its bearer gains <link:Constitution>Constitution</link> saving throw proficiency and one benefit chosen when you create it. Casting a Transmutation spell with a slot lets you change the chosen benefit.",
          "<strong>Darkvision.</strong> Give its bearer <link:Darkvision>Darkvision</link> to 60 feet, or extend existing <link:Darkvision>Darkvision</link> by 60 feet.",
          "<strong>Resistance.</strong> Choose Acid, Cold, Fire, Lightning, Poison, or Thunder each time you select this benefit; its bearer resists that damage type.",
          "<strong>Speed.</strong> Increase its bearer's Speed by 10 feet."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WONDROUS_ALTERATION, {
        description: [
          "<spell:Alter Self>Alter Self</spell> is always prepared. Cast it once without a slot, recovering this free casting after a <link:long-rest>Long Rest</link>. While affected, its options grant these additional benefits.",
          "<strong>Aquatic Adaptation.</strong> While underwater, you may Dash as a Bonus Action.",
          "<strong>Change Appearance.</strong> Gain <link:Advantage>Advantage</link> on <link:Charisma>Charisma</link> (Deception) checks.",
          "<strong>Natural Weapons.</strong> The growth deals <strong>2d6</strong> damage of its associated type. Also gain <link:Advantage>Advantage</link> on <link:Constitution>Constitution</link> saving throws to maintain <link:Concentration>Concentration</link>."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Alter Self is always prepared and has one optional free casting per Long Rest. The feature description is shown in its spell drawer; apply the additional transformation benefits manually."
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.EMPOWERED_TRANSMUTATION,
        {
          description: [
            "When spending a slot to cast a Transmutation spell that neither makes an attack roll nor requires a saving throw, such as <spell:Fly>Fly</spell> or <spell:Magic Weapon>Magic Weapon</spell>, you may increase its effective spell level by 1.",
            "Uses equal your <link:Intelligence>Intelligence</link> modifier, minimum one. Recover all uses after a <link:long-rest>Long Rest</link>."
          ],
          trackingState: TRACKER.SEMI_TRACKED,
          trackingMessage:
            "Eligible Transmutation spell drawers show this feature and an optional charge use. Charges equal your Intelligence modifier (minimum one) and recover on a Long Rest. Apply the effective spell-level increase manually."
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.POTENT_STONE, {
        description: [
          "Your Transmuter's Stone can carry up to two benefits. Only <link:Resistance>Resistance</link> may be selected twice, and those selections must use different damage types. Casting a Transmutation spell with a slot lets you change either or both benefits.",
          "Add these options to the stone's existing choices.",
          "<strong>Mighty Build.</strong> Its bearer has <link:Advantage>Advantage</link> on <link:Strength>Strength</link> saving throws and counts as one size larger for carrying capacity.",
          "<strong>Tremorsense.</strong> Its bearer gains <link:Tremorsense>Tremorsense</link> to 30 feet."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.SHAPE_SHIFTER, {
        description: [
          "<spell:Polymorph>Polymorph</spell> is always prepared. Cast it once without a slot, recovering this free casting after a <link:long-rest>Long Rest</link>.",
          "When targeting yourself, you may modify the spell with the benefits below. You can make this modification once per <link:long-rest>Long Rest</link>.",
          "<strong>Game Statistics.</strong> Besides what Polymorph normally retains, keep your memories, ability to communicate, <link:Intelligence>Intelligence</link>, <link:Wisdom>Wisdom</link>, <link:Charisma>Charisma</link>, proficiencies, class features, and feats.",
          "<strong>Transmute Spells.</strong> In the new form, you may cast Transmutation spells whose Material components have no specified cost and are not consumed. No other spells can be cast while transformed."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Polymorph is always prepared and has one optional free casting per Long Rest. Its spell drawer includes the full feature description; apply and track the self-transformation modifications manually."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.MASTER_TRANSMUTER, {
        description: [
          "While carrying your Transmuter's Stone, use a Magic action to expend its stored power for one option below. It then crumbles to dust, unless you spend a level 7+ spell slot as part of that action to preserve it.",
          "<strong>Major Transformation.</strong> Transform a nonmagical object that fits a 10-foot Cube or eight connected 5-foot Cubes into another nonmagical object of similar size and mass, worth no more than the original. Handling it for 10 minutes completes the transformation.",
          "<strong>Panacea.</strong> Touch a creature as part of the Magic action. It regains half its maximum Hit Points, rounded down. End all magical contagions and curses affecting it, including Attunement to a cursed item, and remove <link:Poisoned>Poisoned</link> and <link:Petrified>Petrified</link>.",
          "<strong>Restore Life.</strong> Cast <spell:Raise Dead>Raise Dead</spell> without a spell slot, replacing its required Material components with the stone.",
          "<strong>Restore Youth.</strong> Touch a willing creature as part of the Magic action. Remove all its <link:Exhaustion>Exhaustion</link> levels and permanently make it appear <strong>3d10</strong> years younger, but no younger than young adulthood."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  },
  {
    // AU reference: https://5e.tools/classes.html#wizard_xphb,state:sub_enchanter_au=b1
    id: "wizard-enchanter",
    name: "Enchanter",
    className: "Wizard",
    tagline: "Influence Minds and Memories",
    summary:
      "Enchanters use magic to captivate and influence minds. Some seek reconciliation or restraint, while others pursue power through persuasion and control.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ENCHANTING_CONVERSATIONALIST,
        {
          description: [
            "Gain proficiency in Deception, Intimidation, or Persuasion. Add your <link:Intelligence>Intelligence</link> modifier, with a minimum bonus of +1, to ability checks using the chosen skill."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ENCHANTMENT_SAVANT, {
        description: createSchoolSavantDescription("Enchantment"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HYPNOTIC_PRESENCE, {
        description: [
          "As a Magic action, choose a creature you can see within 10 feet that can see or hear you. It makes a <link:Wisdom>Wisdom</link> saving throw against your spell save DC. A failure makes it <link:Charmed>Charmed</link> for 1 minute, with <link:Incapacitated>Incapacitated</link> and Speed 0 while <link:Charmed>Charmed</link> this way. The effect ends early if it moves more than 10 feet from you, can neither see nor hear you, or takes damage.",
          "Uses equal your <link:Intelligence>Intelligence</link> modifier, minimum one. Recover all uses after a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The Magic action tracks uses equal to your Intelligence modifier (minimum one), recovers on a Long Rest, and displays your spell save DC formula for the target's Wisdom save. Resolve the target's saving throw and effects manually."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.SPLIT_ENCHANTMENT, {
        description: [
          "When spending a slot to cast an Enchantment spell that can target an additional creature at a higher slot level, such as <spell:Charm Person>Charm Person</spell>, you may increase the spell's effective level by 1.",
          "Uses equal your <link:Intelligence>Intelligence</link> modifier. Recover all uses after a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Enchantment spell drawers include this feature and an optional charge use when casting with a spell slot. Charges equal your Intelligence modifier and recover on a Long Rest. Apply the additional target and effective spell-level increase manually."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.INSTINCTIVE_CHARM, {
        description: [
          "When a creature you can see within 30 feet hits you with an attack roll, use a Reaction to require a <link:Wisdom>Wisdom</link> saving throw against your spell save DC. A failure makes the attack miss you. If another creature other than the attacker is within the attack's range, redirect the same attack roll to it; choose the new target if several qualify.",
          "Recover this Reaction after a <link:long-rest>Long Rest</link> or by casting an Enchantment spell with a spell slot."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The reaction tracks one charge per Long Rest and displays the Wisdom save DC formula. Resolve the attack and saving throw manually; recovery from casting an Enchantment spell can be applied with the charge controls."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.ALTER_MEMORIES, {
        description: [
          "When you spend a slot to cast an Enchantment spell that causes <link:Charmed>Charmed</link>, choose one target that will remain unaware you <link:Charmed>Charmed</link> it.",
          "Once before that spell ends, you may use a Magic action to require an <link:Intelligence>Intelligence</link> saving throw from the chosen target against your spell save DC. On a failure, erase up to 1 + your <link:Intelligence>Intelligence</link> modifier hours of its memories (minimum capacity 1 hour). You may erase less time, and cannot erase more time than the spell's duration."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The full feature description appears on the catalog's leveled Enchantment spells that impose Charmed. It requires a spell-slot casting; Antipathy/Sympathy qualifies only with Sympathy. Resolve the target, saving throw, and memory changes manually."
      })
    ]
  },
  {
    // AU reference: https://5e.tools/classes.html#wizard_xphb,state:sub_conjurer_au=b1
    id: "wizard-conjurer",
    name: "Conjurer",
    className: "Wizard",
    tagline: "Cross Distances and Summon Allies",
    summary:
      "Conjurers study magic that transports creatures and calls allies into being. Their spells make distance and physical boundaries easier to overcome.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.BENIGN_TRANSPOSITION,
        {
          description: [
            "As a Bonus Action, teleport up to 30 feet to an unoccupied space you can see. Alternatively, choose a space in range occupied by a willing Medium or smaller creature and teleport to swap places.",
            "Uses equal your <link:Intelligence>Intelligence</link> modifier, minimum one; recover all uses after a <link:long-rest>Long Rest</link>."
          ],
          trackingState: TRACKER.SEMI_TRACKED,
          trackingMessage:
            "The Bonus Action tracks uses equal to your Intelligence modifier (minimum one), restored on a Long Rest. Resolve the teleport or exchange of places manually."
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.CONJURATION_SAVANT, {
        description: createSchoolSavantDescription("Conjuration"),
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.DISTANT_TRANSPOSITION,
        {
          description: [
            "Benign Transposition reaches 60 feet. You may also spend a level 3+ spell slot without an action to restore one use."
          ],
          trackingState: TRACKER.SEMI_TRACKED,
          trackingMessage:
            "Adds this description to Benign Transposition and updates its displayed range to 60 feet. Restoring a use with a spell slot is handled manually."
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.DURABLE_SUMMONS, {
        description: [
          "When a Conjuration spell cast with a slot creates or summons a creature, it gains <link:Temporary Hit Points>Temporary Hit Points</link> equal to twice your Wizard level on appearing. While those <link:Temporary Hit Points>Temporary Hit Points</link> remain, it resists all damage types except Force, Necrotic, Psychic, and Radiant."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "Adds this description to summoning Conjuration spells. Casting one with a spell slot grants its newly summoned companions Temporary Hit Points equal to twice your Wizard level and adds the feature to their descriptions. Apply the damage resistances manually while those Temporary Hit Points remain."
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.FOCUSED_CONJURATION,
        {
          description: [
            "Damage cannot end your <link:Concentration>Concentration</link> on a Conjuration spell."
          ],
          trackingState: TRACKER.SEMI_TRACKED,
          trackingMessage:
            "The description of this feature is included in all Conjuration spells that require Concentration. Handle its protection from damage manually."
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.SPLINTERED_SUMMONS, {
        description: [
          "When you spend a slot to cast a Conjuration spell that summons a spirit with statistics in the spell description, such as <spell:Summon Aberration>Summon Aberration</spell>, you may summon two of the same kind instead. They follow the spell's statistics and rules, appear in different unoccupied spaces within range that you choose, and each has half the usual current and maximum Hit Points. Losing <link:Concentration>Concentration</link> dismisses both.",
          "Recover this modification after a <link:long-rest>Long Rest</link>, or spend a level 5+ slot without an action to restore it."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The description of this feature is included in all conjuration summoning spells (including the useage tracking) but you have to incldue the secondary summons yourself when you define them and adjust their hit points. The charge is restored on a Long Rest; restoring it with a spell slot is handled manually."
      })
    ]
  }
];
