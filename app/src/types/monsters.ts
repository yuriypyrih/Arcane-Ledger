export type MonsterOrdering =
  | "name"
  | "-name"
  | "type"
  | "-type"
  | "challenge_rating"
  | "-challenge_rating"
  | "cr"
  | "-cr"
  | "document"
  | "-document";

export type MonsterAbilityKey =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

export type MonsterActionType =
  | "ACTION"
  | "BONUS_ACTION"
  | "REACTION"
  | "LEGENDARY_ACTION"
  | string;

export type MonsterV2Reference = {
  name?: string | null;
  key?: string | null;
  url?: string | null;
  type?: string | null;
  display_name?: string | null;
  publisher?: MonsterV2Reference | null;
  gamesystem?: MonsterV2Reference | null;
  permalink?: string | null;
  desc?: string | null;
  [key: string]: unknown;
};

export type MonsterAbilityMap = Partial<Record<MonsterAbilityKey, number | null>> & {
  [key: string]: number | null | undefined;
};

export type MonsterSpeedMap = {
  unit?: string | null;
  walk?: number | null;
  crawl?: number | null;
  climb?: number | null;
  burrow?: number | null;
  fly?: number | null;
  swim?: number | null;
  hover?: boolean | null;
  [key: string]: boolean | number | string | null | undefined;
};

export type MonsterLanguagesRecord = {
  as_string?: string | null;
  data?: MonsterV2Reference[];
  [key: string]: unknown;
};

export type MonsterResistancesAndImmunitiesRecord = {
  damage_immunities_display?: string | null;
  damage_immunities?: MonsterV2Reference[];
  damage_resistances_display?: string | null;
  damage_resistances?: MonsterV2Reference[];
  damage_vulnerabilities_display?: string | null;
  damage_vulnerabilities?: MonsterV2Reference[];
  condition_immunities_display?: string | null;
  condition_immunities?: MonsterV2Reference[];
  [key: string]: unknown;
};

export type MonsterUsageLimitRecord = {
  type?: string | null;
  param?: number | string | null;
  [key: string]: unknown;
};

export type MonsterAttackRecord = {
  name?: string | null;
  attack_type?: string | null;
  to_hit_mod?: number | null;
  reach?: number | null;
  range?: number | null;
  long_range?: number | null;
  target_creature_only?: boolean | null;
  damage_die_count?: number | null;
  damage_die_type?: string | null;
  damage_bonus?: number | null;
  damage_type?: MonsterV2Reference | null;
  extra_damage_die_count?: number | null;
  extra_damage_die_type?: string | null;
  extra_damage_bonus?: number | null;
  extra_damage_type?: MonsterV2Reference | null;
  distance_unit?: string | null;
  [key: string]: unknown;
};

export type MonsterActionRecord = {
  name?: string | null;
  desc?: string | null;
  attacks?: MonsterAttackRecord[];
  action_type?: MonsterActionType | null;
  order_in_statblock?: number | null;
  legendary_action_cost?: number | null;
  limited_to_form?: string | null;
  usage_limits?: MonsterUsageLimitRecord | null;
  [key: string]: unknown;
};

export type MonsterTraitRecord = {
  name?: string | null;
  desc?: string | null;
  [key: string]: unknown;
};

export type MonsterIllustrationRecord = {
  name?: string | null;
  key?: string | null;
  file_url?: string | null;
  alt_text?: string | null;
  attribution?: string | null;
  [key: string]: unknown;
};

export type MonsterRecord = {
  id?: string;
  key: string;
  name: string;
  ability_scores?: MonsterAbilityMap | null;
  actions?: MonsterActionRecord[] | null;
  alignment?: string | null;
  armor_class?: number | null;
  armor_detail?: string | null;
  blindsight_range?: number | null;
  category?: string | null;
  challenge_rating?: number | string | null;
  creaturesets?: string[] | null;
  darkvision_range?: number | null;
  deprecated?: boolean;
  desc?: string | null;
  document?: MonsterV2Reference | null;
  environments?: MonsterV2Reference[] | null;
  experience_points?: number | null;
  hit_dice?: string | null;
  hit_points?: number | null;
  illustration?: MonsterIllustrationRecord | null;
  initiative_bonus?: number | null;
  languages?: MonsterLanguagesRecord | null;
  modifiers?: MonsterAbilityMap | null;
  normal_sight_range?: number | null;
  passive_perception?: number | null;
  proficiency_bonus?: number | null;
  resistances_and_immunities?: MonsterResistancesAndImmunitiesRecord | null;
  saving_throws?: MonsterAbilityMap | null;
  saving_throws_all?: MonsterAbilityMap | null;
  senses_display?: string | null;
  size?: MonsterV2Reference | null;
  skill_bonuses?: Record<string, number | null | undefined> | null;
  skill_bonuses_all?: Record<string, number | null | undefined> | null;
  speed?: MonsterSpeedMap | null;
  speed_all?: MonsterSpeedMap | null;
  subcategory?: string | null;
  traits?: MonsterTraitRecord[] | null;
  tremorsense_range?: number | null;
  truesight_range?: number | null;
  type?: MonsterV2Reference | null;
  [key: string]: unknown;
};

export type MonsterListItem = {
  id: string;
  key: string;
  name: string;
  typeKey: string | null;
  typeName: string | null;
  challengeRating: number | string | null;
  sourceKey: string | null;
  sourceTitle: string | null;
  imageUrl: string | null;
  deprecated?: boolean;
};

export type PaginatedApiResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
