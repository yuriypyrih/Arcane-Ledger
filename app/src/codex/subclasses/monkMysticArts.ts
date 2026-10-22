import { mysticArtsSpellcastingProgression } from "../classes/subclassSpellcasting";

// Reference text shares the progression used by the spellcasting runtime.
export const mysticArtsSpellcastingDescription = [
  "<strong>Cantrips.</strong> Learn two Sorcerer cantrips; <spell:Blade Ward>Blade Ward</spell> and <spell:Thunderclap>Thunderclap</spell> are suggested. Learn a third at Monk level 10. Each time you gain a Monk level, you may replace one with a different Sorcerer cantrip.",
  "<strong>Spell Slots.</strong> The progression below gives your slots for level 1+ spells. All expended slots return after a <link:long-rest>Long Rest</link>.",
  "<strong>Prepared Spells.</strong> Initially prepare three level-1 Sorcerer spells; <spell:Jump>Jump</spell>, <spell:Magic Missile>Magic Missile</spell>, and Shield are suggested. When your preparation limit increases, choose more Sorcerer spells to reach the new limit, using only spell levels for which you have slots.",
  "<strong>Changing Spells.</strong> Each time you gain a Monk level, you may replace one prepared spell with another Sorcerer spell for which you have slots.",
  "<strong>Ability and Focus.</strong> Use <link:Wisdom>Wisdom</link> for these spells and an Arcane Focus as your Spellcasting Focus.",
  "<strong>Multiclassing.</strong> If multiple classes give you Spellcasting, count one third of your Monk levels, rounded down, toward available spell slots.",
  "<strong>Warrior of the Mystic Arts Spellcasting.</strong> Each row lists cantrips, prepared spells, and spell slots at levels 1 / 2 / 3 / 4.",
  ...mysticArtsSpellcastingProgression.map(
    ({ level, cantrips, preparedSpells, spellSlots }) =>
      `<strong>Monk level ${level}.</strong> ${cantrips} cantrips; ${preparedSpells} prepared spells; slots: ${spellSlots.join(" / ")}.`
  )
];

export const mysticArtsFocusDescription = [
  "<strong>Slots to Focus.</strong> Without an action, spend a spell slot to regain expended Focus Points equal to its level.",
  "<strong>Focus to Slots.</strong> After a <link:short-rest>Short Rest</link> or when using Uncanny Metabolism, you may spend unexpended Focus Points to recover one expended slot. Only slots of levels 1–4 can be recovered, with the following costs and minimum Monk levels.",
  "<strong>Level 1 slot.</strong> 2 Focus Points; Monk level 6.",
  "<strong>Level 2 slot.</strong> 3 Focus Points; Monk level 7.",
  "<strong>Level 3 slot.</strong> 5 Focus Points; Monk level 13.",
  "<strong>Level 4 slot.</strong> 6 Focus Points; Monk level 19."
];
