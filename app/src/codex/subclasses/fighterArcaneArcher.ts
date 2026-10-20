import { SKILL } from "../../types";

// Arcane Archer choices and reference descriptions; runtime behavior lives with the subclass.
export const arcaneShotOptions = [
  {
    id: "banishing-shot",
    name: "Banishing Shot",
    description:
      "<strong>Banishing Shot.</strong> On a hit, add Psychic damage equal to one Arcane Shot Die roll. The target makes a <link:Charisma>Charisma</link> saving throw; failure banishes it to a harmless demiplane, where it is <link:Incapacitated>Incapacitated</link> with Speed 0. It returns at the end of its next turn to its former space, or the nearest empty space if occupied."
  },
  {
    id: "beguiling-shot",
    name: "Beguiling Shot",
    description:
      "<strong>Beguiling Shot.</strong> On a hit, add Psychic damage equal to two Arcane Shot Die rolls. A failed <link:Wisdom>Wisdom</link> saving throw leaves it <link:Charmed>Charmed</link> until your next turn starts by you or an ally within 30 feet of it, your choice. The condition ends early if that charmer attacks it, damages it, or forces it to make a saving throw."
  },
  {
    id: "bursting-shot",
    name: "Bursting Shot",
    description:
      "<strong>Bursting Shot.</strong> Immediately after the attack damages its target, that target and every creature in a 10-foot <link:Emanation>Emanation</link> from it take Force damage equal to two Arcane Shot Die rolls."
  },
  {
    id: "enfeebling-shot",
    name: "Enfeebling Shot",
    description:
      "<strong>Enfeebling Shot.</strong> On a hit, add Necrotic damage equal to two Arcane Shot Die rolls. A failed <link:Constitution>Constitution</link> saving throw leaves the target <link:Poisoned>Poisoned</link> until its next turn ends. While <link:Poisoned>Poisoned</link> this way, subtract one Arcane Shot Die roll from the total damage of each attack roll it hits with."
  },
  {
    id: "grasping-shot",
    name: "Grasping Shot",
    description:
      "<strong>Grasping Shot.</strong> On a hit, add Slashing damage equal to one Arcane Shot Die roll. A failed <link:Strength>Strength</link> saving throw leaves the target <link:Restrained>Restrained</link> by brambles for 1 minute or until you use Grasping Shot again. The target or someone within reach may spend an action on a <link:Strength>Strength</link> (Athletics) check against your Arcane Shot DC; success removes the brambles and condition."
  },
  {
    id: "piercing-shot",
    name: "Piercing Shot",
    description:
      "<strong>Piercing Shot.</strong> Replace the attack roll with a 30-foot-long, 1-foot-wide Line from you that passes through solid objects and ignores cover. Each creature in the Line makes a <link:Dexterity>Dexterity</link> saving throw. Failure: normal hit damage plus Piercing damage equal to two Arcane Shot Die rolls. Success: half damage. The ammunition then vanishes."
  },
  {
    id: "seeking-shot",
    name: "Seeking Shot",
    description:
      "<strong>Seeking Shot.</strong> Replace the attack roll by choosing a creature seen within the last minute. The ammunition rounds corners and ignores Half Cover and Three-Quarters Cover. If within the weapon's long range, the target makes a <link:Dexterity>Dexterity</link> saving throw. Failure: normal hit damage plus Force damage equal to two Arcane Shot Die rolls, and you learn its current location. Success: half damage only. If outside long range, the ammunition vanishes at the end of its range."
  },
  {
    id: "shadow-shot",
    name: "Shadow Shot",
    description:
      "<strong>Shadow Shot.</strong> On a hit, add Psychic damage equal to one Arcane Shot Die roll. A failed <link:Wisdom>Wisdom</link> saving throw makes the target <link:Blinded>Blinded</link> until its next turn ends."
  }
] as const;

export const arcaneShotOptionsDescription = arcaneShotOptions.map((option) => option.description);

export const arcaneArcherLoreCantripNames = ["Druidcraft", "Prestidigitation"] as const;
export const arcaneArcherLoreSkills = [SKILL.ARCANA, SKILL.NATURE] as const;

export const arcaneShotOptionLevels = [3, 3, 7, 10, 15, 18] as const;

export const arcaneShotDieProgression = [
  { level: 3, die: "D6" },
  { level: 10, die: "D8" },
  { level: 15, die: "D10" },
  { level: 18, die: "D12" }
] as const;

export const arcaneShotUsingAShotDescription =
  "<strong>Using a Shot.</strong> Once per turn, apply an option to a ranged attack with a weapon that has the Ammunition property. Choose when the attack hits and damages a creature, except for options that replace the attack roll.";
