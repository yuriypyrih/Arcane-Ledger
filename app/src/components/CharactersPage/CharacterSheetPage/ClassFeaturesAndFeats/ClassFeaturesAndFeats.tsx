import clsx from "clsx";
import { BadgeAlert, BadgeCheck, BadgeX, ChevronDown, Pencil, Plus, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  FEAT_CATEGORY,
  FEATS,
  FeatureMap,
  KeywordTooltip,
  getDivinityEntryByName,
  getFeatureTrackingState,
  hardcodedCodexEntries,
  type ClassEntry,
  type DivinityEntry,
  type FeatureMapEntry,
  type KeywordTooltipEntry,
  type SpellEntry
} from "../../../../codex/entries";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import SelectInput from "../../FormInputs/SelectInput";
import { PROF_LEVEL } from "../../../../types";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import {
  getBardExpertiseSelectionsForCharacter,
  getClericBlessedStrikesChoiceForCharacter,
  getClericDivineOrderChoiceForCharacter,
  getDruidPrimalOrderChoiceForCharacter,
  getWeaponMasteryOptionsForCharacter,
  getWeaponMasterySelectionCountForCharacter,
  getWeaponMasterySelectionsForCharacter,
  setBardExpertiseSelectionsForCharacter,
  setClericBlessedStrikesChoiceForCharacter,
  setClericDivineOrderChoiceForCharacter,
  setDruidPrimalOrderChoiceForCharacter,
  setWeaponMasterySelectionsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  createCharacterFeatEntry,
  getAbilityScoreImprovementSummary,
  getCharacterFeatSummary,
  getCharacterFeatSourceLabel,
  getEpicBoonAbilityChoiceSummary,
  getEpicBoonAbilityOptions,
  getFeatCategoryLabel,
  getFeatDefinition,
  getFeatDefinitionsByCategory,
  getSkilledChoiceSummary
} from "../../../../pages/CharactersPage/feats";
import {
  getKeywordDescription
} from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  addFeatGrantedSkillEntries,
  addFeatGrantedToolEntries,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  getToolProficiencyLabel,
  getWeaponProficiencyLabel,
  normalizeCharacterProficiencies,
  removeFeatGrantedSkillEntries,
  removeFeatGrantedToolEntries,
  skillsOptions,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiency";
import {
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  AbilityKey,
  Character,
  CharacterFeatEntry,
  CharacterFeatSource,
  SkillName,
  SkilledChoice,
  SkilledFeatSelection,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import InlineToggleButton from "../InlineToggleButton";
import styles from "./ClassFeaturesAndFeats.module.css";

type ClassFeaturesAndFeatsProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type FeatureRow = {
  key: string;
  level: number;
  feature: CLASS_FEATURE;
  details: FeatureMapEntry;
};

type SelectedKeyword = {
  key: string;
  title: string;
  description: string[];
};

type SelectedFeatReference = {
  entry?: CharacterFeatEntry;
  feat: FEATS;
};

type SelectedSpellReference = SpellEntry;
type SelectedDivinityReference = DivinityEntry;

type PendingAbilityScoreImprovement = {
  mode: "single" | "split";
  primaryAbility: AbilityKey;
  secondaryAbility: AbilityKey;
};

type PendingBoonOfIrresistibleOffense = {
  ability: "STR" | "DEX";
};

type PendingEpicBoonAbilityChoice = {
  feat: FEATS;
  ability: AbilityKey;
};

type PendingSkilledChoice = {
  selections: [string, string, string];
};

type FeatEditorContext =
  | {
      mode: "general";
    }
  | {
      mode: "class-feature";
      source: CharacterFeatSource & {
        type: "class-feature";
      };
    };

const trackingBadgeConfig = {
  tracked: {
    label: "Tracked",
    icon: BadgeCheck,
    className: "featureTrackingButtonTracked"
  },
  "semi-tracked": {
    label: "Semi Tracked",
    icon: BadgeAlert,
    className: "featureTrackingButtonSemiTracked"
  },
  "not-tracked": {
    label: "Not Tracked",
    icon: BadgeX,
    className: "featureTrackingButtonNotTracked"
  }
} as const;

const featCategoryTabs: FEAT_CATEGORY[] = [
  FEAT_CATEGORY.ORIGIN,
  FEAT_CATEGORY.GENERAL,
  FEAT_CATEGORY.FIGHTING_STYLE,
  FEAT_CATEGORY.EPIC_BOON
];
const skilledSelectionIndices = [0, 1, 2] as const;
const skilledSkillOptionSet = new Set<string>(skillsOptions);
const skilledToolOptionSet = new Set<string>(toolProficiencyOptions);
const skilledNoneOptionValue = "none";

const classEntriesByName = new Map<string, ClassEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is ClassEntry => entry.category === ENTRY_CATEGORIES.CLASSES)
    .map((entry) => [entry.name, entry])
);
const spellEntriesByName = new Map<string, SpellEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is SpellEntry => entry.category === ENTRY_CATEGORIES.SPELLS)
    .map((entry) => [entry.name.toLowerCase(), entry])
);

const inlineMarkupPattern =
  /<strong>(.*?)<\/strong>|<link:([^>]+)>(.*?)<\/link>|<spell:([^>]+)>(.*?)<\/spell>|<divinity:([^>]+)>(.*?)<\/divinity>/g;
function createDefaultPendingAbilityScoreImprovement(): PendingAbilityScoreImprovement {
  return {
    mode: "single",
    primaryAbility: "STR",
    secondaryAbility: "DEX"
  };
}

function createDefaultPendingBoonOfIrresistibleOffense(): PendingBoonOfIrresistibleOffense {
  return {
    ability: "STR"
  };
}

function createDefaultPendingEpicBoonAbilityChoice(
  feat: FEATS
): PendingEpicBoonAbilityChoice | null {
  const abilityOptions = getEpicBoonAbilityOptions(feat);

  if (!abilityOptions || abilityOptions.length === 0) {
    return null;
  }

  return {
    feat,
    ability: abilityOptions[0]
  };
}

function decodeSkilledSelection(value: string): SkilledFeatSelection | null {
  if (value === skilledNoneOptionValue) {
    return null;
  }

  if (value.startsWith("skill:")) {
    const skill = value.slice("skill:".length) as SkillName;

    if (skilledSkillOptionSet.has(skill)) {
      return {
        kind: "skill",
        skill
      };
    }

    return null;
  }

  if (value.startsWith("tool:")) {
    const tool = value.slice("tool:".length) as ToolProficiency;

    if (skilledToolOptionSet.has(tool)) {
      return {
        kind: "tool",
        tool
      };
    }
  }

  return null;
}

function decodePendingSkilledChoice(choice: PendingSkilledChoice): SkilledChoice | null {
  const selections = choice.selections
    .map((selection) => decodeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return null;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

function createDefaultPendingSkilledChoice(): PendingSkilledChoice {
  return {
    selections: [skilledNoneOptionValue, skilledNoneOptionValue, skilledNoneOptionValue]
  };
}

function isFeatChoiceFeature(feature: CLASS_FEATURE): boolean {
  return (
    feature === CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT ||
    feature === CLASS_FEATURE.EPIC_BOON ||
    feature === CLASS_FEATURE.FIGHTING_STYLE
  );
}

function getBardExpertiseTierForLevel(level: number): "level2" | "level9" | null {
  if (level === 2) {
    return "level2";
  }

  if (level === 9) {
    return "level9";
  }

  return null;
}

function getDefaultFeatCategoryForFeature(feature: CLASS_FEATURE): FEAT_CATEGORY {
  if (feature === CLASS_FEATURE.FIGHTING_STYLE) {
    return FEAT_CATEGORY.FIGHTING_STYLE;
  }

  if (feature === CLASS_FEATURE.EPIC_BOON) {
    return FEAT_CATEGORY.EPIC_BOON;
  }

  return FEAT_CATEGORY.GENERAL;
}

function createClassFeatureFeatSource(level: number, feature: CLASS_FEATURE): CharacterFeatSource & {
  type: "class-feature";
} {
  return {
    type: "class-feature",
    level,
    feature
  };
}

function isFeatFromClassFeatureSource(
  entry: CharacterFeatEntry,
  level: number,
  feature: CLASS_FEATURE
): boolean {
  return (
    entry.source.type === "class-feature" &&
    entry.source.level === level &&
    entry.source.feature === feature
  );
}

function isPendingSkilledChoiceValid(choice: PendingSkilledChoice): boolean {
  return new Set(choice.selections).size === choice.selections.length && decodePendingSkilledChoice(choice) !== null;
}

function getPendingSkilledChoiceSummary(choice: PendingSkilledChoice): string | null {
  return getSkilledChoiceSummary(decodePendingSkilledChoice(choice) ?? undefined);
}

function splitSkilledSelections(choice?: SkilledChoice): {
  skills: SkillName[];
  tools: ToolProficiency[];
} {
  return (choice?.selections ?? []).reduce<{
    skills: SkillName[];
    tools: ToolProficiency[];
  }>(
    (result, selection) => {
      if (selection.kind === "skill") {
        result.skills.push(selection.skill);
      } else {
        result.tools.push(selection.tool);
      }

      return result;
    },
    {
      skills: [],
      tools: []
    }
  );
}

function resolveKeywordReference(
  keywordKey: string,
  fallbackTitle?: string
): KeywordTooltipEntry | null {
  const tooltip = KeywordTooltip[keywordKey];

  if (tooltip) {
    return tooltip;
  }

  const description = getKeywordDescription(keywordKey);

  if (!description) {
    return null;
  }

  return {
    title: fallbackTitle ?? keywordKey,
    description: [description]
  };
}

function renderDescriptionLine(
  line: string,
  onOpenKeyword: (keywordKey: string, title?: string) => void,
  onOpenFeat: (feat: FEATS) => void,
  onOpenSpell: (spell: SpellEntry) => void,
  onOpenDivinity: (divinity: DivinityEntry) => void
): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(inlineMarkupPattern)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(line.slice(cursor, index));
    }

    if (match[1]) {
      nodes.push(<strong key={`${match[1]}-${index}`}>{match[1]}</strong>);
    }

    if (match[2]) {
      const keywordKey = match[2];
      const label = match[3] ?? keywordKey;
      const resolvedKeyword = resolveKeywordReference(keywordKey, label);

      nodes.push(
        resolvedKeyword ? (
          <button
            key={`${keywordKey}-${index}`}
            type="button"
            className={styles.keywordButton}
            onClick={() => onOpenKeyword(keywordKey, label)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    if (match[4]) {
      const spell = spellEntriesByName.get(match[4].trim().toLowerCase());
      const label = match[5] ?? match[4];

      nodes.push(
        spell ? (
          <button
            key={`${spell.id}-${index}`}
            type="button"
            className={styles.keywordButton}
            onClick={() => onOpenSpell(spell)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    if (match[6]) {
      const divinity = getDivinityEntryByName(match[6]);
      const label = match[7] ?? match[6];

      nodes.push(
        divinity ? (
          <button
            key={`${divinity.id}-${index}`}
            type="button"
            className={styles.keywordButton}
            onClick={() => onOpenDivinity(divinity)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    cursor = index + match[0].length;
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  return nodes.length > 0 ? nodes : line;
}

function ClassFeaturesAndFeats({ className, onPersistCharacter }: ClassFeaturesAndFeatsProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFutureFeaturesVisible, setIsFutureFeaturesVisible] = useState(false);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [featEditorContext, setFeatEditorContext] = useState<FeatEditorContext>({ mode: "general" });
  const [activeFeatCategory, setActiveFeatCategory] = useState<FEAT_CATEGORY>(
    FEAT_CATEGORY.GENERAL
  );
  const [pendingAbilityScoreImprovement, setPendingAbilityScoreImprovement] =
    useState<PendingAbilityScoreImprovement | null>(null);
  const [pendingBoonOfIrresistibleOffense, setPendingBoonOfIrresistibleOffense] =
    useState<PendingBoonOfIrresistibleOffense | null>(null);
  const [pendingEpicBoonAbilityChoice, setPendingEpicBoonAbilityChoice] =
    useState<PendingEpicBoonAbilityChoice | null>(null);
  const [pendingSkilledChoice, setPendingSkilledChoice] = useState<PendingSkilledChoice | null>(
    null
  );
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const [selectedSpellReference, setSelectedSpellReference] = useState<SelectedSpellReference | null>(
    null
  );
  const [selectedDivinityReference, setSelectedDivinityReference] =
    useState<SelectedDivinityReference | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);

  useBodyScrollLock(Boolean(selectedKeyword) || Boolean(selectedFeatReference) || isFeatModalOpen);

  useEffect(() => {
    if (!selectedKeyword && !selectedFeatReference && !isFeatModalOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedKeyword) {
          setSelectedKeyword(null);
          return;
        }

        if (selectedFeatReference) {
          setSelectedFeatReference(null);
          return;
        }

        if (isFeatModalOpen) {
          setPendingAbilityScoreImprovement(null);
          setPendingBoonOfIrresistibleOffense(null);
          setPendingEpicBoonAbilityChoice(null);
          setPendingSkilledChoice(null);
          setIsFeatModalOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFeatModalOpen, selectedFeatReference, selectedKeyword]);

  const classEntry = classEntriesByName.get(character.className) ?? null;
  const allFeatures = useMemo<FeatureRow[]>(() => {
    if (!classEntry) {
      return [];
    }

    return classEntry.features.flatMap((featureRow) =>
      featureRow.classFeatures.map((feature, index) => ({
        key: `${featureRow.level}-${feature}-${index}`,
        level: featureRow.level,
        feature,
        details: featureRow.featureOverrides?.[feature] ?? FeatureMap[feature]
      }))
    );
  }, [classEntry]);

  const unlockedFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level <= character.level),
    [allFeatures, character.level]
  );
  const futureFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level > character.level),
    [allFeatures, character.level]
  );
  const featDefinitionsByCategory = useMemo(() => getFeatDefinitionsByCategory(), []);
  const selectedFeats = useMemo(() => character.feats ?? [], [character.feats]);
  const selectedFeatDefinition = selectedFeatReference
    ? getFeatDefinition(selectedFeatReference.feat)
    : null;

  function getLinkedFeatForFeature(level: number, feature: CLASS_FEATURE): CharacterFeatEntry | null {
    return selectedFeats.find((entry) => isFeatFromClassFeatureSource(entry, level, feature)) ?? null;
  }

  function getBardExpertiseSelections(level: number): SkillName[] {
    const tier = getBardExpertiseTierForLevel(level);

    if (!tier) {
      return [];
    }

    return getBardExpertiseSelectionsForCharacter(character, tier);
  }

  function getAvailableBardExpertiseSkills(level: number, slotIndex: number): SkillName[] {
    const tier = getBardExpertiseTierForLevel(level);

    if (!tier) {
      return [];
    }

    const currentSelections = getBardExpertiseSelectionsForCharacter(character, tier);
    const currentValue = currentSelections[slotIndex];
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== slotIndex)
    );

    return skillsOptions.filter((skillName) => {
      if (blockedSelections.has(skillName)) {
        return false;
      }

      if (currentValue === skillName) {
        return true;
      }

      const proficiency = getSkillProficiencyForName(skillName);

      return (
        proficiency !== null &&
        getSkillLevelFromEntries(character.skillProficiencies ?? [], proficiency) ===
          PROF_LEVEL.PROFICIENT
      );
    });
  }

  function updateBardExpertiseSelection(level: number, slotIndex: number, nextValue: string) {
    const tier = getBardExpertiseTierForLevel(level);

    if (!tier) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentSelections = getBardExpertiseSelectionsForCharacter(currentCharacter, tier);
      const nextSelections: [string, string] = [
        currentSelections[0] ?? "",
        currentSelections[1] ?? ""
      ];

      nextSelections[slotIndex] = nextValue;

      return setBardExpertiseSelectionsForCharacter(
        currentCharacter,
        tier,
        nextSelections.filter(
          (selection): selection is SkillName =>
            skillsOptions.some((skillOption) => skillOption === selection)
        )
      );
    });
  }

  function isBardExpertiseInputRequired(level: number): boolean {
    const tier = getBardExpertiseTierForLevel(level);

    if (!tier) {
      return false;
    }

    return getBardExpertiseSelectionsForCharacter(character, tier).length < 2;
  }

  function getWeaponMasterySelections(): WEAPON_PROFICIENCY[] {
    return getWeaponMasterySelectionsForCharacter(character);
  }

  function getAvailableWeaponMasteryOptions(slotIndex: number): WEAPON_PROFICIENCY[] {
    const currentSelections = getWeaponMasterySelectionsForCharacter(character);
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== slotIndex)
    );

    return getWeaponMasteryOptionsForCharacter(character).filter((proficiency) => {
      if (blockedSelections.has(proficiency)) {
        return false;
      }

      return true;
    });
  }

  function updateWeaponMasterySelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) => {
      const currentSelections = getWeaponMasterySelectionsForCharacter(currentCharacter);
      const nextSelections: string[] = Array.from(
        { length: getWeaponMasterySelectionCountForCharacter(currentCharacter) },
        (_, index) => currentSelections[index] ?? ""
      );

      nextSelections[slotIndex] = nextValue;

      const nextCharacter = setWeaponMasterySelectionsForCharacter(
        currentCharacter,
        nextSelections.filter(
          (selection): selection is WEAPON_PROFICIENCY =>
            getWeaponMasteryOptionsForCharacter(currentCharacter).includes(
              selection as WEAPON_PROFICIENCY
            )
        )
      );
      const nextProficiencies = normalizeCharacterProficiencies({
        className: nextCharacter.className,
        level: nextCharacter.level,
        species: nextCharacter.species,
        background: nextCharacter.background,
        classFeatureState: nextCharacter.classFeatureState,
        skillProficiencies: nextCharacter.skillProficiencies,
        savingThrowProficiencies: nextCharacter.savingThrowProficiencies,
        weaponProficiencies: nextCharacter.weaponProficiencies,
        armorProficiencies: nextCharacter.armorProficiencies,
        toolProficiencies: nextCharacter.toolProficiencies,
        languageProficiencies: nextCharacter.languageProficiencies
      });

      return {
        ...nextCharacter,
        ...nextProficiencies
      };
    });
  }

  function isWeaponMasteryInputRequired(): boolean {
    const totalSelections = getWeaponMasterySelectionCountForCharacter(character);

    if (totalSelections <= 0) {
      return false;
    }

    return getWeaponMasterySelectionsForCharacter(character).length < totalSelections;
  }

  function removeSkilledProficienciesFromCharacter(
    currentCharacter: Character,
    entryToRemove: CharacterFeatEntry
  ): Character {
    if (entryToRemove.feat !== FEATS.SKILLED || !entryToRemove.skilled) {
      return currentCharacter;
    }

    const { skills, tools } = splitSkilledSelections(entryToRemove.skilled);

    return {
      ...currentCharacter,
      skillProficiencies: removeFeatGrantedSkillEntries(
        currentCharacter.skillProficiencies ?? [],
        skills,
        "Skilled",
        entryToRemove.id
      ),
      toolProficiencies: removeFeatGrantedToolEntries(
        currentCharacter.toolProficiencies ?? [],
        tools,
        "Skilled",
        entryToRemove.id
      )
    };
  }

  function upsertFeatForContext(featEntry: CharacterFeatEntry) {
    if (featEditorContext.mode !== "class-feature") {
      onPersistCharacter((currentCharacter) => ({
        ...currentCharacter,
        feats: [...(currentCharacter.feats ?? []), featEntry]
      }));
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const existingEntries = (currentCharacter.feats ?? []).filter((entry) =>
        isFeatFromClassFeatureSource(
          entry,
          featEditorContext.source.level,
          featEditorContext.source.feature
        )
      );
      let nextCharacter = currentCharacter;

      existingEntries.forEach((entry) => {
        nextCharacter = removeSkilledProficienciesFromCharacter(nextCharacter, entry);
      });

      return {
        ...nextCharacter,
        feats: [
          ...(nextCharacter.feats ?? []).filter(
            (entry) =>
              !isFeatFromClassFeatureSource(
                entry,
                featEditorContext.source.level,
                featEditorContext.source.feature
              )
          ),
          featEntry
        ]
      };
    });
    closeFeatEditor();
  }

  useEffect(() => {
    const validFeatureKeys = new Set(allFeatures.map((featureRow) => featureRow.key));

    setExpandedFeatureKeys((current) =>
      current.filter((featureKey) => validFeatureKeys.has(featureKey))
    );
  }, [allFeatures]);

  useEffect(() => {
    if (isExpanded) {
      return;
    }

    setExpandedFeatureKeys([]);
    setIsFutureFeaturesVisible(false);
  }, [isExpanded]);

  function openKeyword(keywordKey: string, title?: string) {
    const resolvedKeyword = resolveKeywordReference(keywordKey, title);

    if (!resolvedKeyword) {
      return;
    }

    setSelectedKeyword({
      key: keywordKey,
      title: resolvedKeyword.title,
      description: resolvedKeyword.description
    });
  }

  function openFeatReference(feat: FEATS, entry?: CharacterFeatEntry) {
    if (!getFeatDefinition(feat)) {
      return;
    }

    setSelectedFeatReference({
      feat,
      entry
    });
  }

  function openSpellReference(spell: SpellEntry) {
    setSelectedSpellReference(spell);
  }

  function openDivinityReference(divinity: DivinityEntry) {
    setSelectedDivinityReference(divinity);
  }

  function updateClericDivineOrderChoice(choice: "protector" | "thaumaturge") {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = setClericDivineOrderChoiceForCharacter(currentCharacter, choice);
      const nextProficiencies = normalizeCharacterProficiencies({
        className: nextCharacter.className,
        level: nextCharacter.level,
        species: nextCharacter.species,
        background: nextCharacter.background,
        classFeatureState: nextCharacter.classFeatureState,
        skillProficiencies: nextCharacter.skillProficiencies,
        savingThrowProficiencies: nextCharacter.savingThrowProficiencies,
        weaponProficiencies: nextCharacter.weaponProficiencies,
        armorProficiencies: nextCharacter.armorProficiencies,
        toolProficiencies: nextCharacter.toolProficiencies,
        languageProficiencies: nextCharacter.languageProficiencies
      });
      const cantripLimit = getCantripLimitForCharacter(
        nextCharacter.className,
        nextCharacter.level,
        nextCharacter.classFeatureState
      );
      const cantripSelectionOptionIds = new Set(
        getCantripSelectionOptionsForCharacter(nextCharacter.className, nextCharacter.level).map(
          (spell) => spell.id
        )
      );

      return {
        ...nextCharacter,
        ...nextProficiencies,
        cantripIds: [...new Set(nextCharacter.cantripIds ?? [])]
          .filter((spellId) => cantripSelectionOptionIds.has(spellId))
          .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY)
      };
    });
  }

  function updateDruidPrimalOrderChoice(choice: "magician" | "warden") {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = setDruidPrimalOrderChoiceForCharacter(currentCharacter, choice);
      const nextProficiencies = normalizeCharacterProficiencies({
        className: nextCharacter.className,
        level: nextCharacter.level,
        species: nextCharacter.species,
        background: nextCharacter.background,
        classFeatureState: nextCharacter.classFeatureState,
        skillProficiencies: nextCharacter.skillProficiencies,
        savingThrowProficiencies: nextCharacter.savingThrowProficiencies,
        weaponProficiencies: nextCharacter.weaponProficiencies,
        armorProficiencies: nextCharacter.armorProficiencies,
        toolProficiencies: nextCharacter.toolProficiencies,
        languageProficiencies: nextCharacter.languageProficiencies
      });
      const cantripLimit = getCantripLimitForCharacter(
        nextCharacter.className,
        nextCharacter.level,
        nextCharacter.classFeatureState
      );
      const cantripSelectionOptionIds = new Set(
        getCantripSelectionOptionsForCharacter(nextCharacter.className, nextCharacter.level).map(
          (spell) => spell.id
        )
      );

      return {
        ...nextCharacter,
        ...nextProficiencies,
        cantripIds: [...new Set(nextCharacter.cantripIds ?? [])]
          .filter((spellId) => cantripSelectionOptionIds.has(spellId))
          .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY)
      };
    });
  }

  function updateClericBlessedStrikesChoice(choice: "blessed-strike" | "potent-spellcasting") {
    onPersistCharacter((currentCharacter) =>
      setClericBlessedStrikesChoiceForCharacter(currentCharacter, choice)
    );
  }

  function closeFeatEditor() {
    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    setFeatEditorContext({ mode: "general" });
    setIsFeatModalOpen(false);
  }

  function openFeatEditor() {
    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    setFeatEditorContext({ mode: "general" });
    setActiveFeatCategory(FEAT_CATEGORY.GENERAL);
    setIsFeatModalOpen(true);
  }

  function openFeatEditorForFeature(level: number, feature: CLASS_FEATURE) {
    const linkedFeat = getLinkedFeatForFeature(level, feature);
    const linkedFeatDefinition = linkedFeat ? getFeatDefinition(linkedFeat.feat) : null;

    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    setFeatEditorContext({
      mode: "class-feature",
      source: createClassFeatureFeatSource(level, feature)
    });
    setActiveFeatCategory(linkedFeatDefinition?.category ?? getDefaultFeatCategoryForFeature(feature));
    setIsFeatModalOpen(true);
  }

  function updateCharacterFeats(
    updater: (currentFeats: CharacterFeatEntry[]) => CharacterFeatEntry[]
  ) {
    const nextFeats = updater(character.feats ?? []);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      feats: nextFeats
    }));
  }

  function removeFeat(entryToRemove: CharacterFeatEntry) {
    if (entryToRemove.feat !== FEATS.SKILLED || !entryToRemove.skilled) {
      updateCharacterFeats((current) => current.filter((entry) => entry.id !== entryToRemove.id));
      return;
    }

    const { skills, tools } = splitSkilledSelections(entryToRemove.skilled);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      feats: (currentCharacter.feats ?? []).filter((entry) => entry.id !== entryToRemove.id),
      skillProficiencies: removeFeatGrantedSkillEntries(
        currentCharacter.skillProficiencies ?? [],
        skills,
        "Skilled",
        entryToRemove.id
      ),
      toolProficiencies: removeFeatGrantedToolEntries(
        currentCharacter.toolProficiencies ?? [],
        tools,
        "Skilled",
        entryToRemove.id
      )
    }));

    setSelectedFeatReference((current) =>
      current?.entry?.id === entryToRemove.id ? null : current
    );
  }

  function addFeat(feat: FEATS) {
    const featSource = featEditorContext.mode === "class-feature" ? featEditorContext.source : undefined;
    const featTakenAtLevel =
      featEditorContext.mode === "class-feature" ? featEditorContext.source.level : character.level;

    if (feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
      setPendingBoonOfIrresistibleOffense(null);
      setPendingEpicBoonAbilityChoice(null);
      setPendingSkilledChoice(null);
      setPendingAbilityScoreImprovement(createDefaultPendingAbilityScoreImprovement());
      return;
    }

    if (feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
      setPendingAbilityScoreImprovement(null);
      setPendingEpicBoonAbilityChoice(null);
      setPendingSkilledChoice(null);
      setPendingBoonOfIrresistibleOffense(createDefaultPendingBoonOfIrresistibleOffense());
      return;
    }

    const pendingEpicBoon = createDefaultPendingEpicBoonAbilityChoice(feat);

    if (pendingEpicBoon) {
      setPendingAbilityScoreImprovement(null);
      setPendingBoonOfIrresistibleOffense(null);
      setPendingSkilledChoice(null);
      setPendingEpicBoonAbilityChoice(pendingEpicBoon);
      return;
    }

    if (feat === FEATS.SKILLED) {
      setPendingAbilityScoreImprovement(null);
      setPendingBoonOfIrresistibleOffense(null);
      setPendingEpicBoonAbilityChoice(null);
      setPendingSkilledChoice(createDefaultPendingSkilledChoice());
      return;
    }

    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    upsertFeatForContext(createCharacterFeatEntry(feat, featTakenAtLevel, { source: featSource }));
  }

  function savePendingAbilityScoreImprovement() {
    if (!pendingAbilityScoreImprovement) {
      return;
    }

    if (
      pendingAbilityScoreImprovement.mode === "split" &&
      pendingAbilityScoreImprovement.primaryAbility === pendingAbilityScoreImprovement.secondaryAbility
    ) {
      return;
    }

    const featSource = featEditorContext.mode === "class-feature" ? featEditorContext.source : undefined;
    const featTakenAtLevel =
      featEditorContext.mode === "class-feature" ? featEditorContext.source.level : character.level;

    upsertFeatForContext(
      createCharacterFeatEntry(FEATS.ABILITY_SCORE_IMPROVEMENT, featTakenAtLevel, {
        source: featSource,
        abilityScoreImprovement: pendingAbilityScoreImprovement
      })
    );
    setPendingAbilityScoreImprovement(null);
  }

  function savePendingBoonOfIrresistibleOffense() {
    if (!pendingBoonOfIrresistibleOffense) {
      return;
    }

    const featSource = featEditorContext.mode === "class-feature" ? featEditorContext.source : undefined;
    const featTakenAtLevel =
      featEditorContext.mode === "class-feature" ? featEditorContext.source.level : character.level;

    upsertFeatForContext(
      createCharacterFeatEntry(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE, featTakenAtLevel, {
        source: featSource,
        boonOfIrresistibleOffense: pendingBoonOfIrresistibleOffense
      })
    );
    setPendingBoonOfIrresistibleOffense(null);
  }

  function savePendingEpicBoonAbilityChoice() {
    if (!pendingEpicBoonAbilityChoice) {
      return;
    }

    const featSource = featEditorContext.mode === "class-feature" ? featEditorContext.source : undefined;
    const featTakenAtLevel =
      featEditorContext.mode === "class-feature" ? featEditorContext.source.level : character.level;

    upsertFeatForContext(
      createCharacterFeatEntry(pendingEpicBoonAbilityChoice.feat, featTakenAtLevel, {
        source: featSource,
        epicBoonAbilityChoice: {
          ability: pendingEpicBoonAbilityChoice.ability
        }
      })
    );
    setPendingEpicBoonAbilityChoice(null);
  }

  function savePendingSkilledChoice() {
    if (!pendingSkilledChoice || !isPendingSkilledChoiceValid(pendingSkilledChoice)) {
      return;
    }

    const skilled = decodePendingSkilledChoice(pendingSkilledChoice);

    if (!skilled) {
      return;
    }

    const featEntry = createCharacterFeatEntry(
      FEATS.SKILLED,
      featEditorContext.mode === "class-feature" ? featEditorContext.source.level : character.level,
      {
        source: featEditorContext.mode === "class-feature" ? featEditorContext.source : undefined,
        skilled
      }
    );
    const { skills, tools } = splitSkilledSelections(skilled);

    onPersistCharacter((currentCharacter) => {
      const sourceContext =
        featEditorContext.mode === "class-feature" ? featEditorContext.source : null;
      const existingEntries =
        sourceContext
          ? (currentCharacter.feats ?? []).filter((entry) =>
              isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
            )
          : [];
      let nextCharacter = currentCharacter;

      existingEntries.forEach((entry) => {
        nextCharacter = removeSkilledProficienciesFromCharacter(nextCharacter, entry);
      });

      return {
        ...nextCharacter,
        feats: [
          ...(nextCharacter.feats ?? []).filter(
            (entry) =>
              !(
                sourceContext &&
                isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
              )
          ),
          featEntry
        ],
        skillProficiencies: addFeatGrantedSkillEntries(
          nextCharacter.skillProficiencies ?? [],
          skills,
          "Skilled",
          featEntry.id
        ),
        toolProficiencies: addFeatGrantedToolEntries(
          nextCharacter.toolProficiencies ?? [],
          tools,
          "Skilled",
          featEntry.id
        )
      };
    });

    setPendingSkilledChoice(null);
    closeFeatEditor();
  }

  function toggleFeature(featureKey: string) {
    setExpandedFeatureKeys((current) =>
      current.includes(featureKey)
        ? current.filter((currentKey) => currentKey !== featureKey)
        : [...current, featureKey]
    );
  }

  function toggleSection() {
    setIsExpanded((current) => !current);
  }

  function renderFeatureList(features: FeatureRow[]) {
    return (
      <ul className={styles.featureList}>
        {features.map((featureRow) => {
          const featureDetails = featureRow.details;
          const isUnlocked = featureRow.level <= character.level;
          const trackingKeywordKey = getFeatureTrackingState(featureDetails);
          const trackingBadge = trackingBadgeConfig[trackingKeywordKey];
          const isFeatureExpanded = expandedFeatureKeys.includes(featureRow.key);
          const featurePanelId = `class-feature-panel-${featureRow.key}`;
          const linkedFeat = isFeatChoiceFeature(featureRow.feature)
            ? getLinkedFeatForFeature(featureRow.level, featureRow.feature)
            : null;
          const linkedFeatDefinition = linkedFeat ? getFeatDefinition(linkedFeat.feat) : null;
          const linkedFeatSummary = linkedFeat ? getCharacterFeatSummary(linkedFeat) : null;
          const blessedStrikesChoice =
            featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES
              ? getClericBlessedStrikesChoiceForCharacter(character)
              : null;
          const isInputRequired =
            (isUnlocked && isFeatChoiceFeature(featureRow.feature) && linkedFeat === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.EXPERTISE &&
              isBardExpertiseInputRequired(featureRow.level)) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY &&
              isWeaponMasteryInputRequired()) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER &&
              getDruidPrimalOrderChoiceForCharacter(character) === null) ||
            (isUnlocked &&
              featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES &&
              blessedStrikesChoice === null);
          const divineOrderChoice =
            featureRow.feature === CLASS_FEATURE.DIVINE_ORDER
              ? getClericDivineOrderChoiceForCharacter(character)
              : null;
          const divineOrderDescriptionLines =
            featureRow.feature === CLASS_FEATURE.DIVINE_ORDER
              ? featureDetails.description.slice(1)
              : [];
          const primalOrderChoice =
            featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER
              ? getDruidPrimalOrderChoiceForCharacter(character)
              : null;
          const primalOrderDescriptionLines =
            featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER
              ? featureDetails.description.slice(1)
              : [];
          const blessedStrikesDescriptionLines =
            featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES
              ? featureDetails.description.slice(1)
              : [];
          const bardExpertiseSelections =
            featureRow.feature === CLASS_FEATURE.EXPERTISE
              ? getBardExpertiseSelections(featureRow.level)
              : [];
          const weaponMasterySelections =
            featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY ? getWeaponMasterySelections() : [];
          const weaponMasterySelectionCount =
            featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY
              ? getWeaponMasterySelectionCountForCharacter(character)
              : 0;
          const bardExpertiseDescriptionLines =
            featureRow.feature === CLASS_FEATURE.EXPERTISE
              ? featureRow.level >= 9
                ? featureDetails.description.slice(1, 2)
                : featureDetails.description.slice(0, 1)
              : [];

          return (
            <li key={featureRow.key} className={styles.featureItem}>
              <div className={styles.featureHeadingRow}>
                <button
                  type="button"
                  className={styles.featureToggleButton}
                  onClick={() => toggleFeature(featureRow.key)}
                  aria-expanded={isFeatureExpanded}
                  aria-controls={featurePanelId}
                >
                  <span className={styles.featureHeading}>
                    {`Level ${featureRow.level}: ${formatCodexLabel(featureRow.feature)}`}
                  </span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={clsx(
                      styles.featureToggleIcon,
                      !isFeatureExpanded && styles.featureToggleIconCollapsed
                    )}
                  />
                  {isInputRequired ? (
                    <span className={styles.featureInputRequired}>
                      <TriangleAlert size={16} aria-hidden="true" />
                      INPUT REQUIRED
                    </span>
                  ) : null}
                </button>
                <div className={styles.featureHeaderActions}>
                  <button
                    type="button"
                    className={clsx(
                      styles.featureTrackingButton,
                      styles[trackingBadge.className]
                    )}
                    onClick={() => openKeyword(trackingKeywordKey)}
                  >
                    <trackingBadge.icon size={18} aria-hidden="true" />
                    <span>{trackingBadge.label}</span>
                  </button>
                </div>
              </div>

              {isFeatureExpanded ? (
                featureDetails.description.length > 0 ? (
                  <div id={featurePanelId} className={styles.descriptionList}>
                    {featureRow.feature === CLASS_FEATURE.DIVINE_ORDER ? (
                      <>
                        {featureDetails.description[0] ? (
                          <p className={styles.descriptionLine}>
                            {renderDescriptionLine(
                              featureDetails.description[0],
                              openKeyword,
                              (feat) => openFeatReference(feat),
                              openSpellReference,
                              openDivinityReference
                            )}
                          </p>
                        ) : null}
                        {divineOrderDescriptionLines.map((line, index) => {
                          const choice = index === 0 ? "protector" : "thaumaturge";

                          return (
                            <label
                              key={`${featureRow.key}-choice-${choice}`}
                              className={clsx(
                                styles.featureOptionRow,
                                !isUnlocked && styles.featureOptionRowDisabled,
                                divineOrderChoice === choice && styles.featureOptionRowActive
                              )}
                            >
                              <input
                                type="radio"
                                name={`divine-order-${character.id}`}
                                checked={divineOrderChoice === choice}
                                disabled={!isUnlocked}
                                onChange={() => updateClericDivineOrderChoice(choice)}
                                className={styles.featureOptionRadio}
                              />
                              <span className={styles.featureOptionText}>
                                {renderDescriptionLine(
                                  line,
                                  openKeyword,
                                  (feat) => openFeatReference(feat),
                                  openSpellReference,
                                  openDivinityReference
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </>
                    ) : featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES ? (
                      <>
                        {featureDetails.description[0] ? (
                          <p className={styles.descriptionLine}>
                            {renderDescriptionLine(
                              featureDetails.description[0],
                              openKeyword,
                              (feat) => openFeatReference(feat),
                              openSpellReference,
                              openDivinityReference
                            )}
                          </p>
                        ) : null}
                        {blessedStrikesDescriptionLines.map((line, index) => {
                          const choice =
                            index === 0 ? "blessed-strike" : "potent-spellcasting";

                          return (
                            <label
                              key={`${featureRow.key}-choice-${choice}`}
                              className={clsx(
                                styles.featureOptionRow,
                                !isUnlocked && styles.featureOptionRowDisabled,
                                blessedStrikesChoice === choice && styles.featureOptionRowActive
                              )}
                            >
                              <input
                                type="radio"
                                name={`blessed-strikes-${character.id}`}
                                checked={blessedStrikesChoice === choice}
                                disabled={!isUnlocked}
                                onChange={() => updateClericBlessedStrikesChoice(choice)}
                                className={styles.featureOptionRadio}
                              />
                              <span className={styles.featureOptionText}>
                                {renderDescriptionLine(
                                  line,
                                  openKeyword,
                                  (feat) => openFeatReference(feat),
                                  openSpellReference,
                                  openDivinityReference
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </>
                    ) : featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER ? (
                      <>
                        {featureDetails.description[0] ? (
                          <p className={styles.descriptionLine}>
                            {renderDescriptionLine(
                              featureDetails.description[0],
                              openKeyword,
                              (feat) => openFeatReference(feat),
                              openSpellReference,
                              openDivinityReference
                            )}
                          </p>
                        ) : null}
                        {primalOrderDescriptionLines.map((line, index) => {
                          const choice = index === 0 ? "magician" : "warden";

                          return (
                            <label
                              key={`${featureRow.key}-choice-${choice}`}
                              className={clsx(
                                styles.featureOptionRow,
                                !isUnlocked && styles.featureOptionRowDisabled,
                                primalOrderChoice === choice && styles.featureOptionRowActive
                              )}
                            >
                              <input
                                type="radio"
                                name={`primal-order-${character.id}`}
                                checked={primalOrderChoice === choice}
                                disabled={!isUnlocked}
                                onChange={() => updateDruidPrimalOrderChoice(choice)}
                                className={styles.featureOptionRadio}
                              />
                              <span className={styles.featureOptionText}>
                                {renderDescriptionLine(
                                  line,
                                  openKeyword,
                                  (feat) => openFeatReference(feat),
                                  openSpellReference,
                                  openDivinityReference
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </>
                    ) : featureRow.feature === CLASS_FEATURE.EXPERTISE ? (
                      <>
                        {bardExpertiseDescriptionLines.map((line, index) => (
                          <p key={`${featureRow.key}-line-${index}`} className={styles.descriptionLine}>
                            {renderDescriptionLine(
                              line,
                              openKeyword,
                              (feat) => openFeatReference(feat),
                              openSpellReference,
                              openDivinityReference
                            )}
                          </p>
                        ))}
                        <div className={styles.featureSelectionGrid}>
                          {[0, 1].map((slotIndex) => {
                            const currentValue = bardExpertiseSelections[slotIndex] ?? "";
                            const availableSkills = getAvailableBardExpertiseSkills(
                              featureRow.level,
                              slotIndex
                            );

                            if (
                              currentValue &&
                              !availableSkills.includes(currentValue as SkillName)
                            ) {
                              availableSkills.unshift(currentValue as SkillName);
                            }

                            return (
                              <label
                                key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                                className={clsx(
                                  styles.featureSelectionField,
                                  !isUnlocked && styles.featureOptionRowDisabled
                                )}
                              >
                                <span className={styles.featureSelectionLabel}>
                                  Expertise {slotIndex + 1}
                                </span>
                                <SelectInput
                                  value={currentValue}
                                  disabled={!isUnlocked}
                                  onChange={(event) =>
                                    updateBardExpertiseSelection(
                                      featureRow.level,
                                      slotIndex,
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="">Select a skill</option>
                                  {availableSkills.map((skillName) => (
                                    <option key={`${featureRow.key}-${skillName}`} value={skillName}>
                                      {skillName}
                                    </option>
                                  ))}
                                </SelectInput>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY ? (
                      <>
                        {featureDetails.description.map((line, index) => (
                          <p key={`${featureRow.key}-line-${index}`} className={styles.descriptionLine}>
                            {renderDescriptionLine(
                              line,
                              openKeyword,
                              (feat) => openFeatReference(feat),
                              openSpellReference,
                              openDivinityReference
                            )}
                          </p>
                        ))}
                        <div className={styles.featureSelectionGrid}>
                          {Array.from({ length: weaponMasterySelectionCount }, (_, slotIndex) => {
                            const currentValue = weaponMasterySelections[slotIndex] ?? "";
                            const availableOptions = getAvailableWeaponMasteryOptions(slotIndex);

                            return (
                              <label
                                key={`${featureRow.key}-weapon-mastery-slot-${slotIndex}`}
                                className={clsx(
                                  styles.featureSelectionField,
                                  !isUnlocked && styles.featureOptionRowDisabled
                                )}
                              >
                                <span className={styles.featureSelectionLabel}>
                                  Weapon Mastery {slotIndex + 1}
                                </span>
                                <SelectInput
                                  value={currentValue}
                                  disabled={!isUnlocked}
                                  onChange={(event) =>
                                    updateWeaponMasterySelection(slotIndex, event.target.value)
                                  }
                                >
                                  <option value="">Select a weapon</option>
                                  {availableOptions.map((proficiency) => (
                                    <option
                                      key={`${featureRow.key}-weapon-mastery-${proficiency}`}
                                      value={proficiency}
                                    >
                                      {getWeaponProficiencyLabel(proficiency)}
                                    </option>
                                  ))}
                                </SelectInput>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      featureDetails.description.map((line, index) => (
                        <p key={`${featureRow.key}-line-${index}`} className={styles.descriptionLine}>
                          {renderDescriptionLine(
                            line,
                            openKeyword,
                            (feat) => openFeatReference(feat),
                            openSpellReference,
                            openDivinityReference
                          )}
                        </p>
                      ))
                    )}

                    {isFeatChoiceFeature(featureRow.feature) ? (
                      linkedFeat && linkedFeatDefinition ? (
                        <div className={styles.featureChoiceRow}>
                          <div className={styles.featureChoiceSummary}>
                            <span className={styles.featureChoiceLabel}>Chosen feat</span>
                            <button
                              type="button"
                              className={styles.featureChoiceValue}
                              onClick={() => openFeatReference(linkedFeat.feat, linkedFeat)}
                            >
                              {linkedFeatDefinition.label}
                              {linkedFeatSummary ? ` · ${linkedFeatSummary}` : ""}
                            </button>
                          </div>
                          <button
                            type="button"
                            className={shared.editButton}
                            disabled={!isUnlocked}
                            onClick={() => openFeatEditorForFeature(featureRow.level, featureRow.feature)}
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div className={styles.featureChoiceRow}>
                          <button
                            type="button"
                            className={shared.editButton}
                            disabled={!isUnlocked}
                            onClick={() => openFeatEditorForFeature(featureRow.level, featureRow.feature)}
                          >
                            <Plus size={16} />
                            Choose Feat
                          </button>
                        </div>
                      )
                    ) : null}
                  </div>
                ) : (
                  <p id={featurePanelId} className={styles.emptyFeatureText}>
                    Details coming soon.
                  </p>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderTrackingButton(trackingState: "tracked" | "semi-tracked" | "not-tracked") {
    const trackingBadge = trackingBadgeConfig[trackingState];

    return (
      <button
        type="button"
        className={clsx(styles.featureTrackingButton, styles[trackingBadge.className])}
        onClick={(event) => {
          event.stopPropagation();
          openKeyword(trackingState);
        }}
      >
        <trackingBadge.icon size={18} aria-hidden="true" />
        <span>{trackingBadge.label}</span>
      </button>
    );
  }

  function renderFeatCards(
    featsToRender: CharacterFeatEntry[],
    options?: {
      emptyText?: string;
    }
  ) {
    if (featsToRender.length === 0) {
      return <p className={shared.emptyText}>{options?.emptyText ?? "No feats added yet."}</p>;
    }

    const groupedEntries = featsToRender.reduce<Array<{ feat: FEATS; entries: CharacterFeatEntry[] }>>(
      (groups, entry) => {
        const existingGroup = groups.find((group) => group.feat === entry.feat);

        if (existingGroup) {
          existingGroup.entries.push(entry);
          return groups;
        }

        groups.push({
          feat: entry.feat,
          entries: [entry]
        });
        return groups;
      },
      []
    );

    return (
      <ul className={styles.featList}>
        {groupedEntries.map(({ feat, entries }) => {
          const featDefinition = getFeatDefinition(feat);

          if (!featDefinition) {
            return null;
          }

          const trackingState = getFeatureTrackingState(featDefinition);
          const isRepeatable = Boolean(featDefinition.repeatable);
          const firstEntry = entries[0];
          const featSummary = firstEntry ? getCharacterFeatSummary(firstEntry) : null;
          const featMetaLabel = firstEntry
            ? isRepeatable
              ? getFeatCategoryLabel(featDefinition.category)
              : `${getFeatCategoryLabel(featDefinition.category)} • ${getCharacterFeatSourceLabel(firstEntry)}`
            : getFeatCategoryLabel(featDefinition.category);

          return (
            <li
              key={featDefinition.feat}
              className={clsx(styles.featItem, styles.featItemInteractive)}
              role="button"
              tabIndex={0}
              onClick={() => openFeatReference(featDefinition.feat)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFeatReference(featDefinition.feat);
                }
              }}
            >
              <div className={styles.featHeaderRow}>
                <div className={styles.featNameButton}>
                  <span className={styles.featName}>{featDefinition.label}</span>
                  {isRepeatable ? (
                    <span className={styles.featOptionRepeatable}>(repeatable)</span>
                  ) : null}
                </div>
                <div className={styles.featHeaderActions}>
                  {renderTrackingButton(trackingState)}
                </div>
              </div>
              <p className={styles.featMeta}>{featMetaLabel}</p>
              {isRepeatable ? (
                <ul className={styles.featSelectedList}>
                  {entries.map((entry) => {
                    const summary = getCharacterFeatSummary(entry);

                    return (
                      <li key={entry.id} className={styles.featSelectedItem}>
                        <span className={styles.featSelectedText}>
                          {summary
                            ? `Picked: ${summary} • ${getCharacterFeatSourceLabel(entry)}`
                            : `Picked • ${getCharacterFeatSourceLabel(entry)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : featSummary ? (
                <p className={styles.featSummary}>{featSummary}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderAvailableFeatList() {
    return (
      <div className={styles.featOptionList}>
        {featDefinitionsByCategory[activeFeatCategory].map((featDefinition) => {
          const selectedEntries = selectedFeats.filter((entry) => entry.feat === featDefinition.feat);
          const selectedCount = selectedEntries.length;
          const isRepeatable = Boolean(featDefinition.repeatable);
          const isAddDisabled = !isRepeatable && selectedCount > 0;
          const isSelected = selectedCount > 0;
          const trackingState = getFeatureTrackingState(featDefinition);
          const isPendingAbilityScoreImprovement =
            featDefinition.feat === FEATS.ABILITY_SCORE_IMPROVEMENT &&
            pendingAbilityScoreImprovement !== null;
          const isPendingBoonOfIrresistibleOffense =
            featDefinition.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
            pendingBoonOfIrresistibleOffense !== null;
          const isPendingEpicBoonAbilityChoice =
            pendingEpicBoonAbilityChoice?.feat === featDefinition.feat;
          const isPendingSkilled =
            featDefinition.feat === FEATS.SKILLED && pendingSkilledChoice !== null;

          return (
            <article
              key={featDefinition.feat}
              className={clsx(styles.featOptionCard, isSelected && styles.featOptionCardSelected)}
              role="button"
              tabIndex={0}
              onClick={() => openFeatReference(featDefinition.feat)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFeatReference(featDefinition.feat);
                }
              }}
            >
              <div className={styles.featOptionHeader}>
                <div className={styles.featOptionTitleBlock}>
                  <span className={styles.featOptionTitle}>{featDefinition.label}</span>
                  {featDefinition.repeatable ? (
                    <span className={styles.featOptionRepeatable}>(repeatable)</span>
                  ) : null}
                </div>
                {renderTrackingButton(trackingState)}
              </div>
              {featDefinition.prerequisite ? (
                <p className={styles.featMeta}>{`Prerequisite: ${featDefinition.prerequisite}`}</p>
              ) : null}
              {isRepeatable && selectedEntries.length > 0 ? (
                <ul className={styles.featSelectedList}>
                  {selectedEntries.map((entry) => {
                    const summary = getCharacterFeatSummary(entry);

                    return (
                      <li key={entry.id} className={styles.featSelectedItem}>
                        <span className={styles.featSelectedText}>
                          {summary
                            ? `Picked: ${summary} • ${getCharacterFeatSourceLabel(entry)}`
                            : `Picked • ${getCharacterFeatSourceLabel(entry)}`}
                        </span>
                        <button
                          type="button"
                          className={styles.featSelectedRemoveButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFeat(entry);
                          }}
                          aria-label={`Remove ${featDefinition.label}`}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {isPendingAbilityScoreImprovement && pendingAbilityScoreImprovement ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>Ability Score Improvement</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingAbilityScoreImprovement(null)}
                      aria-label="Cancel ability score improvement selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiModeRow}>
                    <button
                      type="button"
                      className={clsx(
                        styles.asiModeButton,
                        pendingAbilityScoreImprovement.mode === "single" &&
                          styles.asiModeButtonActive
                      )}
                      onClick={() =>
                        setPendingAbilityScoreImprovement((current) =>
                          current
                            ? {
                                ...current,
                                mode: "single"
                              }
                            : current
                        )
                      }
                    >
                      +2 to one ability
                    </button>
                    <button
                      type="button"
                      className={clsx(
                        styles.asiModeButton,
                        pendingAbilityScoreImprovement.mode === "split" &&
                          styles.asiModeButtonActive
                      )}
                      onClick={() =>
                        setPendingAbilityScoreImprovement((current) =>
                          current
                            ? {
                                ...current,
                                mode: "split"
                              }
                            : current
                        )
                      }
                    >
                      +1 and +1
                    </button>
                  </div>
                  <div className={styles.asiAbilityGrid}>
                    <label className={styles.asiField}>
                      <span>
                        {pendingAbilityScoreImprovement.mode === "single"
                          ? "Ability"
                          : "First ability"}
                      </span>
                      <select
                        className={styles.asiSelect}
                        value={pendingAbilityScoreImprovement.primaryAbility}
                        onChange={(event) =>
                          setPendingAbilityScoreImprovement((current) =>
                            current
                              ? {
                                  ...current,
                                  primaryAbility: event.target.value as AbilityKey
                                }
                              : current
                          )
                        }
                      >
                        {abilityKeys.map((ability) => (
                          <option key={ability} value={ability}>
                            {ability}
                          </option>
                        ))}
                      </select>
                    </label>
                    {pendingAbilityScoreImprovement.mode === "split" ? (
                      <label className={styles.asiField}>
                        <span>Second ability</span>
                        <select
                          className={styles.asiSelect}
                          value={pendingAbilityScoreImprovement.secondaryAbility}
                          onChange={(event) =>
                            setPendingAbilityScoreImprovement((current) =>
                              current
                                ? {
                                    ...current,
                                    secondaryAbility: event.target.value as AbilityKey
                                  }
                                : current
                            )
                          }
                        >
                          {abilityKeys.map((ability) => (
                            <option key={ability} value={ability}>
                              {ability}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                  <p className={styles.asiSummary}>
                    {getAbilityScoreImprovementSummary(pendingAbilityScoreImprovement)}
                  </p>
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      disabled={
                        pendingAbilityScoreImprovement.mode === "split" &&
                        pendingAbilityScoreImprovement.primaryAbility ===
                          pendingAbilityScoreImprovement.secondaryAbility
                      }
                      onClick={savePendingAbilityScoreImprovement}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              {isPendingBoonOfIrresistibleOffense && pendingBoonOfIrresistibleOffense ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>Boon of Irresistible Offense</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingBoonOfIrresistibleOffense(null)}
                      aria-label="Cancel boon of irresistible offense selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiAbilityGridSingle}>
                    <label className={styles.asiField}>
                      <span>Ability</span>
                      <select
                        className={styles.asiSelect}
                        value={pendingBoonOfIrresistibleOffense.ability}
                        onChange={(event) =>
                          setPendingBoonOfIrresistibleOffense({
                            ability: event.target.value as "STR" | "DEX"
                          })
                        }
                      >
                        <option value="STR">STR</option>
                        <option value="DEX">DEX</option>
                      </select>
                    </label>
                  </div>
                  <p className={styles.asiSummary}>
                    {`${pendingBoonOfIrresistibleOffense.ability} +1 (max 30)`}
                  </p>
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      onClick={savePendingBoonOfIrresistibleOffense}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              {isPendingEpicBoonAbilityChoice && pendingEpicBoonAbilityChoice ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>{featDefinition.label}</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingEpicBoonAbilityChoice(null)}
                      aria-label={`Cancel ${featDefinition.label} selection`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiAbilityGridSingle}>
                    <label className={styles.asiField}>
                      <span>Ability</span>
                      <select
                        className={styles.asiSelect}
                        value={pendingEpicBoonAbilityChoice.ability}
                        onChange={(event) =>
                          setPendingEpicBoonAbilityChoice((current) =>
                            current
                              ? {
                                  ...current,
                                  ability: event.target.value as AbilityKey
                                }
                              : current
                          )
                        }
                      >
                        {(getEpicBoonAbilityOptions(featDefinition.feat) ?? []).map((ability) => (
                          <option key={ability} value={ability}>
                            {ability}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className={styles.asiSummary}>
                    {getEpicBoonAbilityChoiceSummary({
                      ability: pendingEpicBoonAbilityChoice.ability
                    })}
                    {" (max 30)"}
                  </p>
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      onClick={savePendingEpicBoonAbilityChoice}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              {isPendingSkilled && pendingSkilledChoice ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>Skilled</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingSkilledChoice(null)}
                      aria-label="Cancel skilled selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiAbilityGridSingle}>
                    {skilledSelectionIndices.map((selectionIndex) => (
                      <label
                        key={`${featDefinition.feat}-selection-${selectionIndex}`}
                        className={styles.asiField}
                      >
                        <span>{`Choice ${selectionIndex + 1}`}</span>
                        <select
                          className={styles.asiSelect}
                          value={pendingSkilledChoice.selections[selectionIndex]}
                          onChange={(event) =>
                            setPendingSkilledChoice((current) => {
                              if (!current) {
                                return current;
                              }

                              const nextSelections = [...current.selections] as PendingSkilledChoice["selections"];
                              nextSelections[selectionIndex] = event.target.value;

                              return {
                                selections: nextSelections
                              };
                            })
                          }
                        >
                          <option value={skilledNoneOptionValue}>None</option>
                          <optgroup label="Skills">
                            {skillsOptions.map((skill) => (
                              <option key={skill} value={`skill:${skill}`}>
                                {skill}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Tools">
                            {toolProficiencyOptions.map((tool) => (
                              <option key={tool} value={`tool:${tool}`}>
                                {getToolProficiencyLabel(tool)}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </label>
                    ))}
                  </div>
                  {getPendingSkilledChoiceSummary(pendingSkilledChoice) ? (
                    <p className={styles.asiSummary}>
                      {getPendingSkilledChoiceSummary(pendingSkilledChoice)}
                    </p>
                  ) : null}
                  {!isPendingSkilledChoiceValid(pendingSkilledChoice) ? (
                    <p className={styles.featOptionValidation}>
                      Choose three different skills or tools.
                    </p>
                  ) : null}
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      disabled={!isPendingSkilledChoiceValid(pendingSkilledChoice)}
                      onClick={savePendingSkilledChoice}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              <div className={styles.featOptionFooter}>
                {isRepeatable || !isSelected ? (
                  <button
                    type="button"
                    className={clsx(shared.editButton, styles.featAddButton)}
                    disabled={isAddDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      addFeat(featDefinition.feat);
                    }}
                  >
                    <Plus size={16} />
                    {isRepeatable && isSelected ? "Add Another" : isAddDisabled ? "Added" : "Add"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={clsx(shared.editButton, styles.featRemoveActionButton)}
                    onClick={(event) => {
                      event.stopPropagation();

                      if (selectedEntries[0]) {
                        removeFeat(selectedEntries[0]);
                      }
                    }}
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <button
        type="button"
        className={styles.sectionToggle}
        onClick={toggleSection}
        aria-expanded={isExpanded}
        aria-controls="class-features-and-feats-content"
      >
        <div>
          <p className={shared.eyebrow}>Build</p>
          <h2 className={shared.title}>Class Features &amp; Feats</h2>
          <p className={shared.helperText}>
            Review unlocked class features and manage feat selections for your build.
          </p>
        </div>
        <span className={styles.sectionToggleMeta}>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={clsx(
              styles.sectionToggleIcon,
              !isExpanded && styles.sectionToggleIconCollapsed
            )}
          />
        </span>
      </button>

      {isExpanded ? (
        <div id="class-features-and-feats-content" className={styles.sectionStack}>
          <section className={styles.subsection} aria-labelledby="character-feats-title">
            <div className={styles.subsectionHeader}>
              <h3 id="character-feats-title" className={styles.subsectionTitle}>
                Feats
              </h3>
              <button
                type="button"
                className={shared.editButton}
                onClick={openFeatEditor}
                disabled={isFeatModalOpen}
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>
            {renderFeatCards(selectedFeats, {
              emptyText: "No feats added yet."
            })}
          </section>

          <section className={styles.subsection} aria-labelledby="character-class-features-title">
            <div className={styles.subsectionHeader}>
              <h3 id="character-class-features-title" className={styles.subsectionTitle}>
                Class Features
              </h3>
            </div>

            {unlockedFeatures.length > 0 ? (
              <>
                {renderFeatureList(unlockedFeatures)}

                {futureFeatures.length > 0 ? (
                  <>
                    <InlineToggleButton
                      label={
                        isFutureFeaturesVisible
                          ? "Hide unlockable features"
                          : "Show unlockable features"
                      }
                      expanded={isFutureFeaturesVisible}
                      onClick={() => setIsFutureFeaturesVisible((current) => !current)}
                    />
                    {isFutureFeaturesVisible ? renderFeatureList(futureFeatures) : null}
                  </>
                ) : null}
              </>
            ) : (
              <p className={shared.emptyText}>
                {classEntry
                  ? "No class features are available for this level yet."
                  : "No class feature progression is available for this class yet."}
              </p>
            )}
          </section>
        </div>
      ) : null}

      {isFeatModalOpen ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={closeFeatEditor}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.featEditorModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-feat-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div className={styles.modalHeading}>
                <h3 id="character-feat-editor-title">
                  {featEditorContext.mode === "class-feature" ? "Choose Feat" : "Edit Feats"}
                </h3>
                <p className={shared.helperText}>
                  {featEditorContext.mode === "class-feature"
                    ? "Choose one feat for this class feature. Your selection will be applied immediately."
                    : "Always choose the appropriate feats based on your class features or your DM's instructions."}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeFeatEditor}
                aria-label="Close feat editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.tabRow} role="tablist" aria-label="Feat categories">
              {featCategoryTabs.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeFeatCategory === category}
                  className={clsx(
                    styles.tabButton,
                    activeFeatCategory === category && styles.tabButtonActive
                  )}
                  onClick={() => setActiveFeatCategory(category)}
                >
                  {getFeatCategoryLabel(category)}
                </button>
              ))}
            </div>

            <div className={styles.featEditorScrollArea}>
              {renderAvailableFeatList()}
            </div>
          </section>
        </div>
      ) : null}

      {selectedFeatReference && selectedFeatDefinition ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.featDrawerBackdrop)}
          role="presentation"
          onClick={() => setSelectedFeatReference(null)}
        >
          <aside
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feat-reference-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Feat</p>
                <div className={clsx(sheetStyles.spellDrawerTitleRow, styles.featDrawerTitleRow)}>
                  <h3 id="feat-reference-drawer-title">{selectedFeatDefinition.label}</h3>
                  {renderTrackingButton(getFeatureTrackingState(selectedFeatDefinition))}
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {getFeatCategoryLabel(selectedFeatDefinition.category)} Feat
                  {selectedFeatDefinition.prerequisite
                    ? ` • Prerequisite: ${selectedFeatDefinition.prerequisite}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedFeatReference(null)}
                aria-label={`Close ${selectedFeatDefinition.label} reference`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.keywordDrawerBody}>
              {selectedFeatReference.entry && getCharacterFeatSummary(selectedFeatReference.entry) ? (
                <p className={styles.featReferenceSummary}>
                  {`Selection: ${getCharacterFeatSummary(selectedFeatReference.entry)}`}
                </p>
              ) : null}
              {selectedFeatDefinition.description.map((line, index) => (
                <p
                  key={`${selectedFeatDefinition.feat}-line-${index}`}
                  className={styles.descriptionLine}
                >
                  {renderDescriptionLine(
                    line,
                    openKeyword,
                    (feat) => openFeatReference(feat),
                    openSpellReference,
                    openDivinityReference
                  )}
                </p>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {selectedKeyword ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.referenceDrawerBackdrop)}
          role="presentation"
          onClick={() => setSelectedKeyword(null)}
        >
          <aside
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-feature-keyword-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                  <p className={sheetStyles.spellDrawerBadge}>Keyword</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="class-feature-keyword-drawer-title">{selectedKeyword.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedKeyword(null)}
                aria-label={`Close ${selectedKeyword.title} reference`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.keywordDrawerBody}>
              {selectedKeyword.description.map((line, index) => (
                <p key={`${selectedKeyword.key}-line-${index}`} className={styles.descriptionLine}>
                  {renderDescriptionLine(
                    line,
                    openKeyword,
                    (feat) => openFeatReference(feat),
                    openSpellReference,
                    openDivinityReference
                  )}
                </p>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          character={character}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
    </article>
  );
}

export default ClassFeaturesAndFeats;
