export type MonsterOrdering = "name" | "-name" | "type" | "-type" | "cr" | "-cr";

export type MonsterSpeedValue = boolean | number | string;

export type MonsterFeatureRecord = {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_bonus?: number;
};

export type MonsterListItem = {
  id: string;
  slug: string;
  name: string;
  type: string;
  cr: number;
  challengeRating: string;
  sourceTitle: string;
  sourceSlug: string;
  imageUrl: string | null;
};

export type MonsterRecord = {
  id: string;
  slug: string;
  desc: string;
  name: string;
  size: string;
  type: string;
  subtype: string;
  group: string | null;
  alignment: string;
  armor_class: number;
  armor_desc: string | null;
  hit_points: number;
  hit_dice: string;
  speed: Record<string, MonsterSpeedValue>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number | null;
  dexterity_save: number | null;
  constitution_save: number | null;
  intelligence_save: number | null;
  wisdom_save: number | null;
  charisma_save: number | null;
  perception: number | null;
  skills: Record<string, number>;
  damage_vulnerabilities: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  challenge_rating: string;
  cr: number;
  actions: MonsterFeatureRecord[] | null;
  bonus_actions: MonsterFeatureRecord[] | null;
  reactions: MonsterFeatureRecord[] | null;
  legendary_desc: string | null;
  legendary_actions: MonsterFeatureRecord[] | null;
  special_abilities: MonsterFeatureRecord[] | null;
  spell_list: string[];
  page_no: number | null;
  environments: string[];
  img_main: string | null;
  document__slug: string;
  document__title: string;
  document__license_url: string;
  document__url: string;
  v2_converted_path: string;
};

export type PaginatedApiResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
