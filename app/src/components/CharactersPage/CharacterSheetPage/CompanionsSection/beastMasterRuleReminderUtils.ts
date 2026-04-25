import type { Character } from "../../../../types";
import { isBeastMasterCharacter } from "../../../../pages/CharactersPage/beastMasterCompanions";

export type BeastMasterRuleReminder = {
  title: string;
  text: string;
};

export function getBeastMasterRuleReminders(character: Character): BeastMasterRuleReminder[] {
  if (!isBeastMasterCharacter(character)) {
    return [];
  }

  return [
    {
      title: "Primal Companion",
      text: "The beast acts during your turn. It can move and use its Reaction on its own, but it Dodges unless you command it with a Bonus Action or sacrifice one attack from your Attack action for Beast's Strike."
    },
    ...(character.level >= 7
      ? [
          {
            title: "Exceptional Training",
            text: "When you command the beast with a Bonus Action, it can also use its Bonus Action to Dash, Disengage, Dodge, or Help. Its hits can deal Force damage instead of their normal damage type."
          }
        ]
      : []),
    ...(character.level >= 11
      ? [
          {
            title: "Bestial Fury",
            text: "When commanded to take Beast's Strike, the beast can use it twice. The first time each turn it hits your Hunter's Mark target, it can add the spell's bonus damage as Force damage."
          }
        ]
      : []),
    ...(character.level >= 15
      ? [
          {
            title: "Share Spells",
            text: "When you cast a spell targeting yourself, the beast can also be affected if it is within 30 feet of you."
          }
        ]
      : [])
  ];
}
