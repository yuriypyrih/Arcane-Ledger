import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";
import {
  banneretBolsteredGroupRecoveryDescription,
  banneretBolsteredRallyingSurgeDescription,
  banneretGroupRecoveryDescription,
  banneretRallyingSurgeDescription,
  banneretSharedResilienceDescription,
  banneretTeamTacticsDescription
} from "./fighterBanneret";
import { fighterBattleMasterManeuverOptionsDescription } from "./fighterBattleMaster";
import {
  fighterChampionImprovedCriticalDescription,
  fighterChampionSuperiorCriticalDescription
} from "./fighterChampion";
import {
  psiWarriorBulwarkOfForceDescription,
  psiWarriorGuardedMindDescription,
  psiWarriorProtectiveFieldDescription,
  psiWarriorPsiPoweredLeapDescription,
  psiWarriorPsionicStrikeDescription,
  psiWarriorTelekineticMasterDescription,
  psiWarriorTelekineticThrustDescription,
  psiWarriorTelekineticMovementDescription
} from "./fighterPsiWarrior";

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
        description: [...banneretGroupRecoveryDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.TEAM_TACTICS, {
        description: [...banneretTeamTacticsDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.RALLYING_SURGE, {
        description: [...banneretRallyingSurgeDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.SHARED_RESILIENCE, {
        description: [...banneretSharedResilienceDescription],
        ...notTracked
      }),
      {
        level: SUBCLASS_FEATURE_LEVELS.LEVEL_18,
        classFeatures: [CLASS_FEATURE.INSPIRING_COMMANDER],
        featureOverrides: {
          [CLASS_FEATURE.INSPIRING_COMMANDER]: {
            description: [
              "You gain the following benefits.",
              "<strong>Bolstered Rally.</strong> The area of effect for both Group Recovery and Rallying Surge is now a <strong>60-foot</strong> <link:Emanation>Emanation</link>.",
              "<strong>Unshakable Bravery.</strong> You have <link:Immunity>Immunity</link> to the <link:Charmed>Charmed</link> and <link:Frightened>Frightened</link> conditions."
            ],
            ...notTracked
          },
          [CLASS_FEATURE.GROUP_RECOVERY]: {
            description: [...banneretBolsteredGroupRecoveryDescription],
            ...notTracked
          },
          [CLASS_FEATURE.RALLYING_SURGE]: {
            description: [...banneretBolsteredRallyingSurgeDescription],
            ...notTracked
          }
        }
      }
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
        description: [...fighterBattleMasterManeuverOptionsDescription],
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
        description: [...fighterChampionImprovedCriticalDescription],
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
        description: [...fighterChampionSuperiorCriticalDescription],
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
          `<strong>Protective Field.</strong> ${psiWarriorProtectiveFieldDescription[0]}`,
          `<strong>Psionic Strike.</strong> ${psiWarriorPsionicStrikeDescription[0]}`,
          `<strong>Telekinetic Movement.</strong> ${psiWarriorTelekineticMovementDescription[0]}`,
          ...psiWarriorTelekineticMovementDescription.slice(1)
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.TELEKINETIC_ADEPT, {
        description: [
          "You have mastered new ways to use your telekinetic abilities, detailed below.",
          `<strong>Psi-Powered Leap.</strong> ${psiWarriorPsiPoweredLeapDescription[0]}`,
          ...psiWarriorPsiPoweredLeapDescription.slice(1),
          `<strong>Telekinetic Thrust.</strong> ${psiWarriorTelekineticThrustDescription[0]}`
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.GUARDED_MIND, {
        description: [...psiWarriorGuardedMindDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.BULWARK_OF_FORCE, {
        description: [...psiWarriorBulwarkOfForceDescription],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_18, CLASS_FEATURE.TELEKINETIC_MASTER, {
        description: [...psiWarriorTelekineticMasterDescription],
        ...notTracked
      })
    ]
  }
];
