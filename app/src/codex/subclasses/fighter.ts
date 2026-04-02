import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_7: 7,
  LEVEL_10: 10,
  LEVEL_15: 15,
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

const notTracked = { trackingState: TRACKER.NOT_TRACKED } as const;

export const fighterSubclassEntries: SubclassEntry[] = [
  {
    id: "fighter-banneret",
    name: "Banneret",
    className: "Fighter",
    tagline: "Rally Fellow Heroes with Inspiring Leadership",
    summary:
      "Bannerets are paragons of valor and leadership who protect the innocent and rally fellow adventurers to the causes of justice and freedom. Many are knights serving in Cormyr, the Silver Marches, Damara, Chessenta, or other lands across Faerun. They wander the realms as knights errant, taking the fight against evil beyond their kingdom's borders. A lone Banneret is a skilled warrior, but when leading a band of allies one of these warriors can transform even a poorly equipped militia into a ferocious war band.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.KNIGHTLY_ENVOY, {
        description: [
          "You know how to conduct yourself with grace as a noble ambassador. You gain the following benefits.",
          "<strong>Comprehension.</strong> You can cast <spell:Comprehend Languages>Comprehend Languages</spell> but only as a Ritual. <link:CHA>Charisma</link> is your spellcasting ability for it.",
          "<strong>Polyglot.</strong> You learn one language from the language tables in the Player's Handbook or chapter 2 of this book. When you finish a <link:long-rest>Long Rest</link>, you can replace a language learned from this benefit with another language you have heard, seen signed, or read in the past 24 hours.",
          "<strong>Well Spoken.</strong> You gain proficiency in one of the following skills of your choice: <link:Insight>Insight</link>, <link:Intimidation>Intimidation</link>, <link:Persuasion>Persuasion</link>, or <link:Performance>Performance</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.GROUP_RECOVERY, {
        description: [
          "When you use your Second Wind to regain Hit Points, you can choose a number of allies within a 30-foot <link:Emanation>Emanation</link> originating from yourself, up to a number of allies equal to your <link:CHA>Charisma</link> modifier (minimum of one).",
          "Each of those allies regains Hit Points equal to 1d4 plus your Fighter level.",
          "Once you use this ability, you can't use it again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.TEAM_TACTICS, {
        description: [
          "When you use Group Recovery, each chosen ally has <link:Advantage>Advantage</link> on D20 Tests until the start of your next turn."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.RALLYING_SURGE, {
        description: [
          "When you use your Action Surge, you can choose allies within a 30-foot <link:Emanation>Emanation</link> originating from yourself, up to a number of allies equal to your <link:CHA>Charisma</link> modifier (minimum of one).",
          "Each of those allies can immediately take a Reaction to use one of the following options.",
          "<strong>Attack.</strong> The ally makes one attack with a weapon or an Unarmed Strike.",
          "<strong>Move.</strong> The ally moves up to half its <link:Speed>Speed</link> without provoking an Opportunity Attack."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.SHARED_RESILIENCE, {
        description: [
          "When an ally you can see within 60 feet of yourself fails a saving throw, you can take a Reaction to expend a use of your Indomitable feature.",
          "The ally can immediately reroll the saving throw with a bonus equal to your Fighter level.",
          "The ally must use the new roll."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_18,
        CLASS_FEATURE.INSPIRING_COMMANDER,
        {
          description: [
            "You gain the following benefits.",
            "<strong>Bolstered Rally.</strong> The area of effect for both Group Recovery and Rallying Surge is now a 60-foot <link:Emanation>Emanation</link>.",
            "<strong>Unshakable Bravery.</strong> You have <link:Immunity>Immunity</link> to the <link:Charmed>Charmed</link> and <link:Frightened>Frightened</link> conditions."
          ],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "fighter-battle-master",
    name: "Battle Master",
    className: "Fighter",
    tagline: "Master Sophisticated Battle Maneuvers",
    summary:
      "Battle Masters are students of the art of battle, learning martial techniques passed down through generations. The most accomplished Battle Masters are well-rounded figures who combine their carefully honed combat skills with academic study in the fields of history, theory, and the arts.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.COMBAT_SUPERIORITY, {
        description: [
          "Your experience on the battlefield has refined your fighting techniques. You learn maneuvers that are fueled by special dice called Superiority Dice.",
          "<strong>Maneuvers.</strong> You learn three maneuvers of your choice from the Maneuver Options feature. Many maneuvers enhance an attack in some way, and you can use only one maneuver per attack.",
          "You learn two additional maneuvers of your choice when you reach Fighter levels 7, 10, and 15. Each time you learn new maneuvers, you can also replace one maneuver you know with a different one.",
          "<strong>Superiority Dice.</strong> You have four Superiority Dice, which are d8s. A Superiority Die is expended when you use it, and you regain all expended Superiority Dice when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
          "You gain an additional Superiority Die when you reach Fighter level 7 (five dice total) and 15 (six dice total).",
          "<strong>Saving Throws.</strong> If a maneuver requires a saving throw, the DC equals 8 plus your <link:STR>Strength</link> or <link:DEX>Dexterity</link> modifier (your choice) and <link:Proficiency Bonus>Proficiency Bonus</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.STUDENT_OF_WAR, {
        description: [
          "You gain proficiency with one type of Artisan's Tools of your choice, and you gain proficiency in one skill of your choice from the skills available to Fighters at level 1."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.MANEUVER_OPTIONS, {
        description: [
          "The maneuvers are presented here in alphabetical order.",
          "<strong>Ambush.</strong> When you make a Dexterity (<link:Stealth>Stealth</link>) check or an <link:Initiative>Initiative</link> roll, you can expend one Superiority Die and add the die to the roll, unless you have the <link:Incapacitated>Incapacitated</link> condition.",
          "<strong>Bait and Switch.</strong> When you're within 5 feet of a creature on your turn, you can expend one Superiority Die and switch places with that creature, provided you spend at least 5 feet of movement and the creature is willing and doesn't have the <link:Incapacitated>Incapacitated</link> condition. This movement doesn't provoke Opportunity Attacks.",
          "Roll the Superiority Die. Until the start of your next turn, you or the other creature (your choice) gains a bonus to <link:Armor Class>AC</link> equal to the number rolled.",
          "<strong>Commander's Strike.</strong> When you take the Attack action on your turn, you can replace one of your attacks to direct one of your companions to strike. When you do so, choose a willing creature who can see or hear you and expend one Superiority Die. That creature can immediately use its Reaction to make one attack with a weapon or an Unarmed Strike, adding the Superiority Die to the attack's damage roll on a hit.",
          "<strong>Commanding Presence.</strong> When you make a Charisma (<link:Intimidation>Intimidation</link>, <link:Performance>Performance</link>, or <link:Persuasion>Persuasion</link>) check, you can expend one Superiority Die and add that die to the roll.",
          "<strong>Disarming Attack.</strong> When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to disarm the target. Add the Superiority Die roll to the attack's damage roll. The target must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or drop one object of your choice that it's holding, with the object landing in its space.",
          "<strong>Distracting Strike.</strong> When you hit a creature with an attack roll, you can expend one Superiority Die to distract the target. Add the Superiority Die roll to the attack's damage roll. The next attack roll against the target by an attacker other than you has <link:Advantage>Advantage</link> if the attack is made before the start of your next turn.",
          "<strong>Evasive Footwork.</strong> As a Bonus Action, you can expend one Superiority Die and take the Disengage action. You also roll the die and add the number rolled to your <link:Armor Class>AC</link> until the start of your next turn.",
          "<strong>Feinting Attack.</strong> As a Bonus Action, you can expend one Superiority Die to feint, choosing one creature within 5 feet of yourself as your target. You have <link:Advantage>Advantage</link> on your next attack roll against that target this turn. If that attack hits, add the Superiority Die to the attack's damage roll.",
          "<strong>Goading Attack.</strong> When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to goad the target into attacking you. Add the Superiority Die to the attack's damage roll. The target must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> or have <link:Disadvantage>Disadvantage</link> on attack rolls against targets other than you until the end of your next turn.",
          "<strong>Lunging Attack.</strong> As a Bonus Action, you can expend one Superiority Die and take the Dash action. If you move at least 5 feet in a straight line immediately before hitting with a melee attack as part of the Attack action on this turn, you can add the Superiority Die to the attack's damage roll.",
          "<strong>Maneuvering Attack.</strong> When you hit a creature with an attack roll, you can expend one Superiority Die to maneuver one of your comrades into another position. Add the Superiority Die roll to the attack's damage roll, and choose a willing creature who can see or hear you. That creature can use its Reaction to move up to half its Speed without provoking an Opportunity Attack from the target of your attack.",
          "<strong>Menacing Attack.</strong> When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to frighten the target. Add the Superiority Die to the attack's damage roll. The target must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> or have the <link:Frightened>Frightened</link> condition until the end of your next turn.",
          "<strong>Parry.</strong> When another creature damages you with a melee attack roll, you can take a Reaction and expend one Superiority Die to reduce the damage by the number you roll on your Superiority Die plus your <link:STR>Strength</link> or <link:DEX>Dexterity</link> modifier (your choice).",
          "<strong>Precision Attack.</strong> When you miss with an attack roll, you can expend one Superiority Die, roll that die, and add it to the attack roll, potentially causing the attack to hit.",
          "<strong>Pushing Attack.</strong> When you hit a creature with an attack roll using a weapon or an Unarmed Strike, you can expend one Superiority Die to attempt to drive the target back. Add the Superiority Die to the attack's damage roll. If the target is Large or smaller, it must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or be pushed up to 15 feet directly away from you.",
          "<strong>Rally.</strong> As a Bonus Action, you can expend one Superiority Die to bolster the resolve of a companion. Choose an ally of yours within 30 feet of yourself who can see or hear you. That creature gains <link:Temporary Hit Points>Temporary Hit Points</link> equal to the Superiority Die roll plus half your Fighter level (round down).",
          "<strong>Riposte.</strong> When a creature misses you with a melee attack roll, you can take a Reaction and expend one Superiority Die to make a melee attack roll with a weapon or an Unarmed Strike against the creature. If you hit, add the Superiority Die to the attack's damage.",
          "<strong>Sweeping Attack.</strong> When you hit a creature with a melee attack roll using a weapon or an Unarmed Strike, you can expend one Superiority Die to attempt to damage another creature. Choose another creature within 5 feet of the original target and within your reach. If the original attack roll would hit the second creature, it takes damage equal to the number you roll on your Superiority Die. The damage is of the same type dealt by the original attack.",
          "<strong>Tactical Assessment.</strong> When you make an Intelligence (<link:History>History</link> or <link:Investigation>Investigation</link>) check or a Wisdom (<link:Insight>Insight</link>) check, you can expend one Superiority Die and add that die to the ability check.",
          "<strong>Trip Attack.</strong> When you hit a creature with an attack roll using a weapon or an Unarmed Strike, you can expend one Superiority Die and add the die to the attack's damage roll. If the target is Large or smaller, it must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or have the <link:Prone>Prone</link> condition."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.KNOW_YOUR_ENEMY, {
        description: [
          "As a Bonus Action, you can discern certain strengths and weaknesses of a creature you can see within 30 feet of yourself; you know whether that creature has any <link:Immunities>Immunities</link>, <link:Resistances>Resistances</link>, or <link:Vulnerabilities>Vulnerabilities</link>, and if the creature has any, you know what they are.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore a use of the feature by expending one Superiority Die, no action required."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.IMPROVED_COMBAT_SUPERIORITY,
        {
          description: ["Your Superiority Die becomes a d10."],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.RELENTLESS, {
        description: [
          "Once per turn, when you use a maneuver, you can roll 1d8 and use the number rolled instead of expending a Superiority Die."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_18,
        CLASS_FEATURE.ULTIMATE_COMBAT_SUPERIORITY,
        {
          description: ["Your Superiority Die becomes a d12."],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "fighter-champion",
    name: "Champion",
    className: "Fighter",
    tagline: "Pursue Physical Excellence in Combat",
    summary:
      "A Champion focuses on the development of martial prowess in a relentless pursuit of victory. Champions combine rigorous training with physical excellence to deal devastating blows, withstand peril, and garner glory. Whether in athletic contests or bloody battle, Champions strive for the crown of the victor.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.IMPROVED_CRITICAL, {
        description: [
          "Your attack rolls with weapons and Unarmed Strikes can score a Critical Hit on a roll of 19 or 20 on the d20."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.REMARKABLE_ATHLETE, {
        description: [
          "Thanks to your athleticism, you have <link:Advantage>Advantage</link> on <link:Initiative>Initiative</link> rolls and Strength (<link:Athletics>Athletics</link>) checks.",
          "In addition, immediately after you score a Critical Hit, you can move up to half your <link:Speed>Speed</link> without provoking Opportunity Attacks."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_7,
        CLASS_FEATURE.ADDITIONAL_FIGHTING_STYLE,
        {
          description: ["You gain another Fighting Style feat of your choice."],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.HEROIC_WARRIOR, {
        description: [
          "The thrill of battle drives you toward victory. During combat, you can give yourself Heroic Inspiration whenever you start your turn without it."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.SUPERIOR_CRITICAL, {
        description: [
          "Your attack rolls with weapons and Unarmed Strikes can now score a Critical Hit on a roll of 18-20 on the d20."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.SURVIVOR, {
        description: [
          "You attain the pinnacle of resilience in battle, giving you these benefits.",
          "<strong>Defy Death.</strong> You have <link:Advantage>Advantage</link> on Death Saving Throws. Moreover, when you roll 18-20 on a Death Saving Throw, you gain the benefit of rolling a 20 on it.",
          "<strong>Heroic Rally.</strong> At the start of each of your turns, you regain Hit Points equal to 5 plus your <link:CON>Constitution</link> modifier if you are Bloodied and have at least 1 Hit Point."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "fighter-eldritch-knight",
    name: "Eldritch Knight",
    className: "Fighter",
    tagline: "Support Combat Skills with Arcane Magic",
    summary:
      "Eldritch Knights combine the martial mastery common to all Fighters with a careful study of magic. Their spells both complement and extend their combat skills, providing additional protection to shore up their armor and also allowing them to engage many foes at once with explosive magic.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SPELLCASTING, {
        description: [
          "You have learned to cast spells. The information below details how you use spellcasting as an Eldritch Knight.",
          "<strong>Cantrips.</strong> You know two cantrips of your choice from the Wizard spell list. <spell:Ray of Frost>Ray of Frost</spell> and <spell:Shocking Grasp>Shocking Grasp</spell> are recommended. Whenever you gain a Fighter level, you can replace one of these cantrips with another cantrip of your choice from the Wizard spell list.",
          "When you reach Fighter level 10, you learn another Wizard cantrip of your choice.",
          "<strong>Spell Slots.</strong> The Eldritch Knight Spellcasting table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose three level 1 spells from the Wizard spell list. <spell:Burning Hands>Burning Hands</spell>, <spell:Jump>Jump</spell>, and <spell:Shield>Shield</spell> are recommended.",
          "The number of spells on your list increases as you gain Fighter levels, as shown in the Prepared Spells column of the Eldritch Knight Spellcasting table. Whenever that number increases, choose additional spells from the Wizard spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots.",
          "<strong>Changing your Prepared Spells.</strong> Whenever you gain a Fighter level, you can replace one spell on your list with another Wizard spell for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> <link:INT>Intelligence</link> is your spellcasting ability for your Wizard spells.",
          "<strong>Spellcasting Focus.</strong> You can use an <link:Arcane Focus>Arcane Focus</link> as a Spellcasting Focus for your Wizard spells."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WAR_BOND, {
        description: [
          "You learn a ritual that creates a magical bond between yourself and one weapon. You perform the ritual over the course of 1 hour, which can be done during a <link:short-rest>Short Rest</link>. The weapon must be within your reach throughout the ritual, at the conclusion of which you touch the weapon and forge the bond.",
          "The bond fails if another Fighter is bonded to the weapon or if the weapon is a magic item to which someone else is attuned.",
          "Once you have bonded a weapon to yourself, you can't be disarmed of that weapon unless you have the <link:Incapacitated>Incapacitated</link> condition.",
          "If it is on the same plane of existence, you can summon that weapon as a Bonus Action, causing it to teleport instantly to your hand.",
          "You can have up to two bonded weapons, but you can summon only one at a time with a Bonus Action. If you attempt to bond with a third weapon, you must break the bond with one of the other two."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.WAR_MAGIC, {
        description: [
          "When you take the Attack action on your turn, you can replace one of the attacks with a casting of one of your Wizard cantrips that has a casting time of an action."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.ELDRITCH_STRIKE, {
        description: [
          "You learn how to make your weapon strikes undercut a creature's ability to withstand your spells. When you hit a creature with an attack using a weapon, that creature has <link:Disadvantage>Disadvantage</link> on the next saving throw it makes against a spell you cast before the end of your next turn."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.ARCANE_CHARGE, {
        description: [
          "When you use your Action Surge, you can teleport up to 30 feet to an unoccupied space you can see. You can teleport before or after the additional action."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.IMPROVED_WAR_MAGIC, {
        description: [
          "When you take the Attack action on your turn, you can replace two of the attacks with a casting of one of your level 1 or level 2 Wizard spells that has a casting time of an action."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "fighter-psi-warrior",
    name: "Psi Warrior",
    className: "Fighter",
    tagline: "Augment Physical Might with Psionic Power",
    summary:
      "Psi Warriors awaken the power of their minds to augment their physical might. They harness this psionic power to infuse their weapon strikes, lash out with telekinetic energy, and create barriers of mental force.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PSIONIC_POWER, {
        description: [
          "You harbor a wellspring of psionic energy within yourself. It is represented by your Psionic Energy Dice, which fuel powers you have from this subclass.",
          "The Psi Warrior Energy Dice table shows the die size and number of these dice you have when you reach certain Fighter levels: level 3, four d6s; level 5, six d8s; level 9, eight d8s; level 11, eight d10s; level 13, ten d10s; level 17, twelve d12s.",
          "Any features in this subclass that use a Psionic Energy Die use only the dice from this subclass. Some of your powers expend a Psionic Energy Die as specified in a power's description, and you can't use a power if it requires you to use a die when all your Psionic Energy Dice are expended.",
          "You regain one of your expended Psionic Energy Dice when you finish a <link:short-rest>Short Rest</link>, and you regain all of them when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Protective Field.</strong> When you or another creature you can see within 30 feet of you takes damage, you can take a Reaction to expend one Psionic Energy Die, roll the die, and reduce the damage taken by the number rolled plus your <link:INT>Intelligence</link> modifier (minimum reduction of 1), as you create a momentary shield of telekinetic force.",
          "<strong>Psionic Strike.</strong> Once on each of your turns, immediately after you hit a target within 30 feet of yourself with an attack and deal damage to it with a weapon, you can expend one Psionic Energy Die, roll it, and deal <link:Force>Force</link> damage to the target equal to the number rolled plus your <link:INT>Intelligence</link> modifier.",
          "<strong>Telekinetic Movement.</strong> As a Magic action, choose one target you can see within 30 feet of yourself; the target must be a loose object that is Large or smaller or one willing creature other than you. You transport the target up to 30 feet to an unoccupied space you can see. Alternatively, if the target is a Tiny object, you can transport it to or from your hand.",
          "Once you take that action, you can't do so again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.TELEKINETIC_ADEPT, {
        description: [
          "You have mastered new ways to use your telekinetic abilities, detailed below.",
          "<strong>Psi-Powered Leap.</strong> As a Bonus Action, you gain a Fly Speed equal to twice your <link:Speed>Speed</link> until the end of the current turn. Once you take this Bonus Action, you can't do so again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it.",
          "<strong>Telekinetic Thrust.</strong> When you deal damage to a target with your Psionic Strike, you can force the target to make a <link:Strength Saving Throw>Strength saving throw</link> with a DC equal to 8 plus your <link:INT>Intelligence</link> modifier and <link:Proficiency Bonus>Proficiency Bonus</link>. On a failed save, you can give the target the <link:Prone>Prone</link> condition or transport it up to 10 feet horizontally."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.GUARDED_MIND, {
        description: [
          "You have <link:Resistance>Resistance</link> to <link:Psychic>Psychic</link> damage.",
          "Moreover, if you start your turn with the <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> condition, you can expend a Psionic Energy Die, no action required, and end every effect on yourself giving you those conditions."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.BULWARK_OF_FORCE, {
        description: [
          "You can shield yourself and others with telekinetic force. As a Bonus Action, you can choose creatures, including yourself, within 30 feet of yourself, up to a number of creatures equal to your <link:INT>Intelligence</link> modifier (minimum of one creature).",
          "Each of the chosen creatures has Half Cover for 1 minute or until you have the <link:Incapacitated>Incapacitated</link> condition.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.TELEKINETIC_MASTER, {
        description: [
          "You always have the <spell:Telekinesis>Telekinesis</spell> spell prepared.",
          "With this feature, you can cast it without a spell slot or components, and your spellcasting ability for it is <link:INT>Intelligence</link>.",
          "On each of your turns while you maintain <link:Concentration>Concentration</link> on it, including the turn when you cast it, you can make one attack with a weapon as a Bonus Action.",
          "Once you cast the spell with this feature, you can't do so in this way again until you finish a <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
        ],
        ...notTracked
      })
    ]
  }
];
