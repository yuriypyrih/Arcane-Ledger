import clsx from "clsx";
import { ArrowLeft, CircleHelp, Dice6 } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import type {
  AbilityKey,
  AbilityScores,
  AttributeMode,
  CharacterBackgroundChoices,
  CharacterClassRulesConfig,
  CharacterCustomBackgroundConfig,
  CharacterCustomClassConfig,
  CharacterCustomSpeciesConfig,
  CharacterCustomSubclassConfig,
  CharacterDraft,
  CharacterFeatEntry,
  CharacterSpeciesChoices,
  EmeraldEnclaveFledglingChoice,
  MagicInitiateChoice,
  PurpleDragonRookChoice,
  SpellfireSparkChoice,
  SkillName
} from "../../../types";
import {
  LANGUAGE_PROFICIENCY,
  TOOL_PROFICIENCY,
  rareLanguageEntries,
  standardLanguageEntries
} from "../../../types";
import { FEATS } from "../../../codex/entries";
import { getClassStarterPack } from "../../../codex/classes/starterPack";
import {
  CUSTOM_ABILITY_SCORE_MAX,
  POINT_BUY_BUDGET,
  abilityKeys,
  alignmentOptions,
  cloneAbilities,
  createDefaultAbilities,
  createDefaultCurrencies,
  createEmptyCharacter,
  getPointBuyCost,
  getPointBuyRemaining,
  normalizePointBuyAbilities,
  speciesOptions
} from "../../../pages/CharactersPage/constants";
import { showToast, useAppDispatch } from "../../../store";
import { clampNumber } from "../../../pages/CharactersPage/shared";
import {
  backgroundOptions,
  classOptions,
  getGrantedSkillProficienciesForCharacter,
  getSkillProficiencyOptionsForClass,
  getSkillSelectionLimitForClass,
  getToolProficiencyChoicesForClass,
  normalizeCharacterProficiencies,
  normalizeSkillSelectionsForClass,
  normalizeToolSelectionsForClass,
  resolveSkillProficienciesForCharacter
} from "../../../pages/CharactersPage/proficiency";
import {
  getToolProficiencyLabel,
  languageProficiencyLabels
} from "../../../pages/CharactersPage/proficiencyOptions";
import {
  createDefaultBackgroundOriginFeatEntry,
  getBackgroundEntry,
  getBackgroundEquipmentChoice,
  getBackgroundToolChoiceOptions,
  normalizeBackgroundChoices
} from "../../../pages/CharactersPage/backgrounds";
import { getFeatLabel } from "../../../pages/CharactersPage/feats";
import { normalizeLevelAndXp } from "../../../pages/CharactersPage/experience";
import {
  CUSTOM_CLASS_NAME,
  customClassHitDice,
  isCustomClassName,
  normalizeCharacterClassRulesConfig,
  normalizeCustomClassConfig
} from "../../../pages/CharactersPage/customClass";
import {
  CUSTOM_BACKGROUND_NAME,
  CUSTOM_BACKGROUND_NAME_MAX_LENGTH,
  CUSTOM_CLASS_NAME_MAX_LENGTH,
  CUSTOM_SPECIES_NAME,
  CUSTOM_SPECIES_NAME_MAX_LENGTH,
  CUSTOM_SPECIES_SPEED_MAXIMUM,
  CUSTOM_SPECIES_SPEED_MINIMUM,
  CUSTOM_SUBCLASS_LABEL,
  CUSTOM_SUBCLASS_NAME_MAX_LENGTH,
  createCustomMetadataId,
  createDefaultCustomBackgroundConfig,
  createDefaultCustomSpeciesConfig,
  createDefaultCustomSubclassConfig,
  customSpeciesSizeOptions,
  isCustomBackgroundName,
  isCustomSpeciesName,
  isCustomSubclassId,
  normalizeCustomBackgroundConfig,
  normalizeCustomSpeciesConfig,
  normalizeCustomSpeciesSpeed,
  normalizeCustomSubclassConfig
} from "../../../pages/CharactersPage/customOrigins";
import { getAutomaticMaxHitPointsForCharacter } from "../../../pages/CharactersPage/gameplay";
import { getEffectiveHitPointMaximumForCharacter } from "../../../pages/CharactersPage/traits";
import {
  createDefaultSpeciesChoicesForSpecies,
  formatDragonbornDraconicAncestryOptionLabel,
  formatElfLineageOptionLabel,
  formatGoliathGiantAncestryOptionLabel,
  formatGnomeLineageOptionLabel,
  formatHumanOriginFeatOptionLabel,
  formatTieflingFiendishLegacyOptionLabel,
  formatBodySize,
  formatBodySizeOptions,
  getSpeciesBodySizeOptions,
  getDragonbornDraconicAncestryOptionsForSpecies,
  getElfLineageOptionsForSpecies,
  getElfSkillProficiencyOptionsForSpecies,
  getElfSpellcastingAbilityOptionsForSpecies,
  getGoliathGiantAncestryOptionsForSpecies,
  getGnomeLineageOptionsForSpecies,
  getGnomeSpellcastingAbilityOptionsForSpecies,
  getHumanOriginFeatOptionsForSpecies,
  getHumanSkillOptionsForSpecies,
  getSpeciesSpeedBonusesForCharacter,
  getSpeciesSpeedForCharacter,
  getTieflingFiendishLegacyOptionsForSpecies,
  getTieflingSpellcastingAbilityOptionsForSpecies,
  normalizeCharacterSpeciesChoices,
  normalizeCharacterSpeciesFeatureState,
  reconcileHumanOriginFeatEntries
} from "../../../pages/CharactersPage/species";
import {
  getSubclassOptionsForClassName,
  normalizeSubclassId
} from "../../../pages/CharactersPage/subclasses";
import ActionButton from "../../ActionButton";
import CellContainer from "../../CellContainer/CellContainer";
import InputRequiredBadge from "../../InputRequiredBadge";
import NumberInput from "../FormInputs/NumberInput";
import SelectInput from "../FormInputs/SelectInput";
import TextAreaInput from "../FormInputs/TextAreaInput";
import TextInput from "../FormInputs/TextInput";
import RadioContainerOption from "../CharacterSheetPage/RadioContainerOption";
import ProficiencySummaryPills from "../CharacterSheetPage/SkillsAndProficienciesForm/ProficiencySummaryPills";
import { getProficiencySummarySections } from "../CharacterSheetPage/SkillsAndProficienciesForm/proficiencySummarySections";
import AbilityScoresEditorContent from "../CharacterSheetPage/StatsForm/AbilityScoresEditorContent";
import HitPointsEditorContent, {
  HIT_POINTS_MODAL_SUMMARY,
  MAX_HIT_POINTS,
  type HitPointsEditorCharacter
} from "../CharacterSheetPage/GameplayForm/widgets/HitPointsEditorContent";
import {
  type ClassBuildPlan,
  getBuildPlan,
  speciesAbilityBonuses,
  speciesSkillAffinity
} from "./recommendedBuildData";
import {
  materializeStarterPackChoiceToInventory,
  previewStarterPackChoiceWarnings
} from "./starterPackInventory";
import {
  formatStarterPackEquipmentChoice,
  getResolvedStarterPack,
  getStarterPackSelectionLabels,
  getStarterPackSelectionOptions,
  normalizeStarterPackSelectionValues,
  resolveStarterPackChoiceCurrencies
} from "./starterPackUtils";
import { randomNamePrefixes, randomNameSuffixes } from "./characterRandomNames";
import OriginFeatSetupControls from "./OriginFeatSetupControls";
import { useCharacterFormPendingAction } from "./useCharacterFormPendingAction";
import { sanitizeUserInput } from "../../../utils/userInputSanitization";
import MulticlassGuideModal from "./MulticlassGuideModal";
import styles from "./CharacterForm.module.css";

type CharacterFormProps = {
  isEditing: boolean;
  initialValues: CharacterDraft;
  onSubmit: (draft: CharacterDraft) => void | Promise<void>;
  onBack: () => void;
};

type CreationStep = 1 | 2 | 3;

type CharacterFormValues = CharacterDraft & {
  startingEquipmentChoiceIndex: string;
  starterPackSelectionValues: Record<string, string>;
};

const disabledCreationClassNames = new Set<string>();
const randomizableClassOptions = classOptions.filter(
  (className) => !disabledCreationClassNames.has(className)
);

function normalizeCustomAbilities(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = Math.max(1, Math.min(CUSTOM_ABILITY_SCORE_MAX, abilities[ability]));
    return next;
  }, {} as AbilityScores);
}

function isPointBuyAbilityDistributionReady(
  attributeMode: AttributeMode,
  abilities: AbilityScores
): boolean {
  return (
    attributeMode !== "pointBuy" ||
    getPointBuyRemaining(normalizePointBuyAbilities(abilities)) === 0
  );
}

function normalizeSelection<T extends string>(values: string[], validOptions: readonly T[]): T[] {
  const validOptionSet = new Set(validOptions);
  return [...new Set(values)].filter((value): value is T => validOptionSet.has(value as T));
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function areCurrenciesEqual(
  left: CharacterDraft["currencies"],
  right: CharacterDraft["currencies"]
): boolean {
  return Object.keys({ ...left, ...right }).every(
    (currencyKey) => (left[currencyKey] ?? 0) === (right[currencyKey] ?? 0)
  );
}

function areStringMapsEqual(left: Record<string, string>, right: Record<string, string>): boolean {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])];
  return keys.every((key) => (left[key] ?? "") === (right[key] ?? ""));
}

function areJsonValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

function formatChoiceCount(count: number): string {
  return count === 1 ? "1 choice" : `${count} choices`;
}

function addCurrencies(
  left: CharacterDraft["currencies"],
  right: CharacterDraft["currencies"]
): CharacterDraft["currencies"] {
  const currencies = createDefaultCurrencies();

  Object.keys({ ...left, ...right }).forEach((currencyKey) => {
    currencies[currencyKey] = (left[currencyKey] ?? 0) + (right[currencyKey] ?? 0);
  });

  return currencies;
}

function getBackgroundPreferredAbilities(className: string): AbilityKey[] {
  const buildPlan = getBuildPlan(className);
  return [buildPlan.primary, buildPlan.secondary, buildPlan.tertiary];
}

function getNormalizedBackgroundChoices(
  background: string,
  choices: CharacterBackgroundChoices | undefined,
  className: string
): CharacterBackgroundChoices | undefined {
  return normalizeBackgroundChoices(background, choices, {
    preferredAbilities: getBackgroundPreferredAbilities(className)
  });
}

function getBackgroundFeatEntry(
  feats: CharacterFeatEntry[] | undefined,
  background: string
): CharacterFeatEntry | null {
  const entry = getBackgroundEntry(background);

  if (!entry) {
    return null;
  }

  return (
    feats?.find(
      (featEntry) =>
        featEntry.source?.type === "background" &&
        featEntry.source.background === entry.name &&
        featEntry.feat === entry.originFeat
    ) ?? createDefaultBackgroundOriginFeatEntry(entry.name, 1)
  );
}

function upsertBackgroundFeatEntry(
  feats: CharacterFeatEntry[] | undefined,
  background: string,
  nextEntry: CharacterFeatEntry
): CharacterFeatEntry[] {
  const entry = getBackgroundEntry(background);
  const nonBackgroundFeats = (feats ?? []).filter(
    (featEntry) => featEntry.source?.type !== "background"
  );

  if (!entry) {
    return nonBackgroundFeats;
  }

  return [...nonBackgroundFeats, nextEntry];
}

const humanOriginFeatSourceSpecies = "Human";

function isHumanOriginFeatEntry(featEntry: CharacterFeatEntry): boolean {
  return (
    featEntry.source?.type === "species" &&
    featEntry.source.species === humanOriginFeatSourceSpecies
  );
}

function getHumanOriginFeatEntry(
  feats: CharacterFeatEntry[] | undefined,
  feat: FEATS | ""
): CharacterFeatEntry | null {
  if (!feat) {
    return null;
  }

  return (
    feats?.find((featEntry) => isHumanOriginFeatEntry(featEntry) && featEntry.feat === feat) ?? null
  );
}

function upsertHumanOriginFeatEntry(
  feats: CharacterFeatEntry[] | undefined,
  nextEntry: CharacterFeatEntry
): CharacterFeatEntry[] {
  return [...(feats ?? []).filter((featEntry) => !isHumanOriginFeatEntry(featEntry)), nextEntry];
}

function updateMagicInitiateFeatEntry(
  featEntry: CharacterFeatEntry | null,
  partialChoice: Partial<MagicInitiateChoice>
): CharacterFeatEntry | null {
  if (!featEntry?.magicInitiate) {
    return null;
  }

  return {
    ...featEntry,
    magicInitiate: {
      ...featEntry.magicInitiate,
      ...partialChoice
    }
  };
}

function updateCultOfDragonInitiateFeatEntry(
  featEntry: CharacterFeatEntry | null,
  language: LANGUAGE_PROFICIENCY
): CharacterFeatEntry | null {
  if (!featEntry?.cultOfDragonInitiate) {
    return null;
  }

  return {
    ...featEntry,
    cultOfDragonInitiate: {
      ...featEntry.cultOfDragonInitiate,
      language
    }
  };
}

function updateEmeraldEnclaveFledglingFeatEntry(
  featEntry: CharacterFeatEntry | null,
  partialChoice: Partial<EmeraldEnclaveFledglingChoice>
): CharacterFeatEntry | null {
  if (!featEntry?.emeraldEnclaveFledgling) {
    return null;
  }

  return {
    ...featEntry,
    emeraldEnclaveFledgling: {
      ...featEntry.emeraldEnclaveFledgling,
      ...partialChoice
    }
  };
}

function updateSpellfireSparkFeatEntry(
  featEntry: CharacterFeatEntry | null,
  partialChoice: Partial<SpellfireSparkChoice>
): CharacterFeatEntry | null {
  if (!featEntry?.spellfireSpark) {
    return null;
  }

  return {
    ...featEntry,
    spellfireSpark: {
      ...featEntry.spellfireSpark,
      ...partialChoice
    }
  };
}

function updatePurpleDragonRookFeatEntry(
  featEntry: CharacterFeatEntry | null,
  skill: PurpleDragonRookChoice["skill"]
): CharacterFeatEntry | null {
  if (!featEntry?.purpleDragonRook) {
    return null;
  }

  return {
    ...featEntry,
    purpleDragonRook: {
      ...featEntry.purpleDragonRook,
      skill
    }
  };
}

function updateToolFeatEntry(
  featEntry: CharacterFeatEntry | null,
  feat: FEATS.CRAFTER | FEATS.HARPER_AGENT | FEATS.MUSICIAN,
  index: number,
  tool: TOOL_PROFICIENCY
): CharacterFeatEntry | null {
  if (!featEntry) {
    return null;
  }

  if (feat === FEATS.CRAFTER && featEntry.crafter) {
    const toolProficiencies = [...featEntry.crafter.toolProficiencies] as [
      TOOL_PROFICIENCY,
      TOOL_PROFICIENCY,
      TOOL_PROFICIENCY
    ];
    toolProficiencies[index] = tool;

    return {
      ...featEntry,
      crafter: {
        toolProficiencies
      }
    };
  }

  if (feat === FEATS.HARPER_AGENT && featEntry.harperAgent) {
    return {
      ...featEntry,
      harperAgent: {
        toolProficiency: tool
      }
    };
  }

  if (feat === FEATS.MUSICIAN && featEntry.musician) {
    const toolProficiencies = [...featEntry.musician.toolProficiencies] as [
      TOOL_PROFICIENCY,
      TOOL_PROFICIENCY,
      TOOL_PROFICIENCY
    ];
    toolProficiencies[index] = tool;

    return {
      ...featEntry,
      musician: {
        toolProficiencies
      }
    };
  }

  return null;
}

function updateSkilledFeatEntry(
  featEntry: CharacterFeatEntry | null,
  index: number,
  value: string
): CharacterFeatEntry | null {
  if (!featEntry?.skilled) {
    return null;
  }

  const selections = [...featEntry.skilled.selections] as NonNullable<
    CharacterFeatEntry["skilled"]
  >["selections"];

  if (value.startsWith("skill:")) {
    selections[index] = {
      kind: "skill",
      skill: value.slice("skill:".length) as SkillName
    };
  } else if (value.startsWith("tool:")) {
    selections[index] = {
      kind: "tool",
      tool: value.slice("tool:".length) as TOOL_PROFICIENCY
    };
  }

  return {
    ...featEntry,
    skilled: {
      selections
    }
  };
}

function createRandomBackgroundState(
  className: string
): Pick<CharacterDraft, "background" | "backgroundChoices" | "feats"> {
  const background = createRandomBackground();
  const backgroundChoices = getNormalizedBackgroundChoices(background, undefined, className);
  const backgroundOriginFeat = createDefaultBackgroundOriginFeatEntry(background, 1);

  return {
    background,
    backgroundChoices,
    feats: backgroundOriginFeat ? [backgroundOriginFeat] : []
  };
}

function createFormValues(
  draft: CharacterDraft,
  options?: {
    defaultHitPointMode?: CharacterDraft["maxHitPointsMode"];
    startingEquipmentChoiceIndex?: string;
    starterPackSelectionValues?: Record<string, string>;
  }
): CharacterFormValues {
  const normalizedCustomClass = normalizeCustomClassConfig(draft.customClass);

  return {
    ...draft,
    customClass: normalizedCustomClass,
    customSubclass: normalizeCustomSubclassConfig(draft.customSubclass, {
      className: draft.className
    }),
    classRules: normalizeCharacterClassRulesConfig(draft.classRules, {
      className: draft.className,
      legacyCustomClass: normalizedCustomClass
    }),
    customSpecies: isCustomSpeciesName(draft.species)
      ? normalizeCustomSpeciesConfig(draft.customSpecies)
      : undefined,
    customBackground: isCustomBackgroundName(draft.background)
      ? normalizeCustomBackgroundConfig(draft.customBackground)
      : undefined,
    abilities:
      draft.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(draft.abilities)
        : normalizeCustomAbilities(draft.abilities),
    maxHitPointsMode: draft.maxHitPointsMode ?? options?.defaultHitPointMode ?? "automatic",
    startingEquipmentChoiceIndex: options?.startingEquipmentChoiceIndex ?? "",
    starterPackSelectionValues: options?.starterPackSelectionValues ?? {}
  };
}

function createDraftCustomClassConfig(
  value?: CharacterCustomClassConfig
): CharacterCustomClassConfig {
  const normalizedConfig = normalizeCustomClassConfig(value);

  return {
    ...normalizedConfig,
    id: normalizedConfig.id ?? createCustomMetadataId("class"),
    name: normalizedConfig.name ?? ""
  };
}

function createDraftCustomSubclassConfig(
  className: string,
  value?: CharacterCustomSubclassConfig
): CharacterCustomSubclassConfig {
  return (
    normalizeCustomSubclassConfig(value, {
      className
    }) ?? createDefaultCustomSubclassConfig(className)
  );
}

function createDraftCustomSpeciesConfig(
  value?: CharacterCustomSpeciesConfig
): CharacterCustomSpeciesConfig {
  return normalizeCustomSpeciesConfig(value) ?? createDefaultCustomSpeciesConfig();
}

function createDraftCustomBackgroundConfig(
  value?: CharacterCustomBackgroundConfig
): CharacterCustomBackgroundConfig {
  return normalizeCustomBackgroundConfig(value) ?? createDefaultCustomBackgroundConfig();
}

function getEffectiveHitPointMaximumForDraft(
  draft: Pick<CharacterDraft, "className" | "hitPoints"> &
    Partial<
      Pick<
        CharacterDraft,
        | "customClass"
        | "customSpecies"
        | "level"
        | "species"
        | "subclassId"
        | "statusEntries"
        | "feats"
      >
    >
): number {
  return getEffectiveHitPointMaximumForCharacter({
    className: draft.className,
    subclassId: draft.subclassId,
    level: draft.level,
    species: draft.species,
    customSpecies: draft.customSpecies,
    hitPoints: draft.hitPoints,
    statusEntries: draft.statusEntries ?? [],
    feats: draft.feats
  });
}

function createBasicProfileSnapshot(
  values: CharacterFormValues,
  options?: {
    includeBackgroundDefaults?: boolean;
  }
): CharacterFormValues {
  const defaults = createEmptyCharacter();
  const normalizedProgress = normalizeLevelAndXp(values.level, values.xp);
  const includeBackgroundDefaults = options?.includeBackgroundDefaults ?? true;
  const backgroundDefaults = getNormalizedBackgroundChoices(
    values.background,
    values.backgroundChoices,
    values.className
  );

  return createFormValues(
    {
      ...defaults,
      name: values.name,
      species: values.species,
      customSpecies: isCustomSpeciesName(values.species)
        ? normalizeCustomSpeciesConfig(values.customSpecies)
        : undefined,
      speciesChoices: undefined,
      speciesFeatureState: normalizeCharacterSpeciesFeatureState(values.species, undefined),
      className: values.className,
      subclassId: isCustomClassName(values.className) ? "" : values.subclassId,
      customSubclass:
        !isCustomClassName(values.className) && values.subclassId === values.customSubclass?.id
          ? normalizeCustomSubclassConfig(values.customSubclass, { className: values.className })
          : undefined,
      classRules: normalizeCharacterClassRulesConfig(values.classRules, {
        className: values.className,
        legacyCustomClass: values.customClass
      }),
      customClass: normalizeCustomClassConfig(values.customClass),
      background: values.background,
      customBackground: isCustomBackgroundName(values.background)
        ? normalizeCustomBackgroundConfig(values.customBackground)
        : undefined,
      backgroundChoices: includeBackgroundDefaults
        ? backgroundDefaults
        : backgroundDefaults
          ? { abilityScoreIncrease: backgroundDefaults.abilityScoreIncrease }
          : undefined,
      level: normalizedProgress.level,
      xp: normalizedProgress.xp,
      attributeMode: "pointBuy",
      abilities: createDefaultAbilities()
    },
    {
      defaultHitPointMode: "automatic",
      startingEquipmentChoiceIndex: "",
      starterPackSelectionValues: {}
    }
  );
}

function isBackgroundAbilityScoreIncreaseReady(
  allowedAbilities: readonly AbilityKey[],
  choice: CharacterBackgroundChoices["abilityScoreIncrease"] | undefined
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

function isBackgroundEquipmentModeReady(
  value: CharacterBackgroundChoices["equipmentMode"] | undefined
): boolean {
  return value === "equipment" || value === "gold";
}

function getAbilityPriorityOrder(plan: ClassBuildPlan): AbilityKey[] {
  const preferredAbilities = [plan.primary, plan.secondary, plan.tertiary];

  return [
    ...preferredAbilities,
    ...abilityKeys.filter((ability) => !preferredAbilities.includes(ability))
  ];
}

function createFallbackRecommendedAbilities(
  species: string,
  level: number,
  buildPlan: ClassBuildPlan
): AbilityScores {
  const recommendedScores = [15, 14, 13, 12, 10, 8];
  const abilityOrder = getAbilityPriorityOrder(buildPlan);
  const abilities = abilityOrder.reduce((next, ability, index) => {
    next[ability] = recommendedScores[index] ?? 8;
    return next;
  }, {} as AbilityScores);
  const normalizedLevel = clampNumber(String(level), 1, 20, 1);
  const speciesBonuses = speciesAbilityBonuses[species] ?? {};

  abilityKeys.forEach((ability) => {
    abilities[ability] += speciesBonuses[ability] ?? 0;
  });

  const abilityIncreaseCount = Math.floor((normalizedLevel - 1) / 4);
  const levelIncreaseOrder = [buildPlan.primary, buildPlan.secondary, buildPlan.tertiary];

  for (let index = 0; index < abilityIncreaseCount; index += 1) {
    const targetAbility = levelIncreaseOrder[index % levelIncreaseOrder.length];
    abilities[targetAbility] = Math.min(CUSTOM_ABILITY_SCORE_MAX, abilities[targetAbility] + 1);
  }

  return normalizeCustomAbilities(abilities);
}

function createFallbackRecommendedSkills(
  species: string,
  speciesChoices: CharacterSpeciesChoices | undefined,
  className: string,
  background: string,
  backgroundChoices: CharacterBackgroundChoices | undefined,
  buildPlan: ClassBuildPlan
): SkillName[] {
  const availableClassSkills = getSkillProficiencyOptionsForClass(className);
  const targetCount = getSkillSelectionLimitForClass(className);
  const grantedSkillSet = new Set(
    getGrantedSkillProficienciesForCharacter(
      className,
      species,
      background,
      backgroundChoices,
      speciesChoices
    ).map((entry) => entry.skill)
  );

  return normalizeSelection(
    [
      ...buildPlan.preferredSkills,
      ...(speciesSkillAffinity[species] ?? []),
      ...availableClassSkills
    ],
    availableClassSkills
  )
    .filter((skill) => !grantedSkillSet.has(skill))
    .slice(0, targetCount);
}

function createRecommendedCharacterDraft(profile: CharacterFormValues): CharacterFormValues {
  const normalizedProgress = normalizeLevelAndXp(profile.level, profile.xp);
  const speciesChoices = createDefaultSpeciesChoicesForSpecies(profile.species);
  const starterPack = getResolvedStarterPack(profile.className);
  const configuredStarterPack = getClassStarterPack(profile.className);
  const buildPlan = getBuildPlan(profile.className);
  const backgroundChoices = getNormalizedBackgroundChoices(
    profile.background,
    profile.backgroundChoices,
    profile.className
  );
  const backgroundEquipmentChoice = getBackgroundEquipmentChoice(
    profile.background,
    backgroundChoices
  );
  const backgroundOriginFeat = createDefaultBackgroundOriginFeatEntry(
    profile.background,
    normalizedProgress.level
  );

  if (starterPack.hasConfiguredStarterPack && starterPack.recommendedAbilityScores) {
    const abilities = cloneAbilities(starterPack.recommendedAbilityScores);
    const grantedSkillSet = new Set(
      getGrantedSkillProficienciesForCharacter(
        profile.className,
        profile.species,
        profile.background,
        backgroundChoices,
        speciesChoices
      ).map((entry) => entry.skill)
    );
    const recommendedSkills = normalizeSelection(
      [...starterPack.recommendedSkillProficiencies, ...starterPack.skillProficiencies],
      starterPack.skillProficiencies
    )
      .filter((skill) => !grantedSkillSet.has(skill))
      .slice(0, starterPack.skillProficiencySelectionCount);
    const recommendedTools = normalizeToolSelectionsForClass(
      profile.className,
      configuredStarterPack?.recommendedToolProficiencies ?? []
    );
    const recommendedChoice =
      starterPack.recommendedStartingEquipmentIndex !== null
        ? (starterPack.startingEquipment[starterPack.recommendedStartingEquipmentIndex] ?? null)
        : null;
    const starterPackSelectionValues = normalizeStarterPackSelectionValues(
      configuredStarterPack,
      recommendedTools,
      {}
    );
    const hitPoints = getAutomaticMaxHitPointsForCharacter({
      className: profile.className,
      level: normalizedProgress.level,
      abilities,
      classFeatureState: profile.classFeatureState ?? {},
      background: profile.background,
      backgroundChoices
    });
    const classCurrencies = resolveStarterPackChoiceCurrencies(recommendedChoice);
    const backgroundCurrencies = resolveStarterPackChoiceCurrencies(backgroundEquipmentChoice);

    return createFormValues(
      {
        ...createEmptyCharacter(),
        name: profile.name,
        species: profile.species,
        speciesChoices,
        speciesFeatureState: normalizeCharacterSpeciesFeatureState(profile.species, undefined),
        className: profile.className,
        subclassId: profile.subclassId,
        background: profile.background,
        backgroundChoices,
        level: normalizedProgress.level,
        xp: normalizedProgress.xp,
        hitPoints,
        currentHitPoints: hitPoints,
        maxHitPointsMode: "automatic",
        attributeMode: "pointBuy",
        abilities,
        alignment: "True Neutral",
        currencies: addCurrencies(classCurrencies, backgroundCurrencies),
        skills: recommendedSkills,
        toolProficiencies: recommendedTools,
        equipment: [],
        feats: backgroundOriginFeat ? [backgroundOriginFeat] : []
      },
      {
        defaultHitPointMode: "automatic",
        startingEquipmentChoiceIndex:
          starterPack.recommendedStartingEquipmentIndex !== null
            ? String(starterPack.recommendedStartingEquipmentIndex)
            : "",
        starterPackSelectionValues
      }
    );
  }

  const abilities = createFallbackRecommendedAbilities(
    profile.species,
    normalizedProgress.level,
    buildPlan
  );
  const hitPoints = getAutomaticMaxHitPointsForCharacter({
    className: profile.className,
    level: normalizedProgress.level,
    abilities,
    classFeatureState: profile.classFeatureState ?? {},
    background: profile.background,
    backgroundChoices
  });

  return createFormValues(
    {
      ...createEmptyCharacter(),
      name: profile.name,
      species: profile.species,
      speciesChoices,
      speciesFeatureState: normalizeCharacterSpeciesFeatureState(profile.species, undefined),
      className: profile.className,
      subclassId: profile.subclassId,
      background: profile.background,
      backgroundChoices,
      level: normalizedProgress.level,
      xp: normalizedProgress.xp,
      hitPoints,
      currentHitPoints: hitPoints,
      maxHitPointsMode: "automatic",
      attributeMode: "pointBuy",
      abilities,
      alignment: "True Neutral",
      currencies: resolveStarterPackChoiceCurrencies(backgroundEquipmentChoice),
      skills: createFallbackRecommendedSkills(
        profile.species,
        speciesChoices,
        profile.className,
        profile.background,
        backgroundChoices,
        buildPlan
      ),
      equipment: [],
      feats: backgroundOriginFeat ? [backgroundOriginFeat] : []
    },
    {
      defaultHitPointMode: "automatic",
      startingEquipmentChoiceIndex: "",
      starterPackSelectionValues: {}
    }
  );
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(items: readonly T[]): T {
  return items[getRandomInt(0, items.length - 1)];
}

function getRandomSubclassIdForClass(className: string): string {
  const subclassOptions = getSubclassOptionsForClassName(className);

  return subclassOptions.length > 0 ? getRandomItem(subclassOptions).id : "";
}

function getDefaultSubclassIdForClass(className: string): string {
  return getSubclassOptionsForClassName(className)[0]?.id ?? "";
}

function shuffle<T>(values: T[]): T[] {
  const nextValues = [...values];

  for (let index = nextValues.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomInt(0, index);
    [nextValues[index], nextValues[swapIndex]] = [nextValues[swapIndex], nextValues[index]];
  }

  return nextValues;
}

function pickRandomSubset<T extends string>(
  options: readonly T[],
  minSize: number,
  maxSize: number
): T[] {
  if (options.length === 0) {
    return [];
  }

  const normalizedMin = Math.max(0, Math.min(minSize, options.length));
  const normalizedMax = Math.max(normalizedMin, Math.min(maxSize, options.length));
  const size = getRandomInt(normalizedMin, normalizedMax);

  return shuffle([...options]).slice(0, size);
}

function createRandomCustomAbilities(): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = getRandomInt(6, 18);
    return next;
  }, {} as AbilityScores);
}

function createRandomPointBuyAbilities(): AbilityScores {
  const abilities = createDefaultAbilities();
  let remainingBudget = POINT_BUY_BUDGET;
  let attempts = 0;

  while (remainingBudget > 0 && attempts < 500) {
    attempts += 1;
    const ability = getRandomItem(abilityKeys);
    const currentScore = abilities[ability];

    if (currentScore >= 15) {
      continue;
    }

    const upgradeCost = getPointBuyCost(currentScore + 1) - getPointBuyCost(currentScore);

    if (upgradeCost > remainingBudget) {
      continue;
    }

    abilities[ability] += 1;
    remainingBudget -= upgradeCost;
  }

  return abilities;
}

function createRandomBackground(): string {
  return backgroundOptions.length > 0 ? getRandomItem(backgroundOptions) : "";
}

function createRandomName(): string {
  return `${getRandomItem(randomNamePrefixes)} ${getRandomItem(randomNameSuffixes)}`;
}

function CharacterForm({ isEditing, initialValues, onSubmit, onBack }: CharacterFormProps) {
  const dispatch = useAppDispatch();
  const [wizardStep, setWizardStep] = useState<CreationStep>(1);
  const [stepOneSnapshot, setStepOneSnapshot] = useState<CharacterFormValues | null>(null);
  const [attemptedBuildAdvance, setAttemptedBuildAdvance] = useState(false);
  const [isMulticlassGuideOpen, setIsMulticlassGuideOpen] = useState(false);
  const [starterPackWarnings, setStarterPackWarnings] = useState<string[]>([]);
  const { hasPendingAction, pendingAction, runPendingAction } = useCharacterFormPendingAction();
  const initialFormValues = useMemo(
    () =>
      createFormValues(initialValues, {
        defaultHitPointMode: isEditing ? (initialValues.maxHitPointsMode ?? "custom") : "automatic",
        startingEquipmentChoiceIndex: "",
        starterPackSelectionValues: {}
      }),
    [initialValues, isEditing]
  );
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    trigger
  } = useForm<CharacterFormValues>({
    defaultValues: initialFormValues
  });
  const handlePendingSubmit = handleSubmit((values) =>
    runPendingAction("submit", () => submitForm(values))
  );
  const [
    selectedName,
    selectedClassName,
    selectedSubclassId,
    selectedCustomSubclass,
    selectedClassRules,
    selectedCustomClass,
    selectedSpecies,
    selectedCustomSpecies,
    selectedSpeciesChoices,
    selectedBackground,
    selectedCustomBackground,
    selectedBackgroundChoices,
    selectedLevel,
    attributeMode,
    abilities,
    selectedHitPoints,
    selectedCurrentHitPoints,
    selectedMaxHitPointsMode,
    alignment,
    selectedSkills,
    selectedToolProficiencies,
    selectedCurrencies,
    selectedStartingEquipmentChoiceIndex,
    selectedStarterPackSelectionValues,
    selectedFeats,
    selectedClassFeatureState
  ] = useWatch({
    control,
    name: [
      "name",
      "className",
      "subclassId",
      "customSubclass",
      "classRules",
      "customClass",
      "species",
      "customSpecies",
      "speciesChoices",
      "background",
      "customBackground",
      "backgroundChoices",
      "level",
      "attributeMode",
      "abilities",
      "hitPoints",
      "currentHitPoints",
      "maxHitPointsMode",
      "alignment",
      "skills",
      "toolProficiencies",
      "currencies",
      "startingEquipmentChoiceIndex",
      "starterPackSelectionValues",
      "feats",
      "classFeatureState"
    ]
  });
  const resolvedName = selectedName ?? initialFormValues.name;
  const resolvedClassName = selectedClassName ?? initialFormValues.className;
  const resolvedSubclassId = selectedSubclassId ?? initialFormValues.subclassId ?? "";
  const resolvedCustomSubclass = useMemo(
    () =>
      normalizeCustomSubclassConfig(selectedCustomSubclass ?? initialFormValues.customSubclass, {
        className: resolvedClassName
      }),
    [initialFormValues.customSubclass, resolvedClassName, selectedCustomSubclass]
  );
  const draftCustomSubclassOption = useMemo(
    () => createDraftCustomSubclassConfig(resolvedClassName, resolvedCustomSubclass),
    [resolvedClassName, resolvedCustomSubclass]
  );
  const resolvedCustomClass = useMemo(
    () => normalizeCustomClassConfig(selectedCustomClass ?? initialFormValues.customClass),
    [initialFormValues.customClass, selectedCustomClass]
  );
  const resolvedClassRules = useMemo(
    () =>
      normalizeCharacterClassRulesConfig(selectedClassRules ?? initialFormValues.classRules, {
        className: resolvedClassName,
        legacyCustomClass: resolvedCustomClass
      }),
    [initialFormValues.classRules, resolvedClassName, resolvedCustomClass, selectedClassRules]
  );
  const isCustomClassSelected = isCustomClassName(resolvedClassName);
  const resolvedSpecies = selectedSpecies ?? initialFormValues.species;
  const resolvedCustomSpecies = useMemo(
    () => normalizeCustomSpeciesConfig(selectedCustomSpecies ?? initialFormValues.customSpecies),
    [initialFormValues.customSpecies, selectedCustomSpecies]
  );
  const isCustomSpeciesSelected = isCustomSpeciesName(resolvedSpecies);
  const resolvedSpeciesChoices = selectedSpeciesChoices ?? initialFormValues.speciesChoices;
  const resolvedBackground = selectedBackground ?? initialFormValues.background;
  const resolvedCustomBackground = useMemo(
    () =>
      normalizeCustomBackgroundConfig(
        selectedCustomBackground ?? initialFormValues.customBackground
      ),
    [initialFormValues.customBackground, selectedCustomBackground]
  );
  const isCustomBackgroundSelected = isCustomBackgroundName(resolvedBackground);
  const isCustomSubclassSelected =
    !isCustomClassSelected &&
    isCustomSubclassId(resolvedSubclassId) &&
    resolvedCustomSubclass?.id === resolvedSubclassId;
  const hasAnyCustomOriginSelected =
    isCustomClassSelected ||
    isCustomSubclassSelected ||
    isCustomSpeciesSelected ||
    isCustomBackgroundSelected;
  const resolvedBackgroundChoiceInput =
    selectedBackgroundChoices ?? initialFormValues.backgroundChoices;
  const resolvedBackgroundChoices = useMemo(
    () =>
      getNormalizedBackgroundChoices(
        resolvedBackground,
        resolvedBackgroundChoiceInput,
        resolvedClassName
      ),
    [resolvedBackground, resolvedBackgroundChoiceInput, resolvedClassName]
  );
  const displayedBackgroundChoices = isEditing
    ? resolvedBackgroundChoices
    : resolvedBackgroundChoiceInput;
  const resolvedLevel = selectedLevel ?? initialFormValues.level;
  const resolvedAttributeMode = attributeMode ?? initialFormValues.attributeMode;
  const resolvedAbilities = abilities ?? initialFormValues.abilities;
  const resolvedHitPoints = selectedHitPoints ?? initialFormValues.hitPoints;
  const resolvedCurrentHitPoints = selectedCurrentHitPoints ?? initialFormValues.currentHitPoints;
  const resolvedMaxHitPointsMode =
    selectedMaxHitPointsMode ?? initialFormValues.maxHitPointsMode ?? "automatic";
  const resolvedAlignment = alignment ?? initialFormValues.alignment;
  const resolvedSkills = selectedSkills ?? initialFormValues.skills;
  const resolvedToolSelections = useMemo(
    () => selectedToolProficiencies ?? initialFormValues.toolProficiencies ?? [],
    [initialFormValues.toolProficiencies, selectedToolProficiencies]
  );
  const resolvedCurrencies = selectedCurrencies ?? initialFormValues.currencies;
  const resolvedStartingEquipmentChoiceIndex = selectedStartingEquipmentChoiceIndex ?? "";
  const resolvedStarterPackSelectionValues = useMemo(
    () => selectedStarterPackSelectionValues ?? {},
    [selectedStarterPackSelectionValues]
  );
  const resolvedFeats = useMemo(
    () => selectedFeats ?? initialFormValues.feats ?? [],
    [initialFormValues.feats, selectedFeats]
  );
  const resolvedClassFeatureState = useMemo(
    () => selectedClassFeatureState ?? initialFormValues.classFeatureState ?? {},
    [initialFormValues.classFeatureState, selectedClassFeatureState]
  );
  const speciesBodySizeOptions = useMemo(
    () => getSpeciesBodySizeOptions(resolvedSpecies),
    [resolvedSpecies]
  );
  const draconicAncestryOptions = useMemo(
    () => getDragonbornDraconicAncestryOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const elfLineageOptions = useMemo(
    () => getElfLineageOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const elfSkillProficiencyOptions = useMemo(
    () => getElfSkillProficiencyOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const elfSpellcastingAbilityOptions = useMemo(
    () => getElfSpellcastingAbilityOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const gnomeLineageOptions = useMemo(
    () => getGnomeLineageOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const gnomeSpellcastingAbilityOptions = useMemo(
    () => getGnomeSpellcastingAbilityOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const giantAncestryOptions = useMemo(
    () => getGoliathGiantAncestryOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const humanSkillProficiencyOptions = useMemo(
    () => getHumanSkillOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const humanOriginFeatOptions = useMemo(
    () => getHumanOriginFeatOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const tieflingLegacyOptions = useMemo(
    () => getTieflingFiendishLegacyOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const tieflingSpellcastingAbilityOptions = useMemo(
    () => getTieflingSpellcastingAbilityOptionsForSpecies(resolvedSpecies),
    [resolvedSpecies]
  );
  const normalizedSpeciesChoices = useMemo(
    () => normalizeCharacterSpeciesChoices(resolvedSpecies, resolvedSpeciesChoices),
    [resolvedSpecies, resolvedSpeciesChoices]
  );
  const selectedBodySize = normalizedSpeciesChoices?.bodySize ?? "";
  const selectedDraconicAncestry = normalizedSpeciesChoices?.draconicAncestry ?? "";
  const selectedElvenLineage = normalizedSpeciesChoices?.elvenLineage ?? "";
  const selectedElvenSkillProficiency = normalizedSpeciesChoices?.elvenSkillProficiency ?? "";
  const selectedElvenSpellcastingAbility = normalizedSpeciesChoices?.elvenSpellcastingAbility ?? "";
  const selectedGnomeLineage = normalizedSpeciesChoices?.gnomeLineage ?? "";
  const selectedGnomeSpellcastingAbility = normalizedSpeciesChoices?.gnomeSpellcastingAbility ?? "";
  const selectedGiantAncestry = normalizedSpeciesChoices?.giantAncestry ?? "";
  const selectedHumanSkillProficiency = normalizedSpeciesChoices?.humanSkillProficiency ?? "";
  const selectedHumanOriginFeat = normalizedSpeciesChoices?.humanOriginFeat ?? "";
  const selectedTieflingLegacy = normalizedSpeciesChoices?.tieflingLegacy ?? "";
  const selectedTieflingSpellcastingAbility =
    normalizedSpeciesChoices?.tieflingSpellcastingAbility ?? "";
  const hasSubclassSelection = !isCustomClassSelected;
  const availableSubclassOptions = isCustomClassSelected
    ? []
    : getSubclassOptionsForClassName(resolvedClassName);
  const starterPack = getResolvedStarterPack(resolvedClassName);
  const configuredStarterPack = isCustomClassSelected ? null : getClassStarterPack(resolvedClassName);
  const backgroundEntry = getBackgroundEntry(resolvedBackground);
  const backgroundToolOptions = getBackgroundToolChoiceOptions(resolvedBackground);
  const backgroundSkillOptions = backgroundEntry?.grantedSkillProficiencies ?? [];
  const backgroundSkillSelectionLimit = Math.min(2, backgroundSkillOptions.length);
  const hasBackgroundSkillChoice = backgroundSkillOptions.length > backgroundSkillSelectionLimit;
  const hasBackgroundToolChoice = backgroundToolOptions.length > 0;
  const standardBackgroundLanguageOptions = standardLanguageEntries.map(
    (entry) => entry.proficiency
  );
  const rareBackgroundLanguageOptions = rareLanguageEntries.map((entry) => entry.proficiency);
  const backgroundLanguageOptions = [
    ...standardBackgroundLanguageOptions,
    ...rareBackgroundLanguageOptions
  ];
  const selectedBackgroundSkillProficiencies = displayedBackgroundChoices?.skillProficiencies ?? [];
  const selectedBackgroundLanguageProficiencies =
    displayedBackgroundChoices?.languageProficiencies ??
    resolvedBackgroundChoices?.languageProficiencies ??
    [];
  const selectedBackgroundToolProficiencies =
    displayedBackgroundChoices?.toolProficiencies ??
    (displayedBackgroundChoices?.toolProficiency
      ? [displayedBackgroundChoices.toolProficiency]
      : []);
  const selectedBackgroundToolChoice: TOOL_PROFICIENCY | "" =
    displayedBackgroundChoices?.toolProficiency ?? selectedBackgroundToolProficiencies[0] ?? "";
  const selectedBackgroundEquipmentChoice = useMemo(() => {
    if (
      !isEditing &&
      wizardStep === 2 &&
      backgroundEntry &&
      !isBackgroundEquipmentModeReady(displayedBackgroundChoices?.equipmentMode)
    ) {
      return null;
    }

    return getBackgroundEquipmentChoice(resolvedBackground, resolvedBackgroundChoices);
  }, [
    backgroundEntry,
    displayedBackgroundChoices?.equipmentMode,
    isEditing,
    resolvedBackground,
    resolvedBackgroundChoices,
    wizardStep
  ]);
  const selectedBackgroundFeatEntry = getBackgroundFeatEntry(resolvedFeats, resolvedBackground);
  const reconciledHumanOriginFeats = useMemo(
    () =>
      reconcileHumanOriginFeatEntries(
        resolvedFeats,
        resolvedSpecies,
        normalizedSpeciesChoices,
        resolvedLevel
      ),
    [normalizedSpeciesChoices, resolvedFeats, resolvedLevel, resolvedSpecies]
  );
  const selectedHumanOriginFeatEntry = getHumanOriginFeatEntry(
    reconciledHumanOriginFeats,
    selectedHumanOriginFeat
  );
  const proficiencyPreviewFeats = useMemo(() => {
    const backgroundFeat = getBackgroundFeatEntry(resolvedFeats, resolvedBackground);
    const backgroundReconciledFeats = backgroundFeat
      ? upsertBackgroundFeatEntry(resolvedFeats, resolvedBackground, backgroundFeat)
      : resolvedFeats.filter((featEntry) => featEntry.source?.type !== "background");

    return reconcileHumanOriginFeatEntries(
      backgroundReconciledFeats,
      resolvedSpecies,
      normalizedSpeciesChoices,
      resolvedLevel
    );
  }, [
    normalizedSpeciesChoices,
    resolvedBackground,
    resolvedFeats,
    resolvedLevel,
    resolvedSpecies
  ]);
  const proficiencyPreviewCollections = useMemo(
    () =>
      normalizeCharacterProficiencies({
        className: resolvedClassName,
        level: resolvedLevel,
        species: resolvedSpecies,
        speciesChoices: normalizedSpeciesChoices,
        background: resolvedBackground,
        backgroundChoices: resolvedBackgroundChoices,
        subclassId: resolvedSubclassId,
        classFeatureState: resolvedClassFeatureState,
        skillProficiencies: [],
        savingThrowProficiencies: [],
        weaponProficiencies: [],
        armorProficiencies: [],
        toolProficiencies: [],
        languageProficiencies: [],
        selectedClassSkills: resolvedSkills,
        selectedClassToolProficiencies: resolvedToolSelections,
        feats: proficiencyPreviewFeats
      }),
    [
      normalizedSpeciesChoices,
      proficiencyPreviewFeats,
      resolvedBackground,
      resolvedBackgroundChoices,
      resolvedClassFeatureState,
      resolvedClassName,
      resolvedLevel,
      resolvedSkills,
      resolvedSpecies,
      resolvedSubclassId,
      resolvedToolSelections
    ]
  );
  const proficiencyPreviewSections = useMemo(
    () => getProficiencySummarySections(proficiencyPreviewCollections, resolvedClassName),
    [proficiencyPreviewCollections, resolvedClassName]
  );
  const availableSkillOptions = starterPack.skillProficiencies;
  const skillSelectionLimit = starterPack.skillProficiencySelectionCount;
  const { choices: availableToolOptions, count: toolSelectionLimit } =
    getToolProficiencyChoicesForClass(resolvedClassName);
  const starterEquipmentChoices = starterPack.startingEquipment;
  const normalizedStarterPackSelectionValues = useMemo(
    () =>
      normalizeStarterPackSelectionValues(
        configuredStarterPack,
        resolvedToolSelections,
        resolvedStarterPackSelectionValues
      ),
    [configuredStarterPack, resolvedStarterPackSelectionValues, resolvedToolSelections]
  );
  const selectedStarterEquipmentChoice =
    resolvedStartingEquipmentChoiceIndex.length > 0
      ? (starterEquipmentChoices[Number(resolvedStartingEquipmentChoiceIndex)] ?? null)
      : null;
  const starterPackSelectionLabels = useMemo(
    () =>
      getStarterPackSelectionLabels(
        configuredStarterPack,
        resolvedToolSelections,
        normalizedStarterPackSelectionValues
      ),
    [configuredStarterPack, normalizedStarterPackSelectionValues, resolvedToolSelections]
  );
  const requiredStarterPackSelections = (
    configuredStarterPack?.startingEquipmentSelections ?? []
  ).filter(
    (selection) =>
      selectedStarterEquipmentChoice?.some(
        (reference) => reference.type === "selected-tool" && reference.selectionId === selection.id
      ) ?? false
  );
  const automaticHitPoints = getAutomaticMaxHitPointsForCharacter({
    className: resolvedClassName,
    classRules: resolvedClassRules,
    customClass: resolvedCustomClass,
    level: resolvedLevel,
    abilities: resolvedAbilities,
    classFeatureState: getValues("classFeatureState") ?? {},
    background: resolvedBackground,
    backgroundChoices: resolvedBackgroundChoices
  });
  const hitPointEditorCharacter: HitPointsEditorCharacter = {
    abilities: resolvedAbilities,
    background: resolvedBackground,
    backgroundChoices: resolvedBackgroundChoices,
    classFeatureState: getValues("classFeatureState") ?? {},
    className: resolvedClassName,
    classRules: resolvedClassRules,
    currentHitPoints: resolvedCurrentHitPoints,
    customClass: resolvedCustomClass,
    feats: resolvedFeats,
    hitPoints: resolvedHitPoints,
    level: resolvedLevel,
    species: resolvedSpecies,
    statusEntries: getValues("statusEntries") ?? [],
    subclassId: resolvedSubclassId
  };
  const pointBuyRemaining = getPointBuyRemaining(resolvedAbilities);
  const resolvedSkillSelections = resolveSkillProficienciesForCharacter(
    resolvedClassName,
    resolvedSpecies,
    resolvedBackground,
    resolvedSkills,
    resolvedBackgroundChoices,
    normalizedSpeciesChoices
  );
  const humanSkillSelectOptions = useMemo(() => {
    const unavailableSkillSet = new Set(
      resolvedSkillSelections.all.filter((skill) => skill !== selectedHumanSkillProficiency)
    );

    return humanSkillProficiencyOptions.map((skill) => ({
      skill,
      disabled: selectedHumanSkillProficiency !== skill && unavailableSkillSet.has(skill)
    }));
  }, [humanSkillProficiencyOptions, resolvedSkillSelections.all, selectedHumanSkillProficiency]);
  const availableManualSkillOptions = availableSkillOptions;
  const selectedSkillCount = resolvedSkillSelections.manual.length;
  const selectedToolCount = resolvedToolSelections.length;
  const buildRequiresSkillSelection = skillSelectionLimit > 0;
  const buildRequiresToolSelection = toolSelectionLimit > 0;
  const isSkillSelectionReady =
    !buildRequiresSkillSelection || selectedSkillCount === skillSelectionLimit;
  const isToolSelectionReady =
    !buildRequiresToolSelection || selectedToolCount === toolSelectionLimit;
  const isEquipmentChoiceReady =
    starterEquipmentChoices.length === 0 || resolvedStartingEquipmentChoiceIndex.length > 0;
  const isStarterPackSelectionReady = requiredStarterPackSelections.every(
    (selection) => normalizedStarterPackSelectionValues[selection.id]?.length > 0
  );
  const backgroundAbilityOptions = isCustomBackgroundSelected
    ? abilityKeys
    : (backgroundEntry?.abilityScoreOptions ?? []);
  const isBackgroundAbilitySelectionReady =
    (!backgroundEntry && !isCustomBackgroundSelected) ||
    isEditing ||
    isBackgroundAbilityScoreIncreaseReady(
      backgroundAbilityOptions,
      displayedBackgroundChoices?.abilityScoreIncrease
    );
  const isBackgroundSkillSelectionReady =
    !backgroundEntry ||
    isCustomBackgroundSelected ||
    isEditing ||
    !hasBackgroundSkillChoice ||
    (selectedBackgroundSkillProficiencies.length === backgroundSkillSelectionLimit &&
      selectedBackgroundSkillProficiencies.every((skill) =>
        backgroundSkillOptions.includes(skill)
      ));
  const isBackgroundToolSelectionReady =
    !backgroundEntry ||
    isCustomBackgroundSelected ||
    isEditing ||
    !hasBackgroundToolChoice ||
    backgroundToolOptions.includes(selectedBackgroundToolChoice as TOOL_PROFICIENCY);
  const isBackgroundEquipmentSelectionReady =
    !backgroundEntry ||
    isCustomBackgroundSelected ||
    isEditing ||
    isBackgroundEquipmentModeReady(displayedBackgroundChoices?.equipmentMode);
  const isBackgroundSetupReady =
    isBackgroundAbilitySelectionReady &&
    isBackgroundSkillSelectionReady &&
    isBackgroundToolSelectionReady &&
    isBackgroundEquipmentSelectionReady;
  const isSpeciesBodySizeReady =
    speciesBodySizeOptions.length <= 1 || Boolean(normalizedSpeciesChoices?.bodySize);
  const isSpeciesDraconicAncestryReady =
    draconicAncestryOptions.length === 0 || Boolean(normalizedSpeciesChoices?.draconicAncestry);
  const isSpeciesElvenLineageReady =
    elfLineageOptions.length === 0 || Boolean(normalizedSpeciesChoices?.elvenLineage);
  const isSpeciesElfSkillProficiencyReady =
    elfSkillProficiencyOptions.length === 0 ||
    Boolean(normalizedSpeciesChoices?.elvenSkillProficiency);
  const isSpeciesElfSpellcastingAbilityReady =
    elfSpellcastingAbilityOptions.length === 0 ||
    Boolean(normalizedSpeciesChoices?.elvenSpellcastingAbility);
  const isSpeciesGnomeLineageReady =
    gnomeLineageOptions.length === 0 || Boolean(normalizedSpeciesChoices?.gnomeLineage);
  const isSpeciesGnomeSpellcastingAbilityReady =
    gnomeSpellcastingAbilityOptions.length === 0 ||
    Boolean(normalizedSpeciesChoices?.gnomeSpellcastingAbility);
  const isSpeciesGiantAncestryReady =
    giantAncestryOptions.length === 0 || Boolean(normalizedSpeciesChoices?.giantAncestry);
  const isSpeciesHumanSkillProficiencyReady =
    humanSkillProficiencyOptions.length === 0 ||
    Boolean(normalizedSpeciesChoices?.humanSkillProficiency);
  const isSpeciesHumanOriginFeatReady =
    humanOriginFeatOptions.length === 0 || Boolean(normalizedSpeciesChoices?.humanOriginFeat);
  const isSpeciesTieflingLegacyReady =
    tieflingLegacyOptions.length === 0 || Boolean(normalizedSpeciesChoices?.tieflingLegacy);
  const isSpeciesTieflingSpellcastingAbilityReady =
    tieflingSpellcastingAbilityOptions.length === 0 ||
    Boolean(normalizedSpeciesChoices?.tieflingSpellcastingAbility);
  const isPointBuyReady = resolvedAttributeMode !== "pointBuy" || pointBuyRemaining === 0;
  const isStartingHitPointsReady =
    resolvedMaxHitPointsMode !== "custom" || Number(resolvedHitPoints) >= 1;
  const isClassSetupReady =
    isSkillSelectionReady &&
    isToolSelectionReady &&
    isEquipmentChoiceReady &&
    isStarterPackSelectionReady;
  const isCustomClassNameReady =
    !isCustomClassSelected || Boolean(resolvedCustomClass.name?.trim());
  const isCustomSubclassNameReady =
    !isCustomSubclassSelected || Boolean(resolvedCustomSubclass?.name.trim());
  const isCustomSpeciesReady =
    !isCustomSpeciesSelected ||
    Boolean(resolvedCustomSpecies?.name.trim()) ||
    Boolean(isEditing && !resolvedCustomSpecies);
  const isCustomBackgroundReady =
    !isCustomBackgroundSelected ||
    Boolean(resolvedCustomBackground?.name.trim()) ||
    Boolean(isEditing && !resolvedCustomBackground);
  const isSpeciesSetupReady =
    isCustomSpeciesReady &&
    isSpeciesBodySizeReady &&
    isSpeciesDraconicAncestryReady &&
    isSpeciesElvenLineageReady &&
    isSpeciesElfSkillProficiencyReady &&
    isSpeciesElfSpellcastingAbilityReady &&
    isSpeciesGnomeLineageReady &&
    isSpeciesGnomeSpellcastingAbilityReady &&
    isSpeciesGiantAncestryReady &&
    isSpeciesHumanSkillProficiencyReady &&
    isSpeciesHumanOriginFeatReady &&
    isSpeciesTieflingLegacyReady &&
    isSpeciesTieflingSpellcastingAbilityReady;
  const isBuildSetupReady =
    isStartingHitPointsReady &&
    isCustomClassNameReady &&
    isCustomSubclassNameReady &&
    isCustomBackgroundReady &&
    isClassSetupReady &&
    isBackgroundSetupReady &&
    isSpeciesSetupReady &&
    isPointBuyReady;
  const isCoreProfileReady =
    resolvedClassName.trim().length > 0 &&
    resolvedSpecies.trim().length > 0 &&
    resolvedBackground.trim().length > 0 &&
    resolvedName.trim().length > 0 &&
    (!hasSubclassSelection || resolvedSubclassId.trim().length > 0) &&
    Number.isFinite(resolvedLevel) &&
    resolvedLevel >= 1 &&
    resolvedLevel <= 20;

  useEffect(() => {
    const nextInitialValues = createFormValues(initialValues, {
      defaultHitPointMode: isEditing ? (initialValues.maxHitPointsMode ?? "custom") : "automatic",
      startingEquipmentChoiceIndex: "",
      starterPackSelectionValues: {}
    });

    reset(nextInitialValues);
    setWizardStep(1);
    setStepOneSnapshot(null);
    setAttemptedBuildAdvance(false);
    setStarterPackWarnings([]);
  }, [initialValues, isEditing, reset]);

  useEffect(() => {
    const currentSkills = getValues("skills") ?? [];
    const currentToolSelections = getValues("toolProficiencies") ?? [];
    const normalizedSkills = normalizeSkillSelectionsForClass(
      resolvedClassName,
      currentSkills,
      resolvedSpecies,
      resolvedBackground
    );
    const normalizedTools = normalizeToolSelectionsForClass(
      resolvedClassName,
      currentToolSelections
    );

    if (!areStringArraysEqual(currentSkills, normalizedSkills)) {
      setValue("skills", normalizedSkills, {
        shouldDirty: true,
        shouldValidate: true
      });
    }

    if (!areStringArraysEqual(currentToolSelections, normalizedTools)) {
      setValue("toolProficiencies", normalizedTools, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [getValues, resolvedBackground, resolvedClassName, resolvedSpecies, setValue]);

  useEffect(() => {
    const currentChoices = getValues("speciesChoices");
    const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, currentChoices);

    if (!areJsonValuesEqual(currentChoices, nextChoices)) {
      setValue("speciesChoices", nextChoices, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [getValues, resolvedSpecies, setValue]);

  useEffect(() => {
    const currentFeats = getValues("feats") ?? [];
    const nextFeats = reconcileHumanOriginFeatEntries(
      currentFeats,
      resolvedSpecies,
      normalizedSpeciesChoices,
      resolvedLevel
    );

    if (!areJsonValuesEqual(currentFeats, nextFeats)) {
      setValue("feats", nextFeats, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [getValues, normalizedSpeciesChoices, resolvedLevel, resolvedSpecies, setValue]);

  useEffect(() => {
    if (!isEditing && wizardStep === 2) {
      return;
    }

    const currentChoices = getValues("backgroundChoices");

    if (!areJsonValuesEqual(currentChoices, resolvedBackgroundChoices)) {
      setValue("backgroundChoices", resolvedBackgroundChoices, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [getValues, isEditing, resolvedBackgroundChoices, setValue, wizardStep]);

  useEffect(() => {
    const currentFeats = getValues("feats") ?? [];
    const backgroundFeat = getBackgroundFeatEntry(currentFeats, resolvedBackground);
    const nextFeats = backgroundFeat
      ? upsertBackgroundFeatEntry(currentFeats, resolvedBackground, backgroundFeat)
      : currentFeats.filter((featEntry) => featEntry.source?.type !== "background");

    if (!areJsonValuesEqual(currentFeats, nextFeats)) {
      setValue("feats", nextFeats, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [getValues, resolvedBackground, setValue]);

  useEffect(() => {
    if (isCustomClassSelected) {
      if (resolvedSubclassId.length > 0) {
        setValue("subclassId", "", {
          shouldDirty: true,
          shouldValidate: true
        });
      }
      if (resolvedCustomSubclass) {
        setValue("customSubclass", undefined, {
          shouldDirty: true,
          shouldValidate: true
        });
      }

      return;
    }

    const normalizedSubclassId =
      normalizeSubclassId(resolvedSubclassId, resolvedClassName, resolvedCustomSubclass) ??
      getDefaultSubclassIdForClass(resolvedClassName);

    if (resolvedSubclassId !== normalizedSubclassId) {
      setValue("subclassId", normalizedSubclassId, {
        shouldDirty: resolvedSubclassId.length > 0 || normalizedSubclassId.length > 0,
        shouldValidate: true
      });
    }
  }, [
    isCustomClassSelected,
    resolvedClassName,
    resolvedCustomSubclass,
    resolvedSubclassId,
    setValue
  ]);

  useEffect(() => {
    if (
      resolvedStartingEquipmentChoiceIndex.length > 0 &&
      starterEquipmentChoices[Number(resolvedStartingEquipmentChoiceIndex)] === undefined
    ) {
      setValue("startingEquipmentChoiceIndex", "", {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [resolvedStartingEquipmentChoiceIndex, setValue, starterEquipmentChoices]);

  useEffect(() => {
    if (
      areStringMapsEqual(resolvedStarterPackSelectionValues, normalizedStarterPackSelectionValues)
    ) {
      return;
    }

    setValue("starterPackSelectionValues", normalizedStarterPackSelectionValues, {
      shouldDirty: true
    });
  }, [
    normalizedStarterPackSelectionValues,
    resolvedStarterPackSelectionValues,
    setValue,
    starterEquipmentChoices
  ]);

  useEffect(() => {
    const classCurrencies = resolveStarterPackChoiceCurrencies(selectedStarterEquipmentChoice);
    const backgroundCurrencies = resolveStarterPackChoiceCurrencies(
      selectedBackgroundEquipmentChoice
    );
    const nextCurrencies = addCurrencies(classCurrencies, backgroundCurrencies);

    if (!areCurrenciesEqual(resolvedCurrencies, nextCurrencies)) {
      setValue("currencies", nextCurrencies, {
        shouldDirty: true
      });
    }
  }, [
    isEditing,
    resolvedCurrencies,
    selectedBackgroundEquipmentChoice,
    selectedStarterEquipmentChoice,
    setValue
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedStarterEquipmentChoice && !selectedBackgroundEquipmentChoice) {
      setStarterPackWarnings((currentWarnings) =>
        currentWarnings.length === 0 ? currentWarnings : []
      );
      return undefined;
    }

    void Promise.all([
      previewStarterPackChoiceWarnings(selectedStarterEquipmentChoice, {
        selectedToolProficiencies: resolvedToolSelections,
        selectionValues: normalizedStarterPackSelectionValues
      }),
      previewStarterPackChoiceWarnings(selectedBackgroundEquipmentChoice, {
        selectedToolProficiencies: resolvedBackgroundChoices?.toolProficiency
          ? [resolvedBackgroundChoices.toolProficiency]
          : [],
        selectionValues: {}
      })
    ])
      .then(([classWarnings, backgroundWarnings]) => {
        if (!cancelled) {
          const nextWarnings = [...classWarnings, ...backgroundWarnings];
          setStarterPackWarnings((currentWarnings) =>
            areStringArraysEqual(currentWarnings, nextWarnings) ? currentWarnings : nextWarnings
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          const nextWarnings = [
            "Couldn't preview starter equipment from the backend. Character creation will still continue without unresolved items."
          ];
          setStarterPackWarnings((currentWarnings) =>
            areStringArraysEqual(currentWarnings, nextWarnings) ? currentWarnings : nextWarnings
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    normalizedStarterPackSelectionValues,
    resolvedBackgroundChoices,
    resolvedToolSelections,
    selectedBackgroundEquipmentChoice,
    selectedStarterEquipmentChoice
  ]);

  useEffect(() => {
    if (resolvedMaxHitPointsMode !== "automatic") {
      return;
    }

    if (getValues("hitPoints") !== automaticHitPoints) {
      setValue("hitPoints", automaticHitPoints, {
        shouldDirty: true,
        shouldValidate: true
      });
    }

    if (!isEditing && getValues("currentHitPoints") !== automaticHitPoints) {
      setValue("currentHitPoints", automaticHitPoints, {
        shouldDirty: true
      });
    }
  }, [automaticHitPoints, getValues, isEditing, resolvedMaxHitPointsMode, setValue]);

  function commitAbilities(nextAbilities: AbilityScores) {
    setValue("abilities", nextAbilities, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function handleAttributeModeChange(nextMode: AttributeMode) {
    if (nextMode === resolvedAttributeMode) {
      return;
    }

    const currentAbilities = getValues("abilities");

    setValue("attributeMode", nextMode, { shouldDirty: true });
    commitAbilities(
      nextMode === "custom"
        ? normalizeCustomAbilities(currentAbilities)
        : normalizePointBuyAbilities(currentAbilities)
    );
  }

  function handleCustomAbilityChange(ability: AbilityKey, rawValue: string) {
    const nextScore = clampNumber(
      rawValue,
      1,
      CUSTOM_ABILITY_SCORE_MAX,
      getValues(`abilities.${ability}`)
    );
    commitAbilities(
      {
        ...getValues("abilities"),
        [ability]: nextScore
      }
    );
  }

  function handlePointBuyAbilityChange(ability: AbilityKey, rawValue: string) {
    const currentAbilities = getValues("abilities");
    const nextScore = clampNumber(rawValue, 8, 15, currentAbilities[ability]);

    commitAbilities(
      {
        ...currentAbilities,
        [ability]: nextScore
      }
    );
  }

  function handleMaxHitPointsModeChange(nextMode: NonNullable<CharacterDraft["maxHitPointsMode"]>) {
    setValue("maxHitPointsMode", nextMode, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (nextMode !== "automatic") {
      return;
    }

    const nextMaximum = getEffectiveHitPointMaximumForDraft({
      className: resolvedClassName,
      subclassId: resolvedSubclassId,
      level: resolvedLevel,
      hitPoints: automaticHitPoints,
      statusEntries: getValues("statusEntries") ?? [],
      feats: resolvedFeats,
      species: resolvedSpecies
    });

    setValue("hitPoints", automaticHitPoints, {
      shouldDirty: true,
      shouldValidate: true
    });
    setValue(
      "currentHitPoints",
      isEditing ? Math.min(resolvedCurrentHitPoints, nextMaximum) : nextMaximum,
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function handleHitPointsChange(event: ChangeEvent<HTMLInputElement>) {
    const nextBaseHitPoints = clampNumber(event.target.value, 1, MAX_HIT_POINTS, resolvedHitPoints);
    const nextMaximum = getEffectiveHitPointMaximumForDraft({
      className: resolvedClassName,
      subclassId: resolvedSubclassId,
      level: resolvedLevel,
      hitPoints: nextBaseHitPoints,
      statusEntries: getValues("statusEntries") ?? [],
      feats: resolvedFeats,
      species: resolvedSpecies
    });

    setValue("hitPoints", nextBaseHitPoints, {
      shouldDirty: true,
      shouldValidate: true
    });
    setValue(
      "currentHitPoints",
      isEditing ? Math.min(resolvedCurrentHitPoints, nextMaximum) : nextMaximum,
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function handleCurrentHitPointsChange(event: ChangeEvent<HTMLInputElement>) {
    const nextMaximum = getEffectiveHitPointMaximumForDraft({
      className: resolvedClassName,
      subclassId: resolvedSubclassId,
      level: resolvedLevel,
      hitPoints: resolvedHitPoints,
      statusEntries: getValues("statusEntries") ?? [],
      feats: resolvedFeats,
      species: resolvedSpecies
    });

    setValue(
      "currentHitPoints",
      clampNumber(event.target.value, 0, nextMaximum, resolvedCurrentHitPoints),
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function commitBackgroundChoices(nextChoices: CharacterBackgroundChoices | undefined) {
    setValue("backgroundChoices", nextChoices, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function getBackgroundChoiceDraftBase(): CharacterBackgroundChoices {
    return getValues("backgroundChoices") ?? resolvedBackgroundChoices ?? {};
  }

  function toggleBackgroundSkillProficiency(skill: SkillName) {
    const currentChoices = getBackgroundChoiceDraftBase();
    const currentSkills = currentChoices.skillProficiencies ?? [];
    const nextSkills = currentSkills.includes(skill)
      ? currentSkills.filter((selectedSkill) => selectedSkill !== skill)
      : currentSkills.length >= 2
        ? currentSkills
        : [...currentSkills, skill];

    commitBackgroundChoices({
      ...currentChoices,
      skillProficiencies: normalizeSelection(nextSkills, backgroundSkillOptions)
    });
  }

  function toggleBackgroundLanguageProficiency(language: LANGUAGE_PROFICIENCY) {
    const currentChoices = getBackgroundChoiceDraftBase();
    const currentLanguages =
      currentChoices.languageProficiencies ?? resolvedBackgroundChoices?.languageProficiencies ?? [];
    const nextLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter((selectedLanguage) => selectedLanguage !== language)
      : [...currentLanguages, language];

    commitBackgroundChoices({
      ...currentChoices,
      languageProficiencies: normalizeSelection(nextLanguages, backgroundLanguageOptions)
    });
  }

  function commitBackgroundToolProficiency(tool: TOOL_PROFICIENCY) {
    const currentChoices = getBackgroundChoiceDraftBase();

    commitBackgroundChoices({
      ...currentChoices,
      toolProficiencies: [tool],
      toolProficiency: backgroundToolOptions.includes(tool) ? tool : currentChoices.toolProficiency
    });
  }

  function updateBackgroundAbilityMode(mode: "two-one" | "one-one-one") {
    if (backgroundAbilityOptions.length === 0) {
      return;
    }

    if (mode === "one-one-one") {
      commitBackgroundChoices({
        ...getBackgroundChoiceDraftBase(),
        abilityScoreIncrease: {
          mode,
          abilities: backgroundAbilityOptions.slice(0, 3) as [AbilityKey, AbilityKey, AbilityKey]
        }
      });
      return;
    }

    const preferredAbilities = getBackgroundPreferredAbilities(resolvedClassName).filter(
      (ability) => backgroundAbilityOptions.includes(ability)
    );
    commitBackgroundChoices({
      ...getBackgroundChoiceDraftBase(),
      abilityScoreIncrease: {
        mode,
        primaryAbility: preferredAbilities[0] ?? backgroundAbilityOptions[0],
        secondaryAbility: preferredAbilities[1] ?? backgroundAbilityOptions[1]
      }
    });
  }

  function updateBackgroundTwoOneAbility(
    kind: "primaryAbility" | "secondaryAbility",
    ability: AbilityKey
  ) {
    if (backgroundAbilityOptions.length === 0 || !resolvedBackgroundChoices?.abilityScoreIncrease) {
      return;
    }

    const currentChoice = resolvedBackgroundChoices.abilityScoreIncrease;
    const fallbackAbility =
      backgroundAbilityOptions.find((option) => option !== ability) ?? backgroundAbilityOptions[0];
    const nextChoice =
      currentChoice.mode === "two-one"
        ? {
            ...currentChoice,
            [kind]: ability,
            [kind === "primaryAbility" ? "secondaryAbility" : "primaryAbility"]:
              currentChoice[kind === "primaryAbility" ? "secondaryAbility" : "primaryAbility"] ===
              ability
                ? fallbackAbility
                : currentChoice[kind === "primaryAbility" ? "secondaryAbility" : "primaryAbility"]
          }
        : {
            mode: "two-one" as const,
            primaryAbility: ability,
            secondaryAbility: fallbackAbility
          };

    commitBackgroundChoices({
      ...getBackgroundChoiceDraftBase(),
      abilityScoreIncrease: nextChoice
    });
  }

  function updateBackgroundOneOneOneAbility(index: number, ability: AbilityKey) {
    if (backgroundAbilityOptions.length === 0) {
      return;
    }

    const currentChoice = resolvedBackgroundChoices?.abilityScoreIncrease;
    const selectedAbilities =
      currentChoice?.mode === "one-one-one"
        ? [...currentChoice.abilities]
        : [...backgroundAbilityOptions.slice(0, 3)];
    const usedAbilities = new Set<AbilityKey>();

    selectedAbilities[index] = ability;

    const nextAbilities = selectedAbilities.map((selectedAbility) => {
      const normalizedAbility =
        backgroundAbilityOptions.includes(selectedAbility) &&
        !usedAbilities.has(selectedAbility)
          ? selectedAbility
          : (backgroundAbilityOptions.find((option) => !usedAbilities.has(option)) ??
            backgroundAbilityOptions[0]);

      usedAbilities.add(normalizedAbility);
      return normalizedAbility;
    }) as [AbilityKey, AbilityKey, AbilityKey];

    commitBackgroundChoices({
      ...getBackgroundChoiceDraftBase(),
      abilityScoreIncrease: {
        mode: "one-one-one",
        abilities: nextAbilities
      }
    });
  }

  function commitBackgroundFeat(nextEntry: CharacterFeatEntry) {
    setValue("feats", upsertBackgroundFeatEntry(resolvedFeats, resolvedBackground, nextEntry), {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function commitHumanOriginFeat(nextEntry: CharacterFeatEntry) {
    setValue("feats", upsertHumanOriginFeatEntry(resolvedFeats, nextEntry), {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function updateBackgroundMagicInitiate(partialChoice: Partial<MagicInitiateChoice>) {
    const nextEntry = updateMagicInitiateFeatEntry(selectedBackgroundFeatEntry, partialChoice);

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanMagicInitiate(partialChoice: Partial<MagicInitiateChoice>) {
    const nextEntry = updateMagicInitiateFeatEntry(selectedHumanOriginFeatEntry, partialChoice);

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function updateBackgroundCultOfDragonInitiateLanguage(language: LANGUAGE_PROFICIENCY) {
    const nextEntry = updateCultOfDragonInitiateFeatEntry(selectedBackgroundFeatEntry, language);

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanCultOfDragonInitiateLanguage(language: LANGUAGE_PROFICIENCY) {
    const nextEntry = updateCultOfDragonInitiateFeatEntry(selectedHumanOriginFeatEntry, language);

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function updateBackgroundEmeraldEnclaveFledgling(
    partialChoice: Partial<EmeraldEnclaveFledglingChoice>
  ) {
    const nextEntry = updateEmeraldEnclaveFledglingFeatEntry(
      selectedBackgroundFeatEntry,
      partialChoice
    );

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanEmeraldEnclaveFledgling(
    partialChoice: Partial<EmeraldEnclaveFledglingChoice>
  ) {
    const nextEntry = updateEmeraldEnclaveFledglingFeatEntry(
      selectedHumanOriginFeatEntry,
      partialChoice
    );

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function updateBackgroundSpellfireSpark(partialChoice: Partial<SpellfireSparkChoice>) {
    const nextEntry = updateSpellfireSparkFeatEntry(selectedBackgroundFeatEntry, partialChoice);

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanSpellfireSpark(partialChoice: Partial<SpellfireSparkChoice>) {
    const nextEntry = updateSpellfireSparkFeatEntry(selectedHumanOriginFeatEntry, partialChoice);

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function updateBackgroundPurpleDragonRookSkill(skill: PurpleDragonRookChoice["skill"]) {
    const nextEntry = updatePurpleDragonRookFeatEntry(selectedBackgroundFeatEntry, skill);

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanPurpleDragonRookSkill(skill: PurpleDragonRookChoice["skill"]) {
    const nextEntry = updatePurpleDragonRookFeatEntry(selectedHumanOriginFeatEntry, skill);

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function updateBackgroundToolFeatSelection(
    feat: FEATS.CRAFTER | FEATS.HARPER_AGENT | FEATS.MUSICIAN,
    index: number,
    tool: TOOL_PROFICIENCY
  ) {
    const nextEntry = updateToolFeatEntry(selectedBackgroundFeatEntry, feat, index, tool);

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanToolFeatSelection(
    feat: FEATS.CRAFTER | FEATS.HARPER_AGENT | FEATS.MUSICIAN,
    index: number,
    tool: TOOL_PROFICIENCY
  ) {
    const nextEntry = updateToolFeatEntry(selectedHumanOriginFeatEntry, feat, index, tool);

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function updateBackgroundSkilledSelection(index: number, value: string) {
    const nextEntry = updateSkilledFeatEntry(selectedBackgroundFeatEntry, index, value);

    if (nextEntry) {
      commitBackgroundFeat(nextEntry);
    }
  }

  function updateHumanSkilledSelection(index: number, value: string) {
    const nextEntry = updateSkilledFeatEntry(selectedHumanOriginFeatEntry, index, value);

    if (nextEntry) {
      commitHumanOriginFeat(nextEntry);
    }
  }

  function normalizeDraft(values: CharacterFormValues): CharacterDraft {
    const {
      startingEquipmentChoiceIndex: _unusedStartingEquipmentChoiceIndex,
      starterPackSelectionValues: _unusedStarterPackSelectionValues,
      ...draftValues
    } = values;
    const normalizedProgress = normalizeLevelAndXp(draftValues.level, draftValues.xp);
    const normalizedClassName = draftValues.className.trim();
    const normalizedCustomClass = isCustomClassName(normalizedClassName)
      ? normalizeCustomClassConfig(draftValues.customClass)
      : undefined;
    const normalizedClassRules = normalizeCharacterClassRulesConfig(draftValues.classRules, {
      className: normalizedClassName,
      legacyCustomClass: normalizedCustomClass
    });
    const normalizedCustomSubclass = isCustomClassName(normalizedClassName)
      ? undefined
      : normalizeCustomSubclassConfig(draftValues.customSubclass, {
          className: normalizedClassName
        });
    const normalizedSpecies = draftValues.species.trim();
    const normalizedCustomSpecies = isCustomSpeciesName(normalizedSpecies)
      ? normalizeCustomSpeciesConfig(draftValues.customSpecies)
      : undefined;
    const normalizedSpeciesChoices = normalizeCharacterSpeciesChoices(
      normalizedSpecies,
      draftValues.speciesChoices
    );
    const normalizedBackground = draftValues.background.trim();
    const resolvedNormalizedBackground =
      backgroundOptions.includes(normalizedBackground) ||
      isCustomBackgroundName(normalizedBackground) ||
      isEditing
        ? normalizedBackground
        : "";
    const normalizedCustomBackground = isCustomBackgroundName(resolvedNormalizedBackground)
      ? normalizeCustomBackgroundConfig(draftValues.customBackground)
      : undefined;
    const normalizedBackgroundChoices = getNormalizedBackgroundChoices(
      resolvedNormalizedBackground,
      draftValues.backgroundChoices,
      normalizedClassName
    );
    const normalizedAbilities =
      draftValues.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(draftValues.abilities)
        : normalizeCustomAbilities(draftValues.abilities);
    const normalizedHitPoints =
      draftValues.maxHitPointsMode === "automatic"
        ? getAutomaticMaxHitPointsForCharacter({
            className: normalizedClassName,
            customClass: normalizedCustomClass,
            classRules: normalizedClassRules,
            level: normalizedProgress.level,
            abilities: normalizedAbilities,
            classFeatureState: draftValues.classFeatureState ?? {},
            background: resolvedNormalizedBackground,
            backgroundChoices: normalizedBackgroundChoices
          })
        : clampNumber(String(draftValues.hitPoints), 1, 999, automaticHitPoints);
    const normalizedSkills = normalizeSkillSelectionsForClass(
      normalizedClassName,
      draftValues.skills ?? [],
      normalizedSpecies,
      resolvedNormalizedBackground
    );
    const normalizedTools = normalizeToolSelectionsForClass(
      normalizedClassName,
      draftValues.toolProficiencies ?? []
    );
    const normalizedSubclassId =
      isCustomClassName(normalizedClassName)
        ? ""
        : (normalizeSubclassId(
            draftValues.subclassId,
            normalizedClassName,
            normalizedCustomSubclass
          ) ?? "");
    const backgroundFeat = getBackgroundFeatEntry(draftValues.feats, resolvedNormalizedBackground);
    const backgroundReconciledFeats = backgroundFeat
      ? upsertBackgroundFeatEntry(draftValues.feats, resolvedNormalizedBackground, backgroundFeat)
      : (draftValues.feats ?? []).filter((featEntry) => featEntry.source?.type !== "background");
    const normalizedFeats = reconcileHumanOriginFeatEntries(
      backgroundReconciledFeats,
      normalizedSpecies,
      normalizedSpeciesChoices,
      normalizedProgress.level
    );
    const normalizedCurrentHitPointMaximum = getEffectiveHitPointMaximumForDraft({
      className: normalizedClassName,
      customClass: normalizedCustomClass,
      customSpecies: normalizedCustomSpecies,
      subclassId: normalizedSubclassId,
      level: normalizedProgress.level,
      hitPoints: normalizedHitPoints,
      statusEntries: draftValues.statusEntries ?? [],
      feats: normalizedFeats
    });
    const normalizedProficiencies = normalizeCharacterProficiencies({
      className: normalizedClassName,
      level: normalizedProgress.level,
      species: normalizedSpecies,
      speciesChoices: normalizedSpeciesChoices,
      background: resolvedNormalizedBackground,
      backgroundChoices: normalizedBackgroundChoices,
      subclassId: normalizedSubclassId,
      classFeatureState: draftValues.classFeatureState ?? {},
      skillProficiencies: [],
      savingThrowProficiencies: [],
      weaponProficiencies: [],
      armorProficiencies: [],
      toolProficiencies: [],
      languageProficiencies: draftValues.languageProficiencies ?? [],
      selectedClassSkills: normalizedSkills,
      selectedClassToolProficiencies: normalizedTools,
      feats: normalizedFeats
    });

    return {
      ...draftValues,
      name: sanitizeUserInput(draftValues.name),
      species: normalizedSpecies,
      speciesChoices: normalizedSpeciesChoices,
      customSpecies: normalizedCustomSpecies,
      speciesFeatureState: normalizeCharacterSpeciesFeatureState(
        normalizedSpecies,
        draftValues.speciesFeatureState
      ),
      className: normalizedClassName,
      subclassId: normalizedSubclassId,
      customSubclass: normalizedCustomSubclass?.id === normalizedSubclassId
        ? normalizedCustomSubclass
        : undefined,
      classRules: normalizedClassRules,
      customClass: normalizedCustomClass,
      level: normalizedProgress.level,
      xp: normalizedProgress.xp,
      hitPoints: normalizedHitPoints,
      currentHitPoints: isEditing
        ? clampNumber(
            String(draftValues.currentHitPoints),
            0,
            normalizedCurrentHitPointMaximum,
            normalizedHitPoints
          )
        : normalizedCurrentHitPointMaximum,
      temporaryHitPoints: clampNumber(String(draftValues.temporaryHitPoints), 0, 999, 0),
      temporaryHitPointsSource:
        clampNumber(String(draftValues.temporaryHitPoints), 0, 999, 0) > 0
          ? draftValues.temporaryHitPointsSource?.trim() || undefined
          : undefined,
      maxHitPointsMode: draftValues.maxHitPointsMode ?? "automatic",
      background: resolvedNormalizedBackground,
      customBackground: normalizedCustomBackground,
      backgroundChoices: normalizedBackgroundChoices,
      backgroundNotes: sanitizeUserInput(draftValues.backgroundNotes, { multiline: true }),
      alignment: alignmentOptions.includes(draftValues.alignment)
        ? draftValues.alignment
        : "True Neutral",
      skills: normalizedSkills,
      toolProficiencies: normalizedTools,
      equipment: [
        ...new Set((draftValues.equipment ?? []).map((item) => item.trim()).filter(Boolean))
      ],
      abilities: normalizedAbilities,
      languageProficiencies: normalizedProficiencies.languageProficiencies,
      feats: normalizedFeats
    };
  }

  async function submitResolvedDraft(values: CharacterFormValues) {
    const normalizedDraft = normalizeDraft(values);

    if (!isPointBuyAbilityDistributionReady(normalizedDraft.attributeMode, normalizedDraft.abilities)) {
      setAttemptedBuildAdvance(true);

      if (!isEditing) {
        setWizardStep(2);
      }

      return;
    }

    const configuredStarterPack = isCustomClassName(normalizedDraft.className)
      ? null
      : getClassStarterPack(normalizedDraft.className);
    const selectedChoice =
      !isEditing && configuredStarterPack && values.startingEquipmentChoiceIndex.length > 0
        ? (configuredStarterPack.startingEquipment[Number(values.startingEquipmentChoiceIndex)] ??
          null)
        : null;
    const selectedBackgroundChoice = !isEditing
      ? getBackgroundEquipmentChoice(normalizedDraft.background, normalizedDraft.backgroundChoices)
      : null;

    if (!selectedChoice && !selectedBackgroundChoice) {
      await onSubmit(normalizedDraft);
      return;
    }

    const normalizedSelectionValues = normalizeStarterPackSelectionValues(
      configuredStarterPack,
      normalizedDraft.toolProficiencies ?? [],
      values.starterPackSelectionValues
    );
    const materializedClassStarterPack = await materializeStarterPackChoiceToInventory(
      normalizedDraft.inventoryItems,
      selectedChoice,
      {
        selectedToolProficiencies: normalizedDraft.toolProficiencies ?? [],
        selectionValues: normalizedSelectionValues
      }
    );
    const materializedBackgroundStarterPack = await materializeStarterPackChoiceToInventory(
      materializedClassStarterPack.inventoryItems,
      selectedBackgroundChoice,
      {
        selectedToolProficiencies: normalizedDraft.backgroundChoices?.toolProficiency
          ? [normalizedDraft.backgroundChoices.toolProficiency]
          : [],
        selectionValues: {}
      }
    );

    setStarterPackWarnings([
      ...materializedClassStarterPack.warnings,
      ...materializedBackgroundStarterPack.warnings
    ]);

    if (
      materializedClassStarterPack.itemsSkipped ||
      materializedBackgroundStarterPack.itemsSkipped
    ) {
      dispatch(
        showToast({
          text: "Starter equipment could not be loaded. Character created without those items.",
          type: "error"
        })
      );
    }

    await onSubmit({
      ...normalizedDraft,
      inventoryItems: materializedBackgroundStarterPack.inventoryItems
    });
  }

  async function submitForm(values: CharacterFormValues) {
    if (
      !isCustomClassNameReady ||
      !isCustomSubclassNameReady ||
      !isCustomSpeciesReady ||
      !isCustomBackgroundReady
    ) {
      setAttemptedBuildAdvance(true);
      return;
    }

    if (!isPointBuyAbilityDistributionReady(values.attributeMode, values.abilities)) {
      setAttemptedBuildAdvance(true);

      if (!isEditing) {
        setWizardStep(2);
      }

      return;
    }

    const submittedSpeciesChoices = normalizeCharacterSpeciesChoices(
      values.species,
      values.speciesChoices
    );
    const requiresDraconicAncestry =
      getDragonbornDraconicAncestryOptionsForSpecies(values.species).length > 0;
    const requiresElvenLineage = getElfLineageOptionsForSpecies(values.species).length > 0;
    const requiresElfSkillProficiency =
      getElfSkillProficiencyOptionsForSpecies(values.species).length > 0;
    const requiresElfSpellcastingAbility =
      getElfSpellcastingAbilityOptionsForSpecies(values.species).length > 0;
    const requiresGnomeLineage = getGnomeLineageOptionsForSpecies(values.species).length > 0;
    const requiresGnomeSpellcastingAbility =
      getGnomeSpellcastingAbilityOptionsForSpecies(values.species).length > 0;
    const requiresGiantAncestry =
      getGoliathGiantAncestryOptionsForSpecies(values.species).length > 0;
    const requiresHumanSkillProficiency = getHumanSkillOptionsForSpecies(values.species).length > 0;
    const requiresHumanOriginFeat = getHumanOriginFeatOptionsForSpecies(values.species).length > 0;
    const requiresTieflingLegacy =
      getTieflingFiendishLegacyOptionsForSpecies(values.species).length > 0;
    const requiresTieflingSpellcastingAbility =
      getTieflingSpellcastingAbilityOptionsForSpecies(values.species).length > 0;

    if (
      (requiresDraconicAncestry && !submittedSpeciesChoices?.draconicAncestry) ||
      (requiresElvenLineage && !submittedSpeciesChoices?.elvenLineage) ||
      (requiresElfSkillProficiency && !submittedSpeciesChoices?.elvenSkillProficiency) ||
      (requiresElfSpellcastingAbility && !submittedSpeciesChoices?.elvenSpellcastingAbility) ||
      (requiresGnomeLineage && !submittedSpeciesChoices?.gnomeLineage) ||
      (requiresGnomeSpellcastingAbility && !submittedSpeciesChoices?.gnomeSpellcastingAbility) ||
      (requiresGiantAncestry && !submittedSpeciesChoices?.giantAncestry) ||
      (requiresHumanSkillProficiency && !submittedSpeciesChoices?.humanSkillProficiency) ||
      (requiresHumanOriginFeat && !submittedSpeciesChoices?.humanOriginFeat) ||
      (requiresTieflingLegacy && !submittedSpeciesChoices?.tieflingLegacy) ||
      (requiresTieflingSpellcastingAbility && !submittedSpeciesChoices?.tieflingSpellcastingAbility)
    ) {
      setAttemptedBuildAdvance(true);

      if (!isEditing) {
        setWizardStep(2);
      }

      return;
    }

    await submitResolvedDraft(values);
  }

  async function validateWizardStepOne(): Promise<boolean> {
    const fields: Array<"name" | "species" | "className" | "subclassId" | "background" | "level"> =
      ["name", "species", "className", "background", "level"];

    if (hasSubclassSelection) {
      fields.splice(3, 0, "subclassId");
    }

    return trigger(fields);
  }

  async function handleRecommendedCreate() {
    if (hasAnyCustomOriginSelected) {
      return;
    }

    const isValid = await validateWizardStepOne();

    if (!isValid || !isCoreProfileReady) {
      return;
    }

    const snapshot = createBasicProfileSnapshot(getValues());
    const recommendedDraft = createRecommendedCharacterDraft(snapshot);

    reset(recommendedDraft);
    await submitResolvedDraft(recommendedDraft);
  }

  async function handleStartCustomization() {
    const isValid = await validateWizardStepOne();

    if (!isValid || !isCoreProfileReady) {
      return;
    }

    const snapshot = createBasicProfileSnapshot(getValues(), {
      includeBackgroundDefaults: false
    });
    setStepOneSnapshot(snapshot);
    reset(snapshot);
    setWizardStep(2);
    setAttemptedBuildAdvance(false);
  }

  async function handleProceedToNotes() {
    setAttemptedBuildAdvance(true);

    const hitPointsValid = resolvedMaxHitPointsMode !== "custom" || (await trigger(["hitPoints"]));

    if (!hitPointsValid || !isBuildSetupReady) {
      return;
    }

    setWizardStep(3);
  }

  function handleBackToStepOne() {
    reset(stepOneSnapshot ?? createBasicProfileSnapshot(getValues()));
    setWizardStep(1);
    setAttemptedBuildAdvance(false);
  }

  function handleWizardStepClick(step: CreationStep) {
    if (step >= wizardStep) {
      return;
    }

    if (step === 1) {
      handleBackToStepOne();
      return;
    }

    setWizardStep(step);
  }

  function renderWizardStepBadge(step: CreationStep, label: string) {
    const isActive = wizardStep === step;
    const isDone = wizardStep > step;
    const className = clsx(
      styles.stepBadge,
      isActive && styles.stepBadgeActive,
      isDone && styles.stepBadgeDone,
      isDone && styles.stepBadgeButton
    );

    if (isDone) {
      return (
        <button
          key={step}
          type="button"
          className={className}
          onClick={() => handleWizardStepClick(step)}
          disabled={hasPendingAction}
        >
          {label}
        </button>
      );
    }

    return (
      <span key={step} className={className} aria-current={isActive ? "step" : undefined}>
        {label}
      </span>
    );
  }

  function handleRandomize() {
    const randomClassName = getRandomItem(randomizableClassOptions);
    const randomBackgroundState = createRandomBackgroundState(randomClassName);
    const randomClassSkillOptions = getSkillProficiencyOptionsForClass(randomClassName);
    const randomClassSkillLimit = getSkillSelectionLimitForClass(randomClassName);
    const { choices: randomClassToolOptions, count: randomClassToolLimit } =
      getToolProficiencyChoicesForClass(randomClassName);
    const randomToolSelections = pickRandomSubset(
      randomClassToolOptions,
      randomClassToolLimit,
      randomClassToolLimit
    );
    const randomStarterPack = getClassStarterPack(randomClassName);
    const randomStartingEquipmentChoiceIndex = randomStarterPack?.startingEquipment.length
      ? "0"
      : "";
    const randomStarterPackSelectionValues = normalizeStarterPackSelectionValues(
      randomStarterPack,
      randomToolSelections,
      {}
    );
    const randomSpecies = getRandomItem(speciesOptions);
    const randomMode: AttributeMode = Math.random() < 0.5 ? "custom" : "pointBuy";
    const randomizedAbilities =
      randomMode === "custom" ? createRandomCustomAbilities() : createRandomPointBuyAbilities();
    const randomizedDraft = createFormValues(
      {
        ...createEmptyCharacter(),
        name: createRandomName(),
        species: randomSpecies,
        speciesChoices: createDefaultSpeciesChoicesForSpecies(randomSpecies),
        speciesFeatureState: normalizeCharacterSpeciesFeatureState(randomSpecies, undefined),
        className: randomClassName,
        subclassId: getRandomSubclassIdForClass(randomClassName),
        level: 1,
        xp: 0,
        hitPoints: getRandomInt(8, 90),
        currentHitPoints: 0,
        maxHitPointsMode: Math.random() < 0.5 ? "automatic" : "custom",
        attributeMode: randomMode,
        abilities: randomizedAbilities,
        alignment: getRandomItem(alignmentOptions),
        ...randomBackgroundState,
        backgroundNotes: "",
        currencies: createDefaultCurrencies(),
        skills: pickRandomSubset(
          randomClassSkillOptions,
          randomClassSkillLimit,
          randomClassSkillLimit
        ),
        toolProficiencies: randomToolSelections,
        equipment: []
      },
      {
        startingEquipmentChoiceIndex: randomStartingEquipmentChoiceIndex,
        starterPackSelectionValues: randomStarterPackSelectionValues
      }
    );
    randomizedDraft.currentHitPoints = randomizedDraft.hitPoints;

    reset(randomizedDraft);
  }

  function renderBasicProfileSection() {
    const classRegistration = register("className", {
      required: "Choose a class",
      validate: (value) =>
        isEditing || !disabledCreationClassNames.has(value) ? true : "Choose a supported class"
    });
    const speciesRegistration = register("species", { required: "Choose a species" });
    const backgroundRegistration = register("background", {
      required: "Choose a background"
    });

    return (
      <section className={clsx(styles.sectionCard, styles.primarySection)}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Core profile</p>
            <h3>Character identity</h3>
          </div>
          <div className={styles.sectionHeaderActions}>
            {!isCoreProfileReady ? <InputRequiredBadge /> : null}
          </div>
        </div>

        <div className={styles.profileGrid}>
          <div className={clsx(styles.profileRow, styles.profileRowTop)}>
            <label className={styles.field}>
              <span>Character name</span>
              <TextInput
                className={styles.fieldInput}
                invalid={Boolean(errors.name)}
                placeholder="Mira Nightbloom"
                {...register("name", {
                  required: "Enter a character name",
                  validate: (value) => value.trim().length > 0 || "Enter a character name"
                })}
              />
              {errors.name ? (
                <small className={styles.errorText}>{errors.name.message}</small>
              ) : null}
            </label>

            <label className={clsx(styles.field, styles.compactField)}>
              <span>Level</span>
              <NumberInput
                className={styles.fieldInput}
                invalid={Boolean(errors.level)}
                min={1}
                max={20}
                {...register("level", {
                  valueAsNumber: true,
                  min: { value: 1, message: "Level must be at least 1" },
                  max: { value: 20, message: "Level cannot exceed 20" }
                })}
              />
              {errors.level ? (
                <small className={styles.errorText}>{errors.level.message}</small>
              ) : null}
            </label>
          </div>

          <div className={styles.profileRow}>
            <label className={styles.field}>
              <span>Class</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={Boolean(errors.className)}
                {...classRegistration}
                value={resolvedClassName}
                onChange={(event) => {
                  const nextClassName = event.target.value;
                  const nextIsCustomClass = isCustomClassName(nextClassName);
                  const nextSubclassId = nextIsCustomClass
                    ? ""
                    : getDefaultSubclassIdForClass(nextClassName);

                  setValue("className", nextClassName, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                  setValue("subclassId", nextSubclassId, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                  setValue("customSubclass", undefined, {
                    shouldDirty: true,
                    shouldValidate: true
                  });

                  if (nextIsCustomClass) {
                    const nextCustomClass = createDraftCustomClassConfig(getValues("customClass"));

                    setValue("customClass", nextCustomClass, {
                      shouldDirty: true,
                      shouldValidate: true
                    });
                    setValue(
                      "classRules",
                      normalizeCharacterClassRulesConfig(
                        {
                          ...getValues("classRules"),
                          classRulesEnforced: false,
                          spellcastingRulesEnforced: false
                        },
                        {
                          className: nextClassName,
                          legacyCustomClass: nextCustomClass
                        }
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true
                      }
                    );
                  } else {
                    setValue(
                      "classRules",
                      normalizeCharacterClassRulesConfig(
                        {
                          ...getValues("classRules"),
                          classRulesEnforced: true,
                          spellcastingRulesEnforced: true
                        },
                        {
                          className: nextClassName,
                          legacyCustomClass: getValues("customClass")
                        }
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true
                      }
                    );
                  }
                }}
              >
                <option value="">Select a class</option>
                {classOptions.map((characterClass) => (
                  <option
                    key={characterClass}
                    value={characterClass}
                    disabled={!isEditing && disabledCreationClassNames.has(characterClass)}
                  >
                    {characterClass}
                  </option>
                ))}
                <option disabled value="__custom-class-divider">
                  ──────────
                </option>
                <option value={CUSTOM_CLASS_NAME}>{CUSTOM_CLASS_NAME}</option>
              </SelectInput>
              {errors.className ? (
                <small className={styles.errorText}>{errors.className.message}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Subclass</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={Boolean(errors.subclassId)}
                disabled={!hasSubclassSelection}
                {...register("subclassId", {
                  validate: (value) =>
                    !hasSubclassSelection ||
                    normalizeSubclassId(value, resolvedClassName, resolvedCustomSubclass)
                      ? true
                      : "Choose a subclass"
                })}
                value={resolvedSubclassId}
                onChange={(event) => {
                  const nextSubclassId = event.target.value;

                  setValue("subclassId", nextSubclassId, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                  setValue(
                    "customSubclass",
                    nextSubclassId === draftCustomSubclassOption.id
                      ? draftCustomSubclassOption
                      : undefined,
                    {
                      shouldDirty: true,
                      shouldValidate: true
                    }
                  );
                }}
              >
                <option value="">
                  {hasSubclassSelection
                    ? "Select a subclass"
                    : "No subclass options"}
                </option>
                {availableSubclassOptions.map((subclass) => (
                  <option key={subclass.id} value={subclass.id}>
                    {subclass.name}
                  </option>
                ))}
                {hasSubclassSelection ? (
                  <>
                    <option disabled value="__custom-subclass-divider">
                      ──────────
                    </option>
                    <option value={draftCustomSubclassOption.id}>{CUSTOM_SUBCLASS_LABEL}</option>
                  </>
                ) : null}
              </SelectInput>
            </label>
          </div>

          <div className={styles.profileRow}>
            <label className={styles.field}>
              <span>Species</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={Boolean(errors.species)}
                {...speciesRegistration}
                onChange={(event) => {
                  void speciesRegistration.onChange(event);
                  const nextSpecies = event.target.value;

                  setValue(
                    "customSpecies",
                    isCustomSpeciesName(nextSpecies)
                      ? createDraftCustomSpeciesConfig(getValues("customSpecies"))
                      : undefined,
                    {
                      shouldDirty: true,
                      shouldValidate: true
                    }
                  );
                  setValue("speciesChoices", undefined, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                  setValue(
                    "speciesFeatureState",
                    normalizeCharacterSpeciesFeatureState(nextSpecies, undefined),
                    {
                      shouldDirty: true,
                      shouldValidate: true
                    }
                  );
                }}
              >
                <option value="">Select a species</option>
                {speciesOptions.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
                <option disabled value="__custom-species-divider">
                  ──────────
                </option>
                <option value={CUSTOM_SPECIES_NAME}>{CUSTOM_SPECIES_NAME}</option>
              </SelectInput>
              {errors.species ? (
                <small className={styles.errorText}>{errors.species.message}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Background</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={Boolean(errors.background)}
                {...backgroundRegistration}
                onChange={(event) => {
                  void backgroundRegistration.onChange(event);
                  const nextBackground = event.target.value;

                  setValue(
                    "customBackground",
                    isCustomBackgroundName(nextBackground)
                      ? createDraftCustomBackgroundConfig(getValues("customBackground"))
                      : undefined,
                    {
                      shouldDirty: true,
                      shouldValidate: true
                    }
                  );
                  setValue(
                    "backgroundChoices",
                    normalizeBackgroundChoices(nextBackground, undefined, {
                      preferredAbilities: getBackgroundPreferredAbilities(resolvedClassName)
                    }),
                    {
                      shouldDirty: true,
                      shouldValidate: true
                    }
                  );
                }}
              >
                <option value="">Select a background</option>
                {backgroundOptions.map((background) => (
                  <option key={background} value={background}>
                    {background}
                  </option>
                ))}
                <option disabled value="__custom-background-divider">
                  ──────────
                </option>
                <option value={CUSTOM_BACKGROUND_NAME}>{CUSTOM_BACKGROUND_NAME}</option>
              </SelectInput>
              {errors.background ? (
                <small className={styles.errorText}>{errors.background.message}</small>
              ) : null}
            </label>
          </div>
        </div>

        {!isEditing ? (
          <div className={styles.multiclassHelpRow}>
            <span>Want to multiclass?</span>
            <button
              type="button"
              className={styles.multiclassHelpButton}
              onClick={() => setIsMulticlassGuideOpen(true)}
              aria-label="Open multiclass guide"
              title="Open multiclass guide"
            >
              <CircleHelp size={16} />
            </button>
          </div>
        ) : null}
      </section>
    );
  }

  function renderStartingHitPointsSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Starting HP</p>
            <h3>Hit Points</h3>
          </div>
          {!isStartingHitPointsReady ? <InputRequiredBadge /> : null}
        </div>

        <p className={styles.helperText}>{HIT_POINTS_MODAL_SUMMARY}</p>

        <HitPointsEditorContent
          character={hitPointEditorCharacter}
          mode={resolvedMaxHitPointsMode}
          hitPoints={resolvedHitPoints}
          currentHitPoints={resolvedCurrentHitPoints}
          onSetMode={handleMaxHitPointsModeChange}
          onHitPointsChange={handleHitPointsChange}
          onCurrentHitPointsChange={handleCurrentHitPointsChange}
          currentHitPointsDisabled={!isEditing}
          hitPointsInvalid={Boolean(errors.hitPoints)}
        />

        <input
          type="hidden"
          {...register("hitPoints", {
            valueAsNumber: true,
            min: { value: 1, message: "Hit points must be at least 1" }
          })}
        />
        {errors.hitPoints ? (
          <small className={styles.errorText}>{errors.hitPoints.message}</small>
        ) : null}
      </section>
    );
  }

  function renderAbilityDistributionSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Base Stats</p>
            <h3>Ability Scores</h3>
          </div>
          {!isPointBuyReady ? <InputRequiredBadge /> : null}
        </div>

        <p className={styles.helperText}>
          Update your base ability scores using Point Buy or Custom values.
        </p>

        <AbilityScoresEditorContent
          attributeMode={resolvedAttributeMode}
          abilities={resolvedAbilities}
          pointBuyRemaining={pointBuyRemaining}
          onSetAttributeMode={handleAttributeModeChange}
          onUpdateAbilityScore={(ability, value) => {
            if (resolvedAttributeMode === "pointBuy") {
              handlePointBuyAbilityChange(ability, value);
              return;
            }

            handleCustomAbilityChange(ability, value);
          }}
        />

        {attemptedBuildAdvance && !isPointBuyReady ? (
          <p className={styles.errorText}>
            Adjust point-buy scores until exactly 0 points remain before continuing.
          </p>
        ) : null}
      </section>
    );
  }

  function updateCustomClassConfig(nextConfig: CharacterCustomClassConfig) {
    setValue("customClass", nextConfig, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function updateClassRulesConfig(nextConfig: CharacterClassRulesConfig) {
    setValue(
      "classRules",
      normalizeCharacterClassRulesConfig(nextConfig, {
        className: resolvedClassName,
        legacyCustomClass: resolvedCustomClass
      }),
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function renderCustomClassSetupSection() {
    if (!isCustomClassSelected) {
      return null;
    }

    const customClassNameDraft = selectedCustomClass?.name ?? resolvedCustomClass.name ?? "";

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Custom Class</p>
            <h3 className={styles.sectionValueHeading}>Class foundations</h3>
          </div>
        </div>

        <p className={styles.helperText}>
          Custom classes skip predefined class setup and use these saved foundations for HP and Hit
          Dice.
        </p>

        <div className={styles.classSetupGrid}>
          <label className={styles.field}>
            <span>Custom class name</span>
            <TextInput
              className={styles.fieldInput}
              invalid={attemptedBuildAdvance && !isCustomClassNameReady}
              value={customClassNameDraft}
              maxLength={CUSTOM_CLASS_NAME_MAX_LENGTH}
              onChange={(event) =>
                updateCustomClassConfig({
                  ...createDraftCustomClassConfig(resolvedCustomClass),
                  name: event.target.value.slice(0, CUSTOM_CLASS_NAME_MAX_LENGTH)
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Hit Die</span>
            <SelectInput
              className={styles.fieldInput}
              value={resolvedClassRules.hitDie}
              onChange={(event) => {
                const hitDie = event.target.value as CharacterClassRulesConfig["hitDie"];

                updateClassRulesConfig({
                  ...resolvedClassRules,
                  hitDie
                });
                updateCustomClassConfig({
                  ...resolvedCustomClass,
                  hitDie
                });
              }}
            >
              {customClassHitDice.map((hitDie) => (
                <option key={hitDie} value={hitDie}>
                  {hitDie.toUpperCase()}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>

        {attemptedBuildAdvance && !isCustomClassNameReady ? (
          <p className={styles.errorText}>Enter a custom class name before continuing.</p>
        ) : null}

        <p className={styles.helperText}>
          Class mechanics, features, proficiencies, equipment, and extra traits can be added
          directly in the character sheet after creation.
        </p>
      </section>
    );
  }

  function renderCustomSubclassSetupSection() {
    if (!isCustomSubclassSelected) {
      return null;
    }

    const customSubclassNameDraft =
      selectedCustomSubclass?.name ?? resolvedCustomSubclass?.name ?? "";

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Custom Subclass</p>
            <h3 className={styles.sectionValueHeading}>Subclass identity</h3>
          </div>
          {!isCustomSubclassNameReady ? <InputRequiredBadge /> : null}
        </div>

        <label className={styles.field}>
          <span>Custom subclass name</span>
          <TextInput
            className={styles.fieldInput}
            invalid={attemptedBuildAdvance && !isCustomSubclassNameReady}
            value={customSubclassNameDraft}
            maxLength={CUSTOM_SUBCLASS_NAME_MAX_LENGTH}
            onChange={(event) =>
              setValue(
                "customSubclass",
                {
                  ...draftCustomSubclassOption,
                  id: resolvedSubclassId,
                  name: event.target.value.slice(0, CUSTOM_SUBCLASS_NAME_MAX_LENGTH)
                },
                {
                  shouldDirty: true,
                  shouldValidate: true
                }
              )
            }
          />
        </label>

        {attemptedBuildAdvance && !isCustomSubclassNameReady ? (
          <p className={styles.errorText}>Enter a custom subclass name before continuing.</p>
        ) : null}
      </section>
    );
  }

  function renderClassSetupSection(options?: { showStartingEquipmentChoice?: boolean }) {
    if (isCustomClassSelected) {
      return null;
    }

    const showStartingEquipmentChoice = options?.showStartingEquipmentChoice ?? true;
    const isRenderedClassSetupReady =
      isSkillSelectionReady &&
      isToolSelectionReady &&
      (!showStartingEquipmentChoice || (isEquipmentChoiceReady && isStarterPackSelectionReady));

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Class setup</p>
            <h3 className={styles.sectionValueHeading}>
              {resolvedClassName || "Choose a class first"}
            </h3>
          </div>
          {!isRenderedClassSetupReady ? <InputRequiredBadge /> : null}
        </div>

        <div className={styles.summaryGrid}>
          <CellContainer
            label="Primary Ability"
            content={starterPack.primaryAbility ?? "Not configured yet"}
          />
          <CellContainer
            label="Hit Point Die"
            content={starterPack.hitPointDieLabel ?? "Not configured yet"}
          />
          <CellContainer
            label="Saving Throw Proficiencies"
            content={
              starterPack.savingThrowProficiencies.length > 0
                ? starterPack.savingThrowProficiencies.join(", ")
                : "Not configured yet"
            }
          />
          <CellContainer
            label="Weapon Proficiencies"
            content={
              starterPack.weaponProficiencies.length > 0
                ? starterPack.weaponProficiencies.join(", ")
                : "Not configured yet"
            }
          />
          <CellContainer
            label="Armor Training"
            content={
              starterPack.armorTrainingProficiencies.length > 0
                ? starterPack.armorTrainingProficiencies.join(", ")
                : "Not configured yet"
            }
          />
          <CellContainer
            label="Weapon Mastery Choices"
            content={
              starterPack.weaponMasteryCount > 0
                ? formatChoiceCount(starterPack.weaponMasteryCount)
                : "None"
            }
          />
        </div>

        <div className={styles.choiceGroupColumns}>
          <fieldset className={styles.choiceGroup}>
            <legend>Skill Proficiencies</legend>
            {buildRequiresSkillSelection ? (
              <p className={styles.helperText}>
                Choose exactly {skillSelectionLimit} class skills from the starter pack list.
              </p>
            ) : (
              <p className={styles.helperText}>
                This class doesn&apos;t have a starter-pack skill choice configured yet.
              </p>
            )}

            <div className={styles.choiceGrid}>
              {availableManualSkillOptions.map((skill) => {
                const isActive = resolvedSkillSelections.manual.includes(skill);
                const disabled =
                  !isActive &&
                  buildRequiresSkillSelection &&
                  selectedSkillCount >= skillSelectionLimit;

                return (
                  <RadioContainerOption
                    key={skill}
                    header={skill}
                    selected={isActive}
                    onSelect={() => {
                      if (disabled) {
                        return;
                      }

                      const nextSkills = isActive
                        ? resolvedSkillSelections.manual.filter(
                            (selectedSkill) => selectedSkill !== skill
                          )
                        : [...resolvedSkillSelections.manual, skill];

                      setValue(
                        "skills",
                        normalizeSkillSelectionsForClass(
                          resolvedClassName,
                          nextSkills,
                          resolvedSpecies,
                          resolvedBackground
                        ),
                        {
                          shouldDirty: true,
                          shouldValidate: true
                        }
                      );
                    }}
                    disabled={disabled}
                    indicatorType="checkbox"
                  />
                );
              })}
            </div>

            {attemptedBuildAdvance && !isSkillSelectionReady ? (
              <p className={styles.errorText}>
                Choose exactly {skillSelectionLimit} starter-pack skills before continuing.
              </p>
            ) : null}
          </fieldset>

          <fieldset className={styles.choiceGroup}>
            <legend>Tool Proficiencies</legend>
            {starterPack.grantedToolProficiencies.length > 0 ? (
              <ul className={styles.grantedSkillList}>
                {starterPack.grantedToolProficiencies.map((tool) => (
                  <li key={tool}>
                    <span>{tool}</span>
                    <small>Granted by class</small>
                  </li>
                ))}
              </ul>
            ) : null}

            {buildRequiresToolSelection ? (
              <>
                <p className={styles.helperText}>
                  Choose exactly {toolSelectionLimit} class tool proficiencies.
                </p>
                <div className={styles.choiceGrid}>
                  {availableToolOptions.map((tool) => {
                    const isActive = resolvedToolSelections.includes(tool);
                    const disabled = !isActive && selectedToolCount >= toolSelectionLimit;

                    return (
                      <RadioContainerOption
                        key={tool}
                        header={getToolProficiencyLabel(tool)}
                        selected={isActive}
                        onSelect={() => {
                          if (disabled) {
                            return;
                          }

                          const nextTools = isActive
                            ? resolvedToolSelections.filter((selectedTool) => selectedTool !== tool)
                            : [...resolvedToolSelections, tool];

                          setValue(
                            "toolProficiencies",
                            normalizeToolSelectionsForClass(resolvedClassName, nextTools),
                            {
                              shouldDirty: true,
                              shouldValidate: true
                            }
                          );
                        }}
                        disabled={disabled}
                        indicatorType="checkbox"
                      />
                    );
                  })}
                </div>
              </>
            ) : starterPack.grantedToolProficiencies.length === 0 ? (
              <p className={styles.helperText}>
                This class doesn&apos;t grant or choose tool proficiencies here.
              </p>
            ) : (
              <p className={styles.helperText}>No tool choices required for this class.</p>
            )}

            {attemptedBuildAdvance && !isToolSelectionReady ? (
              <p className={styles.errorText}>
                Choose exactly {toolSelectionLimit} class tools before continuing.
              </p>
            ) : null}
          </fieldset>

          {showStartingEquipmentChoice ? (
            <fieldset className={styles.choiceGroup}>
              <legend>Starting Equipment</legend>
              {starterEquipmentChoices.length === 0 ? (
                <p className={styles.helperText}>
                  Starter equipment choices haven&apos;t been configured for this class yet.
                </p>
              ) : (
                <div className={styles.radioChoiceGrid}>
                  {starterEquipmentChoices.map((choice, choiceIndex) => {
                    const isActive = resolvedStartingEquipmentChoiceIndex === String(choiceIndex);

                    return (
                      <RadioContainerOption
                        key={choiceIndex}
                        header={`Option ${String.fromCharCode(65 + choiceIndex)}`}
                        selected={isActive}
                        onSelect={() =>
                          setValue("startingEquipmentChoiceIndex", String(choiceIndex), {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                        breakdown={formatStarterPackEquipmentChoice(choice, choiceIndex, {
                          includeOptionLabel: false,
                          selectionLabels: starterPackSelectionLabels
                        })}
                      />
                    );
                  })}
                </div>
              )}

              {requiredStarterPackSelections.map((selection) => {
                const selectionOptions = getStarterPackSelectionOptions(
                  selection,
                  resolvedToolSelections
                );
                const selectedValue = normalizedStarterPackSelectionValues[selection.id] ?? "";

                return (
                  <div key={selection.id}>
                    <p className={styles.helperText}>{selection.label}</p>
                    {selection.description ? (
                      <p className={styles.helperText}>{selection.description}</p>
                    ) : null}
                    <div className={styles.choiceGrid}>
                      {selectionOptions.map((option) => (
                        <RadioContainerOption
                          key={option.value}
                          header={option.label}
                          selected={selectedValue === option.value}
                          onSelect={() =>
                            setValue(
                              "starterPackSelectionValues",
                              {
                                ...normalizedStarterPackSelectionValues,
                                [selection.id]: option.value
                              },
                              {
                                shouldDirty: true,
                                shouldValidate: true
                              }
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {starterPackWarnings.length > 0 ? (
                <div>
                  {starterPackWarnings.map((warning) => (
                    <p key={warning} className={styles.helperText}>
                      {warning}
                    </p>
                  ))}
                </div>
              ) : null}

              {attemptedBuildAdvance && !isEquipmentChoiceReady ? (
                <p className={styles.errorText}>
                  Choose a starter equipment option before continuing.
                </p>
              ) : null}

              {attemptedBuildAdvance && !isStarterPackSelectionReady ? (
                <p className={styles.errorText}>
                  Finish the starter equipment item choices before continuing.
                </p>
              ) : null}
            </fieldset>
          ) : null}
        </div>

        <input type="hidden" {...register("startingEquipmentChoiceIndex")} />
      </section>
    );
  }

  function renderBackgroundOriginFeatControls() {
    return (
      <OriginFeatSetupControls
        feat={backgroundEntry?.originFeat ?? null}
        featEntry={selectedBackgroundFeatEntry}
        sourceLabel="background"
        emptyText="Choose a supported background first."
        skillProficiencies={proficiencyPreviewCollections.skillProficiencies}
        languageProficiencies={proficiencyPreviewCollections.languageProficiencies}
        lockedMagicInitiateSpellList={backgroundEntry?.originFeatSpellList}
        onMagicInitiateChange={updateBackgroundMagicInitiate}
        onCultOfDragonInitiateLanguageChange={updateBackgroundCultOfDragonInitiateLanguage}
        onEmeraldEnclaveFledglingChange={updateBackgroundEmeraldEnclaveFledgling}
        onSpellfireSparkChange={updateBackgroundSpellfireSpark}
        onPurpleDragonRookSkillChange={updateBackgroundPurpleDragonRookSkill}
        onToolFeatSelection={updateBackgroundToolFeatSelection}
        onSkilledSelection={updateBackgroundSkilledSelection}
      />
    );
  }

  function renderHumanOriginFeatControls() {
    return (
      <OriginFeatSetupControls
        feat={selectedHumanOriginFeat || null}
        featEntry={selectedHumanOriginFeatEntry}
        sourceLabel="species"
        emptyText="Choose a Human origin feat first."
        skillProficiencies={proficiencyPreviewCollections.skillProficiencies}
        languageProficiencies={proficiencyPreviewCollections.languageProficiencies}
        onMagicInitiateChange={updateHumanMagicInitiate}
        onCultOfDragonInitiateLanguageChange={updateHumanCultOfDragonInitiateLanguage}
        onEmeraldEnclaveFledglingChange={updateHumanEmeraldEnclaveFledgling}
        onSpellfireSparkChange={updateHumanSpellfireSpark}
        onPurpleDragonRookSkillChange={updateHumanPurpleDragonRookSkill}
        onToolFeatSelection={updateHumanToolFeatSelection}
        onSkilledSelection={updateHumanSkilledSelection}
      />
    );
  }

  function renderCustomBackgroundSetupSection() {
    if (!isCustomBackgroundSelected) {
      return null;
    }

    const customBackground = resolvedCustomBackground ?? createDraftCustomBackgroundConfig();
    const customBackgroundNameDraft = selectedCustomBackground?.name ?? customBackground.name;
    const abilityScoreIncrease = displayedBackgroundChoices?.abilityScoreIncrease;
    const twoOneChoice = abilityScoreIncrease?.mode === "two-one" ? abilityScoreIncrease : null;
    const oneOneOneChoice =
      abilityScoreIncrease?.mode === "one-one-one" ? abilityScoreIncrease : null;

    function updateCustomBackground(partial: Partial<CharacterCustomBackgroundConfig>) {
      setValue(
        "customBackground",
        {
          ...customBackground,
          ...partial
        },
        {
          shouldDirty: true,
          shouldValidate: true
        }
      );
    }

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Custom Background</p>
            <h3 className={styles.sectionValueHeading}>Background foundations</h3>
          </div>
          {!isBackgroundSetupReady || !isCustomBackgroundReady ? <InputRequiredBadge /> : null}
        </div>

        <div className={styles.choiceGroupColumns}>
          <fieldset className={styles.choiceGroup}>
            <legend>Identity</legend>
            <label className={styles.field}>
              <span>Custom background name</span>
              <TextInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isCustomBackgroundReady}
                value={customBackgroundNameDraft}
                maxLength={CUSTOM_BACKGROUND_NAME_MAX_LENGTH}
                onChange={(event) =>
                  updateCustomBackground({
                    name: event.target.value.slice(0, CUSTOM_BACKGROUND_NAME_MAX_LENGTH)
                  })
                }
              />
            </label>
          </fieldset>

          <fieldset className={styles.choiceGroup}>
            <legend>Ability Scores</legend>
            <p className={styles.helperText}>
              Choose either +2/+1 or +1/+1/+1 among any ability scores.
            </p>
            <div
              className={styles.segmentedControl}
              role="tablist"
              aria-label="Background ability mode"
            >
              <button
                type="button"
                className={clsx(
                  styles.segmentButton,
                  abilityScoreIncrease?.mode === "two-one" && styles.segmentButtonActive
                )}
                onClick={() => updateBackgroundAbilityMode("two-one")}
              >
                +2/+1
              </button>
              <button
                type="button"
                className={clsx(
                  styles.segmentButton,
                  abilityScoreIncrease?.mode === "one-one-one" && styles.segmentButtonActive
                )}
                onClick={() => updateBackgroundAbilityMode("one-one-one")}
              >
                +1/+1/+1
              </button>
            </div>

            {twoOneChoice ? (
              <div className={styles.classSetupGrid}>
                <label className={styles.field}>
                  <span>+2 ability</span>
                  <SelectInput
                    className={styles.fieldInput}
                    value={twoOneChoice.primaryAbility}
                    onChange={(event) =>
                      updateBackgroundTwoOneAbility(
                        "primaryAbility",
                        event.target.value as AbilityKey
                      )
                    }
                  >
                    {abilityKeys.map((ability) => (
                      <option
                        key={ability}
                        value={ability}
                        disabled={ability === twoOneChoice.secondaryAbility}
                      >
                        {ability}
                      </option>
                    ))}
                  </SelectInput>
                </label>

                <label className={styles.field}>
                  <span>+1 ability</span>
                  <SelectInput
                    className={styles.fieldInput}
                    value={twoOneChoice.secondaryAbility}
                    onChange={(event) =>
                      updateBackgroundTwoOneAbility(
                        "secondaryAbility",
                        event.target.value as AbilityKey
                      )
                    }
                  >
                    {abilityKeys.map((ability) => (
                      <option
                        key={ability}
                        value={ability}
                        disabled={ability === twoOneChoice.primaryAbility}
                      >
                        {ability}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              </div>
            ) : oneOneOneChoice ? (
              <div className={styles.classSetupGrid}>
                {oneOneOneChoice.abilities.map((selectedAbility, index) => (
                  <label key={`custom-background-plus-one-${index}`} className={styles.field}>
                    <span>+1 ability {index + 1}</span>
                    <SelectInput
                      className={styles.fieldInput}
                      value={selectedAbility}
                      onChange={(event) =>
                        updateBackgroundOneOneOneAbility(index, event.target.value as AbilityKey)
                      }
                    >
                      {abilityKeys.map((ability) => (
                        <option
                          key={ability}
                          value={ability}
                          disabled={
                            ability !== selectedAbility &&
                            oneOneOneChoice.abilities.includes(ability)
                          }
                        >
                          {ability}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.helperText}>Choose an ability increase mode.</p>
            )}
          </fieldset>

          <fieldset className={styles.choiceGroup}>
            <legend>Languages</legend>
            <p className={styles.helperText}>Choose up to 3 total languages (unless you want more)</p>
            <p className={styles.helperText}>Standard</p>
            <div className={styles.choiceGrid}>
              {standardBackgroundLanguageOptions.map((language) => {
                const isActive = selectedBackgroundLanguageProficiencies.includes(language);

                return (
                  <RadioContainerOption
                    key={language}
                    header={languageProficiencyLabels[language]}
                    selected={isActive}
                    onSelect={() => toggleBackgroundLanguageProficiency(language)}
                    indicatorType="checkbox"
                  />
                );
              })}
            </div>
            <p className={styles.helperText}>Rare</p>
            <div className={styles.choiceGrid}>
              {rareBackgroundLanguageOptions.map((language) => {
                const isActive = selectedBackgroundLanguageProficiencies.includes(language);

                return (
                  <RadioContainerOption
                    key={language}
                    header={languageProficiencyLabels[language]}
                    selected={isActive}
                    onSelect={() => toggleBackgroundLanguageProficiency(language)}
                    indicatorType="checkbox"
                  />
                );
              })}
            </div>
          </fieldset>
        </div>

        <p className={styles.helperText}>
          Skill proficiencies, origin feats, and starting equipment can be added directly in the
          character sheet after creation.
        </p>
      </section>
    );
  }

  function renderBackgroundSetupSection() {
    if (isCustomBackgroundSelected) {
      return renderCustomBackgroundSetupSection();
    }

    const abilityScoreIncrease = displayedBackgroundChoices?.abilityScoreIncrease;
    const twoOneChoice = abilityScoreIncrease?.mode === "two-one" ? abilityScoreIncrease : null;
    const oneOneOneChoice =
      abilityScoreIncrease?.mode === "one-one-one" ? abilityScoreIncrease : null;
    const fixedBackgroundTools = backgroundEntry?.grantedToolProficiencies ?? [];

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Background</p>
            <h3 className={styles.sectionValueHeading}>
              {backgroundEntry?.name ?? "Choose a background first"}
            </h3>
          </div>
          {!isBackgroundSetupReady ? <InputRequiredBadge /> : null}
        </div>

        {!backgroundEntry ? (
          <div className={styles.placeholderCard}>
            <p>Choose a supported 2024 background in the core profile step.</p>
          </div>
        ) : (
          <div className={styles.choiceGroupColumns}>
            <fieldset className={styles.choiceGroup}>
              <legend>Ability Scores</legend>
              <p className={styles.helperText}>
                Choose either +2/+1 or +1/+1/+1 among{" "}
                {backgroundEntry.abilityScoreOptions.join(", ")}.
              </p>
              <div
                className={styles.segmentedControl}
                role="tablist"
                aria-label="Background ability mode"
              >
                <button
                  type="button"
                  className={clsx(
                    styles.segmentButton,
                    abilityScoreIncrease?.mode === "two-one" && styles.segmentButtonActive
                  )}
                  onClick={() => updateBackgroundAbilityMode("two-one")}
                >
                  +2/+1
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.segmentButton,
                    abilityScoreIncrease?.mode === "one-one-one" && styles.segmentButtonActive
                  )}
                  onClick={() => updateBackgroundAbilityMode("one-one-one")}
                >
                  +1/+1/+1
                </button>
              </div>

              {twoOneChoice ? (
                <div className={styles.classSetupGrid}>
                  <label className={styles.field}>
                    <span>+2 ability</span>
                    <SelectInput
                      className={styles.fieldInput}
                      value={twoOneChoice.primaryAbility}
                      onChange={(event) =>
                        updateBackgroundTwoOneAbility(
                          "primaryAbility",
                          event.target.value as AbilityKey
                        )
                      }
                    >
                      {backgroundEntry.abilityScoreOptions.map((ability) => (
                        <option
                          key={ability}
                          value={ability}
                          disabled={ability === twoOneChoice.secondaryAbility}
                        >
                          {ability}
                        </option>
                      ))}
                    </SelectInput>
                  </label>

                  <label className={styles.field}>
                    <span>+1 ability</span>
                    <SelectInput
                      className={styles.fieldInput}
                      value={twoOneChoice.secondaryAbility}
                      onChange={(event) =>
                        updateBackgroundTwoOneAbility(
                          "secondaryAbility",
                          event.target.value as AbilityKey
                        )
                      }
                    >
                      {backgroundEntry.abilityScoreOptions.map((ability) => (
                        <option
                          key={ability}
                          value={ability}
                          disabled={ability === twoOneChoice.primaryAbility}
                        >
                          {ability}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                </div>
              ) : oneOneOneChoice ? (
                <div className={styles.classSetupGrid}>
                  {oneOneOneChoice.abilities.map((selectedAbility, index) => (
                    <label key={`background-plus-one-${index}`} className={styles.field}>
                      <span>+1 ability {index + 1}</span>
                      <SelectInput
                        className={styles.fieldInput}
                        value={selectedAbility}
                        onChange={(event) =>
                          updateBackgroundOneOneOneAbility(index, event.target.value as AbilityKey)
                        }
                      >
                        {backgroundEntry.abilityScoreOptions.map((ability) => (
                          <option
                            key={ability}
                            value={ability}
                            disabled={
                              ability !== selectedAbility &&
                              oneOneOneChoice.abilities.includes(ability)
                            }
                          >
                            {ability}
                          </option>
                        ))}
                      </SelectInput>
                    </label>
                  ))}
                </div>
              ) : (
                <p className={styles.helperText}>Choose an ability increase mode.</p>
              )}
              {attemptedBuildAdvance && !isBackgroundAbilitySelectionReady ? (
                <p className={styles.errorText}>
                  Choose a background ability score increase before continuing.
                </p>
              ) : null}
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>Skill Proficiencies</legend>
              {hasBackgroundSkillChoice ? (
                <>
                  <p className={styles.helperText}>
                    Choose exactly {backgroundSkillSelectionLimit} background skills.
                  </p>
                  <div className={styles.choiceGrid}>
                    {backgroundSkillOptions.map((skill) => {
                      const isActive = selectedBackgroundSkillProficiencies.includes(skill);
                      const disabled =
                        !isActive &&
                        selectedBackgroundSkillProficiencies.length >=
                          backgroundSkillSelectionLimit;

                      return (
                        <RadioContainerOption
                          key={skill}
                          header={skill}
                          selected={isActive}
                          onSelect={() => {
                            if (disabled) {
                              return;
                            }

                            toggleBackgroundSkillProficiency(skill);
                          }}
                          disabled={disabled}
                          indicatorType="checkbox"
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <CellContainer
                  label="Background Skills"
                  content={
                    backgroundSkillOptions.length > 0
                      ? backgroundSkillOptions.join(", ")
                      : "No skill proficiencies configured"
                  }
                />
              )}
              {attemptedBuildAdvance && !isBackgroundSkillSelectionReady ? (
                <p className={styles.errorText}>
                  Choose exactly {backgroundSkillSelectionLimit} background skills before
                  continuing.
                </p>
              ) : null}
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>Tool Proficiency</legend>
              {hasBackgroundToolChoice ? (
                <label className={styles.field}>
                  <span>{backgroundEntry.toolProficiencyChoiceLabel ?? "Background tool"}</span>
                  <SelectInput
                    className={styles.fieldInput}
                    invalid={attemptedBuildAdvance && !isBackgroundToolSelectionReady}
                    value={selectedBackgroundToolChoice}
                    onChange={(event) =>
                      commitBackgroundToolProficiency(event.target.value as TOOL_PROFICIENCY)
                    }
                  >
                    <option value="">-</option>
                    {backgroundToolOptions.map((tool) => (
                      <option key={tool} value={tool}>
                        {getToolProficiencyLabel(tool)}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              ) : (
                <CellContainer
                  label="Background Tool"
                  content={
                    fixedBackgroundTools.length > 0
                      ? fixedBackgroundTools.map((tool) => getToolProficiencyLabel(tool)).join(", ")
                      : "No tool proficiency configured"
                  }
                />
              )}
              {attemptedBuildAdvance && !isBackgroundToolSelectionReady ? (
                <p className={styles.errorText}>
                  Choose the background tool proficiency before continuing.
                </p>
              ) : null}
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>Languages</legend>
              <p className={styles.helperText}>
                Choose up to 3 total languages (unless you want more)
              </p>
              <p className={styles.helperText}>Standard</p>
              <div className={styles.choiceGrid}>
                {standardBackgroundLanguageOptions.map((language) => {
                  const isActive = selectedBackgroundLanguageProficiencies.includes(language);

                  return (
                    <RadioContainerOption
                      key={language}
                      header={languageProficiencyLabels[language]}
                      selected={isActive}
                      onSelect={() => toggleBackgroundLanguageProficiency(language)}
                      indicatorType="checkbox"
                    />
                  );
                })}
              </div>
              <p className={styles.helperText}>Rare</p>
              <div className={styles.choiceGrid}>
                {rareBackgroundLanguageOptions.map((language) => {
                  const isActive = selectedBackgroundLanguageProficiencies.includes(language);

                  return (
                    <RadioContainerOption
                      key={language}
                      header={languageProficiencyLabels[language]}
                      selected={isActive}
                      onSelect={() => toggleBackgroundLanguageProficiency(language)}
                      indicatorType="checkbox"
                    />
                  );
                })}
              </div>
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>
                Origin Feat · {getFeatLabel(backgroundEntry.originFeat)}
              </legend>
              {renderBackgroundOriginFeatControls()}
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>Starting Equipment</legend>
              <div className={styles.radioChoiceGrid}>
                {backgroundEntry.starterPack.startingEquipment.map((choice, choiceIndex) => {
                  const equipmentMode = choiceIndex === 1 ? "gold" : "equipment";
                  const isActive = displayedBackgroundChoices?.equipmentMode === equipmentMode;

                  return (
                    <RadioContainerOption
                      key={choiceIndex}
                      header={`Option ${String.fromCharCode(65 + choiceIndex)}`}
                      selected={isActive}
                      onSelect={() =>
                        commitBackgroundChoices({
                          ...getBackgroundChoiceDraftBase(),
                          equipmentMode
                        })
                      }
                      breakdown={formatStarterPackEquipmentChoice(choice, choiceIndex, {
                        includeOptionLabel: false
                      })}
                    />
                  );
                })}
              </div>
              {attemptedBuildAdvance && !isBackgroundEquipmentSelectionReady ? (
                <p className={styles.errorText}>
                  Choose a background starting equipment option before continuing.
                </p>
              ) : null}
            </fieldset>
          </div>
        )}
      </section>
    );
  }

  function renderCustomSpeciesSetupSection() {
    if (!isCustomSpeciesSelected) {
      return null;
    }

    const customSpecies = resolvedCustomSpecies ?? createDraftCustomSpeciesConfig();
    const customSpeciesNameDraft = selectedCustomSpecies?.name ?? customSpecies.name;

    function updateCustomSpecies(partial: Partial<CharacterCustomSpeciesConfig>) {
      setValue(
        "customSpecies",
        {
          ...customSpecies,
          ...partial
        },
        {
          shouldDirty: true,
          shouldValidate: true
        }
      );
    }

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Custom Species</p>
            <h3 className={styles.sectionValueHeading}>Species foundations</h3>
          </div>
          {!isCustomSpeciesReady ? <InputRequiredBadge /> : null}
        </div>

        <div className={styles.classSetupGrid}>
          <label className={styles.field}>
            <span>Custom species name</span>
            <TextInput
              className={styles.fieldInput}
              invalid={attemptedBuildAdvance && !isCustomSpeciesReady}
              value={customSpeciesNameDraft}
              maxLength={CUSTOM_SPECIES_NAME_MAX_LENGTH}
              onChange={(event) =>
                updateCustomSpecies({
                  name: event.target.value.slice(0, CUSTOM_SPECIES_NAME_MAX_LENGTH)
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Speed</span>
            <NumberInput
              className={styles.fieldInput}
              value={customSpecies.speed}
              min={CUSTOM_SPECIES_SPEED_MINIMUM}
              max={CUSTOM_SPECIES_SPEED_MAXIMUM}
              onChange={(event) =>
                updateCustomSpecies({
                  speed: normalizeCustomSpeciesSpeed(event.target.value)
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Size</span>
            <SelectInput
              className={styles.fieldInput}
              value={customSpecies.size}
              onChange={(event) =>
                updateCustomSpecies({
                  size: event.target.value as CharacterCustomSpeciesConfig["size"]
                })
              }
            >
              {customSpeciesSizeOptions.map((bodySize) => (
                <option key={bodySize} value={bodySize}>
                  {formatBodySize(bodySize)}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>

        {attemptedBuildAdvance && !isCustomSpeciesReady ? (
          <p className={styles.errorText}>Enter a custom species name before continuing.</p>
        ) : null}
      </section>
    );
  }

  function renderSpeciesSetupSection() {
    if (isCustomSpeciesSelected) {
      return renderCustomSpeciesSetupSection();
    }

    const speciesSpeedBonuses = getSpeciesSpeedBonusesForCharacter({
      species: resolvedSpecies,
      speciesChoices: normalizedSpeciesChoices
    });
    const speciesSpeed =
      getSpeciesSpeedForCharacter({
        species: resolvedSpecies,
        customSpecies: resolvedCustomSpecies
      }) +
      speciesSpeedBonuses
        .filter((bonus) => (bonus.movementType ?? "walk") === "walk")
        .reduce((total, bonus) => total + bonus.value, 0);
    const selectedDraconicAncestryOption =
      draconicAncestryOptions.find((option) => option.key === selectedDraconicAncestry) ?? null;
    const selectedElvenLineageOption =
      elfLineageOptions.find((option) => option.key === selectedElvenLineage) ?? null;
    const selectedGnomeLineageOption =
      gnomeLineageOptions.find((option) => option.key === selectedGnomeLineage) ?? null;
    const selectedGiantAncestryOption =
      giantAncestryOptions.find((option) => option.key === selectedGiantAncestry) ?? null;
    const selectedHumanOriginFeatOption =
      humanOriginFeatOptions.find((option) => option.feat === selectedHumanOriginFeat) ?? null;
    const selectedTieflingLegacyOption =
      tieflingLegacyOptions.find((option) => option.key === selectedTieflingLegacy) ?? null;

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Species</p>
            <h3 className={styles.sectionValueHeading}>
              {resolvedSpecies || "Choose a species first"}
            </h3>
          </div>
          {!isSpeciesSetupReady ? <InputRequiredBadge /> : null}
        </div>

        <div className={styles.summaryGrid}>
          <CellContainer label="Speed" content={`${speciesSpeed} ft`} />
          <CellContainer
            label="Size Options"
            content={
              speciesBodySizeOptions.length > 0
                ? formatBodySizeOptions(speciesBodySizeOptions)
                : "Not configured yet"
            }
          />
          {draconicAncestryOptions.length > 0 ? (
            <CellContainer
              label="Draconic Ancestry"
              content={
                selectedDraconicAncestryOption
                  ? formatDragonbornDraconicAncestryOptionLabel(selectedDraconicAncestryOption)
                  : "Choose ancestry"
              }
            />
          ) : null}
          {elfLineageOptions.length > 0 ? (
            <CellContainer
              label="Elven Lineage"
              content={
                selectedElvenLineageOption
                  ? formatElfLineageOptionLabel(selectedElvenLineageOption)
                  : "Choose lineage"
              }
            />
          ) : null}
          {elfSkillProficiencyOptions.length > 0 ? (
            <CellContainer
              label="Keen Senses"
              content={selectedElvenSkillProficiency || "Choose skill"}
            />
          ) : null}
          {elfSpellcastingAbilityOptions.length > 0 ? (
            <CellContainer
              label="Lineage Spells"
              content={selectedElvenSpellcastingAbility || "Choose ability"}
            />
          ) : null}
          {gnomeLineageOptions.length > 0 ? (
            <CellContainer
              label="Gnomish Lineage"
              content={
                selectedGnomeLineageOption
                  ? formatGnomeLineageOptionLabel(selectedGnomeLineageOption)
                  : "Choose lineage"
              }
            />
          ) : null}
          {gnomeSpellcastingAbilityOptions.length > 0 ? (
            <CellContainer
              label="Gnome Spellcasting"
              content={selectedGnomeSpellcastingAbility || "Choose ability"}
            />
          ) : null}
          {giantAncestryOptions.length > 0 ? (
            <CellContainer
              label="Giant Ancestry"
              content={
                selectedGiantAncestryOption
                  ? formatGoliathGiantAncestryOptionLabel(selectedGiantAncestryOption)
                  : "Choose ancestry"
              }
            />
          ) : null}
          {humanSkillProficiencyOptions.length > 0 ? (
            <CellContainer
              label="Skillful"
              content={selectedHumanSkillProficiency || "Choose skill"}
            />
          ) : null}
          {humanOriginFeatOptions.length > 0 ? (
            <CellContainer
              label="Origin Feat"
              content={
                selectedHumanOriginFeatOption
                  ? formatHumanOriginFeatOptionLabel(selectedHumanOriginFeatOption)
                  : "Choose feat"
              }
            />
          ) : null}
          {tieflingLegacyOptions.length > 0 ? (
            <CellContainer
              label="Fiendish Legacy"
              content={
                selectedTieflingLegacyOption
                  ? formatTieflingFiendishLegacyOptionLabel(selectedTieflingLegacyOption)
                  : "Choose legacy"
              }
            />
          ) : null}
          {tieflingSpellcastingAbilityOptions.length > 0 ? (
            <CellContainer
              label="Legacy Spells"
              content={selectedTieflingSpellcastingAbility || "Choose ability"}
            />
          ) : null}
        </div>

        {speciesBodySizeOptions.length > 1 ? (
          <fieldset className={styles.choiceGroup}>
            <legend>Body Size</legend>
            <div className={styles.choiceGrid}>
              {speciesBodySizeOptions.map((bodySize) => (
                <RadioContainerOption
                  key={bodySize}
                  name="species-body-size"
                  header={formatBodySize(bodySize)}
                  selected={selectedBodySize === bodySize}
                  onSelect={() =>
                    setValue(
                      "speciesChoices",
                      {
                        ...(getValues("speciesChoices") ?? {}),
                        bodySize
                      },
                      {
                        shouldDirty: true,
                        shouldValidate: true
                      }
                    )
                  }
                />
              ))}
            </div>
            {attemptedBuildAdvance && !isSpeciesBodySizeReady ? (
              <p className={styles.errorText}>Choose a body size before continuing.</p>
            ) : null}
          </fieldset>
        ) : (
          <div className={styles.infoCard}>
            <strong>
              {speciesBodySizeOptions[0] ? formatBodySize(speciesBodySizeOptions[0]) : "-"}
            </strong>
            <small>Derived from species</small>
          </div>
        )}

        <div className={styles.speciesChoiceGrid}>
          {draconicAncestryOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Draconic Ancestry</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesDraconicAncestryReady}
                value={selectedDraconicAncestry}
                onChange={(event) => {
                  const nextAncestry = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    draconicAncestry: nextAncestry || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {draconicAncestryOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatDragonbornDraconicAncestryOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesDraconicAncestryReady ? (
                <small className={styles.errorText}>
                  Choose a Draconic Ancestry before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {elfLineageOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Elven Lineage</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesElvenLineageReady}
                value={selectedElvenLineage}
                onChange={(event) => {
                  const nextLineage = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    elvenLineage: nextLineage || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {elfLineageOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatElfLineageOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesElvenLineageReady ? (
                <small className={styles.errorText}>
                  Choose an Elven Lineage before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {elfSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Keen Senses Proficiency</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesElfSkillProficiencyReady}
                value={selectedElvenSkillProficiency}
                onChange={(event) => {
                  const nextSkill = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    elvenSkillProficiency: nextSkill || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {elfSkillProficiencyOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesElfSkillProficiencyReady ? (
                <small className={styles.errorText}>
                  Choose a Keen Senses skill before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {elfSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Elven Spellcasting Ability</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesElfSpellcastingAbilityReady}
                value={selectedElvenSpellcastingAbility}
                onChange={(event) => {
                  const nextAbility = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    elvenSpellcastingAbility: nextAbility || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {elfSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesElfSpellcastingAbilityReady ? (
                <small className={styles.errorText}>
                  Choose an Elven spellcasting ability before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {gnomeLineageOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Gnomish Lineage</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesGnomeLineageReady}
                value={selectedGnomeLineage}
                onChange={(event) => {
                  const nextLineage = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    gnomeLineage: nextLineage || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {gnomeLineageOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatGnomeLineageOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesGnomeLineageReady ? (
                <small className={styles.errorText}>
                  Choose a Gnomish Lineage before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {gnomeSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Gnome Spellcasting Ability</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesGnomeSpellcastingAbilityReady}
                value={selectedGnomeSpellcastingAbility}
                onChange={(event) => {
                  const nextAbility = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    gnomeSpellcastingAbility: nextAbility || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {gnomeSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesGnomeSpellcastingAbilityReady ? (
                <small className={styles.errorText}>
                  Choose a Gnome spellcasting ability before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {giantAncestryOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Giant Ancestry</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesGiantAncestryReady}
                value={selectedGiantAncestry}
                onChange={(event) => {
                  const nextAncestry = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    giantAncestry: nextAncestry || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {giantAncestryOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatGoliathGiantAncestryOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesGiantAncestryReady ? (
                <small className={styles.errorText}>
                  Choose a Giant Ancestry before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {humanSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Skillful Proficiency</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesHumanSkillProficiencyReady}
                value={selectedHumanSkillProficiency}
                onChange={(event) => {
                  const nextSkill = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    humanSkillProficiency: nextSkill || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {humanSkillSelectOptions.map((option) => (
                  <option key={option.skill} value={option.skill} disabled={option.disabled}>
                    {option.skill}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesHumanSkillProficiencyReady ? (
                <small className={styles.errorText}>
                  Choose a Skillful proficiency before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {humanOriginFeatOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Origin Feat</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesHumanOriginFeatReady}
                value={selectedHumanOriginFeat}
                onChange={(event) => {
                  const nextFeat = event.target.value as FEATS | "";
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    humanOriginFeat: nextFeat || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {humanOriginFeatOptions.map((option) => (
                  <option key={option.feat} value={option.feat}>
                    {formatHumanOriginFeatOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesHumanOriginFeatReady ? (
                <small className={styles.errorText}>
                  Choose a Human origin feat before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {tieflingLegacyOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Fiendish Legacy</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesTieflingLegacyReady}
                value={selectedTieflingLegacy}
                onChange={(event) => {
                  const nextLegacy = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    tieflingLegacy: nextLegacy || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {tieflingLegacyOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatTieflingFiendishLegacyOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesTieflingLegacyReady ? (
                <small className={styles.errorText}>
                  Choose a Fiendish Legacy before continuing.
                </small>
              ) : null}
            </label>
          ) : null}

          {tieflingSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              <span>Tiefling Spellcasting Ability</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={attemptedBuildAdvance && !isSpeciesTieflingSpellcastingAbilityReady}
                value={selectedTieflingSpellcastingAbility}
                onChange={(event) => {
                  const nextAbility = event.target.value;
                  const nextChoices = normalizeCharacterSpeciesChoices(resolvedSpecies, {
                    ...(getValues("speciesChoices") ?? {}),
                    tieflingSpellcastingAbility: nextAbility || undefined
                  });

                  setValue("speciesChoices", nextChoices, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="">-</option>
                {tieflingSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
              {attemptedBuildAdvance && !isSpeciesTieflingSpellcastingAbilityReady ? (
                <small className={styles.errorText}>
                  Choose a Tiefling spellcasting ability before continuing.
                </small>
              ) : null}
            </label>
          ) : null}
        </div>

        {humanOriginFeatOptions.length > 0 ? (
          <fieldset className={styles.choiceGroup}>
            <legend>Origin Feat Setup</legend>
            {renderHumanOriginFeatControls()}
          </fieldset>
        ) : null}
      </section>
    );
  }

  function renderProficiencyPreviewSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>PREVIEW</p>
          </div>
        </div>

        <ProficiencySummaryPills
          sections={proficiencyPreviewSections}
          emptyClassName={styles.helperText}
          emptyText="Choose a class, species, and background to preview proficiencies."
        />
      </section>
    );
  }

  function renderNotesSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Notes</p>
            <h3>Alignment and notes</h3>
          </div>
        </div>

        <div className={styles.alignmentGrid} role="radiogroup" aria-label="Character alignment">
          {alignmentOptions.map((option) => (
            <RadioContainerOption
              key={option}
              name="character-alignment"
              header={option}
              selected={resolvedAlignment === option}
              onSelect={() =>
                setValue("alignment", option, {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            />
          ))}
        </div>

        <label className={styles.field}>
          <span>Character Notes</span>
          <TextAreaInput
            rows={4}
            className={clsx(styles.fieldInput, styles.backgroundInput)}
            placeholder="Optional notes: backstory, motives, bonds, ideals, morals..."
            {...register("backgroundNotes")}
          />
          <small className={styles.helperText}>
            Optional free text for any character context you want to track.
          </small>
        </label>

        <input
          type="hidden"
          {...register("alignment", {
            required: "Select an alignment"
          })}
        />
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <section className={clsx(styles.sectionCard, styles.progressCard)}>
        {isEditing ? (
          <>
            <p className={styles.sectionEyebrow}>Edit character</p>
            <h2 className={styles.title}>Refine your character</h2>
            <p className={styles.description}>
              Update the essentials, starting stats, proficiencies, and notes in one place.
            </p>
          </>
        ) : (
          <div className={styles.wizardProgress} aria-label="Character creation steps">
            {renderWizardStepBadge(1, "1. Core profile")}
            {renderWizardStepBadge(2, "2. Build setup")}
            {renderWizardStepBadge(3, "3. Notes")}
          </div>
        )}
      </section>

      <form
        className={styles.form}
        onSubmit={
          isEditing || wizardStep === 3
            ? handlePendingSubmit
            : (event) => {
                event.preventDefault();
              }
        }
        noValidate
      >
        <input type="hidden" {...register("currentHitPoints", { valueAsNumber: true })} />
        <input type="hidden" {...register("temporaryHitPoints", { valueAsNumber: true })} />
        <input type="hidden" {...register("temporaryHitPointsSource")} />

        {isEditing ? (
          <>
            {renderBasicProfileSection()}
            {renderStartingHitPointsSection()}
            {renderAbilityDistributionSection()}
            {renderCustomClassSetupSection()}
            {renderCustomSubclassSetupSection()}
            {renderClassSetupSection({ showStartingEquipmentChoice: false })}
            {renderSpeciesSetupSection()}
            {renderBackgroundSetupSection()}
            {renderNotesSection()}
          </>
        ) : null}

        {!isEditing && wizardStep === 1 ? renderBasicProfileSection() : null}

        {!isEditing && wizardStep === 2 ? (
          <>
            {renderStartingHitPointsSection()}
            {renderAbilityDistributionSection()}
            {renderCustomClassSetupSection()}
            {renderCustomSubclassSetupSection()}
            {renderClassSetupSection()}
            {renderSpeciesSetupSection()}
            {renderBackgroundSetupSection()}
            {renderProficiencyPreviewSection()}
          </>
        ) : null}

        {!isEditing && wizardStep === 3 ? renderNotesSection() : null}

        <section className={clsx(styles.sectionCard, styles.actionsCard)}>
          <div
            className={clsx(styles.actions, !isEditing && wizardStep === 1 && styles.actionsSplit)}
          >
            {isEditing ? (
              <>
                <ActionButton
                  type="submit"
                  fullWidth={false}
                  loading={pendingAction === "submit"}
                  disabled={hasPendingAction || !isPointBuyReady}
                >
                  Update character
                </ActionButton>
                <ActionButton
                  type="button"
                  fullWidth={false}
                  onClick={onBack}
                  disabled={hasPendingAction}
                >
                  Cancel
                </ActionButton>
              </>
            ) : null}

            {!isEditing && wizardStep === 1 ? (
              <>
                <div className={clsx(styles.actionsGroup, styles.actionsLeft)}>
                  <ActionButton
                    type="button"
                    fullWidth={false}
                    icon={<Dice6 size={16} aria-hidden="true" />}
                    onClick={handleRandomize}
                    disabled={hasPendingAction}
                  >
                    Randomize
                  </ActionButton>
                </div>
                <div className={clsx(styles.actionsGroup, styles.actionsRight)}>
                  {!hasAnyCustomOriginSelected ? (
                    <ActionButton
                      type="button"
                      fullWidth={false}
                      loading={pendingAction === "recommended"}
                      disabled={hasPendingAction || !isCoreProfileReady}
                      onClick={() => {
                        void runPendingAction("recommended", handleRecommendedCreate);
                      }}
                    >
                      Create with recommended build
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    type="button"
                    fullWidth={false}
                    loading={pendingAction === "customize"}
                    disabled={hasPendingAction || !isCoreProfileReady}
                    onClick={() => {
                      void runPendingAction("customize", handleStartCustomization);
                    }}
                  >
                    Customize based on your needs
                  </ActionButton>
                </div>
              </>
            ) : null}

            {!isEditing && wizardStep === 2 ? (
              <>
                <ActionButton
                  type="button"
                  fullWidth={false}
                  icon={<ArrowLeft size={16} aria-hidden="true" />}
                  onClick={handleBackToStepOne}
                  disabled={hasPendingAction}
                >
                  Back
                </ActionButton>
                <ActionButton
                  type="button"
                  fullWidth={false}
                  loading={pendingAction === "proceed"}
                  disabled={hasPendingAction || !isBuildSetupReady}
                  onClick={() => {
                    void runPendingAction("proceed", handleProceedToNotes);
                  }}
                >
                  Proceed
                </ActionButton>
              </>
            ) : null}

            {!isEditing && wizardStep === 3 ? (
              <>
                <ActionButton
                  type="button"
                  fullWidth={false}
                  icon={<ArrowLeft size={16} aria-hidden="true" />}
                  onClick={() => setWizardStep(2)}
                  disabled={hasPendingAction}
                >
                  Back
                </ActionButton>
                <ActionButton
                  type="submit"
                  fullWidth={false}
                  loading={pendingAction === "submit"}
                  disabled={hasPendingAction}
                >
                  Create Character
                </ActionButton>
              </>
            ) : null}
          </div>
        </section>
      </form>
      {isMulticlassGuideOpen ? (
        <MulticlassGuideModal onClose={() => setIsMulticlassGuideOpen(false)} />
      ) : null}
    </div>
  );
}

export default CharacterForm;
