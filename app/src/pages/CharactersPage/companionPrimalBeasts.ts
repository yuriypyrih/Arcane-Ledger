import type { Character, MonsterListItem, MonsterRecord } from "../../types";
import { getAbilityModifierForCharacter } from "./abilities";

export type PrimalBeastKind = "land" | "sea" | "sky";

export const PRIMAL_BEAST_MONSTER_TYPE = "Primal Beast";
const primalBeastCreatureType = "Beast";

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
    document__slug: "arcane-ledger",
    document__title: "Primal Beast",
    document__license_url: "",
    document__url: "",
    v2_converted_path: ""
  };
}

function getPrimalBeastFormulaHitPoints(
  kind: PrimalBeastKind,
  character?: Pick<Character, "level">
) {
  const level = Math.max(1, Math.floor(character?.level ?? 3));

  return kind === "sky" ? 4 + 4 * level : 5 + 5 * level;
}

function getPrimalBeastArmorClass(character?: Pick<Character, "abilities">) {
  if (!character) {
    return 13;
  }

  return 13 + getAbilityModifierForCharacter(character, "WIS");
}

export const primalBeastTemplates: Record<PrimalBeastKind, MonsterRecord> = {
  land: createPrimalBeastTemplate("land", {
    desc: "",
    name: "Beast of the Land",
    size: "Medium",
    type: primalBeastCreatureType,
    subtype: "",
    group: PRIMAL_BEAST_MONSTER_TYPE,
    alignment: "Neutral",
    armor_class: 13,
    armor_desc: "plus your Wisdom modifier",
    hit_points: 20,
    hit_dice:
      "5 + five times your ranger level; the beast has a number of hit dice (d8s) equal to your ranger level",
    speed: { walk: 40, climb: 40 },
    strength: 14,
    dexterity: 14,
    constitution: 15,
    intelligence: 8,
    wisdom: 14,
    charisma: 11,
    strength_save: 2,
    dexterity_save: 2,
    constitution_save: 2,
    intelligence_save: -1,
    wisdom_save: 2,
    charisma_save: 0,
    perception: null,
    skills: {},
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "Darkvision 60 ft., Passive Perception 12",
    languages: "Understands the languages that you know",
    challenge_rating: "None (XP 0; PB equals your Proficiency Bonus)",
    cr: 0,
    actions: [
      {
        name: "Beast's Strike",
        desc: "Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d8 + 2 plus your Wisdom modifier Bludgeoning, Piercing, or Slashing damage (your choice when you summon the beast). If the beast moved at least 20 feet straight toward the target before the hit, the target takes an extra 1d6 damage of the same type, and the target has the Prone condition if it is a Large or smaller creature."
      }
    ],
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: [
      {
        name: "Primal Bond",
        desc: "Add your Proficiency Bonus to any ability check or saving throw the beast makes."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: ["forest", "grassland", "hill"],
    img_main: null
  }),
  sea: createPrimalBeastTemplate("sea", {
    desc: "",
    name: "Beast of the Sea",
    size: "Medium",
    type: primalBeastCreatureType,
    subtype: "",
    group: PRIMAL_BEAST_MONSTER_TYPE,
    alignment: "Neutral",
    armor_class: 13,
    armor_desc: "plus your Wisdom modifier",
    hit_points: 20,
    hit_dice:
      "5 + five times your ranger level; the beast has a number of hit dice (d8s) equal to your ranger level",
    speed: { walk: 5, swim: 60 },
    strength: 14,
    dexterity: 14,
    constitution: 15,
    intelligence: 8,
    wisdom: 14,
    charisma: 11,
    strength_save: 2,
    dexterity_save: 2,
    constitution_save: 2,
    intelligence_save: -1,
    wisdom_save: 2,
    charisma_save: 0,
    perception: null,
    skills: {},
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "Darkvision 90 ft., Passive Perception 12",
    languages: "Understands the languages that you know",
    challenge_rating: "None (XP 0; PB equals your Proficiency Bonus)",
    cr: 0,
    actions: [
      {
        name: "Beast's Strike",
        desc: "Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d6 + 2 plus your Wisdom modifier Bludgeoning or Piercing damage (your choice when you summon the beast), and the target has the Grappled condition (escape DC equals your spell save DC)."
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
        desc: "Add your Proficiency Bonus to any ability check or saving throw the beast makes."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: ["coastal", "underwater"],
    img_main: null
  }),
  sky: createPrimalBeastTemplate("sky", {
    desc: "",
    name: "Beast of the Sky",
    size: "Small",
    type: primalBeastCreatureType,
    subtype: "",
    group: PRIMAL_BEAST_MONSTER_TYPE,
    alignment: "Neutral",
    armor_class: 13,
    armor_desc: "plus your Wisdom modifier",
    hit_points: 16,
    hit_dice:
      "4 + four times your ranger level; the beast has a number of hit dice (d6s) equal to your ranger level",
    speed: { walk: 10, fly: 60 },
    strength: 6,
    dexterity: 16,
    constitution: 13,
    intelligence: 8,
    wisdom: 14,
    charisma: 11,
    strength_save: -2,
    dexterity_save: 3,
    constitution_save: 1,
    intelligence_save: -1,
    wisdom_save: 2,
    charisma_save: 0,
    perception: null,
    skills: {},
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "Darkvision 60 ft., Passive Perception 12",
    languages: "Understands the languages that you know",
    challenge_rating: "None (XP 0; PB equals your Proficiency Bonus)",
    cr: 0,
    actions: [
      {
        name: "Beast's Strike",
        desc: "Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d4 + 3 plus your Wisdom modifier Slashing damage."
      }
    ],
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: [
      {
        name: "Flyby",
        desc: "The beast doesn't provoke Opportunity Attacks when it flies out of an enemy's reach."
      },
      {
        name: "Primal Bond",
        desc: "Add your Proficiency Bonus to any ability check or saving throw the beast makes."
      }
    ],
    spell_list: [],
    page_no: null,
    environments: ["forest", "mountain", "sky"],
    img_main: null
  })
};

export function getPrimalBeastTemplate(
  kind: PrimalBeastKind | undefined,
  character?: Pick<Character, "abilities" | "level">
): MonsterRecord | null {
  if (!kind) {
    return null;
  }

  const template = primalBeastTemplates[kind];

  if (!template) {
    return null;
  }

  return {
    ...template,
    armor_class: getPrimalBeastArmorClass(character),
    hit_points: getPrimalBeastFormulaHitPoints(kind, character)
  };
}

export function isPrimalBeastKind(value: unknown): value is PrimalBeastKind {
  return value === "land" || value === "sea" || value === "sky";
}

export function getPrimalBeastKindFromSlug(slug: string): PrimalBeastKind | null {
  const normalizedSlug = slug.trim();

  return (
    primalBeastKindOptions.find((option) => `primal-beast-${option.value}` === normalizedSlug)
      ?.value ?? null
  );
}

export function getPrimalBeastTemplateBySlug(
  slug: string,
  character?: Pick<Character, "abilities" | "level">
): MonsterRecord | null {
  const kind = getPrimalBeastKindFromSlug(slug);

  return kind ? getPrimalBeastTemplate(kind, character) : null;
}

export function isPrimalBeastMonsterType(value: string | null | undefined): boolean {
  return value === PRIMAL_BEAST_MONSTER_TYPE;
}

export const primalBeastMonsterListItems: MonsterListItem[] = primalBeastKindOptions.map(
  ({ value }) => {
    const template = primalBeastTemplates[value];

    return {
      id: template.id,
      slug: template.slug,
      name: template.name,
      type: PRIMAL_BEAST_MONSTER_TYPE,
      cr: template.cr,
      challengeRating: template.challenge_rating,
      sourceTitle: template.document__title,
      sourceSlug: template.document__slug,
      imageUrl: template.img_main
    };
  }
);
