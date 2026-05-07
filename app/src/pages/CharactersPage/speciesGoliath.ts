import {
  BODY_SIZE,
  DAMAGE_TYPE,
  getSpeciesEntryByName,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterGoliathFeatureState,
  type CharacterGoliathGiantAncestry,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { getAbilityModifierForCharacter } from "./abilities";
import { appendSourcedDescriptionAddition } from "./actionModalDescriptions";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type {
  AbilityCheckIndicatorMap,
  FeatureActionCard,
  FeatureActionFact,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureSpeedBonus,
  SavingThrowIndicatorMap,
  SkillIndicatorMap
} from "./classFeatures/types";
import { formatFormulaCell, formatFormulaTerms, formatSignedFormulaTerm } from "./shared/formulas";
import { skillGroupsByAbility } from "./skillDefinitions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";

type GoliathRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "level" | "speciesChoices" | "speciesFeatureState" | "statusEntries">>;

type GoliathActionCharacter = Pick<Character, "species" | "level" | "abilities"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState" | "statusEntries">>;

export type GoliathGiantAncestryOption = {
  key: CharacterGoliathGiantAncestry;
  name: string;
  featureName: string;
  sectionHeading: string;
  damageBonus?: {
    formula: string;
    damageType: DAMAGE_TYPE;
  };
};

export type GoliathAttackOptionState = {
  ancestry: GoliathGiantAncestryOption;
  featureName: string;
  sectionHeading: string;
  usesRemaining: number;
  usesTotal: number;
  disabled: boolean;
  disabledReason?: string;
  damageBonus: FeatureDamageBonus | null;
};

const goliathSpeciesId = "species-goliath-2024";
const goliathDefaultGiantAncestry: CharacterGoliathGiantAncestry = "cloud";
const goliathLargeFormUsesTotal = 1;
const goliathLargeFormStatusSourceId = "species-goliath-large-form";
const goliathAttackAncestryKeys = new Set<CharacterGoliathGiantAncestry>(["fire", "frost", "hill"]);
const goliathGiantAncestryOptions = [
  {
    key: "cloud",
    name: "Cloud Giant",
    featureName: "Cloud's Jaunt",
    sectionHeading: "Cloud's Jaunt (Cloud Giant)"
  },
  {
    key: "fire",
    name: "Fire Giant",
    featureName: "Fire's Burn",
    sectionHeading: "Fire's Burn (Fire Giant)",
    damageBonus: {
      formula: "1d10",
      damageType: DAMAGE_TYPE.FIRE
    }
  },
  {
    key: "frost",
    name: "Frost Giant",
    featureName: "Frost's Chill",
    sectionHeading: "Frost's Chill (Frost Giant)",
    damageBonus: {
      formula: "1d6",
      damageType: DAMAGE_TYPE.COLD
    }
  },
  {
    key: "hill",
    name: "Hill Giant",
    featureName: "Hill's Tumble",
    sectionHeading: "Hill's Tumble (Hill Giant)"
  },
  {
    key: "stone",
    name: "Stone Giant",
    featureName: "Stone's Endurance",
    sectionHeading: "Stone's Endurance (Stone Giant)"
  },
  {
    key: "storm",
    name: "Storm Giant",
    featureName: "Storm's Thunder",
    sectionHeading: "Storm's Thunder (Storm Giant)"
  }
] as const satisfies readonly GoliathGiantAncestryOption[];
const goliathGiantAncestryAliases = new Map<string, CharacterGoliathGiantAncestry>();

goliathGiantAncestryOptions.forEach((option) => {
  goliathGiantAncestryAliases.set(option.key, option.key);
  goliathGiantAncestryAliases.set(option.name.toLowerCase(), option.key);
  goliathGiantAncestryAliases.set(option.name.replace(/\s+giant$/i, "").toLowerCase(), option.key);
});

function getGoliathEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName("Goliath");

  return entry?.id === goliathSpeciesId ? entry : null;
}

function getGoliathDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getGoliathEntry()?.description.filter(
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

function stripDescriptionMarkup(value: string): string {
  return value
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getGoliathDescriptionText(heading: string, fallback: string): string {
  const section = getGoliathDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getGoliathDescriptionPlainText(heading: string, fallback: string): string {
  return stripDescriptionMarkup(getGoliathDescriptionText(heading, fallback))
    .replace(new RegExp(`^${escapeRegExp(heading)}\\.\\s*`, "i"), "")
    .trim();
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function formatDamageTypeLabel(damageType: DAMAGE_TYPE): string {
  return `${damageType.charAt(0)}${damageType.slice(1).toLowerCase()}`;
}

function getGoliathFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterGoliathFeatureState {
  return character.speciesFeatureState?.goliath ?? {};
}

function setGoliathFeatureState(
  character: Character,
  state: CharacterGoliathFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      goliath: {
        ...getGoliathFeatureState(character),
        ...state
      }
    }
  };
}

function getGoliathAncestryDescription(
  option: GoliathGiantAncestryOption
): SpellDescriptionEntry[] {
  const description = getGoliathDescriptionSection(option.sectionHeading);

  if (description.length > 0) {
    return description;
  }

  switch (option.key) {
    case "cloud":
      return [
        "As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see."
      ];
    case "fire":
      return [
        "When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target."
      ];
    case "frost":
      return [
        "When you hit a target with an attack roll and deal damage to it, you can also deal 1d6 Cold damage to that target and reduce its Speed by 10 feet until the start of your next turn."
      ];
    case "hill":
      return [
        "When you hit a Large or smaller creature with an attack roll and deal damage to it, you can give that target the Prone condition."
      ];
    case "stone":
      return [
        "When you take damage, you can take a Reaction to roll 1d12. Add your Constitution modifier to the number rolled and reduce the damage by that total."
      ];
    case "storm":
      return [
        "When you take damage from a creature within 60 feet of you, you can take a Reaction to deal 1d8 Thunder damage to that creature."
      ];
    default:
      return [];
  }
}

function getLargeFormDescription(): SpellDescriptionEntry[] {
  const description = getGoliathDescriptionSection("Large Form");

  return description.length > 0
    ? description
    : [
        "Starting at character level 5, you can change your size to Large as a Bonus Action if you're in a big enough space. This transformation lasts for 10 minutes or until you end it. For that duration, you have Advantage on Strength checks, and your Speed increases by 10 feet. Once you use this trait, you can't use it again until you finish a Long Rest."
      ];
}

function getLargeFormStatusDescription(): string {
  return getGoliathDescriptionPlainText(
    "Large Form",
    "You change your size to Large for 10 minutes. For that duration, you have Advantage on Strength checks, and your Speed increases by 10 feet."
  );
}

function getPowerfulBuildDescription(): string {
  return getGoliathDescriptionText(
    "Powerful Build",
    "You have Advantage on any ability check you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity."
  );
}

function createGoliathStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> & {
    sourceId: string;
    source?: string;
  }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source ?? "Goliath",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: null,
    description: options.description
  };
}

export function isGoliathSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === goliathSpeciesId;
}

export function getGoliathGiantAncestryOptions(): GoliathGiantAncestryOption[] {
  return [...goliathGiantAncestryOptions];
}

export function getGoliathGiantAncestryOptionsForSpecies(
  species: string
): GoliathGiantAncestryOption[] {
  return isGoliathSpecies(species) ? getGoliathGiantAncestryOptions() : [];
}

export function normalizeGoliathGiantAncestry(
  value: unknown
): CharacterGoliathGiantAncestry | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return goliathGiantAncestryAliases.get(value.trim().toLowerCase());
}

export function getDefaultGoliathGiantAncestryForSpecies(
  species: string
): CharacterGoliathGiantAncestry | undefined {
  if (!isGoliathSpecies(species)) {
    return undefined;
  }

  return (
    normalizeGoliathGiantAncestry(getGoliathEntry()?.starterPack.recommendedGiantAncestry) ??
    goliathDefaultGiantAncestry
  );
}

export function formatGoliathGiantAncestryOptionLabel(option: GoliathGiantAncestryOption): string {
  return option.name;
}

export function getGoliathGiantAncestryForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): GoliathGiantAncestryOption | null {
  if (!isGoliathSpecies(character.species)) {
    return null;
  }

  const ancestry = normalizeGoliathGiantAncestry(character.speciesChoices?.giantAncestry);

  return goliathGiantAncestryOptions.find((option) => option.key === ancestry) ?? null;
}

export function normalizeGoliathFeatureState(value: unknown): CharacterGoliathFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    giantAncestryUsesExpended: clampExpendedUses(record.giantAncestryUsesExpended),
    largeFormExpended: record.largeFormExpended === true
  };
}

export function getGoliathGiantAncestryUsesTotal(character: GoliathRuntimeCharacter): number {
  return isGoliathSpecies(character.species) ? getSpeciesProficiencyBonus(character.level ?? 1) : 0;
}

export function getGoliathGiantAncestryUsesRemaining(character: GoliathRuntimeCharacter): number {
  const total = getGoliathGiantAncestryUsesTotal(character);
  const expended = clampExpendedUses(getGoliathFeatureState(character).giantAncestryUsesExpended);

  return Math.max(0, total - expended);
}

export function consumeGoliathGiantAncestryUseForCharacter(character: Character): Character {
  if (getGoliathGiantAncestryUsesRemaining(character) <= 0) {
    return character;
  }

  const state = getGoliathFeatureState(character);

  return setGoliathFeatureState(character, {
    giantAncestryUsesExpended: clampExpendedUses(state.giantAncestryUsesExpended) + 1
  });
}

export function restoreGoliathGiantAncestryOnLongRest(character: Character): Character {
  if (getGoliathGiantAncestryUsesTotal(character) <= 0) {
    return character;
  }

  const state = getGoliathFeatureState(character);

  if (clampExpendedUses(state.giantAncestryUsesExpended) <= 0) {
    return character;
  }

  return setGoliathFeatureState(character, {
    giantAncestryUsesExpended: 0
  });
}

export function getGoliathLargeFormUsesTotal(character: GoliathRuntimeCharacter): number {
  return isGoliathSpecies(character.species) && (character.level ?? 1) >= 5
    ? goliathLargeFormUsesTotal
    : 0;
}

export function getGoliathLargeFormUsesRemaining(character: GoliathRuntimeCharacter): number {
  const total = getGoliathLargeFormUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return getGoliathFeatureState(character).largeFormExpended === true ? 0 : total;
}

export function restoreGoliathLargeFormOnLongRest(character: Character): Character {
  if (getGoliathLargeFormUsesTotal(character) <= 0) {
    return character;
  }

  const state = getGoliathFeatureState(character);

  if (state.largeFormExpended !== true) {
    return character;
  }

  return setGoliathFeatureState(character, {
    largeFormExpended: false
  });
}

export function isGoliathLargeFormStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return entry.sourceId === goliathLargeFormStatusSourceId;
}

export function normalizeGoliathLargeFormStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  return {
    ...entry,
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: "Large Form",
    source: "Large Form",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    description: getLargeFormStatusDescription()
  };
}

export function hasActiveGoliathLargeForm(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isGoliathLargeFormStatusEntry
  );
}

export function activateGoliathLargeFormForCharacter(character: Character): Character {
  if (getGoliathLargeFormUsesRemaining(character) <= 0 || hasActiveGoliathLargeForm(character)) {
    return character;
  }

  return {
    ...setGoliathFeatureState(character, {
      largeFormExpended: true
    }),
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isGoliathLargeFormStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Large Form",
        source: "Large Form",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: goliathLargeFormStatusSourceId,
        description: getLargeFormStatusDescription()
      })
    ]
  };
}

export function getGoliathStoneEnduranceDamageReductionFormula(
  character: Pick<Character, "abilities"> & Partial<Pick<Character, "statusEntries">>
): string {
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");

  return constitutionModifier === 0
    ? "1d12"
    : `1d12${constitutionModifier > 0 ? "+" : ""}${constitutionModifier}`;
}

export function getGoliathStoneEnduranceDamageReductionFormulaDisplay(
  character: Pick<Character, "abilities"> & Partial<Pick<Character, "statusEntries">>
): string {
  return formatFormulaTerms([
    "1d12",
    formatSignedFormulaTerm(getAbilityModifierForCharacter(character, "CON"), "CON")
  ]);
}

function getGoliathStoneEnduranceDamageReductionFact(
  character: Pick<Character, "abilities"> & Partial<Pick<Character, "statusEntries">>
): FeatureActionFact {
  const formulaCell = formatFormulaCell({
    formula: getGoliathStoneEnduranceDamageReductionFormula(character),
    displayTerms: [
      "1d12",
      formatSignedFormulaTerm(getAbilityModifierForCharacter(character, "CON"), "CON")
    ],
    resultLabel: "Damage Reduction"
  });

  return {
    label: "Damage Reduction",
    value: formulaCell.value,
    breakdown: formulaCell.breakdown,
    fullWidth: true
  };
}

export function getGoliathStormThunderDamageFormula(): string {
  return "1d8";
}

function getGoliathStormThunderDamageFact(): FeatureActionFact {
  const formulaCell = formatFormulaCell({
    formula: getGoliathStormThunderDamageFormula(),
    displayTerms: ["1d8 Thunder"],
    resultLabel: "Thunder damage"
  });

  return {
    label: "Damage Formula",
    value: formulaCell.value,
    breakdown: formulaCell.breakdown,
    fullWidth: true
  };
}

export function getGoliathAttackOptionStateForCharacter(
  character: GoliathRuntimeCharacter
): GoliathAttackOptionState | null {
  const ancestry = getGoliathGiantAncestryForCharacter(character);

  if (!ancestry || !goliathAttackAncestryKeys.has(ancestry.key)) {
    return null;
  }

  const usesTotal = getGoliathGiantAncestryUsesTotal(character);
  const usesRemaining = getGoliathGiantAncestryUsesRemaining(character);
  const damageBonus = ancestry.damageBonus
    ? {
        label: ancestry.featureName,
        formula: ancestry.damageBonus.formula,
        displayLabel: `${ancestry.damageBonus.formula} ${formatDamageTypeLabel(
          ancestry.damageBonus.damageType
        )}`
      }
    : null;

  return {
    ancestry,
    featureName: ancestry.featureName,
    sectionHeading: ancestry.sectionHeading,
    usesRemaining,
    usesTotal,
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0
        ? `${ancestry.featureName} recharges when you finish a Long Rest.`
        : undefined,
    damageBonus
  };
}

export function appendGoliathAttackDescriptionAddition<
  T extends {
    description?: SpellDescriptionEntry[];
    descriptionAdditions?: SpellDescriptionEntry[][];
  }
>(value: T, state: GoliathAttackOptionState | null): T {
  if (!state) {
    return value;
  }

  return appendSourcedDescriptionAddition(
    value,
    state.sectionHeading,
    getGoliathAncestryDescription(state.ancestry)
  );
}

export function getGoliathAttackDamageDetail(
  baseDamageDetail: string,
  state: GoliathAttackOptionState | null
): string {
  if (!state?.damageBonus) {
    return baseDamageDetail;
  }

  const bonusLabel = state.damageBonus.displayLabel ?? state.damageBonus.formula;

  return [baseDamageDetail.trim(), `+ ${bonusLabel} (${state.featureName})`]
    .filter(Boolean)
    .join(" ");
}

function getCloudsJauntAction(character: GoliathActionCharacter): FeatureActionCard | null {
  const ancestry = getGoliathGiantAncestryForCharacter(character);

  if (ancestry?.key !== "cloud") {
    return null;
  }

  const total = getGoliathGiantAncestryUsesTotal(character);
  const remaining = getGoliathGiantAncestryUsesRemaining(character);
  const description = getGoliathAncestryDescription(ancestry);
  const disabledReason =
    remaining <= 0 ? "Cloud's Jaunt recharges when you finish a Long Rest." : undefined;

  return {
    key: "species-goliath-clouds-jaunt",
    name: "Cloud's Jaunt",
    summary: "Magically teleport up to 30 feet.",
    detail: "Move to an unoccupied space you can see.",
    breakdown: "Teleport 30 feet",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Goliath Trait",
      description
    },
    execute: {
      kind: "custom-form",
      formKind: "goliath-clouds-jaunt"
    }
  };
}

function getStonesEnduranceAction(character: GoliathActionCharacter): FeatureActionCard | null {
  const ancestry = getGoliathGiantAncestryForCharacter(character);

  if (ancestry?.key !== "stone") {
    return null;
  }

  const total = getGoliathGiantAncestryUsesTotal(character);
  const remaining = getGoliathGiantAncestryUsesRemaining(character);
  const description = getGoliathAncestryDescription(ancestry);
  const facts = [getGoliathStoneEnduranceDamageReductionFact(character)];
  const disabledReason =
    remaining <= 0 ? "Stone's Endurance recharges when you finish a Long Rest." : undefined;

  return {
    key: "species-goliath-stones-endurance",
    name: "Stone's Endurance",
    summary: "React to incoming damage.",
    detail: "Roll 1d12 plus Constitution to reduce the damage.",
    breakdown: "Reduce incoming damage",
    economyType: ECONOMY_TYPE.REACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    facts,
    drawer: {
      kind: "confirm",
      eyebrow: "Goliath Trait",
      description,
      facts,
      factsSectionTitle: null,
      confirmLabel: "Take Reaction"
    },
    execute: {
      kind: "custom-form",
      formKind: "goliath-stones-endurance"
    }
  };
}

function getStormsThunderAction(character: GoliathActionCharacter): FeatureActionCard | null {
  const ancestry = getGoliathGiantAncestryForCharacter(character);

  if (ancestry?.key !== "storm") {
    return null;
  }

  const total = getGoliathGiantAncestryUsesTotal(character);
  const remaining = getGoliathGiantAncestryUsesRemaining(character);
  const description = getGoliathAncestryDescription(ancestry);
  const facts = [getGoliathStormThunderDamageFact()];
  const disabledReason =
    remaining <= 0 ? "Storm's Thunder recharges when you finish a Long Rest." : undefined;

  return {
    key: "species-goliath-storms-thunder",
    name: "Storm's Thunder",
    summary: "React to a nearby damaging creature.",
    detail: "Deal 1d8 Thunder damage to the creature.",
    breakdown: "Return thunder damage",
    economyType: ECONOMY_TYPE.REACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    facts,
    drawer: {
      kind: "confirm",
      eyebrow: "Goliath Trait",
      description,
      facts,
      factsSectionTitle: null,
      confirmLabel: "Take Reaction"
    },
    execute: {
      kind: "custom-form",
      formKind: "goliath-storms-thunder"
    }
  };
}

function getLargeFormAction(character: GoliathActionCharacter): FeatureActionCard | null {
  const total = getGoliathLargeFormUsesTotal(character);

  if (total <= 0) {
    return null;
  }

  const remaining = getGoliathLargeFormUsesRemaining(character);
  const isActive = hasActiveGoliathLargeForm(character);
  const description = getLargeFormDescription();
  const disabledReason = isActive
    ? "Large Form is already active."
    : remaining <= 0
      ? "Large Form recharges when you finish a Long Rest."
      : undefined;

  return {
    key: "species-goliath-large-form",
    name: "Large Form",
    summary: "Become Large for 10 minutes.",
    detail: "Gain Strength-check advantage and +10 feet Speed.",
    breakdown: isActive ? "Large Form is active" : "Grow to Large size",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Goliath Trait",
      description
    },
    execute: {
      kind: "custom-form",
      formKind: "goliath-large-form"
    }
  };
}

export function getGoliathActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isGoliathSpecies(character.species)) {
    return [];
  }

  return [
    getCloudsJauntAction(character),
    getStonesEnduranceAction(character),
    getStormsThunderAction(character),
    getLargeFormAction(character)
  ].filter((action): action is FeatureActionCard => action !== null);
}

export function getGoliathSpeedBonusesForCharacter(
  character: GoliathRuntimeCharacter
): FeatureSpeedBonus[] {
  if (!isGoliathSpecies(character.species) || !hasActiveGoliathLargeForm(character)) {
    return [];
  }

  return [
    {
      label: "Large Form",
      value: 10
    }
  ];
}

export function getGoliathBodySizeOverrideForCharacter(
  character: GoliathRuntimeCharacter
): BODY_SIZE | null {
  return isGoliathSpecies(character.species) && hasActiveGoliathLargeForm(character)
    ? BODY_SIZE.LARGE
    : null;
}

export function getGoliathDerivedStatusEntriesForCharacter(
  character: GoliathRuntimeCharacter
): CharacterStatusEntry[] {
  if (!isGoliathSpecies(character.species)) {
    return [];
  }

  return [
    createGoliathStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Powerful Build",
      sourceId: "species-goliath-powerful-build",
      description: getPowerfulBuildDescription()
    })
  ];
}

function getLargeFormAdvantageIndicator(): FeatureIndicator {
  return {
    label: "Advantage",
    tone: "advantage",
    source: "Large Form"
  };
}

export function getGoliathAbilityCheckIndicatorsForCharacter(
  character: GoliathRuntimeCharacter
): AbilityCheckIndicatorMap {
  if (!isGoliathSpecies(character.species) || !hasActiveGoliathLargeForm(character)) {
    return {};
  }

  return {
    STR: [getLargeFormAdvantageIndicator()]
  };
}

export function getGoliathSavingThrowIndicatorsForCharacter(
  character: GoliathRuntimeCharacter
): SavingThrowIndicatorMap {
  if (!isGoliathSpecies(character.species) || !hasActiveGoliathLargeForm(character)) {
    return {};
  }

  return {
    STR: [getLargeFormAdvantageIndicator()]
  };
}

export function getGoliathSkillIndicatorsForCharacter(
  character: GoliathRuntimeCharacter
): SkillIndicatorMap {
  if (!isGoliathSpecies(character.species) || !hasActiveGoliathLargeForm(character)) {
    return {};
  }

  const strengthSkills =
    skillGroupsByAbility.find((group) => group.ability === "STR")?.skills ?? [];

  return Object.fromEntries(
    strengthSkills.map((skill: SkillName) => [skill, [getLargeFormAdvantageIndicator()]])
  ) as SkillIndicatorMap;
}
