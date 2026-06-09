import { FEATS, SPELL_LIST_CLASS, type BackgroundEntry } from "../../codex/entries";
import { getBackgroundEntries, getBackgroundEntryByName } from "../../codex/selectors";
import type {
  AbilityKey,
  Character,
  CharacterBackgroundAbilityScoreIncrease,
  CharacterBackgroundChoices,
  CharacterBackgroundEquipmentMode,
  CharacterCustomBackgroundConfig,
  CharacterFeatEntry,
  MagicInitiateChoice,
  SkillName
} from "../../types";
import { LANGUAGE_PROFICIENCY, TOOL_PROFICIENCY } from "../../types";
import {
  createCharacterFeatEntry,
  getMagicInitiateCantripOptions,
  getMagicInitiateLevelOneSpellOptions
} from "./feats";
import { abilityKeys } from "./constants";
import { getDefaultCultOfDragonInitiateLanguage } from "./feats/cultOfDragonInitiate";
import { crafterFastCraftingToolProficiencies } from "./feats/crafter";
import { getDefaultHarperAgentInstrument } from "./feats/harperAgent";
import { getDefaultPurpleDragonRookSkill } from "./feats/purpleDragonRook";
import { getDefaultSpellfireSparkSpellcastingAbility } from "./feats/spellfireSpark";
import {
  musicalInstrumentToolProficiencies,
  gamingSetToolProficiencies,
  languageProficiencyOptions,
  type ToolProficiency
} from "./proficiencyOptions";
import { getCharacterBackgroundDisplayName, isCustomBackgroundName } from "./customOrigins";

type BackgroundChoiceContext = {
  preferredAbilities?: AbilityKey[];
};

const backgroundEntriesByName = new Map(getBackgroundEntries().map((entry) => [entry.name, entry]));
const backgroundEquipmentModes = new Set<CharacterBackgroundEquipmentMode>(["equipment", "gold"]);

function sortBackgroundNames(left: string, right: string): number {
  return left.localeCompare(right);
}

function getDefaultMagicInitiateAbility(
  spellList: MagicInitiateChoice["spellList"]
): MagicInitiateChoice["spellcastingAbility"] {
  return spellList === SPELL_LIST_CLASS.WIZARD ? "INT" : "WIS";
}

function getBackgroundFeatEntryId(entry: BackgroundEntry): string {
  const backgroundKey = entry.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const featKey = entry.originFeat.toLowerCase().replace(/_/g, "-");

  return `background-${backgroundKey}-${featKey}`;
}

function createBackgroundFeatEntry(
  entry: BackgroundEntry,
  level: number,
  options?: Parameters<typeof createCharacterFeatEntry>[2]
): CharacterFeatEntry {
  return {
    ...createCharacterFeatEntry(entry.originFeat, level, options),
    id: getBackgroundFeatEntryId(entry)
  };
}

function getPreferredAbilityOrder(context?: BackgroundChoiceContext): AbilityKey[] {
  const preferredAbilities = context?.preferredAbilities ?? [];

  return [
    ...preferredAbilities.filter((ability) => abilityKeys.includes(ability)),
    ...abilityKeys.filter((ability) => !preferredAbilities.includes(ability))
  ];
}

function isAbilityScoreIncreaseValidForBackground(
  entry: BackgroundEntry,
  choice: CharacterBackgroundAbilityScoreIncrease | undefined
): boolean {
  if (!choice) {
    return false;
  }

  const allowedAbilitySet = new Set<AbilityKey>(entry.abilityScoreOptions);

  if (choice.mode === "two-one") {
    return (
      allowedAbilitySet.has(choice.primaryAbility) &&
      allowedAbilitySet.has(choice.secondaryAbility) &&
      choice.primaryAbility !== choice.secondaryAbility
    );
  }

  return (
    choice.abilities.length === 3 &&
    new Set(choice.abilities).size === 3 &&
    choice.abilities.every((ability) => allowedAbilitySet.has(ability))
  );
}

function isAbilityScoreIncreaseValidForAbilities(
  allowedAbilities: readonly AbilityKey[],
  choice: CharacterBackgroundAbilityScoreIncrease | undefined
): boolean {
  if (!choice) {
    return false;
  }

  const allowedAbilitySet = new Set<AbilityKey>(allowedAbilities);

  if (choice.mode === "two-one") {
    return (
      allowedAbilitySet.has(choice.primaryAbility) &&
      allowedAbilitySet.has(choice.secondaryAbility) &&
      choice.primaryAbility !== choice.secondaryAbility
    );
  }

  return (
    choice.abilities.length === 3 &&
    new Set(choice.abilities).size === 3 &&
    choice.abilities.every((ability) => allowedAbilitySet.has(ability))
  );
}

function normalizeToolProficiencyChoice(
  entry: BackgroundEntry,
  value: unknown
): TOOL_PROFICIENCY | undefined {
  const choices = entry.toolProficiencyChoices;

  if (!choices?.length) {
    return undefined;
  }

  if (typeof value === "string" && choices.includes(value as TOOL_PROFICIENCY)) {
    return value as TOOL_PROFICIENCY;
  }

  return entry.starterPack.recommendedToolProficiency ?? choices[0];
}

function getBackgroundToolSelectionOptions(entry: BackgroundEntry): ToolProficiency[] {
  return entry.toolProficiencyChoices?.length
    ? entry.toolProficiencyChoices
    : entry.grantedToolProficiencies;
}

function normalizeBackgroundSkillProficiencies(
  entry: BackgroundEntry,
  value: unknown
): SkillName[] {
  const backgroundSkillOptions = [...entry.grantedSkillProficiencies];
  const backgroundSkillOptionSet = new Set<SkillName>(backgroundSkillOptions);
  const selectionCount = Math.min(2, backgroundSkillOptions.length);

  if (Array.isArray(value)) {
    const skills = [...new Set(value)].filter((skill): skill is SkillName =>
      backgroundSkillOptionSet.has(skill as SkillName)
    );

    if (skills.length === selectionCount) {
      return skills;
    }
  }

  return backgroundSkillOptions.slice(0, selectionCount);
}

function normalizeBackgroundToolProficiencies(
  entry: BackgroundEntry,
  value: unknown
): TOOL_PROFICIENCY[] {
  const options = getBackgroundToolSelectionOptions(entry);
  const optionSet = new Set<ToolProficiency>(options);

  if (Array.isArray(value)) {
    const tools = [...new Set(value)].filter((tool): tool is TOOL_PROFICIENCY =>
      optionSet.has(tool as TOOL_PROFICIENCY)
    );

    if (tools.length > 0) {
      return tools.slice(0, 1);
    }
  }

  const fallbackTool =
    entry.starterPack.recommendedToolProficiency ??
    entry.grantedToolProficiencies.find((tool) => optionSet.has(tool)) ??
    options[0];

  return fallbackTool ? [fallbackTool] : [];
}

function normalizeBackgroundLanguageProficiencies(value: unknown): LANGUAGE_PROFICIENCY[] {
  if (!Array.isArray(value)) {
    return [LANGUAGE_PROFICIENCY.COMMON];
  }

  const allowedLanguageSet = new Set<LANGUAGE_PROFICIENCY>(languageProficiencyOptions);

  return [...new Set(value)].filter(
    (language): language is LANGUAGE_PROFICIENCY =>
      typeof language === "string" && allowedLanguageSet.has(language as LANGUAGE_PROFICIENCY)
  );
}

function normalizeAbilityScoreIncrease(
  entry: BackgroundEntry,
  value: unknown,
  context?: BackgroundChoiceContext
): CharacterBackgroundAbilityScoreIncrease {
  if (value && typeof value === "object") {
    const record = value as Partial<CharacterBackgroundAbilityScoreIncrease>;

    if (
      record.mode === "two-one" &&
      isAbilityScoreIncreaseValidForBackground(entry, {
        mode: "two-one",
        primaryAbility: record.primaryAbility as AbilityKey,
        secondaryAbility: record.secondaryAbility as AbilityKey
      })
    ) {
      return {
        mode: "two-one",
        primaryAbility: record.primaryAbility as AbilityKey,
        secondaryAbility: record.secondaryAbility as AbilityKey
      };
    }

    if (
      record.mode === "one-one-one" &&
      Array.isArray(record.abilities) &&
      isAbilityScoreIncreaseValidForBackground(entry, {
        mode: "one-one-one",
        abilities: record.abilities as [AbilityKey, AbilityKey, AbilityKey]
      })
    ) {
      return {
        mode: "one-one-one",
        abilities: record.abilities as [AbilityKey, AbilityKey, AbilityKey]
      };
    }
  }

  const allowedAbilitySet = new Set<AbilityKey>(entry.abilityScoreOptions);
  const abilityOrder = getPreferredAbilityOrder(context).filter((ability) =>
    allowedAbilitySet.has(ability)
  );
  const [primaryAbility, secondaryAbility] = [
    abilityOrder[0] ?? entry.abilityScoreOptions[0],
    abilityOrder[1] ?? entry.abilityScoreOptions[1]
  ];

  return {
    mode: "two-one",
    primaryAbility,
    secondaryAbility
  };
}

function normalizeCustomBackgroundAbilityScoreIncrease(
  value: unknown,
  context?: BackgroundChoiceContext
): CharacterBackgroundAbilityScoreIncrease {
  if (value && typeof value === "object") {
    const record = value as Partial<CharacterBackgroundAbilityScoreIncrease>;

    if (
      record.mode === "two-one" &&
      isAbilityScoreIncreaseValidForAbilities(abilityKeys, {
        mode: "two-one",
        primaryAbility: record.primaryAbility as AbilityKey,
        secondaryAbility: record.secondaryAbility as AbilityKey
      })
    ) {
      return {
        mode: "two-one",
        primaryAbility: record.primaryAbility as AbilityKey,
        secondaryAbility: record.secondaryAbility as AbilityKey
      };
    }

    if (
      record.mode === "one-one-one" &&
      Array.isArray(record.abilities) &&
      isAbilityScoreIncreaseValidForAbilities(abilityKeys, {
        mode: "one-one-one",
        abilities: record.abilities as [AbilityKey, AbilityKey, AbilityKey]
      })
    ) {
      return {
        mode: "one-one-one",
        abilities: record.abilities as [AbilityKey, AbilityKey, AbilityKey]
      };
    }
  }

  const abilityOrder = getPreferredAbilityOrder(context);

  return {
    mode: "two-one",
    primaryAbility: abilityOrder[0] ?? "STR",
    secondaryAbility: abilityOrder[1] ?? "DEX"
  };
}

function normalizeEquipmentMode(value: unknown): CharacterBackgroundEquipmentMode {
  return typeof value === "string" &&
    backgroundEquipmentModes.has(value as CharacterBackgroundEquipmentMode)
    ? (value as CharacterBackgroundEquipmentMode)
    : "equipment";
}

function getDefaultMagicInitiateChoice(
  spellList: MagicInitiateChoice["spellList"],
  spellcastingAbility: MagicInitiateChoice["spellcastingAbility"]
): MagicInitiateChoice {
  const cantrips = getMagicInitiateCantripOptions(spellList);
  const levelOneSpells = getMagicInitiateLevelOneSpellOptions(spellList);
  const firstCantripId = cantrips[0]?.id ?? "";
  const secondCantripId = cantrips.find((spell) => spell.id !== firstCantripId)?.id ?? "";

  return {
    spellList,
    cantripIds: [firstCantripId, secondCantripId],
    levelOneSpellId: levelOneSpells[0]?.id ?? "",
    spellcastingAbility
  };
}

function getDefaultCrafterTools(): [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY] {
  return [
    TOOL_PROFICIENCY.SMITHS_TOOLKIT,
    TOOL_PROFICIENCY.CARPENTERS_TOOLS,
    TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS
  ].filter((tool) => crafterFastCraftingToolProficiencies.includes(tool)) as [
    TOOL_PROFICIENCY,
    TOOL_PROFICIENCY,
    TOOL_PROFICIENCY
  ];
}

function getDefaultMusicianTools(): [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY] {
  return [
    TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
    ...musicalInstrumentToolProficiencies.filter(
      (tool) => tool !== TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE
    )
  ].slice(0, 3) as [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY];
}

export function isBackgroundEquipmentMode(
  value: string
): value is CharacterBackgroundEquipmentMode {
  return backgroundEquipmentModes.has(value as CharacterBackgroundEquipmentMode);
}

export function getBackgroundEntry(background: string): BackgroundEntry | null {
  return getBackgroundEntryByName(background);
}

export function getBackgroundOptions(): string[] {
  return [...backgroundEntriesByName.keys()].sort(sortBackgroundNames);
}

export function getDefaultBackgroundChoices(
  background: string,
  context?: BackgroundChoiceContext
): CharacterBackgroundChoices | undefined {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return undefined;
  }

  return normalizeBackgroundChoices(background, {}, context);
}

export function normalizeBackgroundChoices(
  background: string,
  value: unknown,
  context?: BackgroundChoiceContext
): CharacterBackgroundChoices | undefined {
  if (isCustomBackgroundName(background)) {
    const record =
      value && typeof value === "object" ? (value as Partial<CharacterBackgroundChoices>) : {};
    const hasLanguageChoices =
      value !== null && typeof value === "object" && "languageProficiencies" in value;

    return {
      abilityScoreIncrease: normalizeCustomBackgroundAbilityScoreIncrease(
        record.abilityScoreIncrease,
        context
      ),
      languageProficiencies: normalizeBackgroundLanguageProficiencies(
        hasLanguageChoices ? record.languageProficiencies : undefined
      )
    };
  }

  const entry = getBackgroundEntry(background);

  if (!entry) {
    return undefined;
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterBackgroundChoices>) : {};
  const hasLanguageChoices =
    value !== null && typeof value === "object" && "languageProficiencies" in value;
  const toolProficiencies = normalizeBackgroundToolProficiencies(
    entry,
    record.toolProficiencies ?? (record.toolProficiency ? [record.toolProficiency] : undefined)
  );
  const toolProficiency = normalizeToolProficiencyChoice(
    entry,
    record.toolProficiency ?? toolProficiencies[0]
  );

  return {
    abilityScoreIncrease: normalizeAbilityScoreIncrease(
      entry,
      record.abilityScoreIncrease,
      context
    ),
    languageProficiencies: normalizeBackgroundLanguageProficiencies(
      hasLanguageChoices ? record.languageProficiencies : undefined
    ),
    skillProficiencies: normalizeBackgroundSkillProficiencies(entry, record.skillProficiencies),
    toolProficiencies,
    toolProficiency,
    equipmentMode: normalizeEquipmentMode(record.equipmentMode)
  };
}

export function getBackgroundSkillProficiencies(
  background: string,
  choices?: CharacterBackgroundChoices
): SkillName[] {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return [];
  }

  return choices?.skillProficiencies?.length === 2
    ? choices.skillProficiencies
    : entry.grantedSkillProficiencies;
}

export function getBackgroundToolProficiencies(
  background: string,
  choices?: CharacterBackgroundChoices
): ToolProficiency[] {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return [];
  }

  return [
    ...new Set([
      ...(choices?.toolProficiencies?.length
        ? choices.toolProficiencies
        : entry.grantedToolProficiencies),
      ...(entry.toolProficiencyChoices?.length && choices?.toolProficiency
        ? [choices.toolProficiency]
        : [])
    ])
  ];
}

export function getBackgroundLanguageProficiencies(
  background: string,
  choices?: CharacterBackgroundChoices
): LANGUAGE_PROFICIENCY[] {
  if (isCustomBackgroundName(background)) {
    return normalizeBackgroundLanguageProficiencies(choices?.languageProficiencies);
  }

  const entry = getBackgroundEntry(background);

  if (!entry) {
    return [];
  }

  return normalizeBackgroundLanguageProficiencies(choices?.languageProficiencies);
}

export function getBackgroundEquipmentChoice(
  background: string,
  choices?: CharacterBackgroundChoices
) {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return null;
  }

  const equipmentIndex = choices?.equipmentMode === "gold" ? 1 : 0;
  return entry.starterPack.startingEquipment[equipmentIndex] ?? null;
}

export function getBackgroundAbilityScoreBonusesForCharacter(
  character: Partial<
    Pick<Character, "background" | "backgroundChoices"> & {
      customBackground?: CharacterCustomBackgroundConfig;
    }
  >
) {
  const entry = getBackgroundEntry(character.background ?? "");
  const isCustomBackground = isCustomBackgroundName(character.background);
  const choices = normalizeBackgroundChoices(
    character.background ?? "",
    character.backgroundChoices
  );
  const abilityScoreIncrease = choices?.abilityScoreIncrease;
  const backgroundLabel = isCustomBackground
    ? getCharacterBackgroundDisplayName({
        background: character.background ?? "",
        customBackground: character.customBackground
      })
    : entry?.name;

  if ((!entry && !isCustomBackground) || !abilityScoreIncrease || !backgroundLabel) {
    return [];
  }

  if (abilityScoreIncrease.mode === "one-one-one") {
    return abilityScoreIncrease.abilities.map((ability, index) => ({
      ability,
      label: `${backgroundLabel} Background`,
      value: 1,
      maxScore: 20,
      order: -100 + index
    }));
  }

  return [
    {
      ability: abilityScoreIncrease.primaryAbility,
      label: `${backgroundLabel} Background`,
      value: 2,
      maxScore: 20,
      order: -101
    },
    {
      ability: abilityScoreIncrease.secondaryAbility,
      label: `${backgroundLabel} Background`,
      value: 1,
      maxScore: 20,
      order: -100
    }
  ];
}

export function createDefaultBackgroundOriginFeatEntry(
  background: string,
  level = 1
): CharacterFeatEntry | null {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return null;
  }

  const source = {
    type: "background" as const,
    background: entry.name
  };

  if (entry.originFeat === FEATS.MAGIC_INITIATE && entry.originFeatSpellList) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      magicInitiate: getDefaultMagicInitiateChoice(
        entry.originFeatSpellList,
        getDefaultMagicInitiateAbility(entry.originFeatSpellList)
      )
    });
  }

  if (entry.originFeat === FEATS.CRAFTER) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      crafter: {
        toolProficiencies: getDefaultCrafterTools()
      }
    });
  }

  if (entry.originFeat === FEATS.MUSICIAN) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      musician: {
        toolProficiencies: getDefaultMusicianTools()
      }
    });
  }

  if (entry.originFeat === FEATS.SKILLED) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      skilled: {
        selections: [
          { kind: "skill", skill: "Acrobatics" },
          { kind: "skill", skill: "Animal Handling" },
          { kind: "skill", skill: "Arcana" }
        ]
      }
    });
  }

  if (entry.originFeat === FEATS.CULT_OF_THE_DRAGON_INITIATE) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      cultOfDragonInitiate: {
        language: getDefaultCultOfDragonInitiateLanguage()
      }
    });
  }

  if (entry.originFeat === FEATS.HARPER_AGENT) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      harperAgent: {
        toolProficiency: getDefaultHarperAgentInstrument()
      }
    });
  }

  if (entry.originFeat === FEATS.PURPLE_DRAGON_ROOK) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      purpleDragonRook: {
        skill: getDefaultPurpleDragonRookSkill()
      }
    });
  }

  if (entry.originFeat === FEATS.SPELLFIRE_SPARK) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      spellfireSpark: {
        spellcastingAbility: getDefaultSpellfireSparkSpellcastingAbility()
      }
    });
  }

  if (entry.originFeat === FEATS.EMERALD_ENCLAVE_FLEDGLING) {
    return createBackgroundFeatEntry(entry, level, {
      source,
      emeraldEnclaveFledgling: {
        spellcastingAbility: "WIS"
      }
    });
  }

  return createBackgroundFeatEntry(entry, level, {
    source
  });
}

function ensureBackgroundFeatChoices(
  entry: CharacterFeatEntry,
  backgroundEntry: BackgroundEntry
): CharacterFeatEntry {
  if (backgroundEntry.originFeat === FEATS.MAGIC_INITIATE && backgroundEntry.originFeatSpellList) {
    return {
      ...entry,
      magicInitiate:
        entry.magicInitiate?.spellList === backgroundEntry.originFeatSpellList
          ? entry.magicInitiate
          : getDefaultMagicInitiateChoice(
              backgroundEntry.originFeatSpellList,
              getDefaultMagicInitiateAbility(backgroundEntry.originFeatSpellList)
            )
    };
  }

  if (backgroundEntry.originFeat === FEATS.CRAFTER && !entry.crafter) {
    return {
      ...entry,
      crafter: {
        toolProficiencies: getDefaultCrafterTools()
      }
    };
  }

  if (backgroundEntry.originFeat === FEATS.MUSICIAN && !entry.musician) {
    return {
      ...entry,
      musician: {
        toolProficiencies: getDefaultMusicianTools()
      }
    };
  }

  if (backgroundEntry.originFeat === FEATS.SKILLED && !entry.skilled) {
    return {
      ...entry,
      skilled: {
        selections: [
          { kind: "skill", skill: "Acrobatics" },
          { kind: "skill", skill: "Animal Handling" },
          { kind: "skill", skill: "Arcana" }
        ]
      }
    };
  }

  if (
    backgroundEntry.originFeat === FEATS.CULT_OF_THE_DRAGON_INITIATE &&
    !entry.cultOfDragonInitiate
  ) {
    return {
      ...entry,
      cultOfDragonInitiate: {
        language: getDefaultCultOfDragonInitiateLanguage()
      }
    };
  }

  if (backgroundEntry.originFeat === FEATS.HARPER_AGENT && !entry.harperAgent) {
    return {
      ...entry,
      harperAgent: {
        toolProficiency: getDefaultHarperAgentInstrument()
      }
    };
  }

  if (backgroundEntry.originFeat === FEATS.PURPLE_DRAGON_ROOK && !entry.purpleDragonRook) {
    return {
      ...entry,
      purpleDragonRook: {
        skill: getDefaultPurpleDragonRookSkill()
      }
    };
  }

  if (backgroundEntry.originFeat === FEATS.SPELLFIRE_SPARK && !entry.spellfireSpark) {
    return {
      ...entry,
      spellfireSpark: {
        spellcastingAbility: getDefaultSpellfireSparkSpellcastingAbility()
      }
    };
  }

  if (
    backgroundEntry.originFeat === FEATS.EMERALD_ENCLAVE_FLEDGLING &&
    !entry.emeraldEnclaveFledgling
  ) {
    return {
      ...entry,
      emeraldEnclaveFledgling: {
        spellcastingAbility: "WIS"
      }
    };
  }

  return entry;
}

export function reconcileBackgroundOriginFeatEntries(
  feats: CharacterFeatEntry[],
  background: string,
  level = 1
): CharacterFeatEntry[] {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return feats.filter((featEntry) => featEntry.source?.type !== "background");
  }

  const nonBackgroundFeats = feats.filter((featEntry) => featEntry.source?.type !== "background");
  const existingBackgroundFeat = feats.find(
    (featEntry) =>
      featEntry.source?.type === "background" &&
      featEntry.source.background === entry.name &&
      featEntry.feat === entry.originFeat
  );
  const nextBackgroundFeat = existingBackgroundFeat
    ? ensureBackgroundFeatChoices(existingBackgroundFeat, entry)
    : createDefaultBackgroundOriginFeatEntry(entry.name, level);

  return nextBackgroundFeat ? [...nonBackgroundFeats, nextBackgroundFeat] : nonBackgroundFeats;
}

export function getBackgroundToolChoiceOptions(background: string): ToolProficiency[] {
  return getBackgroundEntry(background)?.toolProficiencyChoices ?? [];
}

export function getDefaultBackgroundGamingSet(): TOOL_PROFICIENCY {
  return gamingSetToolProficiencies.includes(TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS)
    ? TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS
    : gamingSetToolProficiencies[0];
}
