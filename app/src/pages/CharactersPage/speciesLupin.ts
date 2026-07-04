import {
  getSpeciesEntryByName,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterLupinFeatureState,
  type CharacterLupinSkillProficiency,
  type CharacterStatusEntry,
  type SkillName
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { getAbilityModifierForCharacter } from "./abilities";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type { FeatureActionCard, FeatureActionFact } from "./classFeatures/types";
import { formatFormulaCell, formatSignedFormulaTerm } from "./shared/formulas";
import type { WeaponAction } from "./gameplay";

type LupinRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState">>;
type LupinActionCharacter = Pick<Character, "species" | "level" | "abilities"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState" | "statusEntries">>;

const lupinSpeciesId = "species-lupin-rhw";
const lupinName = "Lupin";
const feralPounceName = "Feral Pounce";
const howlName = "Howl";
const lupinHowlActionKey = "species-lupin-howl";
const lupinSkillProficiencyOptions = [
  "Perception",
  "Stealth",
  "Survival"
] as const satisfies readonly CharacterLupinSkillProficiency[];
const lupinSkillProficiencySet = new Set<string>(lupinSkillProficiencyOptions);

function getLupinEntry(species = lupinName): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === lupinSpeciesId ? entry : null;
}

function getLupinDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getLupinEntry()?.rulesDescription.filter(
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

function getLupinDescriptionText(heading: string, fallback: string): string {
  const section = getLupinDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getFeralPounceDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getLupinDescriptionSection(feralPounceName);

  return createSourcedDescriptionEntries(
    feralPounceName,
    description.length > 0
      ? description
      : [
          "Your Unarmed Strikes deal Slashing damage instead of Bludgeoning damage. In addition, when you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Shove options. You can use this benefit only once per turn."
        ]
  );
}

function getHowlDescription(): SpellDescriptionEntry[] {
  const description = getLupinDescriptionSection(howlName);

  return description.length > 0
    ? description
    : [
        "As a Bonus Action, you let out an unearthly howl. Each creature of your choice within 15 feet of you must succeed on a Wisdom saving throw (DC 8 plus your Constitution modifier and Proficiency Bonus) or have Disadvantage on attack rolls and saving throws until the start of your next turn.",
        "You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
      ];
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function getLupinFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterLupinFeatureState {
  return character.speciesFeatureState?.lupin ?? {};
}

function setLupinFeatureState(character: Character, state: CharacterLupinFeatureState): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      lupin: {
        ...getLupinFeatureState(character),
        ...state
      }
    }
  };
}

function createLupinStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: lupinName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function getLupinHowlSaveDc(
  character: Pick<Character, "level" | "abilities"> & Partial<Pick<Character, "statusEntries">>
): number {
  return (
    8 +
    getAbilityModifierForCharacter(character, "CON") +
    getSpeciesProficiencyBonus(character.level)
  );
}

function getLupinHowlSaveDcFact(character: LupinActionCharacter): FeatureActionFact {
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const proficiencyBonus = getSpeciesProficiencyBonus(character.level);
  const saveDc = getLupinHowlSaveDc(character);
  const formulaCell = formatFormulaCell({
    formula: String(saveDc),
    displayTerms: [
      "DC 8 (Base)",
      formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
      formatSignedFormulaTerm(constitutionModifier, "CON")
    ]
  });

  return {
    label: "Howl DC Formula",
    value: `Wisdom DC ${saveDc} = ${formulaCell.value}`,
    breakdown: formulaCell.breakdown,
    fullWidth: true
  };
}

function getLupinHowlAction(character: LupinActionCharacter): FeatureActionCard {
  const total = getLupinHowlUsesTotal(character);
  const remaining = getLupinHowlUsesRemaining(character);
  const description = getHowlDescription();
  const disabledReason = remaining <= 0 ? "Howl recharges when you finish a Long Rest." : undefined;
  const facts = [getLupinHowlSaveDcFact(character)];

  return {
    key: lupinHowlActionKey,
    name: howlName,
    summary: "Unleash an unearthly howl.",
    detail: "Creatures of your choice make a Wisdom save.",
    breakdown: "Impose attack and save disadvantage",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    facts,
    drawer: {
      kind: "confirm",
      eyebrow: "Lupin Trait",
      description,
      facts,
      factsSectionTitle: "Formula"
    },
    execute: {
      kind: "activate"
    }
  };
}

export function isLupinSpecies(species: string): boolean {
  return getLupinEntry(species) !== null;
}

export function normalizeLupinSkillProficiency(
  value: unknown
): CharacterLupinSkillProficiency | undefined {
  return typeof value === "string" && lupinSkillProficiencySet.has(value)
    ? (value as CharacterLupinSkillProficiency)
    : undefined;
}

export function normalizeLupinFeatureState(value: unknown): CharacterLupinFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    howlUsesExpended: clampExpendedUses(record.howlUsesExpended)
  };
}

export function getLupinSkillProficiencyOptionsForSpecies(
  species: string
): CharacterLupinSkillProficiency[] {
  return isLupinSpecies(species) ? [...lupinSkillProficiencyOptions] : [];
}

export function getLupinSkillProficiencyForCharacter(
  character: LupinRuntimeCharacter
): SkillName | null {
  if (!isLupinSpecies(character.species)) {
    return null;
  }

  return normalizeLupinSkillProficiency(character.speciesChoices?.lupinSkillProficiency) ?? null;
}

export function getLupinHowlUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isLupinSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getLupinHowlUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getLupinHowlUsesTotal(character);
  const expended = clampExpendedUses(getLupinFeatureState(character).howlUsesExpended);

  return Math.max(0, total - expended);
}

export function spendLupinHowlForCharacter(character: Character): Character {
  if (getLupinHowlUsesRemaining(character) <= 0) {
    return character;
  }

  const lupinState = getLupinFeatureState(character);

  return setLupinFeatureState(character, {
    howlUsesExpended: clampExpendedUses(lupinState.howlUsesExpended) + 1
  });
}

export function restoreLupinHowlOnLongRest(character: Character): Character {
  if (getLupinHowlUsesTotal(character) <= 0) {
    return character;
  }

  const lupinState = getLupinFeatureState(character);

  if (clampExpendedUses(lupinState.howlUsesExpended) <= 0) {
    return character;
  }

  return setLupinFeatureState(character, {
    howlUsesExpended: 0
  });
}

export function activateLupinFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  return actionKey === lupinHowlActionKey ? spendLupinHowlForCharacter(character) : character;
}

export function getLupinActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isLupinSpecies(character.species)) {
    return [];
  }

  return [getLupinHowlAction(character)];
}

export function getLupinWeaponActionForCharacter(
  character: Pick<Character, "species">,
  action: WeaponAction
): WeaponAction {
  if (!isLupinSpecies(character.species) || action.attackKind !== "unarmed") {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      getFeralPounceDescriptionAddition()
    ]
  };
}

export function getLupinDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isLupinSpecies(character.species)) {
    return [];
  }

  const darkvisionDescription = getLupinDescriptionText(
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );

  return [
    createLupinStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-lupin-darkvision",
      rangeFeet: 60,
      description: darkvisionDescription
    })
  ];
}
