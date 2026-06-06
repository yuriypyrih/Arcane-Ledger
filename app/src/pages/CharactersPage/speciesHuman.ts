import {
  FEAT_CATEGORY,
  FEATS,
  SPELL_LIST_CLASS,
  getSpeciesEntryByName,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  ALL_SKILLS,
  TOOL_PROFICIENCY,
  isSkillName,
  type Character,
  type CharacterFeatEntry,
  type CharacterSpeciesChoices,
  type MagicInitiateChoice,
  type SkillName
} from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import {
  createCharacterFeatEntry,
  getFeatDefinition,
  getFeatDefinitionsByCategory,
  getMagicInitiateCantripOptions,
  getMagicInitiateLevelOneSpellOptions,
  type FeatDefinition
} from "./feats";
import { getDefaultCultOfDragonInitiateLanguage } from "./feats/cultOfDragonInitiate";
import { crafterFastCraftingToolProficiencies } from "./feats/crafter";
import { getDefaultHarperAgentInstrument } from "./feats/harperAgent";
import { getDefaultPurpleDragonRookSkill } from "./feats/purpleDragonRook";
import { getDefaultSpellfireSparkSpellcastingAbility } from "./feats/spellfireSpark";
import { restoreHeroicInspirationForCharacter } from "./heroicInspiration";
import { musicalInstrumentToolProficiencies } from "./proficiencyOptions";

type HumanRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices">>;

type CharacterFeatEntryOptions = NonNullable<Parameters<typeof createCharacterFeatEntry>[2]>;

const humanSpeciesId = "species-human-2024";
const humanDefaultSkillProficiency: SkillName = "Perception";
const humanDefaultOriginFeat = FEATS.ALERT;
const humanOriginFeatSourceSpecies = "Human";
const humanOriginFeatDefinitions = getFeatDefinitionsByCategory()[FEAT_CATEGORY.ORIGIN];
const humanOriginFeatSet = new Set<FEATS>(humanOriginFeatDefinitions.map((entry) => entry.feat));
const humanOriginFeatAliasMap = new Map<string, FEATS>();

humanOriginFeatDefinitions.forEach((definition) => {
  humanOriginFeatAliasMap.set(definition.feat, definition.feat);
  humanOriginFeatAliasMap.set(definition.label.toLowerCase(), definition.feat);
});

function getHumanEntry(species = "Human"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === humanSpeciesId ? entry : null;
}

function getHumanDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getHumanEntry()?.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );

  if (!description) {
    return [];
  }

  const startIndex = description.findIndex((descriptionEntry) =>
    descriptionEntry.includes(`<strong>${heading}.`)
  );

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const descriptionEntry = description[index]!;

    if (index > startIndex && descriptionEntry.startsWith("<strong>")) {
      break;
    }

    section.push(descriptionEntry);
  }

  return section;
}

function getResourcefulDescription(): SpellDescriptionEntry[] {
  const description = getHumanDescriptionSection("Resourceful");

  return description.length > 0
    ? description
    : [
        "<strong>Resourceful.</strong> You gain Heroic Inspiration whenever you finish a Long Rest."
      ];
}

function getHumanOriginFeatEntryId(feat: FEATS): string {
  return `species-human-${feat.toLowerCase().replace(/_/g, "-")}`;
}

function getDefaultMagicInitiateChoice(): MagicInitiateChoice {
  const spellList = SPELL_LIST_CLASS.WIZARD;
  const cantrips = getMagicInitiateCantripOptions(spellList);
  const levelOneSpells = getMagicInitiateLevelOneSpellOptions(spellList);
  const firstCantripId = cantrips[0]?.id ?? "";
  const secondCantripId = cantrips.find((spell) => spell.id !== firstCantripId)?.id ?? "";

  return {
    spellList,
    cantripIds: [firstCantripId, secondCantripId],
    levelOneSpellId: levelOneSpells[0]?.id ?? "",
    spellcastingAbility: "INT"
  };
}

function getDefaultCrafterTools(): [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY] {
  const preferredTools = [
    TOOL_PROFICIENCY.SMITHS_TOOLKIT,
    TOOL_PROFICIENCY.CARPENTERS_TOOLS,
    TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS,
    ...crafterFastCraftingToolProficiencies
  ].filter((tool, index, tools) => tools.indexOf(tool) === index);

  return [
    preferredTools[0] ?? TOOL_PROFICIENCY.SMITHS_TOOLKIT,
    preferredTools[1] ?? TOOL_PROFICIENCY.CARPENTERS_TOOLS,
    preferredTools[2] ?? TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS
  ];
}

function getDefaultMusicianTools(): [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY] {
  const preferredTools = [
    TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
    ...musicalInstrumentToolProficiencies
  ].filter((tool, index, tools) => tools.indexOf(tool) === index);

  return [
    preferredTools[0] ?? TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
    preferredTools[1] ?? TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE,
    preferredTools[2] ?? TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DRUM
  ];
}

function getHumanOriginFeatChoiceOptions(feat: FEATS): CharacterFeatEntryOptions {
  if (feat === FEATS.MAGIC_INITIATE) {
    return {
      magicInitiate: getDefaultMagicInitiateChoice()
    };
  }

  if (feat === FEATS.CRAFTER) {
    return {
      crafter: {
        toolProficiencies: getDefaultCrafterTools()
      }
    };
  }

  if (feat === FEATS.MUSICIAN) {
    return {
      musician: {
        toolProficiencies: getDefaultMusicianTools()
      }
    };
  }

  if (feat === FEATS.SKILLED) {
    return {
      skilled: {
        selections: [
          { kind: "skill", skill: "Acrobatics" },
          { kind: "skill", skill: "Animal Handling" },
          { kind: "skill", skill: "Arcana" }
        ]
      }
    };
  }

  if (feat === FEATS.CULT_OF_THE_DRAGON_INITIATE) {
    return {
      cultOfDragonInitiate: {
        language: getDefaultCultOfDragonInitiateLanguage()
      }
    };
  }

  if (feat === FEATS.HARPER_AGENT) {
    return {
      harperAgent: {
        toolProficiency: getDefaultHarperAgentInstrument()
      }
    };
  }

  if (feat === FEATS.PURPLE_DRAGON_ROOK) {
    return {
      purpleDragonRook: {
        skill: getDefaultPurpleDragonRookSkill()
      }
    };
  }

  if (feat === FEATS.SPELLFIRE_SPARK) {
    return {
      spellfireSpark: {
        spellcastingAbility: getDefaultSpellfireSparkSpellcastingAbility()
      }
    };
  }

  if (feat === FEATS.EMERALD_ENCLAVE_FLEDGLING) {
    return {
      emeraldEnclaveFledgling: {
        spellcastingAbility: "WIS"
      }
    };
  }

  return {};
}

function createHumanOriginFeatEntry(feat: FEATS, level: number): CharacterFeatEntry {
  return {
    ...createCharacterFeatEntry(feat, level, {
      source: {
        type: "species",
        species: humanOriginFeatSourceSpecies
      },
      ...getHumanOriginFeatChoiceOptions(feat)
    }),
    id: getHumanOriginFeatEntryId(feat)
  };
}

function ensureHumanOriginFeatChoices(entry: CharacterFeatEntry): CharacterFeatEntry {
  if (entry.feat === FEATS.MAGIC_INITIATE && !entry.magicInitiate) {
    return {
      ...entry,
      magicInitiate: getDefaultMagicInitiateChoice()
    };
  }

  if (entry.feat === FEATS.CRAFTER && !entry.crafter) {
    return {
      ...entry,
      crafter: {
        toolProficiencies: getDefaultCrafterTools()
      }
    };
  }

  if (entry.feat === FEATS.MUSICIAN && !entry.musician) {
    return {
      ...entry,
      musician: {
        toolProficiencies: getDefaultMusicianTools()
      }
    };
  }

  if (entry.feat === FEATS.SKILLED && !entry.skilled) {
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

  if (entry.feat === FEATS.CULT_OF_THE_DRAGON_INITIATE && !entry.cultOfDragonInitiate) {
    return {
      ...entry,
      cultOfDragonInitiate: {
        language: getDefaultCultOfDragonInitiateLanguage()
      }
    };
  }

  if (entry.feat === FEATS.HARPER_AGENT && !entry.harperAgent) {
    return {
      ...entry,
      harperAgent: {
        toolProficiency: getDefaultHarperAgentInstrument()
      }
    };
  }

  if (entry.feat === FEATS.PURPLE_DRAGON_ROOK && !entry.purpleDragonRook) {
    return {
      ...entry,
      purpleDragonRook: {
        skill: getDefaultPurpleDragonRookSkill()
      }
    };
  }

  if (entry.feat === FEATS.SPELLFIRE_SPARK && !entry.spellfireSpark) {
    return {
      ...entry,
      spellfireSpark: {
        spellcastingAbility: getDefaultSpellfireSparkSpellcastingAbility()
      }
    };
  }

  if (entry.feat === FEATS.EMERALD_ENCLAVE_FLEDGLING && !entry.emeraldEnclaveFledgling) {
    return {
      ...entry,
      emeraldEnclaveFledgling: {
        spellcastingAbility: "WIS"
      }
    };
  }

  return entry;
}

function isHumanOriginFeatEntry(entry: CharacterFeatEntry): boolean {
  return entry.source.type === "species" && entry.source.species === humanOriginFeatSourceSpecies;
}

export function isHumanSpecies(species: string): boolean {
  return getHumanEntry(species) !== null;
}

export function normalizeHumanSkillProficiency(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

export function normalizeHumanOriginFeat(value: unknown): FEATS | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const directFeat = value.trim() as FEATS;

  if (humanOriginFeatSet.has(directFeat)) {
    return directFeat;
  }

  return humanOriginFeatAliasMap.get(value.trim().toLowerCase());
}

export function getDefaultHumanSkillProficiencyForSpecies(species: string): SkillName | undefined {
  return isHumanSpecies(species) ? humanDefaultSkillProficiency : undefined;
}

export function getDefaultHumanOriginFeatForSpecies(species: string): FEATS | undefined {
  return isHumanSpecies(species) ? humanDefaultOriginFeat : undefined;
}

export function getHumanSkillOptionsForSpecies(species: string): SkillName[] {
  return isHumanSpecies(species) ? [...ALL_SKILLS] : [];
}

export function getHumanOriginFeatOptionsForSpecies(species: string): FeatDefinition[] {
  return isHumanSpecies(species) ? [...humanOriginFeatDefinitions] : [];
}

export function formatHumanOriginFeatOptionLabel(option: Pick<FeatDefinition, "label">): string {
  return option.label;
}

export function getHumanSkillProficiencyForCharacter(
  character: HumanRuntimeCharacter
): SkillName | null {
  if (!isHumanSpecies(character.species)) {
    return null;
  }

  return normalizeHumanSkillProficiency(character.speciesChoices?.humanSkillProficiency) ?? null;
}

export function getHumanOriginFeatForCharacter(character: HumanRuntimeCharacter): FEATS | null {
  if (!isHumanSpecies(character.species)) {
    return null;
  }

  return normalizeHumanOriginFeat(character.speciesChoices?.humanOriginFeat) ?? null;
}

export function getHumanResourcefulDescriptionEntriesForCharacter(
  character: Pick<Character, "species">
): SpellDescriptionEntry[] {
  return isHumanSpecies(character.species)
    ? createSourcedDescriptionEntries("Human: Resourceful", getResourcefulDescription())
    : [];
}

export function restoreHumanResourcefulHeroicInspirationOnLongRest(
  character: Character
): Character {
  if (!isHumanSpecies(character.species) || character.heroicInspiration) {
    return character;
  }

  return restoreHeroicInspirationForCharacter(character);
}

export function reconcileHumanOriginFeatEntries(
  feats: CharacterFeatEntry[],
  species: string,
  speciesChoices: CharacterSpeciesChoices | undefined,
  level = 1
): CharacterFeatEntry[] {
  const nonHumanSpeciesFeats = feats.filter((entry) => !isHumanOriginFeatEntry(entry));

  if (!isHumanSpecies(species)) {
    return nonHumanSpeciesFeats;
  }

  const feat = getHumanOriginFeatForCharacter({ species, speciesChoices });

  if (!feat || !getFeatDefinition(feat)) {
    return nonHumanSpeciesFeats;
  }

  const existingHumanFeat = feats.find(isHumanOriginFeatEntry);
  const nextHumanFeat =
    existingHumanFeat?.feat === feat
      ? ensureHumanOriginFeatChoices({
          ...existingHumanFeat,
          source: {
            type: "species",
            species: humanOriginFeatSourceSpecies
          }
        })
      : createHumanOriginFeatEntry(feat, level);

  return [...nonHumanSpeciesFeats, nextHumanFeat];
}
