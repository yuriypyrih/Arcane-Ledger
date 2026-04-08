export const psiWarriorProtectiveFieldDescription = [
  "When you or another creature you can see within 30 feet of you takes damage, you can take a Reaction to expend one Psionic Energy Die, roll the die, and reduce the damage taken by the number rolled plus your <link:INT>Intelligence</link> modifier (minimum reduction of 1), as you create a momentary shield of telekinetic force."
] as const;

export const psiWarriorPsionicStrikeDescription = [
  "Once on each of your turns, immediately after you hit a target within 30 feet of yourself with an attack and deal damage to it with a weapon, you can expend one Psionic Energy Die, roll it, and deal <link:Force>Force</link> damage to the target equal to the number rolled plus your <link:INT>Intelligence</link> modifier."
] as const;

export const psiWarriorTelekineticMovementDescription = [
  "As a Magic action, choose one target you can see within 30 feet of yourself; the target must be a loose object that is Large or smaller or one willing creature other than you.",
  "You transport the target up to 30 feet to an unoccupied space you can see. Alternatively, if the target is a Tiny object, you can transport it to or from your hand.",
  "Once you take that action, you can't do so again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
] as const;

export const psiWarriorPsiPoweredLeapDescription = [
  "As a Bonus Action, you gain a Fly Speed equal to twice your <link:Speed>Speed</link> until the end of the current turn.",
  "Once you take this Bonus Action, you can't do so again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
] as const;

export const psiWarriorTelekineticThrustDescription = [
  "When you deal damage to a target with your Psionic Strike, you can force the target to make a <link:Strength Saving Throw>Strength saving throw</link> with a DC equal to 8 plus your <link:INT>Intelligence</link> modifier and <link:Proficiency Bonus>Proficiency Bonus</link>. On a failed save, you can give the target the <link:Prone>Prone</link> condition or transport it up to 10 feet horizontally."
] as const;

export const psiWarriorGuardedMindDescription = [
  "You have <link:Resistance>Resistance</link> to <link:Psychic>Psychic</link> damage.",
  "Moreover, if you start your turn with the <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> condition, you can expend a Psionic Energy Die, no action required, and end every effect on yourself giving you those conditions."
] as const;

export const psiWarriorBulwarkOfForceDescription = [
  "You can shield yourself and others with telekinetic force. As a Bonus Action, you can choose creatures, including yourself, within 30 feet of yourself, up to a number of creatures equal to your <link:INT>Intelligence</link> modifier (minimum of one creature).",
  "Each of the chosen creatures has Half Cover for 1 minute or until you have the <link:Incapacitated>Incapacitated</link> condition.",
  "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
] as const;

export const psiWarriorTelekineticMasterDescription = [
  "You always have the <spell:Telekinesis>Telekinesis</spell> spell prepared.",
  "With this feature, you can cast it without a spell slot or components, and your spellcasting ability for it is <link:INT>Intelligence</link>.",
  "On each of your turns while you maintain <link:Concentration>Concentration</link> on it, including the turn when you cast it, you can make one attack with a weapon as a Bonus Action.",
  "Once you cast the spell with this feature, you can't do so in this way again until you finish a <link:long-rest>Long Rest</link> unless you expend a Psionic Energy Die, no action required, to restore your use of it."
] as const;
