import clsx from "clsx";
import { Dice6 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import type { AbilityKey, AbilityScores, AttributeMode, CharacterDraft } from "../../../types";
import {
  POINT_BUY_BUDGET,
  abilityKeys,
  alignmentGrid,
  cloneAbilities,
  createDefaultAbilities,
  equipmentOptions,
  getAffordablePointBuyMax,
  getPointBuyCost,
  getPointBuyRemaining,
  normalizePointBuyAbilities,
  roleOptions,
  skillsOptions,
  speciesOptions
} from "../../../pages/CharactersPage/constants";
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

function normalizeSelection(values: string[], validOptions: string[]): string[] {
  const validOptionSet = new Set(validOptions);
  return [...new Set(values)].filter((value) => validOptionSet.has(value));
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

const randomOrigins = [
  "Raised by caravan merchants on dangerous frontier roads.",
  "Trained in a secluded monastery before leaving for the wider world.",
  "Former city guard who walked away after a political betrayal.",
  "Academic apprentice who fled after uncovering forbidden lore.",
  "Wanderer from a vanished village with only scattered clues left behind.",
  "Shipwreck survivor who swore to never be powerless again."
];

const randomTraits = [
  "Always speaks with calm confidence in tense moments.",
  "Collects tiny trophies from every completed job.",
  "Keeps a running notebook of people, favors, and grudges.",
  "Protects strangers first and asks questions later.",
  "Uses humor to cut through fear and uncertainty."
];

const randomIdeals = [
  "Justice must outlast any kingdom.",
  "Knowledge should never be hoarded by the powerful.",
  "Freedom matters more than comfort.",
  "Loyalty to companions is sacred.",
  "Greatness is earned through relentless discipline."
];

const randomBonds = [
  "Owes a life debt to an old mentor who disappeared.",
  "Searches for a missing sibling taken years ago.",
  "Guards a family relic tied to an ancient prophecy.",
  "Supports a struggling hometown with every coin to spare.",
  "Carries a promise to protect one specific person at all costs."
];

const randomFlaws = [
  "Slow to trust anyone in authority.",
  "Cannot resist a dangerous mystery.",
  "Holds grudges far longer than is healthy.",
  "Overcommits and refuses to ask for help.",
  "Acts impulsively when allies are threatened."
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(items: T[]): T {
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

function pickRandomSubset(options: string[], minSize: number, maxSize: number): string[] {
  const size = getRandomInt(minSize, Math.min(maxSize, options.length));
  return shuffle(options).slice(0, size);
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
  return [
    `Background: ${getRandomItem(randomOrigins)}`,
    `Personal Trait: ${getRandomItem(randomTraits)}`,
    `Ideal: ${getRandomItem(randomIdeals)}`,
    `Bond: ${getRandomItem(randomBonds)}`,
    `Flaw: ${getRandomItem(randomFlaws)}`
  ].join("\n");
}

function createRandomName(): string {
  return `${getRandomItem(randomNamePrefixes)} ${getRandomItem(randomNameSuffixes)}`;
}

function CharacterForm({ isEditing, initialValues, onSubmit, onBack }: CharacterFormProps) {
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    watch
  } = useForm<CharacterDraft>({
    defaultValues: initialValues
  });
  const attributeMode = watch("attributeMode") ?? initialValues.attributeMode;
  const abilities = watch("abilities") ?? initialValues.abilities;
  const alignment = watch("alignment") ?? initialValues.alignment;
  const selectedSkills = watch("skills") ?? initialValues.skills;
  const selectedEquipment = watch("equipment") ?? initialValues.equipment;
  const lastCustomAbilitiesRef = useRef(cloneAbilities(initialValues.abilities));
  const lastPointBuyAbilitiesRef = useRef(
    initialValues.attributeMode === "pointBuy"
      ? normalizePointBuyAbilities(initialValues.abilities)
      : createDefaultAbilities()
  );
  const pointBuyRemaining = getPointBuyRemaining(abilities);

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
  }, [initialValues, reset]);

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

  function submitForm(values: CharacterDraft) {
    const maxHitPoints = clampNumber(String(values.hitPoints), 1, 999, 8);

    onSubmit({
      ...values,
      name: values.name.trim(),
      level: clampNumber(String(values.level), 1, 20, 1),
      hitPoints: maxHitPoints,
      currentHitPoints: clampNumber(String(values.currentHitPoints), 0, maxHitPoints, maxHitPoints),
      background: values.background.trim(),
      skills: normalizeSelection(values.skills, skillsOptions),
      equipment: normalizeSelection(values.equipment, equipmentOptions),
      abilities:
        values.attributeMode === "pointBuy"
          ? normalizePointBuyAbilities(values.abilities)
          : normalizeCustomAbilities(values.abilities)
    });
  }

  function handleRandomize() {
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
      role: getRandomItem(roleOptions),
      level: getRandomInt(1, 12),
      hitPoints: getRandomInt(8, 90),
      currentHitPoints: 0,
      attributeMode: randomMode,
      abilities: randomizedAbilities,
      alignment: getRandomItem(alignmentGrid.flat()),
      background: createRandomBackground(),
      skills: pickRandomSubset(skillsOptions, 3, 8),
      equipment: pickRandomSubset(equipmentOptions, 3, 8)
    };
    randomizedDraft.currentHitPoints = randomizedDraft.hitPoints;

    reset(randomizedDraft);
    lastPointBuyAbilitiesRef.current = cloneAbilities(randomizedPointBuyAbilities);
    lastCustomAbilitiesRef.current = cloneAbilities(randomizedCustomAbilities);
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.backButton} onClick={onBack}>
        Go back
      </button>

      <div className={styles.header}>
        <p className={styles.eyebrow}>Character forge</p>
        <h2 className={styles.title}>{isEditing ? "Refine your character" : "Create a new character"}</h2>
        <p className={styles.description}>
          Set the essentials first, then distribute the six core abilities with either freeform
          numbers or a standard {POINT_BUY_BUDGET}-point DnD point buy.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
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
              <span>Role</span>
              <SelectInput
                className={styles.fieldInput}
                invalid={Boolean(errors.role)}
                {...register("role", { required: "Choose a role" })}
              >
                <option value="">Select a role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </SelectInput>
              {errors.role ? <small className={styles.errorText}>{errors.role.message}</small> : null}
            </label>

            <label className={styles.field}>
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
              {errors.level ? <small className={styles.errorText}>{errors.level.message}</small> : null}
            </label>

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
          </div>
        </section>

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

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Character background</p>
              <h3>Behavior and personality</h3>
            </div>
            <span>Choose alignment + write notes</span>
          </div>

          <div className={styles.alignmentGrid} role="radiogroup" aria-label="Character alignment">
            {alignmentGrid.flat().map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={alignment === option}
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

          <input
            type="hidden"
            {...register("alignment", {
              required: "Select an alignment"
            })}
          />

          <label className={styles.field}>
            <span>Background notes</span>
            <TextAreaInput
              className={styles.backgroundInput}
              invalid={Boolean(errors.background)}
              placeholder="Background, Personal Traits, Ideals, Bonds, Flaws, etc."
              {...register("background", {
                maxLength: {
                  value: 2000,
                  message: "Background notes cannot exceed 2000 characters"
                }
              })}
            />
            {errors.background ? (
              <small className={styles.errorText}>{errors.background.message}</small>
            ) : (
              <small className={styles.helperText}>
                Use this section to capture key roleplay details and story hooks.
              </small>
            )}
          </label>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Skills and equipment</p>
              <h3>Choose current proficiencies and gear</h3>
            </div>
            <span>Default options for now</span>
          </div>

          <div className={styles.loadoutGrid}>
            <fieldset className={styles.choiceGroup}>
              <legend>Skills</legend>
              <p className={styles.helperText}>
                Pick the skills currently relevant for this character.
              </p>
              <div className={styles.choiceGrid}>
                {skillsOptions.map((skill) => (
                  <label
                    key={skill}
                    className={clsx(
                      styles.choiceOption,
                      selectedSkills.includes(skill) && styles.choiceOptionActive
                    )}
                  >
                    <input
                      type="checkbox"
                      value={skill}
                      className={styles.choiceCheckbox}
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
                Select the base gear currently on this character sheet.
              </p>
              <div className={styles.choiceGrid}>
                {equipmentOptions.map((item) => (
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

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>
            {isEditing ? "Update character" : "Save character"}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CharacterForm;
