import type {
  AbilityKey,
  AbilityScores,
  Alignment,
  AttributeMode,
  CharacterArmorClassFormulaSelection,
  CharacterBackgroundChoices,
  CharacterCustomBackgroundConfig,
  CharacterCustomAction,
  CharacterCustomSpellSnapshot,
  CharacterCompanion,
  CharacterCurrencies,
  CharacterClassRulesConfig,
  CharacterCustomClassConfig,
  CharacterCustomSpeciesConfig,
  CharacterCustomSubclassConfig,
  CharacterAvatarMetadata,
  CharacterBackgroundTextureMetadata,
  CharacterDeathSaves,
  CharacterInventoryItem,
  CharacterRoundTracker,
  CharacterSpeciesChoices,
  CharacterSpeciesFeatureState,
  CharacterSyncMetadata
} from "./characters";
import type { CharacterClassFeatureState } from "./classFeatures";
import type { CharacterFeatEntry } from "./feats";
import type {
  ArmorProficiencyEntry,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "./proficiencies";
import type { CharacterStatusEntry } from "./traits";

export const PORTABLE_CHARACTER_SHEET_SCHEMA_VERSION = 2;

export type PortableCharacterSheetIdentity = {
  localId: number;
  name: string;
  alignment: Alignment;
};

export type PortableCharacterSheetOrigin = {
  species: string;
  speciesChoices?: CharacterSpeciesChoices;
  customSpecies?: CharacterCustomSpeciesConfig;
  background: string;
  backgroundChoices?: CharacterBackgroundChoices;
  customBackground?: CharacterCustomBackgroundConfig;
  backgroundNotes: string;
};

export type PortableCharacterSheetProgression = {
  className: string;
  subclassId?: string;
  customSubclass?: CharacterCustomSubclassConfig;
  classRules?: CharacterClassRulesConfig;
  customClass?: CharacterCustomClassConfig;
  level: number;
  xp: number;
};

export type PortableCharacterSheetAbilities = {
  attributeMode: AttributeMode;
  scores: AbilityScores;
};

export type PortableCharacterSheetVitals = {
  maxHitPointsMode?: "automatic" | "custom";
  hitPoints: number;
  currentHitPoints: number;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  hitDiceRemaining?: number;
  deathSaves?: CharacterDeathSaves;
};

export type PortableCharacterSheetResources = {
  heroicInspiration: boolean;
  shortRestsUsedToday?: number;
};

export type PortableCharacterSheetSpellcasting = {
  cantripIds?: string[];
  spellbookSpellIds?: string[];
  preparedSpellIds?: string[];
  customSpellSnapshots?: CharacterCustomSpellSnapshot[];
  spellSlotsExpended?: number[];
};

export type PortableCharacterSheetFeatures = {
  speciesFeatureState?: CharacterSpeciesFeatureState;
  classFeatureState?: CharacterClassFeatureState;
  customActions?: CharacterCustomAction[];
  feats?: CharacterFeatEntry[];
};

export type PortableCharacterSheetProficiencies = {
  skillProficiencies?: SkillProficiencyEntry[];
  savingThrowProficiencies?: SavingThrowProficiencyEntry[];
  weaponProficiencies?: WeaponProficiencyEntry[];
  armorProficiencies?: ArmorProficiencyEntry[];
  toolProficiencies?: ToolProficiencyEntry[];
  languageProficiencies?: LanguageProficiencyEntry[];
};

export type PortableCharacterSheetInventory = {
  currencies: CharacterCurrencies;
  items: CharacterInventoryItem[];
};

export type PortableCharacterSheetCompanions = {
  entries: CharacterCompanion[];
};

export type PortableCharacterSheetSession = {
  roundTracker?: CharacterRoundTracker;
  statusEntries?: CharacterStatusEntry[];
};

export type PortableCharacterSheetPreferences = {
  armorClassFormulaSelection?: CharacterArmorClassFormulaSelection;
  hover?: boolean;
};

export type PortableCharacterSheetMetadata = {
  sheetSizeBytes: number;
  sync?: CharacterSyncMetadata;
  avatar?: CharacterAvatarMetadata;
  backgroundTexture?: CharacterBackgroundTextureMetadata;
};

export type PortableEncounterStatBlockAbility = {
  score: number;
  modifier: number;
  save: number;
};

export type PortableEncounterStatBlock = {
  version: 1;
  name: string;
  typeLabel: string;
  alignment: Alignment;
  level: number;
  className: string;
  species: string;
  armorClass: number;
  initiative: string;
  speed: string;
  proficiencyBonus: number;
  hitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
  deathSaves?: CharacterDeathSaves;
  immunities: string[];
  conditionImmunities?: string[];
  resistances: string[];
  vulnerabilities: string[];
  senses: string[];
  passivePerception: number;
  languages: string[];
  skills?: Record<string, number>;
  abilities: Record<AbilityKey, PortableEncounterStatBlockAbility>;
  featureTraits: string[];
  reactions: string[];
  generatedAt: string;
  sourceLocalRevision?: number;
  sourceRemoteRevision?: number;
};

export type PortableEncounterCompanionSummary = Pick<
  CharacterCompanion,
  | "id"
  | "name"
  | "description"
  | "type"
  | "separateInitiative"
  | "maxHitPoints"
  | "currentHitPoints"
  | "temporaryHitPoints"
  | "temporaryHitPointsSource"
  | "deathSaves"
  | "inheritedCreatureEntry"
  | "inheritedCreatureEntryModified"
>;

export type PortableCharacterSheetSummary = {
  localId: number;
  name: string;
  species: string;
  className: string;
  subclassId?: string | null;
  level: number;
  background: string;
  sheetSizeBytes?: number;
  encounterStatBlock?: PortableEncounterStatBlock;
  companions?: PortableEncounterCompanionSummary[];
};

export type PortableCharacterSheet = {
  schemaVersion: typeof PORTABLE_CHARACTER_SHEET_SCHEMA_VERSION;
  identity: PortableCharacterSheetIdentity;
  origin: PortableCharacterSheetOrigin;
  progression: PortableCharacterSheetProgression;
  abilities: PortableCharacterSheetAbilities;
  vitals: PortableCharacterSheetVitals;
  resources: PortableCharacterSheetResources;
  spellcasting: PortableCharacterSheetSpellcasting;
  features: PortableCharacterSheetFeatures;
  proficiencies: PortableCharacterSheetProficiencies;
  inventory: PortableCharacterSheetInventory;
  companions: PortableCharacterSheetCompanions;
  session: PortableCharacterSheetSession;
  preferences: PortableCharacterSheetPreferences;
  summary: PortableCharacterSheetSummary;
  metadata?: PortableCharacterSheetMetadata;
};
