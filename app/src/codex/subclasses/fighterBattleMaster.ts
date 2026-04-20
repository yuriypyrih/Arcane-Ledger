export type BattleMasterManeuverId =
  | "ambush"
  | "bait-and-switch"
  | "commanders-strike"
  | "commanding-presence"
  | "disarming-attack"
  | "distracting-strike"
  | "evasive-footwork"
  | "feinting-attack"
  | "goading-attack"
  | "lunging-attack"
  | "maneuvering-attack"
  | "menacing-attack"
  | "parry"
  | "precision-attack"
  | "pushing-attack"
  | "rally"
  | "riposte"
  | "sweeping-attack"
  | "tactical-assessment"
  | "trip-attack";

export type BattleMasterManeuverDefinition = {
  id: BattleMasterManeuverId;
  name: string;
  description: string[];
};

export type BattleMasterManeuverReferenceKey = `:${BattleMasterManeuverId}`;

export function getFighterBattleMasterManeuverReferenceKey(
  maneuverId: BattleMasterManeuverId
): BattleMasterManeuverReferenceKey {
  return `:${maneuverId}`;
}

export const fighterBattleMasterCombatSuperiorityManeuversDescription =
  "You learn three maneuvers of your choice from the Maneuver Options feature. Many maneuvers enhance an attack in some way, and you can use only one maneuver per attack.";

export const fighterBattleMasterManeuverDefinitions = [
  {
    id: "ambush",
    name: "Ambush",
    description: [
      "When you make a Dexterity (<link:Stealth>Stealth</link>) check or an <link:Initiative>Initiative</link> roll, you can expend one Superiority Die and add the die to the roll, unless you have the <link:Incapacitated>Incapacitated</link> condition."
    ]
  },
  {
    id: "bait-and-switch",
    name: "Bait and Switch",
    description: [
      "When you're within 5 feet of a creature on your turn, you can expend one Superiority Die and switch places with that creature, provided you spend at least 5 feet of movement and the creature is willing and doesn't have the <link:Incapacitated>Incapacitated</link> condition. This movement doesn't provoke Opportunity Attacks.",
      "Roll the Superiority Die. Until the start of your next turn, you or the other creature (your choice) gains a bonus to <link:Armor Class>AC</link> equal to the number rolled."
    ]
  },
  {
    id: "commanders-strike",
    name: "Commander's Strike",
    description: [
      "When you take the Attack action on your turn, you can replace one of your attacks to direct one of your companions to strike. When you do so, choose a willing creature who can see or hear you and expend one Superiority Die. That creature can immediately use its Reaction to make one attack with a weapon or an Unarmed Strike, adding the Superiority Die to the attack's damage roll on a hit."
    ]
  },
  {
    id: "commanding-presence",
    name: "Commanding Presence",
    description: [
      "When you make a Charisma (<link:Intimidation>Intimidation</link>, <link:Performance>Performance</link>, or <link:Persuasion>Persuasion</link>) check, you can expend one Superiority Die and add that die to the roll."
    ]
  },
  {
    id: "disarming-attack",
    name: "Disarming Attack",
    description: [
      "When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to disarm the target. Add the Superiority Die roll to the attack's damage roll. The target must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or drop one object of your choice that it's holding, with the object landing in its space."
    ]
  },
  {
    id: "distracting-strike",
    name: "Distracting Strike",
    description: [
      "When you hit a creature with an attack roll, you can expend one Superiority Die to distract the target. Add the Superiority Die roll to the attack's damage roll. The next attack roll against the target by an attacker other than you has <link:Advantage>Advantage</link> if the attack is made before the start of your next turn."
    ]
  },
  {
    id: "evasive-footwork",
    name: "Evasive Footwork",
    description: [
      "As a Bonus Action, you can expend one Superiority Die and take the Disengage action. You also roll the die and add the number rolled to your <link:Armor Class>AC</link> until the start of your next turn."
    ]
  },
  {
    id: "feinting-attack",
    name: "Feinting Attack",
    description: [
      "As a Bonus Action, you can expend one Superiority Die to feint, choosing one creature within 5 feet of yourself as your target. You have <link:Advantage>Advantage</link> on your next attack roll against that target this turn. If that attack hits, add the Superiority Die to the attack's damage roll."
    ]
  },
  {
    id: "goading-attack",
    name: "Goading Attack",
    description: [
      "When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to goad the target into attacking you. Add the Superiority Die to the attack's damage roll. The target must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> or have <link:Disadvantage>Disadvantage</link> on attack rolls against targets other than you until the end of your next turn."
    ]
  },
  {
    id: "lunging-attack",
    name: "Lunging Attack",
    description: [
      "As a Bonus Action, you can expend one Superiority Die and take the Dash action. If you move at least 5 feet in a straight line immediately before hitting with a melee attack as part of the Attack action on this turn, you can add the Superiority Die to the attack's damage roll."
    ]
  },
  {
    id: "maneuvering-attack",
    name: "Maneuvering Attack",
    description: [
      "When you hit a creature with an attack roll, you can expend one Superiority Die to maneuver one of your comrades into another position. Add the Superiority Die roll to the attack's damage roll, and choose a willing creature who can see or hear you. That creature can use its Reaction to move up to half its Speed without provoking an Opportunity Attack from the target of your attack."
    ]
  },
  {
    id: "menacing-attack",
    name: "Menacing Attack",
    description: [
      "When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to frighten the target. Add the Superiority Die to the attack's damage roll. The target must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> or have the <link:Frightened>Frightened</link> condition until the end of your next turn."
    ]
  },
  {
    id: "parry",
    name: "Parry",
    description: [
      "When another creature damages you with a melee attack roll, you can take a Reaction and expend one Superiority Die to reduce the damage by the number you roll on your Superiority Die plus your <link:STR>Strength</link> or <link:DEX>Dexterity</link> modifier (your choice)."
    ]
  },
  {
    id: "precision-attack",
    name: "Precision Attack",
    description: [
      "When you miss with an attack roll, you can expend one Superiority Die, roll that die, and add it to the attack roll, potentially causing the attack to hit."
    ]
  },
  {
    id: "pushing-attack",
    name: "Pushing Attack",
    description: [
      "When you hit a creature with an attack roll using a weapon or an Unarmed Strike, you can expend one Superiority Die to attempt to drive the target back. Add the Superiority Die to the attack's damage roll. If the target is Large or smaller, it must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or be pushed up to 15 feet directly away from you."
    ]
  },
  {
    id: "rally",
    name: "Rally",
    description: [
      "As a Bonus Action, you can expend one Superiority Die to bolster the resolve of a companion. Choose an ally of yours within 30 feet of yourself who can see or hear you. That creature gains <link:Temporary Hit Points>Temporary Hit Points</link> equal to the Superiority Die roll plus half your Fighter level (round down)."
    ]
  },
  {
    id: "riposte",
    name: "Riposte",
    description: [
      "When a creature misses you with a melee attack roll, you can take a Reaction and expend one Superiority Die to make a melee attack roll with a weapon or an Unarmed Strike against the creature. If you hit, add the Superiority Die to the attack's damage."
    ]
  },
  {
    id: "sweeping-attack",
    name: "Sweeping Attack",
    description: [
      "When you hit a creature with a melee attack roll using a weapon or an Unarmed Strike, you can expend one Superiority Die to attempt to damage another creature. Choose another creature within 5 feet of the original target and within your reach. If the original attack roll would hit the second creature, it takes damage equal to the number you roll on your Superiority Die. The damage is of the same type dealt by the original attack."
    ]
  },
  {
    id: "tactical-assessment",
    name: "Tactical Assessment",
    description: [
      "When you make an Intelligence (<link:History>History</link> or <link:Investigation>Investigation</link>) check or a Wisdom (<link:Insight>Insight</link>) check, you can expend one Superiority Die and add that die to the ability check."
    ]
  },
  {
    id: "trip-attack",
    name: "Trip Attack",
    description: [
      "When you hit a creature with an attack roll using a weapon or an Unarmed Strike, you can expend one Superiority Die and add the die to the attack's damage roll. If the target is Large or smaller, it must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or have the <link:Prone>Prone</link> condition."
    ]
  }
] as const satisfies readonly BattleMasterManeuverDefinition[];

export const fighterBattleMasterManeuverOptionsIntroDescription = [
  "The maneuvers are presented here in alphabetical order."
];

export const fighterBattleMasterManeuverOptionsDescription = [
  ...fighterBattleMasterManeuverOptionsIntroDescription,
  ...fighterBattleMasterManeuverDefinitions.flatMap((maneuver) => {
    const [firstEntry, ...remainingEntries] = maneuver.description;
    const maneuverReferenceKey = getFighterBattleMasterManeuverReferenceKey(maneuver.id);

    return firstEntry
      ? [
          `<strong><link:${maneuverReferenceKey}>${maneuver.name}</link>.</strong> ${firstEntry}`,
          ...remainingEntries
        ]
      : [];
  })
];

export const fighterBattleMasterManeuverReferenceEntries = fighterBattleMasterManeuverDefinitions.map(
  (maneuver) => ({
    key: getFighterBattleMasterManeuverReferenceKey(maneuver.id),
    title: maneuver.name,
    description: maneuver.description.join("\n\n")
  })
);
