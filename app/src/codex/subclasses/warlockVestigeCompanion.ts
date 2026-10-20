import type { MonsterRecord } from "../../types";

export const vestigeCompanionMonsterKey = "warlock-vestige-companion";
export const vestigeCompanionName = "Vestige Companion";
export const vestigeCompanionForms = ["Celestial", "Fiend", "Undead"] as const;
export type VestigeCompanionForm = (typeof vestigeCompanionForms)[number];

const damageTypeByForm = {
  Celestial: "Radiant",
  Fiend: "Fire",
  Undead: "Necrotic"
} satisfies Record<VestigeCompanionForm, string>;

type VestigeCompanionStats = {
  warlockLevel: number;
  charismaModifier: number;
  proficiencyBonus: number;
  spellAttackModifier: number;
  form: VestigeCompanionForm;
};

function signed(value: number): string {
  return value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
}

export function createVestigeCompanionStatBlock({
  warlockLevel,
  charismaModifier,
  proficiencyBonus,
  spellAttackModifier,
  form
}: VestigeCompanionStats): MonsterRecord {
  const damageType = damageTypeByForm[form];
  return {
    key: vestigeCompanionMonsterKey,
    name: vestigeCompanionName,
    deprecated: false,
    size: { name: "Small", key: "small" },
    type: { name: form, key: form.toLowerCase() },
    alignment: "Neutral",
    armor_class: 13 + charismaModifier,
    armor_detail: "13 + your Charisma modifier",
    initiative_bonus: 2,
    hit_points: 4 + 4 * warlockLevel,
    hit_dice: `${warlockLevel}d6`,
    speed: { walk: 5, fly: 30, hover: true },
    ability_scores: {
      strength: 1,
      dexterity: 14,
      constitution: 10,
      intelligence: 15,
      wisdom: 15,
      charisma: 16
    },
    saving_throws_all: {
      strength: -5,
      dexterity: 2,
      constitution: 0,
      intelligence: 2,
      wisdom: 2,
      charisma: 3
    },
    resistances_and_immunities: {
      damage_resistances_display: damageType,
      condition_immunities_display: "Charmed, Frightened, Prone"
    },
    passive_perception: 12,
    languages: { as_string: "Speaks the languages you know" },
    challenge_rating: "None",
    experience_points: 0,
    proficiency_bonus: proficiencyBonus,
    traits: [
      {
        name: "Pact Bond",
        desc: `Add your Proficiency Bonus (${signed(proficiencyBonus)}) to any ability check or saving throw the vestige makes.`
      }
    ],
    actions: [
      {
        name: "Vestige's Strike",
        action_type: "ACTION",
        order_in_statblock: 0,
        desc: `Melee or Ranged Attack Roll: ${signed(spellAttackModifier)} (your spell attack modifier), reach 5 ft. or range 60 ft. Hit: 1d6 ${signed(3 + charismaModifier)} ${damageType} damage (1d6 + 3 plus your Charisma modifier).`
      },
      {
        name: "Divine Power (1/Day)",
        action_type: "BONUS_ACTION",
        order_in_statblock: 0,
        desc: "Your vestige manifests a remnant of its divine power in one of the following ways, based on its form."
      },
      {
        name: "Cursed Invocation (Undead Only)",
        action_type: "BONUS_ACTION",
        order_in_statblock: 1,
        desc: "The vestige places a curse on a creature you can see within 30 feet of the vestige for 1 minute. While cursed, the target has Disadvantage on attack rolls against you and the vestige."
      },
      {
        name: "Fiendish Swap (Fiend Only)",
        action_type: "BONUS_ACTION",
        order_in_statblock: 2,
        desc: "If you and the vestige are within 60 feet of each other, you both teleport, swapping places."
      },
      {
        name: "Healing Touch (Celestial Only)",
        action_type: "BONUS_ACTION",
        order_in_statblock: 3,
        desc: `The vestige touches another creature. The target regains Hit Points equal to 2d8 ${signed(charismaModifier)} (your Charisma modifier) and ends one condition on it: Blinded, Deafened, or Poisoned.`
      }
    ],
    document: { key: "AU", name: "Arcana Unleashed" }
  };
}

const vestigeReferenceBase = createVestigeCompanionStatBlock({
  warlockLevel: 1,
  charismaModifier: 0,
  proficiencyBonus: 0,
  spellAttackModifier: 0,
  form: "Celestial"
});

export const vestigeCompanionReferenceStatBlock: MonsterRecord = {
  ...vestigeReferenceBase,
  type: { name: "Celestial, Fiend, or Undead", key: vestigeCompanionMonsterKey },
  armor_class: "13 + your Charisma modifier",
  armor_detail: null,
  hit_points: "4 + four times your Warlock level",
  hit_dice: "the vestige has a number of Hit Dice [d6s] equal to your Warlock level",
  proficiency_bonus: null,
  proficiency_bonus_display: "Equals your Proficiency Bonus",
  resistances_and_immunities: {
    ...vestigeReferenceBase.resistances_and_immunities,
    damage_resistances_display:
      "Fire (Fiend only); Necrotic (Undead only); Radiant (Celestial only)"
  },
  traits: [
    {
      name: "Pact Bond",
      desc: "Add your Proficiency Bonus to any ability check or saving throw the vestige makes."
    }
  ],
  actions: vestigeReferenceBase.actions?.map((action) => {
    if (action.name === "Vestige's Strike")
      return {
        ...action,
        desc: "Melee or Ranged Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. or range 60 ft. Hit: 1d6 + 3 plus your Charisma modifier Fire (Fiend), Necrotic (Undead), or Radiant (Celestial) damage."
      };
    if (action.name === "Healing Touch (Celestial Only)")
      return {
        ...action,
        desc: "The vestige touches another creature. The target regains Hit Points equal to 2d8 plus your Charisma modifier and ends one condition on it: Blinded, Deafened, or Poisoned."
      };
    return action;
  })
};
