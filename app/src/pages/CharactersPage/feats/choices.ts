import { getSpellEntriesForSpellListClass } from "../../../codex/classes/spellAccess";
import { FEATS, SPELL_LIST_CLASS, type SpellEntry } from "../../../codex/entries";
import { ALL_SKILLS, TOOL_PROFICIENCY } from "../../../types";
import type {
  AbilityKey,
  BlessedWarriorChoice,
  CharacterFeatEntry,
  DruidicWarriorChoice,
  LuckyChoice,
  MagicInitiateChoice,
  MusicianChoice,
  SkillName
} from "../../../types";
import type {
  AbilityScoreImprovementChoice,
  BoonOfIrresistibleOffenseChoice,
  EpicBoonAbilityChoice,
  SkilledChoice,
  SkilledFeatSelection
} from "../../../types/feats";
import { formatCodexLabel } from "../../../utils/codex";
import { abilityKeys } from "../constants";
import { getToolProficiencyLabel, musicalInstrumentToolProficiencies } from "../proficiencyOptions";
import { getCrafterChoiceSummary } from "./crafter";

const abilityKeySet = new Set<AbilityKey>(abilityKeys);
const skillNameSet = new Set<SkillName>(ALL_SKILLS);
const allEpicBoonAbilityOptions: AbilityKey[] = [...abilityKeys];
const spellRecallAbilityOptions: AbilityKey[] = ["INT", "WIS", "CHA"];
const blessedWarriorCantripOptions = getSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.CLERIC
).filter((spell) => spell.spellLevel === 0);
const blessedWarriorCantripOptionsById = new Map(
  blessedWarriorCantripOptions.map((spell) => [spell.id, spell] as const)
);
const druidicWarriorCantripOptions = getSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.DRUID
).filter((spell) => spell.spellLevel === 0);
const druidicWarriorCantripOptionsById = new Map(
  druidicWarriorCantripOptions.map((spell) => [spell.id, spell] as const)
);
export const magicInitiateSpellListOptions = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
] as const;
export const magicInitiateSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;
const magicInitiateSpellListOptionSet = new Set<SPELL_LIST_CLASS>(magicInitiateSpellListOptions);
const magicInitiateSpellcastingAbilityOptionSet = new Set<AbilityKey>(
  magicInitiateSpellcastingAbilityOptions
);
const magicInitiateCantripOptionsBySpellList = new Map<
  MagicInitiateChoice["spellList"],
  SpellEntry[]
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    getSpellEntriesForSpellListClass(spellList).filter((spell) => spell.spellLevel === 0)
  ])
);
const magicInitiateLevelOneSpellOptionsBySpellList = new Map<
  MagicInitiateChoice["spellList"],
  SpellEntry[]
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    getSpellEntriesForSpellListClass(spellList).filter((spell) => spell.spellLevel === 1)
  ])
);
const magicInitiateCantripOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    new Map(
      (magicInitiateCantripOptionsBySpellList.get(spellList) ?? []).map(
        (spell) => [spell.id, spell] as const
      )
    )
  ])
);
const magicInitiateLevelOneSpellOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    new Map(
      (magicInitiateLevelOneSpellOptionsBySpellList.get(spellList) ?? []).map(
        (spell) => [spell.id, spell] as const
      )
    )
  ])
);
const musicalInstrumentToolProficiencySet = new Set<TOOL_PROFICIENCY>(
  musicalInstrumentToolProficiencies
);
export const epicBoonAbilityIncreaseFeatOptions = new Map<FEATS, AbilityKey[]>([
  [FEATS.BOON_OF_COMBAT_PROWESS, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_DIMENSIONAL_TRAVEL, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_FATE, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_THE_NIGHT_SPIRIT, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_SPELL_RECALL, spellRecallAbilityOptions],
  [FEATS.BOON_OF_TRUESIGHT, allEpicBoonAbilityOptions]
]);

function isAbilityKey(value: unknown): value is AbilityKey {
  return typeof value === "string" && abilityKeySet.has(value as AbilityKey);
}

export function normalizeAbilityScoreImprovementChoice(
  value: unknown
): AbilityScoreImprovementChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<AbilityScoreImprovementChoice>;

  if (record.mode === "single" && isAbilityKey(record.primaryAbility)) {
    return {
      mode: "single",
      primaryAbility: record.primaryAbility
    };
  }

  if (
    record.mode === "split" &&
    isAbilityKey(record.primaryAbility) &&
    isAbilityKey(record.secondaryAbility) &&
    record.primaryAbility !== record.secondaryAbility
  ) {
    return {
      mode: "split",
      primaryAbility: record.primaryAbility,
      secondaryAbility: record.secondaryAbility
    };
  }

  return undefined;
}

export function normalizeBoonOfIrresistibleOffenseChoice(
  value: unknown
): BoonOfIrresistibleOffenseChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BoonOfIrresistibleOffenseChoice>;

  if (record.ability === "STR" || record.ability === "DEX") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeEpicBoonAbilityChoice(
  feat: FEATS,
  value: unknown
): EpicBoonAbilityChoice | undefined {
  const allowedAbilities = epicBoonAbilityIncreaseFeatOptions.get(feat);

  if (!allowedAbilities || !value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<EpicBoonAbilityChoice>;

  if (typeof record.ability !== "string") {
    return undefined;
  }

  const ability = record.ability as AbilityKey;

  if (!allowedAbilities.includes(ability)) {
    return undefined;
  }

  return {
    ability
  };
}

export function normalizeBlessedWarriorChoice(value: unknown): BlessedWarriorChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BlessedWarriorChoice>;

  if (!Array.isArray(record.cantripIds) || record.cantripIds.length !== 2) {
    return undefined;
  }

  const cantripIds = [
    ...new Set(record.cantripIds.filter((id): id is string => typeof id === "string"))
  ];

  if (cantripIds.length !== 2) {
    return undefined;
  }

  if (!cantripIds.every((id) => blessedWarriorCantripOptionsById.has(id))) {
    return undefined;
  }

  return {
    cantripIds: cantripIds as BlessedWarriorChoice["cantripIds"]
  };
}

export function normalizeDruidicWarriorChoice(value: unknown): DruidicWarriorChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<DruidicWarriorChoice>;

  if (!Array.isArray(record.cantripIds) || record.cantripIds.length !== 2) {
    return undefined;
  }

  const cantripIds = [
    ...new Set(record.cantripIds.filter((id): id is string => typeof id === "string"))
  ];

  if (cantripIds.length !== 2) {
    return undefined;
  }

  if (!cantripIds.every((id) => druidicWarriorCantripOptionsById.has(id))) {
    return undefined;
  }

  return {
    cantripIds: cantripIds as DruidicWarriorChoice["cantripIds"]
  };
}

export function isMagicInitiateSpellList(
  value: unknown
): value is MagicInitiateChoice["spellList"] {
  return (
    typeof value === "string" &&
    magicInitiateSpellListOptionSet.has(value as MagicInitiateChoice["spellList"])
  );
}

export function normalizeMagicInitiateChoice(value: unknown): MagicInitiateChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MagicInitiateChoice>;

  if (!isMagicInitiateSpellList(record.spellList)) {
    return undefined;
  }

  if (!Array.isArray(record.cantripIds) || record.cantripIds.length !== 2) {
    return undefined;
  }

  const cantripOptionsById = magicInitiateCantripOptionsBySpellListAndId.get(record.spellList);
  const levelOneSpellOptionsById = magicInitiateLevelOneSpellOptionsBySpellListAndId.get(
    record.spellList
  );
  const cantripIds = [
    ...new Set(record.cantripIds.filter((id): id is string => typeof id === "string"))
  ];

  if (
    cantripIds.length !== 2 ||
    !cantripOptionsById ||
    !cantripIds.every((id) => cantripOptionsById.has(id))
  ) {
    return undefined;
  }

  if (
    typeof record.levelOneSpellId !== "string" ||
    !levelOneSpellOptionsById?.has(record.levelOneSpellId)
  ) {
    return undefined;
  }

  if (
    typeof record.spellcastingAbility !== "string" ||
    !magicInitiateSpellcastingAbilityOptionSet.has(record.spellcastingAbility as AbilityKey)
  ) {
    return undefined;
  }

  return {
    spellList: record.spellList,
    cantripIds: cantripIds as MagicInitiateChoice["cantripIds"],
    levelOneSpellId: record.levelOneSpellId,
    spellcastingAbility: record.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"],
    freeCastExpended: record.freeCastExpended === true ? true : undefined
  };
}

function isSkilledTool(value: unknown): value is TOOL_PROFICIENCY {
  return (
    typeof value === "string" && Object.values(TOOL_PROFICIENCY).includes(value as TOOL_PROFICIENCY)
  );
}

function normalizeSkilledSelection(value: unknown): SkilledFeatSelection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<SkilledFeatSelection>;

  if (
    record.kind === "skill" &&
    typeof record.skill === "string" &&
    skillNameSet.has(record.skill as SkillName)
  ) {
    return {
      kind: "skill",
      skill: record.skill as SkillName
    };
  }

  if (record.kind === "tool" && isSkilledTool(record.tool)) {
    return {
      kind: "tool",
      tool: record.tool
    };
  }

  return null;
}

export function normalizeSkilledChoice(value: unknown): SkilledChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SkilledChoice>;

  if (!Array.isArray(record.selections) || record.selections.length !== 3) {
    return undefined;
  }

  const selections = record.selections
    .map((selection) => normalizeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return undefined;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

function isMusicianInstrument(value: unknown): value is TOOL_PROFICIENCY {
  return (
    typeof value === "string" && musicalInstrumentToolProficiencySet.has(value as TOOL_PROFICIENCY)
  );
}

export function normalizeMusicianChoice(value: unknown): MusicianChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MusicianChoice>;

  if (!Array.isArray(record.toolProficiencies) || record.toolProficiencies.length !== 3) {
    return undefined;
  }

  const toolProficiencies = record.toolProficiencies.filter(isMusicianInstrument);
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return undefined;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as MusicianChoice["toolProficiencies"]
  };
}

function getFeatProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

export function normalizeLuckyChoice(
  value: unknown,
  currentLevel: number
): LuckyChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const rawPointsExpended = Number((value as Partial<LuckyChoice>).pointsExpended);
  const pointsExpended = Number.isFinite(rawPointsExpended) ? Math.floor(rawPointsExpended) : 0;
  const maxPoints = getFeatProficiencyBonusForLevel(currentLevel);
  const normalizedPointsExpended = Math.max(0, Math.min(maxPoints, pointsExpended));

  return normalizedPointsExpended > 0
    ? {
        pointsExpended: normalizedPointsExpended
      }
    : undefined;
}

export function getAbilityScoreImprovementSummary(
  choice?: AbilityScoreImprovementChoice
): string | null {
  if (!choice) {
    return null;
  }

  if (choice.mode === "single") {
    return `${choice.primaryAbility} +2`;
  }

  return `${choice.primaryAbility} +1, ${choice.secondaryAbility} +1`;
}

export function getSkilledSelectionLabel(selection: SkilledFeatSelection): string {
  return selection.kind === "skill" ? selection.skill : getToolProficiencyLabel(selection.tool);
}

export function getSkilledChoiceSummary(choice?: SkilledChoice): string | null {
  if (!choice) {
    return null;
  }

  return choice.selections.map((selection) => getSkilledSelectionLabel(selection)).join(", ");
}

export function getMusicianChoiceSummary(choice?: MusicianChoice): string | null {
  if (!choice) {
    return null;
  }

  return choice.toolProficiencies.map((tool) => getToolProficiencyLabel(tool)).join(", ");
}

export function getEpicBoonAbilityChoiceSummary(choice?: EpicBoonAbilityChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getBlessedWarriorChoiceSummary(choice?: BlessedWarriorChoice): string | null {
  if (!choice) {
    return null;
  }

  const cantripNames = choice.cantripIds
    .map((cantripId) => blessedWarriorCantripOptionsById.get(cantripId)?.name)
    .filter((name): name is string => Boolean(name));

  return cantripNames.length > 0 ? cantripNames.join(", ") : null;
}

export function getDruidicWarriorChoiceSummary(choice?: DruidicWarriorChoice): string | null {
  if (!choice) {
    return null;
  }

  const cantripNames = choice.cantripIds
    .map((cantripId) => druidicWarriorCantripOptionsById.get(cantripId)?.name)
    .filter((name): name is string => Boolean(name));

  return cantripNames.length > 0 ? cantripNames.join(", ") : null;
}

export function getMagicInitiateSpellListLabel(
  spellList: MagicInitiateChoice["spellList"]
): string {
  return formatCodexLabel(spellList);
}

export function getMagicInitiateChoiceSummary(choice?: MagicInitiateChoice): string | null {
  if (!choice) {
    return null;
  }

  const cantripOptionsById = magicInitiateCantripOptionsBySpellListAndId.get(choice.spellList);
  const levelOneSpellOptionsById = magicInitiateLevelOneSpellOptionsBySpellListAndId.get(
    choice.spellList
  );
  const cantripNames = choice.cantripIds
    .map((cantripId) => cantripOptionsById?.get(cantripId)?.name)
    .filter((name): name is string => Boolean(name));
  const levelOneSpellName = levelOneSpellOptionsById?.get(choice.levelOneSpellId)?.name;
  const spellNames = [...cantripNames, levelOneSpellName].filter((name): name is string =>
    Boolean(name)
  );

  return spellNames.length > 0
    ? `${getMagicInitiateSpellListLabel(choice.spellList)} (${choice.spellcastingAbility}): ${spellNames.join(", ")}`
    : null;
}

export function getCharacterFeatSummary(entry: CharacterFeatEntry): string | null {
  if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
    return getAbilityScoreImprovementSummary(entry.abilityScoreImprovement);
  }

  if (entry.feat === FEATS.BLESSED_WARRIOR) {
    return getBlessedWarriorChoiceSummary(entry.blessedWarrior);
  }

  if (entry.feat === FEATS.DRUIDIC_WARRIOR) {
    return getDruidicWarriorChoiceSummary(entry.druidicWarrior);
  }

  if (entry.feat === FEATS.MAGIC_INITIATE) {
    return getMagicInitiateChoiceSummary(entry.magicInitiate);
  }

  if (entry.feat === FEATS.CRAFTER) {
    return getCrafterChoiceSummary(entry.crafter);
  }

  if (entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
    return entry.boonOfIrresistibleOffense ? `${entry.boonOfIrresistibleOffense.ability} +1` : null;
  }

  if (entry.epicBoonAbilityChoice) {
    return getEpicBoonAbilityChoiceSummary(entry.epicBoonAbilityChoice);
  }

  if (entry.feat === FEATS.SKILLED) {
    return getSkilledChoiceSummary(entry.skilled);
  }

  if (entry.feat === FEATS.MUSICIAN) {
    return getMusicianChoiceSummary(entry.musician);
  }

  return null;
}

export function getBlessedWarriorCantripOptions(): SpellEntry[] {
  return blessedWarriorCantripOptions;
}

export function getDruidicWarriorCantripOptions(): SpellEntry[] {
  return druidicWarriorCantripOptions;
}

export function getMagicInitiateCantripOptions(
  spellList: MagicInitiateChoice["spellList"]
): SpellEntry[] {
  return magicInitiateCantripOptionsBySpellList.get(spellList) ?? [];
}

export function getMagicInitiateLevelOneSpellOptions(
  spellList: MagicInitiateChoice["spellList"]
): SpellEntry[] {
  return magicInitiateLevelOneSpellOptionsBySpellList.get(spellList) ?? [];
}

export function getEpicBoonAbilityOptions(feat: FEATS): AbilityKey[] | null {
  const options = epicBoonAbilityIncreaseFeatOptions.get(feat);

  return options ? [...options] : null;
}
