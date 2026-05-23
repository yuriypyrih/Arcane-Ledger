import type {
  AbilityScores,
  Alignment,
  AttributeMode,
  CharacterArmorClassFormulaSelection,
  CharacterBackgroundChoices,
  CharacterCompanion,
  CharacterCurrencies,
  CharacterCustomClassConfig,
  CharacterDeathSaves,
  CharacterInventoryItem,
  CharacterRoundTracker,
  CharacterSpeciesChoices,
  CharacterSpeciesFeatureState
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

export const CHARACTER_SHEET_RECORD_SCHEMA_VERSION = 2;

export type CharacterSheetRecordV2Identity = {
  localId: number;
  name: string;
  alignment: Alignment;
};

export type CharacterSheetRecordV2Origin = {
  species: string;
  speciesChoices?: CharacterSpeciesChoices;
  background: string;
  backgroundChoices?: CharacterBackgroundChoices;
  backgroundNotes: string;
};

export type CharacterSheetRecordV2Progression = {
  className: string;
  subclassId?: string;
  customClass?: CharacterCustomClassConfig;
  level: number;
  xp: number;
};

export type CharacterSheetRecordV2Abilities = {
  attributeMode: AttributeMode;
  scores: AbilityScores;
};

export type CharacterSheetRecordV2Vitals = {
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

export type CharacterSheetRecordV2Resources = {
  heroicInspiration: boolean;
  shortRestsUsedToday?: number;
};

export type CharacterSheetRecordV2Spellcasting = {
  cantripIds?: string[];
  spellbookSpellIds?: string[];
  preparedSpellIds?: string[];
  spellSlotsExpended?: number[];
};

export type CharacterSheetRecordV2Features = {
  speciesFeatureState?: CharacterSpeciesFeatureState;
  classFeatureState?: CharacterClassFeatureState;
  feats?: CharacterFeatEntry[];
};

export type CharacterSheetRecordV2Proficiencies = {
  skillProficiencies?: SkillProficiencyEntry[];
  savingThrowProficiencies?: SavingThrowProficiencyEntry[];
  weaponProficiencies?: WeaponProficiencyEntry[];
  armorProficiencies?: ArmorProficiencyEntry[];
  toolProficiencies?: ToolProficiencyEntry[];
  languageProficiencies?: LanguageProficiencyEntry[];
};

export type CharacterSheetRecordV2Inventory = {
  currencies: CharacterCurrencies;
  items: CharacterInventoryItem[];
};

export type CharacterSheetRecordV2Companions = {
  entries: CharacterCompanion[];
};

export type CharacterSheetRecordV2Session = {
  roundTracker?: CharacterRoundTracker;
  statusEntries?: CharacterStatusEntry[];
};

export type CharacterSheetRecordV2Preferences = {
  armorClassFormulaSelection?: CharacterArmorClassFormulaSelection;
  hover?: boolean;
};

export type CharacterSheetRecordV2Metadata = {
  sheetSizeBytes: number;
};

export type CharacterSheetRecordV2Summary = {
  localId: number;
  name: string;
  species: string;
  className: string;
  subclassId?: string;
  level: number;
  background: string;
  sheetSizeBytes?: number;
};

export type CharacterSheetRecordV2 = {
  schemaVersion: typeof CHARACTER_SHEET_RECORD_SCHEMA_VERSION;
  identity: CharacterSheetRecordV2Identity;
  origin: CharacterSheetRecordV2Origin;
  progression: CharacterSheetRecordV2Progression;
  abilities: CharacterSheetRecordV2Abilities;
  vitals: CharacterSheetRecordV2Vitals;
  resources: CharacterSheetRecordV2Resources;
  spellcasting: CharacterSheetRecordV2Spellcasting;
  features: CharacterSheetRecordV2Features;
  proficiencies: CharacterSheetRecordV2Proficiencies;
  inventory: CharacterSheetRecordV2Inventory;
  companions: CharacterSheetRecordV2Companions;
  session: CharacterSheetRecordV2Session;
  preferences: CharacterSheetRecordV2Preferences;
  summary: CharacterSheetRecordV2Summary;
  metadata?: CharacterSheetRecordV2Metadata;
};
