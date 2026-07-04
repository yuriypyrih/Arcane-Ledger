import {
  REACTION,
  getSpeciesEntryByName,
  type ReactionEntry,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  SKILL,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterShifterFeatureState,
  type CharacterShifterSkillProficiency,
  type CharacterStatusEntry
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type {
  AbilityCheckIndicatorMap,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureArmorClassBonus,
  FeatureIndicator,
  FeatureSpeedBonus,
  SkillIndicatorMap
} from "./classFeatures/types";
import { swapSystemTemporaryHitPointsAssignmentForCharacter } from "./feats/runtime";
import { skillGroupsByAbility } from "./skillDefinitions";
import { formatFormulaCell } from "./shared/formulas";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";
import type { WeaponAction } from "./gameplay";

export type ShifterShiftingOptionKey = "beasthide" | "longtooth" | "swiftstride" | "wildhunt";

type ShifterRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState" | "statusEntries">>;
type ShifterActionCharacter = Pick<Character, "species"> &
  Partial<
    Pick<
      Character,
      | "level"
      | "speciesChoices"
      | "speciesFeatureState"
      | "statusEntries"
      | "temporaryHitPoints"
      | "temporaryHitPointsSource"
    >
  >;

type ShifterShiftingOption = {
  key: ShifterShiftingOptionKey;
  name: string;
  fallbackDescription: string;
};

const shifterSpeciesId = "species-shifter-efa";
const shifterName = "Shifter";
const shiftingName = "Shifting";
const shiftingStatusSourceIdPrefix = "species-shifter-shifting";
const shiftingDurationRounds = 10;
const shifterDarkvisionSourceId = "species-shifter-darkvision";

export const shifterShiftingActionKey = "species-shifter-shifting";
export const shifterBeasthideOptionKey: ShifterShiftingOptionKey = "beasthide";

const shifterSkillProficiencyOptions = [
  SKILL.ACROBATICS,
  SKILL.ATHLETICS,
  SKILL.INTIMIDATION,
  SKILL.SURVIVAL
] as const satisfies readonly CharacterShifterSkillProficiency[];
const shifterSkillProficiencySet = new Set<string>(shifterSkillProficiencyOptions);
const shifterShiftingOptions: ShifterShiftingOption[] = [
  {
    key: "beasthide",
    name: "Beasthide",
    fallbackDescription:
      "You gain 1d6 additional Temporary Hit Points. While shifted, you have a +1 bonus to your Armor Class."
  },
  {
    key: "longtooth",
    name: "Longtooth",
    fallbackDescription:
      "When you shift and as a Bonus Action on your other turns while shifted, you can use your elongated fangs to make an Unarmed Strike. If you hit with this Unarmed Strike and deal damage, you can deal Piercing damage equal to 1d6 plus your Strength modifier, instead of the normal damage of an Unarmed Strike."
  },
  {
    key: "swiftstride",
    name: "Swiftstride",
    fallbackDescription:
      "While you are shifted, your Speed increases by 10 feet. Additionally, you can move up to 10 feet as a Reaction when a creature ends its turn within 5 feet of you. This reactive movement doesn't provoke Opportunity Attacks."
  },
  {
    key: "wildhunt",
    name: "Wildhunt",
    fallbackDescription:
      "While shifted, you have Advantage on Wisdom checks. Additionally, no creature within 30 feet of you can have Advantage on an attack roll against you unless you have the Incapacitated condition."
  }
];
const wildhuntAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Wildhunt"
};

function getShifterEntry(species = shifterName): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === shifterSpeciesId ? entry : null;
}

function getShifterDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getShifterEntry()?.rulesDescription.filter(
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

function stripDescriptionHeading(value: string, heading: string): string {
  return value.replace(new RegExp(`^<strong>${heading}\\.<\\/strong>\\s*`, "i"), "").trim();
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function getShifterTemporaryHitPoints(character: Partial<Pick<Character, "level">>): number {
  return getSpeciesProficiencyBonus(character.level ?? 1) * 2;
}

function getShifterBeasthideTemporaryHitPointsFormula(
  character: Partial<Pick<Character, "level">>
): string {
  return `1d6 + ${getShifterTemporaryHitPoints(character)}`;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function getShifterFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterShifterFeatureState {
  return character.speciesFeatureState?.shifter ?? {};
}

function setShifterFeatureState(
  character: Character,
  state: CharacterShifterFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      shifter: {
        ...getShifterFeatureState(character),
        ...state
      }
    }
  };
}

function getShifterShiftingStatusSourceId(optionKey: ShifterShiftingOptionKey): string {
  return `${shiftingStatusSourceIdPrefix}-${optionKey}`;
}

function getShifterShiftingStatusOptionKey(
  entry: Pick<CharacterStatusEntry, "sourceId">
): ShifterShiftingOptionKey | null {
  if (typeof entry.sourceId !== "string") {
    return null;
  }

  const option = shifterShiftingOptions.find(
    (shiftingOption) => entry.sourceId === getShifterShiftingStatusSourceId(shiftingOption.key)
  );

  return option?.key ?? null;
}

function getShifterShiftingOption(optionKey: string): ShifterShiftingOption | null {
  return shifterShiftingOptions.find((option) => option.key === optionKey) ?? null;
}

function getShiftingDescription(): SpellDescriptionEntry[] {
  const description = getShifterDescriptionSection(shiftingName);

  return description.length > 0
    ? description
    : [
        "As a Bonus Action, you can shape-shift to assume a more bestial appearance. This transformation lasts for 1 minute or until you revert to your normal appearance as a Bonus Action. When you shift, you gain Temporary Hit Points equal to 2 times your Proficiency Bonus. You can shift a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
        "Whenever you shift, you gain the benefit of one of the following options."
      ];
}

function getShifterOptionDescription(option: ShifterShiftingOption): SpellDescriptionEntry[] {
  const description = getShifterDescriptionSection(option.name);

  return description.length > 0
    ? description
    : [`<strong>${option.name}.</strong> ${option.fallbackDescription}`];
}

function getShifterOptionStatusDescription(option: ShifterShiftingOption): string {
  return getShifterOptionDescription(option)
    .filter((line): line is string => typeof line === "string")
    .map((line, index) => (index === 0 ? stripDescriptionHeading(line, option.name) : line))
    .join("\n");
}

function getShifterOptionPlainDescription(option: ShifterShiftingOption): string {
  return getShifterOptionDescription(option)
    .filter((line): line is string => typeof line === "string")
    .map(stripDescriptionMarkup)
    .map((line, index) =>
      index === 0 ? line.replace(new RegExp(`^${option.name}\\.\\s*`, "i"), "").trim() : line
    )
    .join(" ");
}

function createShifterStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description">> & {
      sourceId: string;
      source?: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source ?? shifterName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function createShifterShiftingOptionCard(
  character: ShifterActionCharacter,
  option: ShifterShiftingOption
): FeatureActionOptionCard {
  const description = getShifterOptionDescription(option);
  const plainDescription = getShifterOptionPlainDescription(option);
  const isBeasthide = option.key === shifterBeasthideOptionKey;
  const beasthideTemporaryHitPointsFormula = isBeasthide
    ? getShifterBeasthideTemporaryHitPointsFormula(character)
    : undefined;
  const facts = isBeasthide
    ? [
        {
          label: "Temp HP",
          ...formatFormulaCell({
            formula: beasthideTemporaryHitPointsFormula ?? "1d6",
            resultLabel: "Temporary Hit Points"
          }),
          fullWidth: true
        }
      ]
    : undefined;

  return {
    key: option.key,
    name: option.name,
    presentation: "plain",
    summary: plainDescription,
    detail: plainDescription,
    breakdown: plainDescription,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    resultLabel: isBeasthide ? "Temp HP" : undefined,
    rollFormula: beasthideTemporaryHitPointsFormula,
    rollFormulaDisplay: beasthideTemporaryHitPointsFormula,
    rollDescription: isBeasthide
      ? "Roll total Temporary Hit Points from Shifting and Beasthide."
      : undefined,
    disabled: getShifterShiftingUsesRemaining(character) <= 0,
    disabledReason:
      getShifterShiftingUsesRemaining(character) <= 0
        ? "Shifting recharges when you finish a Long Rest."
        : undefined,
    description,
    facts
  };
}

function getShifterShiftingAction(character: ShifterActionCharacter): FeatureActionCard {
  const total = getShifterShiftingUsesTotal(character);
  const remaining = getShifterShiftingUsesRemaining(character);
  const isActive = hasActiveShifterShifting(character);
  const description = getShiftingDescription();
  const disabledReason = isActive
    ? "Shifting is already active."
    : remaining <= 0
      ? "Shifting recharges when you finish a Long Rest."
      : undefined;

  return {
    key: shifterShiftingActionKey,
    name: shiftingName,
    summary: "Assume a bestial appearance.",
    detail: "Gain Temporary Hit Points and a shifting form.",
    breakdown: isActive ? "Shifting is active" : "Choose a shifting form",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "options",
      eyebrow: "Shifter Trait",
      description,
      optionSelection: "single-confirm",
      confirmLabel: "Use Shifting"
    },
    execute: {
      kind: "option"
    }
  };
}

export function isShifterSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === shifterSpeciesId;
}

export function isShifterSkillProficiency(
  value: unknown
): value is CharacterShifterSkillProficiency {
  return typeof value === "string" && shifterSkillProficiencySet.has(value);
}

export function normalizeShifterSkillProficiency(
  value: unknown
): CharacterShifterSkillProficiency | undefined {
  return isShifterSkillProficiency(value) ? value : undefined;
}

export function normalizeShifterFeatureState(value: unknown): CharacterShifterFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    shiftingUsesExpended: clampExpendedUses(record.shiftingUsesExpended)
  };
}

export function getShifterSkillProficiencyOptionsForSpecies(
  species: string
): CharacterShifterSkillProficiency[] {
  return isShifterSpecies(species) ? [...shifterSkillProficiencyOptions] : [];
}

export function getShifterSkillProficiencyForCharacter(
  character: ShifterRuntimeCharacter
): CharacterShifterSkillProficiency | null {
  if (!isShifterSpecies(character.species)) {
    return null;
  }

  return (
    normalizeShifterSkillProficiency(character.speciesChoices?.shifterSkillProficiency) ?? null
  );
}

export function getShifterShiftingUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isShifterSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getShifterShiftingUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getShifterShiftingUsesTotal(character);
  const expended = clampExpendedUses(getShifterFeatureState(character).shiftingUsesExpended);

  return Math.max(0, total - expended);
}

export function restoreShifterShiftingOnLongRest(character: Character): Character {
  if (getShifterShiftingUsesTotal(character) <= 0) {
    return character;
  }

  const state = getShifterFeatureState(character);

  if (clampExpendedUses(state.shiftingUsesExpended) <= 0) {
    return character;
  }

  return setShifterFeatureState(character, {
    shiftingUsesExpended: 0
  });
}

export function isShifterShiftingStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return (
    typeof entry.sourceId === "string" &&
    entry.sourceId.startsWith(`${shiftingStatusSourceIdPrefix}-`)
  );
}

export function normalizeShifterShiftingStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  const optionKey = getShifterShiftingStatusOptionKey(entry);
  const option = optionKey ? getShifterShiftingOption(optionKey) : null;

  if (!option) {
    return entry;
  }

  return {
    ...entry,
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: `${shiftingName}/${option.name}`,
    source: shiftingName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    sourceId: getShifterShiftingStatusSourceId(option.key),
    description: getShifterOptionStatusDescription(option)
  };
}

export function hasActiveShifterShifting(
  character: Partial<Pick<Character, "statusEntries">>,
  optionKey?: ShifterShiftingOptionKey
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some((entry) => {
    if (!isShifterShiftingStatusEntry(entry) || entry.disabled) {
      return false;
    }

    return optionKey ? getShifterShiftingStatusOptionKey(entry) === optionKey : true;
  });
}

export function activateShifterShiftingForCharacter(
  character: Character,
  optionKey: string
): Character {
  const option = getShifterShiftingOption(optionKey);

  if (
    !isShifterSpecies(character.species) ||
    !option ||
    getShifterShiftingUsesRemaining(character) <= 0 ||
    hasActiveShifterShifting(character)
  ) {
    return character;
  }

  const state = getShifterFeatureState(character);
  const statusName = `${shiftingName}/${option.name}`;
  const temporaryHitPoints = getShifterTemporaryHitPoints(character);
  const nextTemporaryHitPoints = swapSystemTemporaryHitPointsAssignmentForCharacter(
    character,
    temporaryHitPoints,
    statusName
  );

  return {
    ...setShifterFeatureState(character, {
      shiftingUsesExpended: clampExpendedUses(state.shiftingUsesExpended) + 1
    }),
    ...nextTemporaryHitPoints,
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isShifterShiftingStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: statusName,
        source: shiftingName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: shiftingDurationRounds,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: getShifterShiftingStatusSourceId(option.key),
        description: getShifterOptionStatusDescription(option)
      })
    ]
  };
}

export function applyShifterBeasthideTemporaryHitPointsRollForCharacter(
  character: Character,
  temporaryHitPointsTotal: number
): Character {
  if (
    !isShifterSpecies(character.species) ||
    !hasActiveShifterShifting(character, shifterBeasthideOptionKey)
  ) {
    return character;
  }

  const grantedTemporaryHitPoints = Math.max(0, Math.floor(temporaryHitPointsTotal));
  const nextTemporaryHitPoints = swapSystemTemporaryHitPointsAssignmentForCharacter(
    character,
    grantedTemporaryHitPoints,
    `${shiftingName}/Beasthide`
  );

  if (
    nextTemporaryHitPoints.temporaryHitPoints === character.temporaryHitPoints &&
    nextTemporaryHitPoints.temporaryHitPointsSource === character.temporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...nextTemporaryHitPoints
  };
}

export function activateShifterFeatureActionOptionForCharacter(
  character: Character,
  actionKey: string,
  optionKey: string
): Character {
  return actionKey === shifterShiftingActionKey
    ? activateShifterShiftingForCharacter(character, optionKey)
    : character;
}

export function getShifterActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isShifterSpecies(character.species)) {
    return [];
  }

  return [getShifterShiftingAction(character)];
}

export function getShifterActionOptionsForCharacter(
  character: ShifterActionCharacter
): Partial<Record<string, FeatureActionOptionCard[]>> {
  if (!isShifterSpecies(character.species)) {
    return {};
  }

  return {
    [shifterShiftingActionKey]: shifterShiftingOptions.map((option) =>
      createShifterShiftingOptionCard(character, option)
    )
  };
}

export function getShifterDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isShifterSpecies(character.species)) {
    return [];
  }

  const darkvisionDescription = getShifterDescriptionSection("Darkvision").join("\n");

  return [
    createShifterStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: shifterDarkvisionSourceId,
      rangeFeet: 60,
      description: darkvisionDescription || "You have Darkvision with a range of 60 feet."
    })
  ];
}

export function getShifterArmorClassBonusesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): FeatureArmorClassBonus[] {
  return isShifterSpecies(character.species) &&
    hasActiveShifterShifting(character, shifterBeasthideOptionKey)
    ? [
        {
          label: "Beasthide",
          value: 1
        }
      ]
    : [];
}

export function getShifterSpeedBonusesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  return isShifterSpecies(character.species) && hasActiveShifterShifting(character, "swiftstride")
    ? [
        {
          label: "Swiftstride",
          value: 10,
          movementType: "walk"
        }
      ]
    : [];
}

export function getShifterReactionEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): ReactionEntry[] {
  const option = getShifterShiftingOption("swiftstride");

  if (
    !option ||
    !isShifterSpecies(character.species) ||
    !hasActiveShifterShifting(character, option.key)
  ) {
    return [];
  }

  return [
    {
      id: "reaction-shifter-swiftstride",
      reaction: REACTION.SWIFTSTRIDE,
      name: "Swiftstride",
      sourceType: "feature",
      sourceLabel: "Swiftstride",
      description: getShifterOptionDescription(option)
    }
  ];
}

export function getShifterAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): AbilityCheckIndicatorMap {
  if (!isShifterSpecies(character.species) || !hasActiveShifterShifting(character, "wildhunt")) {
    return {};
  }

  return {
    WIS: [wildhuntAdvantageIndicator]
  };
}

export function getShifterSkillIndicatorsForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): SkillIndicatorMap {
  if (!isShifterSpecies(character.species) || !hasActiveShifterShifting(character, "wildhunt")) {
    return {};
  }

  const wisdomSkills = skillGroupsByAbility.find((group) => group.ability === "WIS")?.skills ?? [];

  return wisdomSkills.reduce<SkillIndicatorMap>((indicators, skill) => {
    indicators[skill] = [wildhuntAdvantageIndicator];
    return indicators;
  }, {});
}

export function hasShifterLongtoothBonusUnarmedStrikeForCharacter(
  character: Partial<Pick<Character, "species" | "statusEntries">>,
  action: Pick<WeaponAction, "attackKind">
): boolean {
  return (
    Boolean(character.species && isShifterSpecies(character.species)) &&
    action.attackKind === "unarmed" &&
    hasActiveShifterShifting(character, "longtooth")
  );
}

export function getShifterWeaponActionForCharacter(
  character: Partial<Pick<Character, "species" | "statusEntries">>,
  action: WeaponAction
): WeaponAction {
  if (!hasShifterLongtoothBonusUnarmedStrikeForCharacter(character, action)) {
    return action;
  }

  const option = getShifterShiftingOption("longtooth");

  return option
    ? {
        ...action,
        descriptionAdditions: [
          ...(action.descriptionAdditions ?? []),
          createSourcedDescriptionEntries("Longtooth", getShifterOptionDescription(option))
        ]
      }
    : action;
}
