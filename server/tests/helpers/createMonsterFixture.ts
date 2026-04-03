import type { MonsterFeatureRecord, MonsterRecord } from "../../src/types/monster.js";

type MonsterFixtureOverrides = Partial<MonsterRecord>;

const defaultActions: MonsterFeatureRecord[] = [
  {
    name: "Bite",
    desc: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target.",
    attack_bonus: 5,
    damage_dice: "1d8",
    damage_bonus: 3
  }
];

export function createMonsterFixture(overrides: MonsterFixtureOverrides = {}): MonsterRecord {
  return {
    slug: "monster-slug",
    desc: "A sturdy monster fixture for tests.",
    name: "Monster Fixture",
    size: "Medium",
    type: "Beast",
    subtype: "",
    group: null,
    alignment: "unaligned",
    armor_class: 13,
    armor_desc: "natural armor",
    hit_points: 27,
    hit_dice: "5d8+5",
    speed: {
      walk: 30
    },
    strength: 14,
    dexterity: 12,
    constitution: 12,
    intelligence: 2,
    wisdom: 12,
    charisma: 6,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: null,
    skills: {},
    damage_vulnerabilities: "",
    damage_resistances: "",
    damage_immunities: "",
    condition_immunities: "",
    senses: "passive Perception 10",
    languages: "—",
    challenge_rating: "1",
    cr: 1,
    actions: defaultActions,
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: null,
    spell_list: [],
    page_no: null,
    environments: [],
    img_main: null,
    document__slug: "test-doc",
    document__title: "Test Document",
    document__license_url: "http://open5e.com/legal",
    document__url: "https://example.com/test-document",
    v2_converted_path: "/v2/creatures/test-doc_monster-slug/",
    ...overrides
  };
}
