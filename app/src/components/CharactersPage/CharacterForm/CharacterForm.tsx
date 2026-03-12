import clsx from "clsx";
import { Dice6 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { AbilityKey, AbilityScores, AttributeMode, CharacterDraft, SkillName } from "../../../types";
import {
  POINT_BUY_BUDGET,
  abilityKeys,
  alignmentGrid,
  backgroundOptions,
  cloneAbilities,
  createDefaultAbilities,
  createDefaultCurrencies,
  createEmptyCharacter,
  getAffordablePointBuyMax,
  getPointBuyCost,
  getPointBuyRemaining,
  normalizePointBuyAbilities,
  classOptions,
  speciesOptions
} from "../../../pages/CharactersPage/constants";
import {
  getAvailableEquipmentNamesForClass,
  getGrantedSkillProficienciesForCharacter,
  getSkillProficiencyOptionsForClass,
  getSkillSelectionLimitForClass,
  normalizeSelectionsForClass,
  resolveSkillProficienciesForCharacter
} from "../../../pages/CharactersPage/proficiency";
import { normalizeLevelAndXp } from "../../../pages/CharactersPage/experience";
import NumberInput from "../FormInputs/NumberInput";
import SelectInput from "../FormInputs/SelectInput";
import TextAreaInput from "../FormInputs/TextAreaInput";
import TextInput from "../FormInputs/TextInput";
import styles from "./CharacterForm.module.css";

type CharacterFormProps = {
  isEditing: boolean;
  initialValues: CharacterDraft;
  onSubmit: (draft: CharacterDraft) => void;
  onBack: () => void;
};

type CreationStep = 1 | 2 | 3;

type ClassBuildPlan = {
  primary: AbilityKey;
  secondary: AbilityKey;
  tertiary: AbilityKey;
  hitDie: number;
  preferredSkills: string[];
  preferredEquipment: string[];
  background: string;
  alignment: CharacterDraft["alignment"];
};

const alignmentOptions = alignmentGrid.flat();

const fallbackBuildPlan: ClassBuildPlan = {
  primary: "STR",
  secondary: "CON",
  tertiary: "DEX",
  hitDie: 10,
  preferredSkills: ["Athletics", "Perception", "Survival", "Intimidation"],
  preferredEquipment: [
    "Longsword",
    "Shield",
    "Chain Mail",
    "Backpack",
    "Rations (1 day)",
    "Torch"
  ],
  background: "Soldier",
  alignment: "True Neutral"
};

const classBuildPlans: Record<string, ClassBuildPlan> = {
  Artificer: {
    primary: "INT",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 8,
    preferredSkills: ["Arcana", "Investigation", "History", "Perception", "Insight"],
    preferredEquipment: [
      "Spellbook",
      "Healer's Kit",
      "Leather Armor",
      "Dagger",
      "Backpack",
      "Explorer's Pack"
    ],
    background: "Guild Artisan / Merchant",
    alignment: "Lawful Neutral"
  },
  Barbarian: {
    primary: "STR",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 12,
    preferredSkills: ["Athletics", "Survival", "Intimidation", "Perception", "Animal Handling"],
    preferredEquipment: [
      "Longsword",
      "Shield",
      "Backpack",
      "Rations (1 day)",
      "Torch",
      "Rope (50 ft.)"
    ],
    background: "Outlander",
    alignment: "Chaotic Neutral"
  },
  Bard: {
    primary: "CHA",
    secondary: "DEX",
    tertiary: "CON",
    hitDie: 8,
    preferredSkills: ["Performance", "Persuasion", "Deception", "Insight", "History"],
    preferredEquipment: [
      "Shortsword",
      "Leather Armor",
      "Backpack",
      "Waterskin",
      "Torch",
      "Spellbook"
    ],
    background: "Entertainer",
    alignment: "Neutral Good"
  },
  Cleric: {
    primary: "WIS",
    secondary: "CON",
    tertiary: "STR",
    hitDie: 8,
    preferredSkills: ["Religion", "Insight", "Medicine", "Persuasion", "History"],
    preferredEquipment: [
      "Chain Mail",
      "Shield",
      "Longsword",
      "Healer's Kit",
      "Backpack",
      "Torch"
    ],
    background: "Acolyte",
    alignment: "Lawful Good"
  },
  Druid: {
    primary: "WIS",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 8,
    preferredSkills: ["Nature", "Animal Handling", "Medicine", "Survival", "Perception"],
    preferredEquipment: [
      "Leather Armor",
      "Shield",
      "Dagger",
      "Healer's Kit",
      "Waterskin",
      "Rations (1 day)"
    ],
    background: "Hermit",
    alignment: "True Neutral"
  },
  Fighter: {
    primary: "STR",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 10,
    preferredSkills: ["Athletics", "Perception", "Survival", "Intimidation", "History"],
    preferredEquipment: [
      "Chain Mail",
      "Shield",
      "Longsword",
      "Shortsword",
      "Backpack",
      "Rope (50 ft.)"
    ],
    background: "Soldier",
    alignment: "Lawful Neutral"
  },
  Monk: {
    primary: "DEX",
    secondary: "WIS",
    tertiary: "CON",
    hitDie: 8,
    preferredSkills: ["Acrobatics", "Stealth", "Insight", "Athletics", "Perception"],
    preferredEquipment: [
      "Shortsword",
      "Dagger",
      "Backpack",
      "Rations (1 day)",
      "Waterskin",
      "Torch"
    ],
    background: "Hermit",
    alignment: "Lawful Good"
  },
  Paladin: {
    primary: "STR",
    secondary: "CHA",
    tertiary: "CON",
    hitDie: 10,
    preferredSkills: ["Persuasion", "Athletics", "Insight", "Intimidation", "Religion"],
    preferredEquipment: [
      "Chain Mail",
      "Shield",
      "Longsword",
      "Backpack",
      "Torch",
      "Rations (1 day)"
    ],
    background: "Noble",
    alignment: "Lawful Good"
  },
  Ranger: {
    primary: "DEX",
    secondary: "WIS",
    tertiary: "CON",
    hitDie: 10,
    preferredSkills: ["Survival", "Perception", "Stealth", "Nature", "Athletics"],
    preferredEquipment: [
      "Leather Armor",
      "Longsword",
      "Shortsword",
      "Backpack",
      "Rope (50 ft.)",
      "Rations (1 day)"
    ],
    background: "Outlander",
    alignment: "Neutral Good"
  },
  Rogue: {
    primary: "DEX",
    secondary: "INT",
    tertiary: "CHA",
    hitDie: 8,
    preferredSkills: ["Stealth", "Sleight of Hand", "Deception", "Acrobatics", "Investigation"],
    preferredEquipment: [
      "Leather Armor",
      "Dagger",
      "Shortsword",
      "Thieves' Tools",
      "Backpack",
      "Torch"
    ],
    background: "Criminal / Spy",
    alignment: "Chaotic Neutral"
  },
  Sorcerer: {
    primary: "CHA",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 6,
    preferredSkills: ["Arcana", "Deception", "Persuasion", "Insight", "Intimidation"],
    preferredEquipment: ["Spellbook", "Dagger", "Backpack", "Waterskin", "Torch", "Rations (1 day)"],
    background: "Charlatan",
    alignment: "Chaotic Good"
  },
  Warlock: {
    primary: "CHA",
    secondary: "CON",
    tertiary: "INT",
    hitDie: 8,
    preferredSkills: ["Arcana", "Deception", "Intimidation", "Investigation", "Religion"],
    preferredEquipment: [
      "Spellbook",
      "Dagger",
      "Leather Armor",
      "Backpack",
      "Torch",
      "Rations (1 day)"
    ],
    background: "Charlatan",
    alignment: "Neutral Evil"
  },
  Wizard: {
    primary: "INT",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 6,
    preferredSkills: ["Arcana", "History", "Investigation", "Insight", "Religion"],
    preferredEquipment: ["Spellbook", "Dagger", "Backpack", "Waterskin", "Torch", "Rations (1 day)"],
    background: "Sage",
    alignment: "Lawful Neutral"
  }
};

const speciesAbilityBonuses: Partial<Record<string, Partial<Record<AbilityKey, number>>>> = {
  Dragonborn: { STR: 2, CHA: 1 },
  Dwarf: { CON: 2, WIS: 1 },
  Elf: { DEX: 2, INT: 1 },
  Gnome: { INT: 2, DEX: 1 },
  "Half-Elf": { CHA: 2, DEX: 1, CON: 1 },
  "Half-Orc": { STR: 2, CON: 1 },
  Halfling: { DEX: 2, CHA: 1 },
  Human: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
  Tiefling: { CHA: 2, INT: 1 }
};

const speciesSkillAffinity: Partial<Record<string, string[]>> = {
  Dragonborn: ["Intimidation", "Persuasion", "Athletics"],
  Dwarf: ["History", "Insight", "Survival"],
  Elf: ["Perception", "Stealth", "Arcana"],
  Gnome: ["Arcana", "Investigation", "History"],
  "Half-Elf": ["Persuasion", "Insight", "Deception"],
  "Half-Orc": ["Athletics", "Intimidation", "Survival"],
  Halfling: ["Stealth", "Perception", "Persuasion"],
  Human: ["Insight", "Perception", "Persuasion"],
  Tiefling: ["Deception", "Arcana", "Intimidation"]
};

const speciesEquipmentAffinity: Partial<Record<string, string[]>> = {
  Dragonborn: ["Shield", "Longsword"],
  Dwarf: ["Chain Mail", "Shield"],
  Elf: ["Leather Armor", "Longsword"],
  Gnome: ["Healer's Kit", "Backpack"],
  "Half-Elf": ["Leather Armor", "Shortsword"],
  "Half-Orc": ["Shield", "Longsword"],
  Halfling: ["Dagger", "Backpack"],
  Human: ["Backpack", "Rope (50 ft.)"],
  Tiefling: ["Spellbook", "Dagger"]
};

function clampNumber(rawValue: string, min: number, max: number, fallback: number): number {
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsedValue));
}

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

function createBasicProfileSnapshot(values: CharacterDraft): CharacterDraft {
  const defaults = createEmptyCharacter();
  const normalizedProgress = normalizeLevelAndXp(values.level, values.xp);

  return {
    ...defaults,
    name: values.name,
    species: values.species,
    className: values.className,
    level: normalizedProgress.level,
    xp: normalizedProgress.xp
  };
}

function getBuildPlan(className: string): ClassBuildPlan {
  return classBuildPlans[className] ?? fallbackBuildPlan;
}

function getAbilityPriorityOrder(plan: ClassBuildPlan): AbilityKey[] {
  const preferredAbilities = [plan.primary, plan.secondary, plan.tertiary];

  return [
    ...preferredAbilities,
    ...abilityKeys.filter((ability) => !preferredAbilities.includes(ability))
  ];
}

function createRecommendedAbilities(
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

function calculateRecommendedHitPoints(hitDie: number, level: number, constitutionScore: number): number {
  const normalizedLevel = clampNumber(String(level), 1, 20, 1);
  const constitutionModifier = Math.floor((constitutionScore - 10) / 2);
  const firstLevelHitPoints = Math.max(1, hitDie + constitutionModifier);
  const averagePerLevel = Math.max(1, Math.floor(hitDie / 2) + 1 + constitutionModifier);

  return Math.max(1, firstLevelHitPoints + (normalizedLevel - 1) * averagePerLevel);
}

function createRecommendedSkills(
  species: string,
  className: string,
  buildPlan: ClassBuildPlan
): SkillName[] {
  const availableClassSkills = getSkillProficiencyOptionsForClass(className);
  const targetCount = getSkillSelectionLimitForClass(className);
  const grantedSkillSet = new Set(
    getGrantedSkillProficienciesForCharacter(className, species, buildPlan.background).map(
      (entry) => entry.skill
    )
  );

  return normalizeSelection(
    [...buildPlan.preferredSkills, ...(speciesSkillAffinity[species] ?? []), ...availableClassSkills],
    availableClassSkills
  )
    .filter((skill) => !grantedSkillSet.has(skill))
    .slice(0, targetCount);
}

function createRecommendedEquipment(
  species: string,
  level: number,
  className: string,
  buildPlan: ClassBuildPlan
): string[] {
  const availableClassEquipment = getAvailableEquipmentNamesForClass(className);
  const targetCount = Math.max(4, Math.min(8, 5 + Math.floor((level - 1) / 4)));

  return normalizeSelection(
    [
      ...buildPlan.preferredEquipment,
      ...(speciesEquipmentAffinity[species] ?? []),
      ...availableClassEquipment
    ],
    availableClassEquipment
  ).slice(0, targetCount);
}

function createRecommendedBackgroundChoice(buildPlan: ClassBuildPlan): string {
  return backgroundOptions.includes(buildPlan.background)
    ? buildPlan.background
    : (backgroundOptions[0] ?? "");
}

function createRecommendedCharacterDraft(profile: CharacterDraft): CharacterDraft {
  const normalizedLevel = clampNumber(String(profile.level), 1, 20, 1);
  const normalizedProgress = normalizeLevelAndXp(normalizedLevel, profile.xp);
  const buildPlan = getBuildPlan(profile.className);
  const recommendedAbilities = createRecommendedAbilities(
    profile.species,
    normalizedProgress.level,
    buildPlan
  );
  const maxHitPoints = clampNumber(
    String(
      calculateRecommendedHitPoints(
        buildPlan.hitDie,
        normalizedProgress.level,
        recommendedAbilities.CON
      )
    ),
    1,
    999,
    8
  );

  return {
    ...createEmptyCharacter(),
    name: profile.name,
    species: profile.species,
    className: profile.className,
    level: normalizedProgress.level,
    xp: normalizedProgress.xp,
    hitPoints: maxHitPoints,
    currentHitPoints: maxHitPoints,
    attributeMode: "custom",
    abilities: recommendedAbilities,
    alignment: buildPlan.alignment,
    background: createRecommendedBackgroundChoice(buildPlan),
    skills: createRecommendedSkills(profile.species, profile.className, buildPlan),
    equipment: createRecommendedEquipment(
      profile.species,
      normalizedProgress.level,
      profile.className,
      buildPlan
    )
  };
}

const randomNamePrefixes = [
  "Arin",
  "Bryn",
  "Cora",
  "Dain",
  "Eira",
  "Fen",
  "Galen",
  "Ilya",
  "Kael",
  "Lyra",
  "Mira",
  "Nox",
  "Orin",
  "Rhea",
  "Soren",
  "Thalia",
  "Vale",
  "Zara"
];

const randomNameSuffixes = [
  "Ashwhisper",
  "Blackwood",
  "Brightmantle",
  "Dawnbreaker",
  "Emberfall",
  "Gloomwater",
  "Ironbloom",
  "Moonbrook",
  "Nightbloom",
  "Ravenscar",
  "Silverstep",
  "Stormvale",
  "Sunspire",
  "Thornhollow",
  "Wildmere"
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(items: readonly T[]): T {
  return items[getRandomInt(0, items.length - 1)];
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
  const [stepOneSnapshot, setStepOneSnapshot] = useState<CharacterDraft | null>(null);
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
    watch
  } = useForm<CharacterDraft>({
    defaultValues: initialValues
  });
  const selectedClassName = watch("className") ?? initialValues.className;
  const selectedSpecies = watch("species") ?? initialValues.species;
  const selectedBackground = watch("background") ?? initialValues.background;
  const attributeMode = watch("attributeMode") ?? initialValues.attributeMode;
  const abilities = watch("abilities") ?? initialValues.abilities;
  const alignment = watch("alignment") ?? initialValues.alignment;
  const selectedSkills = watch("skills") ?? initialValues.skills;
  const selectedEquipment = watch("equipment") ?? initialValues.equipment;
  const availableSkillOptions = getSkillProficiencyOptionsForClass(selectedClassName);
  const skillSelectionLimit = getSkillSelectionLimitForClass(selectedClassName);
  const availableEquipmentOptions = getAvailableEquipmentNamesForClass(selectedClassName);
  const lastCustomAbilitiesRef = useRef(cloneAbilities(initialValues.abilities));
  const lastPointBuyAbilitiesRef = useRef(
    initialValues.attributeMode === "pointBuy"
      ? normalizePointBuyAbilities(initialValues.abilities)
      : createDefaultAbilities()
  );
  const pointBuyRemaining = getPointBuyRemaining(abilities);

  const creationTitleByStep: Record<CreationStep, string> = {
    1: "Create a new character",
    2: "Customize your build",
    3: "Finalize the background"
  };
  const creationDescriptionByStep: Record<CreationStep, string> = {
    1: "Start with identity details, then either create instantly with a recommended build or continue customizing manually.",
    2: "Adjust stats, abilities, skills, and equipment. Going back will reset these custom changes.",
    3: "Choose a background, alignment, and optional background notes, then create the character."
  };

  useEffect(() => {
    reset(initialValues);
    lastCustomAbilitiesRef.current =
      initialValues.attributeMode === "custom"
        ? cloneAbilities(initialValues.abilities)
        : cloneAbilities(createDefaultAbilities());
    lastPointBuyAbilitiesRef.current =
      initialValues.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(initialValues.abilities)
        : createDefaultAbilities();
    setWizardStep(1);
    setStepOneSnapshot(null);
  }, [initialValues, reset]);

  useEffect(() => {
    const currentSkills = getValues("skills") ?? [];
    const currentEquipment = getValues("equipment") ?? [];
    const normalizedSelections = normalizeSelectionsForClass(
      selectedClassName,
      currentSkills,
      currentEquipment,
      selectedSpecies,
      selectedBackground
    );

    if (!areStringArraysEqual(currentSkills, normalizedSelections.skills)) {
      setValue("skills", normalizedSelections.skills, {
        shouldDirty: true,
        shouldValidate: true
      });
    }

    if (!areStringArraysEqual(currentEquipment, normalizedSelections.equipment)) {
      setValue("equipment", normalizedSelections.equipment, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [getValues, selectedBackground, selectedClassName, selectedSpecies, setValue]);

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
    if (nextMode === attributeMode) {
      return;
    }

    const currentAbilities = getValues("abilities");

    if (attributeMode === "custom") {
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

  function normalizeDraft(values: CharacterDraft): CharacterDraft {
    const maxHitPoints = clampNumber(String(values.hitPoints), 1, 999, 8);
    const normalizedProgress = normalizeLevelAndXp(values.level, values.xp);
    const normalizedClassName = values.className.trim();
    const normalizedBackground = values.background.trim();
    const resolvedBackground = backgroundOptions.includes(normalizedBackground)
      ? normalizedBackground
      : "";
    const normalizedSelections = normalizeSelectionsForClass(
      normalizedClassName,
      values.skills ?? [],
      values.equipment ?? [],
      values.species,
      resolvedBackground
    );

    return {
      ...values,
      name: values.name.trim(),
      species: values.species.trim(),
      className: normalizedClassName,
      level: normalizedProgress.level,
      xp: normalizedProgress.xp,
      hitPoints: maxHitPoints,
      currentHitPoints: isEditing
        ? clampNumber(String(values.currentHitPoints), 0, maxHitPoints, maxHitPoints)
        : maxHitPoints,
      background: resolvedBackground,
      backgroundNotes: values.backgroundNotes.trim(),
      alignment: alignmentOptions.includes(values.alignment) ? values.alignment : "True Neutral",
      skills: normalizedSelections.skills,
      equipment: normalizedSelections.equipment,
      abilities:
        values.attributeMode === "pointBuy"
          ? normalizePointBuyAbilities(values.abilities)
          : normalizeCustomAbilities(values.abilities)
    };
  }

  function submitForm(values: CharacterDraft) {
    onSubmit(normalizeDraft(values));
  }

  async function validateWizardStepOne(): Promise<boolean> {
    return trigger(["name", "species", "className", "level"]);
  }

  async function handleRecommendedCreate() {
    const isValid = await validateWizardStepOne();

    if (!isValid) {
      return;
    }

    const snapshot = createBasicProfileSnapshot(getValues());
    const recommendedDraft = createRecommendedCharacterDraft(snapshot);

    reset(recommendedDraft);
    onSubmit(normalizeDraft(recommendedDraft));
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
  }

  async function handleProceedToBackground() {
    const isValid = await trigger(["hitPoints"]);

    if (!isValid) {
      return;
    }

    setWizardStep(3);
  }

  function handleBackToStepOne() {
    reset(stepOneSnapshot ?? createBasicProfileSnapshot(getValues()));
    setWizardStep(1);
  }

  function handleRandomize() {
    if (!isEditing && wizardStep === 1) {
      const randomClassName = getRandomItem(classOptions);
      reset({
        ...createEmptyCharacter(),
        name: createRandomName(),
        species: getRandomItem(speciesOptions),
        className: randomClassName,
        background: createRandomBackground(),
        backgroundNotes: "",
        level: 1
      });
      return;
    }

    const randomClassName = getRandomItem(classOptions);
    const randomClassSkillOptions = getSkillProficiencyOptionsForClass(randomClassName);
    const randomClassSkillLimit = getSkillSelectionLimitForClass(randomClassName);
    const randomClassEquipmentOptions = getAvailableEquipmentNamesForClass(randomClassName);
    const randomMode: AttributeMode = Math.random() < 0.5 ? "custom" : "pointBuy";
    const randomizedAbilities =
      randomMode === "custom" ? createRandomCustomAbilities() : createRandomPointBuyAbilities();
    const randomizedPointBuyAbilities =
      randomMode === "pointBuy" ? randomizedAbilities : createRandomPointBuyAbilities();
    const randomizedCustomAbilities =
      randomMode === "custom" ? randomizedAbilities : createRandomCustomAbilities();
    const randomizedDraft: CharacterDraft = {
      name: createRandomName(),
      species: getRandomItem(speciesOptions),
      className: randomClassName,
      level: 1,
      xp: 0,
      hitPoints: getRandomInt(8, 90),
      currentHitPoints: 0,
      attributeMode: randomMode,
      abilities: randomizedAbilities,
      alignment: getRandomItem(alignmentGrid.flat()),
      background: createRandomBackground(),
      backgroundNotes: "",
      currencies: createDefaultCurrencies(),
      skills: pickRandomSubset(
        randomClassSkillOptions,
        randomClassSkillLimit,
        randomClassSkillLimit
      ),
      equipment: pickRandomSubset(
        randomClassEquipmentOptions,
        3,
        Math.min(8, randomClassEquipmentOptions.length)
      )
    };
    randomizedDraft.currentHitPoints = randomizedDraft.hitPoints;

    reset(randomizedDraft);
    lastPointBuyAbilitiesRef.current = cloneAbilities(randomizedPointBuyAbilities);
    lastCustomAbilitiesRef.current = cloneAbilities(randomizedCustomAbilities);
  }

  function renderBasicProfileSection(includeHitPoints: boolean) {
    return (
      <section className={clsx(styles.sectionCard, styles.primarySection)}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Basic profile</p>
            <h3>Identity and starting stats</h3>
          </div>
          <button
            type="button"
            className={styles.randomizeButton}
            onClick={handleRandomize}
            aria-label="Randomize character"
            title="Randomize character"
          >
            <Dice6 size={20} />
          </button>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Character name</span>
            <TextInput
              className={styles.fieldInput}
              invalid={Boolean(errors.name)}
              placeholder="Mira Nightbloom"
              {...register("name", {
                required: "Enter a character name",
                validate: (value) =>
                  value.trim().length > 0 || "Enter a character name"
              })}
            />
            {errors.name ? <small className={styles.errorText}>{errors.name.message}</small> : null}
          </label>

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
            <span>Starting level</span>
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
            {errors.level ? <small className={styles.errorText}>{errors.level.message}</small> : null}
          </label>

          {includeHitPoints ? (
            <label className={styles.field}>
              <span>Hit points</span>
              <NumberInput
                className={styles.fieldInput}
                invalid={Boolean(errors.hitPoints)}
                min={1}
                {...register("hitPoints", {
                  valueAsNumber: true,
                  min: { value: 1, message: "Hit points must be at least 1" }
                })}
              />
              {errors.hitPoints ? (
                <small className={styles.errorText}>{errors.hitPoints.message}</small>
              ) : (
                <small className={styles.helperText}>Default starts at 8 and can be adjusted.</small>
              )}
            </label>
          ) : null}
        </div>
      </section>
    );
  }

  function renderHitPointsSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Combat stats</p>
            <h3>Set your starting hit points</h3>
          </div>
          <span>Current HP starts at max when created</span>
        </div>

        <label className={styles.field}>
          <span>Hit points</span>
          <NumberInput
            className={styles.fieldInput}
            invalid={Boolean(errors.hitPoints)}
            min={1}
            {...register("hitPoints", {
              valueAsNumber: true,
              min: { value: 1, message: "Hit points must be at least 1" },
              onChange: (event) => {
                const nextMaxHitPoints = clampNumber(event.target.value, 1, 999, 8);
                setValue("currentHitPoints", nextMaxHitPoints, { shouldDirty: true });
              }
            })}
          />
          {errors.hitPoints ? (
            <small className={styles.errorText}>{errors.hitPoints.message}</small>
          ) : (
            <small className={styles.helperText}>
              This can be adjusted later from the character presentation view.
            </small>
          )}
        </label>
      </section>
    );
  }

  function renderAbilitiesSection() {
    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Ability scores</p>
            <h3>Distribute STR, DEX, CON, INT, WIS, CHA</h3>
          </div>
          <span>{attributeMode === "custom" ? "1-99 custom range" : `${pointBuyRemaining} points left`}</span>
        </div>

        <div className={styles.segmentedControl} role="tablist" aria-label="Ability distribution mode">
          <button
            type="button"
            className={clsx(
              styles.segmentButton,
              attributeMode === "custom" && styles.segmentButtonActive
            )}
            onClick={() => handleAttributeModeChange("custom")}
          >
            Custom
          </button>
          <button
            type="button"
            className={clsx(
              styles.segmentButton,
              attributeMode === "pointBuy" && styles.segmentButtonActive
            )}
            onClick={() => handleAttributeModeChange("pointBuy")}
          >
            Point Buy
          </button>
        </div>

        <p className={styles.helperText}>
          {attributeMode === "custom"
            ? "Custom mode allows any value from 1 to 99 for each attribute."
            : "Point Buy follows standard DnD rules: scores start at 8, can rise to 15 before species bonuses, and must stay within a 27-point budget."}
        </p>

        {attributeMode === "pointBuy" ? (
          <div className={styles.pointSummary}>
            <strong>{pointBuyRemaining} points remaining</strong>
            <span>{POINT_BUY_BUDGET - pointBuyRemaining} spent</span>
          </div>
        ) : null}

        <div className={styles.attributesGrid}>
          {abilityKeys.map((ability) => (
            <Controller
              key={ability}
              control={control}
              name={`abilities.${ability}` as const}
              render={({ field }) => {
                const currentValue = field.value ?? 8;
                const maxPointBuyScore =
                  attributeMode === "pointBuy"
                    ? getAffordablePointBuyMax(ability, abilities)
                    : 99;

                return (
                  <div className={styles.abilityCard}>
                    <div className={styles.abilityHeader}>
                      <div>
                        <strong>{ability}</strong>
                        {attributeMode === "pointBuy" ? (
                          <span>{getPointBuyCost(currentValue)} points spent</span>
                        ) : (
                          <span>Custom score</span>
                        )}
                      </div>
                      {attributeMode === "pointBuy" ? (
                        <small>8-15 only</small>
                      ) : (
                        <small>1-99</small>
                      )}
                    </div>

                    {attributeMode === "custom" ? (
                      <NumberInput
                        className={styles.abilityInput}
                        min={1}
                        max={99}
                        value={currentValue}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          handleCustomAbilityChange(ability, event.target.value)
                        }
                      />
                    ) : (
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          className={styles.stepButton}
                          disabled={currentValue <= 8}
                          onClick={() => {
                            handlePointBuyAbilityChange(ability, String(currentValue - 1));
                          }}
                        >
                          -
                        </button>
                        <NumberInput
                          className={styles.abilityInput}
                          min={8}
                          max={15}
                          value={currentValue}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            handlePointBuyAbilityChange(ability, event.target.value)
                          }
                        />
                        <button
                          type="button"
                          className={styles.stepButton}
                          disabled={currentValue >= maxPointBuyScore}
                          onClick={() => {
                            handlePointBuyAbilityChange(ability, String(currentValue + 1));
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          ))}
        </div>

        {attributeMode === "pointBuy" ? (
          <div className={styles.legend}>
            {[8, 9, 10, 11, 12, 13, 14, 15].map((score) => (
              <span key={score} className={styles.legendChip}>
                {score} = {getPointBuyCost(score)}
              </span>
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  function renderBackgroundSection() {
    const hasSelectedBackground = selectedBackground.trim().length > 0;

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Character background</p>
            <h3>Choose origin and outlook</h3>
          </div>
          <span>Choose background + alignment + notes</span>
        </div>

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
          ) : (
            <small className={styles.helperText}>
              Background grants innate skill and tool proficiencies.
            </small>
          )}
        </label>

        <div className={styles.alignmentGrid} role="radiogroup" aria-label="Character alignment">
          {alignmentGrid.flat().map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={alignment === option}
              disabled={!hasSelectedBackground}
              className={clsx(
                styles.alignmentOption,
                alignment === option && styles.alignmentOptionActive
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

        {errors.alignment ? <small className={styles.errorText}>{errors.alignment.message}</small> : null}
        {!hasSelectedBackground ? (
          <small className={styles.helperText}>Choose a background before selecting alignment.</small>
        ) : null}

        <label className={styles.field}>
          <span>Background Notes</span>
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

  function renderLoadoutSection() {
    const resolvedSkills = resolveSkillProficienciesForCharacter(
      selectedClassName,
      selectedSpecies,
      selectedBackground,
      selectedSkills
    );
    const grantedSkillProficiencies = resolvedSkills.granted;
    const grantedSkillSet = new Set(grantedSkillProficiencies.map((entry) => entry.skill));
    const availableManualSkillOptions = availableSkillOptions.filter(
      (skill) => !grantedSkillSet.has(skill)
    );
    const selectedSkillCount = resolvedSkills.manual.length;
    const isSkillSelectionLimited = skillSelectionLimit > 0;
    const isSkillSelectionAtLimit = isSkillSelectionLimited && selectedSkillCount >= skillSelectionLimit;

    return (
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Skills and equipment</p>
            <h3>Choose current proficiencies and gear</h3>
          </div>
          <span>
            {isSkillSelectionLimited
              ? `${selectedSkillCount}/${skillSelectionLimit} class skills selected`
              : "Select a class to view proficiencies"}
          </span>
        </div>

        <div className={styles.loadoutGrid}>
          <fieldset className={styles.choiceGroup}>
            <legend>Skills</legend>
            <p className={styles.helperText}>Granted proficiencies (locked):</p>
            {grantedSkillProficiencies.length === 0 ? (
              <p className={styles.helperText}>
                No granted proficiencies from class, species, or background.
              </p>
            ) : (
              <ul className={styles.grantedSkillList}>
                {grantedSkillProficiencies.map((entry) => (
                  <li key={entry.skill}>
                    <span>{entry.skill}</span>
                    <small>{entry.sources.join(", ")}</small>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.helperText}>
              {isSkillSelectionLimited
                ? `Choose exactly ${skillSelectionLimit} manual skills allowed by this class.`
                : "Choose a class to unlock skill proficiency options."}
            </p>
            <div className={styles.choiceGrid}>
              {availableManualSkillOptions.map((skill) => (
                <label
                  key={skill}
                  className={clsx(
                    styles.choiceOption,
                    resolvedSkills.manual.includes(skill) && styles.choiceOptionActive
                  )}
                >
                  <input
                    type="checkbox"
                    value={skill}
                    className={styles.choiceCheckbox}
                    disabled={!resolvedSkills.manual.includes(skill) && isSkillSelectionAtLimit}
                    {...register("skills")}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.choiceGroup}>
            <legend>Equipment</legend>
            <p className={styles.helperText}>
              Weapons and armor are filtered by class proficiency type.
            </p>
            <div className={styles.choiceGrid}>
              {availableEquipmentOptions.map((item) => (
                <label
                  key={item}
                  className={clsx(
                    styles.choiceOption,
                    selectedEquipment.includes(item) && styles.choiceOptionActive
                  )}
                >
                  <input
                    type="checkbox"
                    value={item}
                    className={styles.choiceCheckbox}
                    {...register("equipment")}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
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
            ? `Set the essentials first, then distribute the six core abilities with either freeform numbers or a standard ${POINT_BUY_BUDGET}-point DnD point buy.`
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
              1. Basic profile
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
            <span
              className={clsx(styles.stepBadge, wizardStep === 3 && styles.stepBadgeActive)}
            >
              3. Background
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

        {isEditing ? (
          <>
            {renderBasicProfileSection(true)}
            {renderAbilitiesSection()}
            {renderBackgroundSection()}
            {renderLoadoutSection()}
          </>
        ) : null}

        {!isEditing && wizardStep === 1 ? renderBasicProfileSection(false) : null}

        {!isEditing && wizardStep === 2 ? (
          <>
            {renderHitPointsSection()}
            {renderAbilitiesSection()}
            {renderLoadoutSection()}
          </>
        ) : null}

        {!isEditing && wizardStep === 3 ? renderBackgroundSection() : null}

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
              <button type="button" className={styles.secondaryButton} onClick={handleBackToStepOne}>
                Back (reset changes)
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  void handleProceedToBackground();
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
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={selectedBackground.trim().length === 0}
              >
                {selectedBackground.trim().length === 0
                  ? "Choose Background First"
                  : "Create Character"}
              </button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default CharacterForm;
