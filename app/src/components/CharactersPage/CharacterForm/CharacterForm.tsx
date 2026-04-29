import clsx from "clsx";
import { Dice6 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type {
  AbilityKey,
  AbilityScores,
  AttributeMode,
  CharacterDraft,
  SkillName
} from "../../../types";
import { getClassStarterPack } from "../../../codex/classes/starterPack";
import {
  POINT_BUY_BUDGET,
  abilityKeys,
  alignmentOptions,
  cloneAbilities,
  createDefaultAbilities,
  createDefaultCurrencies,
  createEmptyCharacter,
  getAffordablePointBuyMax,
  getPointBuyCost,
  getPointBuyRemaining,
  normalizePointBuyAbilities,
  speciesOptions
} from "../../../pages/CharactersPage/constants";
import { clampNumber } from "../../../pages/CharactersPage/shared";
import {
  backgroundOptions,
  classOptions,
  getGrantedSkillProficienciesForCharacter,
  getSkillProficiencyOptionsForClass,
  getSkillSelectionLimitForClass,
  getToolProficiencyChoicesForClass,
  normalizeSkillSelectionsForClass,
  normalizeToolSelectionsForClass,
  resolveSkillProficienciesForCharacter
} from "../../../pages/CharactersPage/proficiency";
import { getToolProficiencyLabel } from "../../../pages/CharactersPage/proficiencyOptions";
import { normalizeLevelAndXp } from "../../../pages/CharactersPage/experience";
import { getAutomaticMaxHitPointsForCharacter } from "../../../pages/CharactersPage/gameplay";
import { getEffectiveHitPointMaximumForCharacter } from "../../../pages/CharactersPage/traits";
import {
  getSubclassOptionsForClassName,
  normalizeSubclassId
} from "../../../pages/CharactersPage/subclasses";
import NumberInput from "../FormInputs/NumberInput";
import SelectInput from "../FormInputs/SelectInput";
import TextAreaInput from "../FormInputs/TextAreaInput";
import TextInput from "../FormInputs/TextInput";
import abilityEditorStyles from "../CharacterSheetPage/StatsForm/AbilityScoresModal.module.css";
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

function normalizeCustomAbilities(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = Math.max(1, Math.min(99, abilities[ability]));
    return next;
  }, {} as AbilityScores);
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

function createFormValues(
  draft: CharacterDraft,
  options?: {
    defaultHitPointMode?: CharacterDraft["maxHitPointsMode"];
    startingEquipmentChoiceIndex?: string;
    starterPackSelectionValues?: Record<string, string>;
  }
): CharacterFormValues {
  return {
    ...draft,
    maxHitPointsMode: draft.maxHitPointsMode ?? options?.defaultHitPointMode ?? "automatic",
    startingEquipmentChoiceIndex: options?.startingEquipmentChoiceIndex ?? "",
    starterPackSelectionValues: options?.starterPackSelectionValues ?? {}
  };
}

function getEffectiveHitPointMaximumForDraft(
  draft: Pick<CharacterDraft, "className" | "hitPoints"> &
    Partial<Pick<CharacterDraft, "level" | "subclassId" | "statusEntries">>
): number {
  return getEffectiveHitPointMaximumForCharacter({
    className: draft.className,
    subclassId: draft.subclassId,
    level: draft.level,
    hitPoints: draft.hitPoints,
    statusEntries: draft.statusEntries ?? []
  });
}

function createBasicProfileSnapshot(values: CharacterFormValues): CharacterFormValues {
  const defaults = createEmptyCharacter();
  const normalizedProgress = normalizeLevelAndXp(values.level, values.xp);

  return createFormValues(
    {
      ...defaults,
      name: values.name,
      species: values.species,
      className: values.className,
      subclassId: values.subclassId,
      background: values.background,
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
    abilities[targetAbility] = Math.min(99, abilities[targetAbility] + 1);
  }

  return normalizeCustomAbilities(abilities);
}

function createFallbackRecommendedSkills(
  species: string,
  className: string,
  background: string,
  buildPlan: ClassBuildPlan
): SkillName[] {
  const availableClassSkills = getSkillProficiencyOptionsForClass(className);
  const targetCount = getSkillSelectionLimitForClass(className);
  const grantedSkillSet = new Set(
    getGrantedSkillProficienciesForCharacter(className, species, background).map(
      (entry) => entry.skill
    )
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
  const starterPack = getResolvedStarterPack(profile.className);
  const configuredStarterPack = getClassStarterPack(profile.className);

  if (starterPack.hasConfiguredStarterPack && starterPack.recommendedAbilityScores) {
    const abilities = cloneAbilities(starterPack.recommendedAbilityScores);
    const grantedSkillSet = new Set(
      getGrantedSkillProficienciesForCharacter(
        profile.className,
        profile.species,
        profile.background
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
      classFeatureState: profile.classFeatureState ?? {}
    });

    return createFormValues(
      {
        ...createEmptyCharacter(),
        name: profile.name,
        species: profile.species,
        className: profile.className,
        subclassId: profile.subclassId,
        background: profile.background,
        level: normalizedProgress.level,
        xp: normalizedProgress.xp,
        hitPoints,
        currentHitPoints: hitPoints,
        maxHitPointsMode: "automatic",
        attributeMode: "pointBuy",
        abilities,
        alignment: "True Neutral",
        currencies: resolveStarterPackChoiceCurrencies(recommendedChoice),
        skills: recommendedSkills,
        toolProficiencies: recommendedTools,
        equipment: []
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

  const buildPlan = getBuildPlan(profile.className);
  const abilities = createFallbackRecommendedAbilities(
    profile.species,
    normalizedProgress.level,
    buildPlan
  );
  const hitPoints = getAutomaticMaxHitPointsForCharacter({
    className: profile.className,
    level: normalizedProgress.level,
    abilities,
    classFeatureState: profile.classFeatureState ?? {}
  });

  return createFormValues(
    {
      ...createEmptyCharacter(),
      name: profile.name,
      species: profile.species,
      className: profile.className,
      subclassId: profile.subclassId,
      background: profile.background,
      level: normalizedProgress.level,
      xp: normalizedProgress.xp,
      hitPoints,
      currentHitPoints: hitPoints,
      maxHitPointsMode: "automatic",
      attributeMode: "pointBuy",
      abilities,
      alignment: "True Neutral",
      currencies: createDefaultCurrencies(),
      skills: createFallbackRecommendedSkills(
        profile.species,
        profile.className,
        profile.background,
        buildPlan
      ),
      equipment: []
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
  const [wizardStep, setWizardStep] = useState<CreationStep>(1);
  const [stepOneSnapshot, setStepOneSnapshot] = useState<CharacterFormValues | null>(null);
  const [attemptedBuildAdvance, setAttemptedBuildAdvance] = useState(false);
  const [starterPackWarnings, setStarterPackWarnings] = useState<string[]>([]);
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
  const [
    selectedClassName,
    selectedSubclassId,
    selectedSpecies,
    selectedBackground,
    selectedLevel,
    attributeMode,
    abilities,
    selectedMaxHitPointsMode,
    alignment,
    selectedSkills,
    selectedToolProficiencies,
    selectedCurrencies,
    selectedStartingEquipmentChoiceIndex,
    selectedStarterPackSelectionValues
  ] = useWatch({
    control,
    name: [
      "className",
      "subclassId",
      "species",
      "background",
      "level",
      "attributeMode",
      "abilities",
      "maxHitPointsMode",
      "alignment",
      "skills",
      "toolProficiencies",
      "currencies",
      "startingEquipmentChoiceIndex",
      "starterPackSelectionValues"
    ]
  });
  const resolvedClassName = selectedClassName ?? initialFormValues.className;
  const resolvedSubclassId = selectedSubclassId ?? initialFormValues.subclassId ?? "";
  const resolvedSpecies = selectedSpecies ?? initialFormValues.species;
  const resolvedBackground = selectedBackground ?? initialFormValues.background;
  const resolvedLevel = selectedLevel ?? initialFormValues.level;
  const resolvedAttributeMode = attributeMode ?? initialFormValues.attributeMode;
  const resolvedAbilities = abilities ?? initialFormValues.abilities;
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
  const availableSubclassOptions = getSubclassOptionsForClassName(resolvedClassName);
  const starterPack = getResolvedStarterPack(resolvedClassName);
  const configuredStarterPack = getClassStarterPack(resolvedClassName);
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
  const requiredStarterPackSelections = (configuredStarterPack?.startingEquipmentSelections ?? []).filter(
    (selection) =>
      selectedStarterEquipmentChoice?.some(
        (reference) => reference.type === "selected-tool" && reference.selectionId === selection.id
      ) ?? false
  );
  const automaticHitPoints = getAutomaticMaxHitPointsForCharacter({
    className: resolvedClassName,
    level: resolvedLevel,
    abilities: resolvedAbilities,
    classFeatureState: getValues("classFeatureState") ?? {}
  });
  const lastCustomAbilitiesRef = useRef(cloneAbilities(initialFormValues.abilities));
  const lastPointBuyAbilitiesRef = useRef(
    initialFormValues.attributeMode === "pointBuy"
      ? normalizePointBuyAbilities(initialFormValues.abilities)
      : createDefaultAbilities()
  );
  const pointBuyRemaining = getPointBuyRemaining(resolvedAbilities);
  const resolvedSkillSelections = resolveSkillProficienciesForCharacter(
    resolvedClassName,
    resolvedSpecies,
    resolvedBackground,
    resolvedSkills
  );
  const grantedSkillSet = new Set(resolvedSkillSelections.granted.map((entry) => entry.skill));
  const availableManualSkillOptions = availableSkillOptions.filter(
    (skill) => !grantedSkillSet.has(skill)
  );
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
  const isPointBuyReady = resolvedAttributeMode !== "pointBuy" || pointBuyRemaining === 0;
  const isBuildSetupReady =
    isSkillSelectionReady &&
    isToolSelectionReady &&
    isEquipmentChoiceReady &&
    isStarterPackSelectionReady &&
    isPointBuyReady &&
    (resolvedMaxHitPointsMode !== "custom" || automaticHitPoints > 0);

  const creationTitleByStep: Record<CreationStep, string> = {
    1: "Create a new character",
    2: "Customize your build",
    3: "Finalize your notes"
  };
  const creationDescriptionByStep: Record<CreationStep, string> = {
    1: "Set the essentials first, then either create instantly with the recommended starter pack or continue customizing manually.",
    2: "Choose your starting HP approach, distribute ability scores, and lock in class starter choices before moving on.",
    3: "Finish with alignment and optional character notes."
  };

  useEffect(() => {
    const nextInitialValues = createFormValues(initialValues, {
      defaultHitPointMode: isEditing ? (initialValues.maxHitPointsMode ?? "custom") : "automatic",
      startingEquipmentChoiceIndex: "",
      starterPackSelectionValues: {}
    });

    reset(nextInitialValues);
    lastCustomAbilitiesRef.current =
      nextInitialValues.attributeMode === "custom"
        ? cloneAbilities(nextInitialValues.abilities)
        : cloneAbilities(createDefaultAbilities());
    lastPointBuyAbilitiesRef.current =
      nextInitialValues.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(nextInitialValues.abilities)
        : createDefaultAbilities();
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
    const normalizedSubclassId = normalizeSubclassId(resolvedSubclassId, resolvedClassName) ?? "";

    if (resolvedSubclassId !== normalizedSubclassId) {
      setValue("subclassId", normalizedSubclassId, {
        shouldDirty: resolvedSubclassId.length > 0,
        shouldValidate: true
      });
    }
  }, [resolvedClassName, resolvedSubclassId, setValue]);

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
    if (areStringMapsEqual(resolvedStarterPackSelectionValues, normalizedStarterPackSelectionValues)) {
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
    if (!selectedStarterEquipmentChoice) {
      if (!isEditing && !areCurrenciesEqual(resolvedCurrencies, createDefaultCurrencies())) {
        setValue("currencies", createDefaultCurrencies(), {
          shouldDirty: true
        });
      }

      return;
    }

    const nextCurrencies = resolveStarterPackChoiceCurrencies(selectedStarterEquipmentChoice);

    if (!areCurrenciesEqual(resolvedCurrencies, nextCurrencies)) {
      setValue("currencies", nextCurrencies, {
        shouldDirty: true
      });
    }
  }, [isEditing, resolvedCurrencies, selectedStarterEquipmentChoice, setValue]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedStarterEquipmentChoice) {
      setStarterPackWarnings([]);
      return undefined;
    }

    void previewStarterPackChoiceWarnings(selectedStarterEquipmentChoice, {
      selectedToolProficiencies: resolvedToolSelections,
      selectionValues: normalizedStarterPackSelectionValues
    })
      .then((warnings) => {
        if (!cancelled) {
          setStarterPackWarnings(warnings);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStarterPackWarnings([
            "Couldn't preview starter equipment from the backend. Character creation will still continue without unresolved items."
          ]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    normalizedStarterPackSelectionValues,
    resolvedToolSelections,
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

  function commitAbilities(nextAbilities: AbilityScores, mode: AttributeMode) {
    setValue("abilities", nextAbilities, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (mode === "custom") {
      lastCustomAbilitiesRef.current = cloneAbilities(nextAbilities);
      return;
    }

    lastPointBuyAbilitiesRef.current = cloneAbilities(nextAbilities);
  }

  function handleAttributeModeChange(nextMode: AttributeMode) {
    if (nextMode === resolvedAttributeMode) {
      return;
    }

    const currentAbilities = getValues("abilities");

    if (resolvedAttributeMode === "custom") {
      lastCustomAbilitiesRef.current = cloneAbilities(currentAbilities);
    } else {
      lastPointBuyAbilitiesRef.current = normalizePointBuyAbilities(currentAbilities);
    }

    setValue("attributeMode", nextMode, { shouldDirty: true });
    commitAbilities(
      cloneAbilities(
        nextMode === "custom" ? lastCustomAbilitiesRef.current : lastPointBuyAbilitiesRef.current
      ),
      nextMode
    );
  }

  function handleCustomAbilityChange(ability: AbilityKey, rawValue: string) {
    const nextScore = clampNumber(rawValue, 1, 99, getValues(`abilities.${ability}`));
    commitAbilities(
      {
        ...getValues("abilities"),
        [ability]: nextScore
      },
      "custom"
    );
  }

  function handlePointBuyAbilityChange(ability: AbilityKey, rawValue: string) {
    const currentAbilities = getValues("abilities");
    const maxScore = getAffordablePointBuyMax(ability, currentAbilities);
    const nextScore = clampNumber(rawValue, 8, Math.min(15, maxScore), currentAbilities[ability]);

    commitAbilities(
      {
        ...currentAbilities,
        [ability]: nextScore
      },
      "pointBuy"
    );
  }

  function normalizeDraft(values: CharacterFormValues): CharacterDraft {
    const {
      startingEquipmentChoiceIndex: _unusedStartingEquipmentChoiceIndex,
      starterPackSelectionValues: _unusedStarterPackSelectionValues,
      ...draftValues
    } = values;
    const normalizedProgress = normalizeLevelAndXp(draftValues.level, draftValues.xp);
    const normalizedClassName = draftValues.className.trim();
    const normalizedBackground = draftValues.background.trim();
    const resolvedNormalizedBackground = backgroundOptions.includes(normalizedBackground)
      ? normalizedBackground
      : "";
    const normalizedAbilities =
      draftValues.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(draftValues.abilities)
        : normalizeCustomAbilities(draftValues.abilities);
    const normalizedHitPoints =
      draftValues.maxHitPointsMode === "automatic"
        ? getAutomaticMaxHitPointsForCharacter({
            className: normalizedClassName,
            level: normalizedProgress.level,
            abilities: normalizedAbilities,
            classFeatureState: draftValues.classFeatureState ?? {}
          })
        : clampNumber(String(draftValues.hitPoints), 1, 999, automaticHitPoints);
    const normalizedSkills = normalizeSkillSelectionsForClass(
      normalizedClassName,
      draftValues.skills ?? [],
      draftValues.species,
      resolvedNormalizedBackground
    );
    const normalizedTools = normalizeToolSelectionsForClass(
      normalizedClassName,
      draftValues.toolProficiencies ?? []
    );
    const normalizedSubclassId =
      normalizeSubclassId(draftValues.subclassId, normalizedClassName) ?? "";
    const normalizedCurrentHitPointMaximum = getEffectiveHitPointMaximumForDraft({
      className: normalizedClassName,
      subclassId: normalizedSubclassId,
      level: normalizedProgress.level,
      hitPoints: normalizedHitPoints,
      statusEntries: draftValues.statusEntries ?? []
    });

    return {
      ...draftValues,
      name: draftValues.name.trim(),
      species: draftValues.species.trim(),
      className: normalizedClassName,
      subclassId: normalizedSubclassId,
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
      backgroundNotes: draftValues.backgroundNotes.trim(),
      alignment: alignmentOptions.includes(draftValues.alignment)
        ? draftValues.alignment
        : "True Neutral",
      skills: normalizedSkills,
      toolProficiencies: normalizedTools,
      equipment: [...new Set((draftValues.equipment ?? []).map((item) => item.trim()).filter(Boolean))],
      abilities: normalizedAbilities
    };
  }

  async function submitResolvedDraft(values: CharacterFormValues) {
    const normalizedDraft = normalizeDraft(values);
    const configuredStarterPack = getClassStarterPack(normalizedDraft.className);
    const selectedChoice =
      !isEditing && configuredStarterPack && values.startingEquipmentChoiceIndex.length > 0
        ? (configuredStarterPack.startingEquipment[Number(values.startingEquipmentChoiceIndex)] ?? null)
        : null;

    if (!selectedChoice) {
      await onSubmit(normalizedDraft);
      return;
    }

    const normalizedSelectionValues = normalizeStarterPackSelectionValues(
      configuredStarterPack,
      normalizedDraft.toolProficiencies ?? [],
      values.starterPackSelectionValues
    );
    const materializedStarterPack = await materializeStarterPackChoiceToInventory(
      normalizedDraft.inventoryItems,
      selectedChoice,
      {
        selectedToolProficiencies: normalizedDraft.toolProficiencies ?? [],
        selectionValues: normalizedSelectionValues
      }
    );

    setStarterPackWarnings(materializedStarterPack.warnings);
    await onSubmit({
      ...normalizedDraft,
      inventoryItems: materializedStarterPack.inventoryItems
    });
  }

  async function submitForm(values: CharacterFormValues) {
    await submitResolvedDraft(values);
  }

  async function validateWizardStepOne(): Promise<boolean> {
    const fields: Array<"name" | "species" | "className" | "subclassId" | "background" | "level"> =
      ["name", "species", "className", "background", "level"];

    if (availableSubclassOptions.length > 0) {
      fields.splice(3, 0, "subclassId");
    }

    return trigger(fields);
  }

  async function handleRecommendedCreate() {
    const isValid = await validateWizardStepOne();

    if (!isValid) {
      return;
    }

    const snapshot = createBasicProfileSnapshot(getValues());
    const recommendedDraft = createRecommendedCharacterDraft(snapshot);

    reset(recommendedDraft);
    await submitResolvedDraft(recommendedDraft);
  }

  async function handleStartCustomization() {
    const isValid = await validateWizardStepOne();

    if (!isValid) {
      return;
    }

    const snapshot = createBasicProfileSnapshot(getValues());
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

  function handleRandomize() {
    const randomClassName = getRandomItem(classOptions);

    if (!isEditing && wizardStep === 1) {
      reset(
        createFormValues({
          ...createEmptyCharacter(),
          name: createRandomName(),
          species: getRandomItem(speciesOptions),
          className: randomClassName,
          subclassId: getRandomSubclassIdForClass(randomClassName),
          background: createRandomBackground(),
          backgroundNotes: "",
          level: 1,
          maxHitPointsMode: "automatic",
          attributeMode: "pointBuy"
        })
      );
      return;
    }

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
    const randomStartingEquipmentChoiceIndex =
      randomStarterPack?.startingEquipment.length ? "0" : "";
    const randomStarterPackSelectionValues = normalizeStarterPackSelectionValues(
      randomStarterPack,
      randomToolSelections,
      {}
    );
    const randomMode: AttributeMode = Math.random() < 0.5 ? "custom" : "pointBuy";
    const randomizedAbilities =
      randomMode === "custom" ? createRandomCustomAbilities() : createRandomPointBuyAbilities();
    const randomizedPointBuyAbilities =
      randomMode === "pointBuy" ? randomizedAbilities : createRandomPointBuyAbilities();
    const randomizedCustomAbilities =
      randomMode === "custom" ? randomizedAbilities : createRandomCustomAbilities();
    const randomizedDraft = createFormValues({
      ...createEmptyCharacter(),
      name: createRandomName(),
      species: getRandomItem(speciesOptions),
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
      background: createRandomBackground(),
      backgroundNotes: "",
      currencies: createDefaultCurrencies(),
      skills: pickRandomSubset(
        randomClassSkillOptions,
        randomClassSkillLimit,
        randomClassSkillLimit
      ),
      toolProficiencies: randomToolSelections,
      equipment: []
    }, {
      startingEquipmentChoiceIndex: randomStartingEquipmentChoiceIndex,
      starterPackSelectionValues: randomStarterPackSelectionValues
    });
    randomizedDraft.currentHitPoints = randomizedDraft.hitPoints;

    reset(randomizedDraft);
    lastPointBuyAbilitiesRef.current = cloneAbilities(randomizedPointBuyAbilities);
    lastCustomAbilitiesRef.current = cloneAbilities(randomizedCustomAbilities);
  }

  function renderBasicProfileSection() {
    const showRandomize = !isEditing && wizardStep === 1;

    return (
      <section className={clsx(styles.sectionCard, styles.primarySection)}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Core profile</p>
            <h3>Character identity</h3>
          </div>
          {showRandomize ? (
            <button
              type="button"
              className={styles.randomizeButton}
              onClick={handleRandomize}
              aria-label="Randomize character"
              title="Randomize character"
            >
              <Dice6 size={20} />
            </button>
          ) : null}
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
                {...register("className", { required: "Choose a class" })}
              >
                <option value="">Select a class</option>
                {classOptions.map((characterClass) => (
                  <option key={characterClass} value={characterClass}>
                    {characterClass}
                  </option>
                ))}
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
                disabled={availableSubclassOptions.length === 0}
                {...register("subclassId", {
                  validate: (value) =>
                    availableSubclassOptions.length === 0 ||
                    normalizeSubclassId(value, resolvedClassName)
                      ? true
                      : "Choose a subclass"
                })}
              >
                <option value="">
                  {availableSubclassOptions.length > 0
                    ? "Select a subclass"
                    : "No subclass options"}
                </option>
                {availableSubclassOptions.map((subclass) => (
                  <option key={subclass.id} value={subclass.id}>
                    {subclass.name}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>

          <div className={styles.profileRow}>
            <label className={styles.field}>
              <span>Species</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={Boolean(errors.species)}
                {...register("species", { required: "Choose a species" })}
              >
                <option value="">Select a species</option>
                {speciesOptions.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
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
                {...register("background", {
                  required: "Choose a background"
                })}
              >
                <option value="">Select a background</option>
                {backgroundOptions.map((background) => (
                  <option key={background} value={background}>
                    {background}
                  </option>
                ))}
              </SelectInput>
              {errors.background ? (
                <small className={styles.errorText}>{errors.background.message}</small>
              ) : null}
            </label>
          </div>
        </div>
      </section>
    );
  }

  function renderStartingHitPointsSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Starting HP</p>
            <h3>Choose how to set max hit points</h3>
          </div>
          <span>{resolvedMaxHitPointsMode === "automatic" ? "Average" : "Custom"}</span>
        </div>

        <div
          className={styles.segmentedControl}
          role="tablist"
          aria-label="Starting hit points mode"
        >
          <button
            type="button"
            className={clsx(
              styles.segmentButton,
              resolvedMaxHitPointsMode === "automatic" && styles.segmentButtonActive
            )}
            onClick={() =>
              setValue("maxHitPointsMode", "automatic", {
                shouldDirty: true,
                shouldValidate: true
              })
            }
          >
            Average
          </button>
          <button
            type="button"
            className={clsx(
              styles.segmentButton,
              resolvedMaxHitPointsMode === "custom" && styles.segmentButtonActive
            )}
            onClick={() =>
              setValue("maxHitPointsMode", "custom", {
                shouldDirty: true,
                shouldValidate: true
              })
            }
          >
            Custom
          </button>
        </div>

        {resolvedMaxHitPointsMode === "automatic" ? (
          <div className={styles.infoCard}>
            <strong>{automaticHitPoints} HP</strong>
            <small>Average class hit points using your current Constitution score.</small>
          </div>
        ) : (
          <label className={styles.field}>
            <span>Custom starting HP</span>
            <NumberInput
              className={styles.fieldInput}
              invalid={Boolean(errors.hitPoints)}
              min={1}
              {...register("hitPoints", {
                valueAsNumber: true,
                min: { value: 1, message: "Hit points must be at least 1" },
                onChange: (event) => {
                  const nextHitPoints = clampNumber(event.target.value, 1, 999, 1);

                  if (!isEditing) {
                    setValue("currentHitPoints", nextHitPoints, { shouldDirty: true });
                  }
                }
              })}
            />
            {errors.hitPoints ? (
              <small className={styles.errorText}>{errors.hitPoints.message}</small>
            ) : (
              <small className={styles.helperText}>
                Manual HP stays independent from the automatic class average.
              </small>
            )}
          </label>
        )}
      </section>
    );
  }

  function renderAbilityDistributionSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Ability scores</p>
          </div>
          <span>
            {resolvedAttributeMode === "pointBuy"
              ? `${pointBuyRemaining} points left`
              : "Custom values"}
          </span>
        </div>

        <div className={abilityEditorStyles.modeControl}>
          <button
            type="button"
            className={clsx(
              abilityEditorStyles.modeButton,
              resolvedAttributeMode === "pointBuy" && abilityEditorStyles.modeButtonActive
            )}
            onClick={() => handleAttributeModeChange("pointBuy")}
          >
            Point Buy
          </button>
          <button
            type="button"
            className={clsx(
              abilityEditorStyles.modeButton,
              resolvedAttributeMode === "custom" && abilityEditorStyles.modeButtonActive
            )}
            onClick={() => handleAttributeModeChange("custom")}
          >
            Custom
          </button>
        </div>

        {resolvedAttributeMode === "pointBuy" ? (
          <div className={abilityEditorStyles.pointBuyInfo}>
            <div
              className={clsx(
                abilityEditorStyles.pointBuySummary,
                pointBuyRemaining < 0 && abilityEditorStyles.pointBuySummaryOverdraft
              )}
            >
              <span className={abilityEditorStyles.pointBuyLabel}>POINTS REMAINING</span>
              <strong className={abilityEditorStyles.pointBuyValue}>{pointBuyRemaining}</strong>
            </div>
            <p className={abilityEditorStyles.pointBuyHint}>
              Scores start at 8 and you must spend the full 27-point budget before proceeding.
            </p>
          </div>
        ) : (
          <p className={styles.helperText}>
            Custom mode lets you enter any scores you want. Point Buy is the default guided path.
          </p>
        )}

        <div className={abilityEditorStyles.abilityInputGrid}>
          {abilityKeys.map((ability) => (
            <Controller
              key={ability}
              control={control}
              name={`abilities.${ability}` as const}
              render={({ field }) => {
                const currentValue = field.value ?? 8;
                const maxPointBuyScore =
                  resolvedAttributeMode === "pointBuy"
                    ? getAffordablePointBuyMax(ability, resolvedAbilities)
                    : 99;

                return (
                  <label className={abilityEditorStyles.abilityInputCard}>
                    <span>{ability}</span>
                    {resolvedAttributeMode === "pointBuy" ? (
                      <div className={abilityEditorStyles.pointBuyInputShell}>
                        <NumberInput
                          className={abilityEditorStyles.pointBuyInput}
                          min={8}
                          max={15}
                          readOnly
                          value={currentValue}
                          onBeforeInput={(event) => {
                            event.preventDefault();
                          }}
                          onChange={(event) =>
                            handlePointBuyAbilityChange(ability, event.target.value)
                          }
                        />
                        <div className={abilityEditorStyles.pointBuyStepper}>
                          <button
                            type="button"
                            className={abilityEditorStyles.pointBuyStepperButton}
                            onClick={() =>
                              handlePointBuyAbilityChange(ability, String(currentValue + 1))
                            }
                            disabled={currentValue >= maxPointBuyScore}
                            aria-label={`Increase ${ability}`}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className={abilityEditorStyles.pointBuyStepperButton}
                            onClick={() =>
                              handlePointBuyAbilityChange(ability, String(currentValue - 1))
                            }
                            disabled={currentValue <= 8}
                            aria-label={`Decrease ${ability}`}
                          >
                            -
                          </button>
                        </div>
                      </div>
                    ) : (
                      <NumberInput
                        className={styles.abilityInput}
                        min={1}
                        max={99}
                        value={currentValue}
                        onBlur={field.onBlur}
                        onChange={(event) => handleCustomAbilityChange(ability, event.target.value)}
                      />
                    )}
                  </label>
                );
              }}
            />
          ))}
        </div>

        {attemptedBuildAdvance && !isPointBuyReady ? (
          <p className={styles.errorText}>Spend all 27 point-buy points before continuing.</p>
        ) : null}
      </section>
    );
  }

  function renderClassSetupSection(options?: { showStartingEquipmentChoice?: boolean }) {
    const showStartingEquipmentChoice = options?.showStartingEquipmentChoice ?? true;

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Class setup</p>
          </div>
          <span>{resolvedClassName || "Choose a class first"}</span>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <strong>Primary Ability</strong>
            <span>{starterPack.primaryAbility ?? "Not configured yet"}</span>
          </div>
          <div className={styles.summaryCard}>
            <strong>Hit Point Die</strong>
            <span>{starterPack.hitPointDieLabel ?? "Not configured yet"}</span>
          </div>
          <div className={styles.summaryCard}>
            <strong>Saving Throws</strong>
            <span>
              {starterPack.savingThrowProficiencies.length > 0
                ? starterPack.savingThrowProficiencies.join(", ")
                : "Not configured yet"}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <strong>Weapons</strong>
            <span>
              {starterPack.weaponProficiencies.length > 0
                ? starterPack.weaponProficiencies.join(", ")
                : "Not configured yet"}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <strong>Armor</strong>
            <span>
              {starterPack.armorTrainingProficiencies.length > 0
                ? starterPack.armorTrainingProficiencies.join(", ")
                : "Not configured yet"}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <strong>Weapon Masteries</strong>
            <span>{starterPack.weaponMasteryCount > 0 ? starterPack.weaponMasteryCount : "None"}</span>
          </div>
        </div>

        <div className={styles.classSetupGrid}>
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

            {resolvedSkillSelections.granted.length > 0 ? (
              <ul className={styles.grantedSkillList}>
                {resolvedSkillSelections.granted.map((entry) => (
                  <li key={entry.skill}>
                    <span>{entry.skill}</span>
                    <small>{entry.sources.join(", ")}</small>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className={styles.choiceGrid}>
              {availableManualSkillOptions.map((skill) => (
                <label
                  key={skill}
                  className={clsx(
                    styles.choiceOption,
                    resolvedSkillSelections.manual.includes(skill) && styles.choiceOptionActive
                  )}
                >
                  <input
                    type="checkbox"
                    value={skill}
                    className={styles.choiceCheckbox}
                    disabled={
                      !resolvedSkillSelections.manual.includes(skill) &&
                      buildRequiresSkillSelection &&
                      selectedSkillCount >= skillSelectionLimit
                    }
                    {...register("skills")}
                  />
                  <span>{skill}</span>
                </label>
              ))}
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

                    return (
                      <label
                        key={tool}
                        className={clsx(styles.choiceOption, isActive && styles.choiceOptionActive)}
                      >
                        <input
                          type="checkbox"
                          value={tool}
                          className={styles.choiceCheckbox}
                          disabled={!isActive && selectedToolCount >= toolSelectionLimit}
                          {...register("toolProficiencies")}
                        />
                        <span>{getToolProficiencyLabel(tool)}</span>
                      </label>
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
                      <button
                        key={choiceIndex}
                        type="button"
                        className={clsx(
                          styles.radioChoiceCard,
                          isActive && styles.radioChoiceCardActive
                        )}
                        onClick={() =>
                          setValue("startingEquipmentChoiceIndex", String(choiceIndex), {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                      >
                        <strong>Option {String.fromCharCode(65 + choiceIndex)}</strong>
                        <span>
                          {formatStarterPackEquipmentChoice(choice, choiceIndex, {
                            includeOptionLabel: false,
                            selectionLabels: starterPackSelectionLabels
                          })}
                        </span>
                      </button>
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
                        <button
                          key={option.value}
                          type="button"
                          className={clsx(
                            styles.choiceOption,
                            selectedValue === option.value && styles.choiceOptionActive
                          )}
                          onClick={() =>
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
                        >
                          <span>{option.label}</span>
                        </button>
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

  function renderFutureSection(title: string, eyebrow: string, description: string) {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>{eyebrow}</p>
            <h3>{title}</h3>
          </div>
        </div>
        <div className={styles.placeholderCard}>
          <p>{description}</p>
        </div>
      </section>
    );
  }

  function renderNotesSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Notes</p>
            <h3>Choose alignment and add notes</h3>
          </div>
          <span>Everything here is optional except alignment, which defaults to True Neutral.</span>
        </div>

        <div className={styles.alignmentGrid} role="radiogroup" aria-label="Character alignment">
          {alignmentOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={resolvedAlignment === option}
              className={clsx(
                styles.alignmentOption,
                resolvedAlignment === option && styles.alignmentOptionActive
              )}
              onClick={() =>
                setValue("alignment", option, {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            >
              {option}
            </button>
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
      <button type="button" className={styles.backButton} onClick={onBack}>
        Go back
      </button>

      <div className={styles.header}>
        <p className={styles.eyebrow}>Character forge</p>
        <h2 className={styles.title}>
          {isEditing ? "Refine your character" : creationTitleByStep[wizardStep]}
        </h2>
        <p className={styles.description}>
          {isEditing
            ? "Update the essentials, starting stats, proficiencies, and notes in one place."
            : creationDescriptionByStep[wizardStep]}
        </p>

        {!isEditing ? (
          <div className={styles.wizardProgress} aria-label="Character creation steps">
            <span
              className={clsx(
                styles.stepBadge,
                wizardStep === 1 && styles.stepBadgeActive,
                wizardStep > 1 && styles.stepBadgeDone
              )}
            >
              1. Core profile
            </span>
            <span
              className={clsx(
                styles.stepBadge,
                wizardStep === 2 && styles.stepBadgeActive,
                wizardStep > 2 && styles.stepBadgeDone
              )}
            >
              2. Build setup
            </span>
            <span className={clsx(styles.stepBadge, wizardStep === 3 && styles.stepBadgeActive)}>
              3. Notes
            </span>
          </div>
        ) : null}
      </div>

      <form
        className={styles.form}
        onSubmit={
          isEditing || wizardStep === 3
            ? handleSubmit(submitForm)
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
            {renderClassSetupSection({ showStartingEquipmentChoice: false })}
            {renderNotesSection()}
          </>
        ) : null}

        {!isEditing && wizardStep === 1 ? renderBasicProfileSection() : null}

        {!isEditing && wizardStep === 2 ? (
          <>
            {renderStartingHitPointsSection()}
            {renderAbilityDistributionSection()}
            {renderClassSetupSection()}
            {renderFutureSection(
              "",
              "Species",
              "Species-specific builder choices will appear here in a future pass."
            )}
            {renderFutureSection(
              "",
              "Background",
              "Background-specific builder choices will appear here in a future pass."
            )}
          </>
        ) : null}

        {!isEditing && wizardStep === 3 ? renderNotesSection() : null}

        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button type="submit" className={styles.primaryButton}>
                Update character
              </button>
              <button type="button" className={styles.secondaryButton} onClick={onBack}>
                Cancel
              </button>
            </>
          ) : null}

          {!isEditing && wizardStep === 1 ? (
            <>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  void handleRecommendedCreate();
                }}
              >
                Create with recommended build
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  void handleStartCustomization();
                }}
              >
                Customize based on your needs
              </button>
            </>
          ) : null}

          {!isEditing && wizardStep === 2 ? (
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleBackToStepOne}
              >
                Back (reset changes)
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  void handleProceedToNotes();
                }}
              >
                Proceed
              </button>
            </>
          ) : null}

          {!isEditing && wizardStep === 3 ? (
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setWizardStep(2)}
              >
                Back
              </button>
              <button type="submit" className={styles.primaryButton}>
                Create Character
              </button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default CharacterForm;
