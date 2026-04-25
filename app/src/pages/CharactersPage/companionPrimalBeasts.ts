import type { MonsterRecord } from "../../types";

export type PrimalBeastKind = "land" | "sea" | "sky";

export const primalBeastKindOptions: Array<{ value: PrimalBeastKind; label: string }> = [
  { value: "land", label: "Beast of the Land" },
  { value: "sea", label: "Beast of the Sea" },
  { value: "sky", label: "Beast of the Sky" }
];

function createPrimalBeastTemplate(
  kind: PrimalBeastKind,
  record: Omit<
    MonsterRecord,
    | "id"
    | "slug"
    | "document__slug"
    | "document__title"
    | "document__license_url"
    | "document__url"
    | "v2_converted_path"
  >
): MonsterRecord {
  return {
    ...record,
    id: `primal-beast-${kind}`,
    slug: `primal-beast-${kind}`,
    document__slug: "dad-companion",
    document__title: "Primal Companion",
    document__license_url: "",
    document__url: "",
    v2_converted_path: ""
  };
}

export const primalBeastTemplates: Record<PrimalBeastKind, MonsterRecord> = {
  land: createPrimalBeastTemplate("land", {
    desc: "A land-bound primal spirit in animal form. Placeholder values for Beast Master play; refine this stat block later.",
    name: "Beast of the Land",
    size: "Medium",
    type: "Beast",
    subtype: "",
    group: "Primal Companion",
    alignment: "Unaligned",
    armor_class: 13,
    armor_desc: "natural armor",
    hit_points: 20,
    hit_dice: "placeholder",
    speed: { walk: 40, climb: 40 },
    strength: 14,
    dexterity: 14,
    constitution: 15,
    intelligence: 8,
    wisdom: 14,
    charisma: 11,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: 4,
    skills: { perception: 4, stealth: 4 },
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "Darkvision 60 ft., Passive Perception 14",
    languages: "understands the languages you speak",
    challenge_rating: "Primal Companion",
    cr: 0,
    actions: [
      {
        name: "Beast's Strike",
        desc: "Melee Weapon Attack: placeholder attack bonus, reach 5 ft., one target. Hit: placeholder force or natural weapon damage."
      }
    ],
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: [
      {
        name: "Primal Bond",
        desc: "The beast acts during your turn and follows the Primal Companion command rules."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: ["forest", "grassland", "hill"],
    img_main: null
  }),
  sea: createPrimalBeastTemplate("sea", {
    desc: "An aquatic primal spirit in animal form. Placeholder values for Beast Master play; refine this stat block later.",
    name: "Beast of the Sea",
    size: "Medium",
    type: "Beast",
    subtype: "",
    group: "Primal Companion",
    alignment: "Unaligned",
    armor_class: 13,
    armor_desc: "natural armor",
    hit_points: 20,
    hit_dice: "placeholder",
    speed: { walk: 5, swim: 60 },
    strength: 14,
    dexterity: 14,
    constitution: 15,
    intelligence: 8,
    wisdom: 14,
    charisma: 11,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: 4,
    skills: { perception: 4, stealth: 4 },
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "Darkvision 60 ft., Passive Perception 14",
    languages: "understands the languages you speak",
    challenge_rating: "Primal Companion",
    cr: 0,
    actions: [
      {
        name: "Beast's Strike",
        desc: "Melee Weapon Attack: placeholder attack bonus, reach 5 ft., one target. Hit: placeholder force or natural weapon damage."
      }
    ],
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: [
      {
        name: "Amphibious",
        desc: "The beast can breathe air and water."
      },
      {
        name: "Primal Bond",
        desc: "The beast acts during your turn and follows the Primal Companion command rules."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: ["coastal", "underwater"],
    img_main: null
  }),
  sky: createPrimalBeastTemplate("sky", {
    desc: "A flying primal spirit in animal form. Placeholder values for Beast Master play; refine this stat block later.",
    name: "Beast of the Sky",
    size: "Small",
    type: "Beast",
    subtype: "",
    group: "Primal Companion",
    alignment: "Unaligned",
    armor_class: 13,
    armor_desc: "natural armor",
    hit_points: 15,
    hit_dice: "placeholder",
    speed: { walk: 10, fly: 60 },
    strength: 6,
    dexterity: 16,
    constitution: 13,
    intelligence: 8,
    wisdom: 14,
    charisma: 11,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: 4,
    skills: { perception: 4, stealth: 5 },
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "Darkvision 60 ft., Passive Perception 14",
    languages: "understands the languages you speak",
    challenge_rating: "Primal Companion",
    cr: 0,
    actions: [
      {
        name: "Beast's Strike",
        desc: "Melee Weapon Attack: placeholder attack bonus, reach 5 ft., one target. Hit: placeholder force or natural weapon damage."
      }
    ],
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: [
      {
        name: "Flyby",
        desc: "The beast does not provoke opportunity attacks when it flies out of an enemy's reach."
      },
      {
        name: "Primal Bond",
        desc: "The beast acts during your turn and follows the Primal Companion command rules."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: ["forest", "mountain", "sky"],
    img_main: null
  })
};

export function getPrimalBeastTemplate(kind: PrimalBeastKind | undefined): MonsterRecord | null {
  return kind ? (primalBeastTemplates[kind] ?? null) : null;
}

export function isPrimalBeastKind(value: unknown): value is PrimalBeastKind {
  return value === "land" || value === "sea" || value === "sky";
}
