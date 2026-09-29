import { CLASS_FEATURE } from "../entries/enums";
import { clericSubclassEntries } from "./cleric";

// Static reference text only; this module does not grant gameplay benefits.
export const vestigeCompanionStatisticsDescription = [
  "<strong>Vestige Companion — Statistics.</strong> Small Celestial, Fiend, or Undead; Neutral.",
  "<strong>Armor Class.</strong> 13 + your <link:Charisma>Charisma</link> modifier. <strong>Hit Points.</strong> 4 + four times your Warlock level. <strong>Hit Dice.</strong> A number of d6s equal to your Warlock level.",
  "<strong>Movement.</strong> Speed 5 feet; Fly Speed 30 feet, with hover. <strong>Abilities.</strong> STR 1 (−5), DEX 14 (+2), CON 10 (+0), INT 15 (+2), WIS 15 (+2), CHA 16 (+3).",
  "<strong>Resistances.</strong> Fire for a Fiend, Necrotic for an Undead, or Radiant for a Celestial. <strong>Condition Immunities.</strong> <link:Charmed>Charmed</link>, <link:Frightened>Frightened</link>, <link:Prone>Prone</link>.",
  "<strong>Senses and Languages.</strong> <link:Passive Perception>Passive Perception</link> 12. It speaks your known languages. Its <link:Proficiency Bonus>Proficiency Bonus</link> equals yours.",
  "<strong>Pact Bond.</strong> Add your <link:Proficiency Bonus>Proficiency Bonus</link> to every ability check and saving throw the companion makes.",
  "<strong>Vestige's Strike (Action).</strong> Melee or ranged attack using your spell attack modifier; reach 5 feet or range 60 feet. On a hit: <strong>1d6</strong> + 3 + your <link:Charisma>Charisma</link> modifier damage, dealing Fire (Fiend), Necrotic (Undead), or Radiant (Celestial).",
  "<strong>Divine Power (Bonus Action, 1/Day).</strong> The effect depends on its creature type.",
  "<strong>Cursed Invocation — Undead.</strong> Curse a creature you can see within 30 feet of the vestige for 1 minute. Its attack rolls against you and the vestige have <link:Disadvantage>Disadvantage</link>.",
  "<strong>Fiendish Swap — Fiend.</strong> If you and the vestige are within 60 feet of each other, teleport to swap places.",
  "<strong>Healing Touch — Celestial.</strong> Touch another creature to restore Hit Points equal to <strong>2d8</strong> plus your <link:Charisma>Charisma</link> modifier and end one of its conditions: <link:Blinded>Blinded</link>, <link:Deafened>Deafened</link>, or <link:Poisoned>Poisoned</link>."
];

// Reuse the existing domain lists as reference text, without preparing their spells.
export const vestigeDomainSpellDescriptions = [
  ["cleric-life-domain", CLASS_FEATURE.LIFE_DOMAIN_SPELLS],
  ["cleric-light-domain", CLASS_FEATURE.LIGHT_DOMAIN_SPELLS],
  ["cleric-trickery-domain", CLASS_FEATURE.TRICKERY_DOMAIN_SPELLS],
  ["cleric-war-domain", CLASS_FEATURE.WAR_DOMAIN_SPELLS]
] as const;

export function getVestigeDomainSpellDescriptions(): string[] {
  return vestigeDomainSpellDescriptions.flatMap(([id, feature]) => {
    const domain = clericSubclassEntries.find((entry) => entry.id === id)!;
    const details = domain.features.find((row) => row.featureOverrides?.[feature])!
      .featureOverrides![feature]!;
    return [
      `<strong>${domain.name}.</strong> Use your Warlock level for these spells.`,
      ...details.description.filter((line) => line.startsWith("<strong>Level "))
    ];
  });
}
