import type {
  AbilityScores,
  Alignment,
  AttributeMode,
  CharacterArmorClassFormulaSelection,
  CharacterBackgroundChoices,
  CharacterCompanion,
  CharacterCurrencies,
  CharacterCustomClassConfig,
  CharacterAvatarMetadata,
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
  background: string;
  backgroundChoices?: CharacterBackgroundChoices;
  backgroundNotes: string;
};

export type PortableCharacterSheetProgression = {
  className: string;
  subclassId?: string;
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
  spellSlotsExpended?: number[];
};

export type PortableCharacterSheetFeatures = {
  speciesFeatureState?: CharacterSpeciesFeatureState;
  classFeatureState?: CharacterClassFeatureState;
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
};

export type PortableCharacterSheetSummary = {
  localId: number;
  name: string;
  species: string;
  className: string;
  subclassId?: string | null;
  level: number;
  background: string;
  sheetSizeBytes?: number;
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
