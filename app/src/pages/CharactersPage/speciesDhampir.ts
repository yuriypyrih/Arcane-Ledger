import {
  DAMAGE_TYPE,
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
  type CharacterDhampirFeatureState,
  type CharacterStatusEntry
} from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { getAbilityModifierBreakdownForCharacter } from "./abilities";
import type { FeatureSpeedBonus } from "./classFeatures/types";
import type { FeatureDescriptionContribution } from "./featureContributions";
import type { WeaponAction } from "./gameplay";

type DhampirActionCharacter = Pick<Character, "species" | "level"> &
  Partial<Pick<Character, "speciesFeatureState">>;

export type DhampirVampiricBiteOptionState = {
  usesRemaining: number;
  usesTotal: number;
  disabled: boolean;
  disabledReason?: string;
};

const dhampirSpeciesId = "species-dhampir-rhw";
const dhampirVampiricBiteName = "Vampiric Bite";

function getDhampirEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName("Dhampir");

  return entry?.id === dhampirSpeciesId ? entry : null;
}

function getDhampirDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getDhampirEntry()?.description.filter(
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

function getDhampirVampiricBiteDescription(): SpellDescriptionEntry[] {
  const entry = getDhampirEntry();
  const description = entry?.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );
  const startIndex =
    description?.findIndex((descriptionEntry) =>
      descriptionEntry.includes(`<strong>${dhampirVampiricBiteName}.`)
    ) ?? -1;

  if (!description || startIndex < 0) {
    return [
      "When you use your Unarmed Strike and deal damage, you can choose to bite with your fangs. You deal Piercing damage equal to 1d4 plus your Constitution modifier instead of the normal damage of an Unarmed Strike.",
      "In addition, when you deal this damage to a creature that isn't a Construct or an Undead, you can empower yourself in one of the following ways:",
      "<strong>Drain.</strong> You regain Hit Points equal to the Piercing damage dealt.",
      "<strong>Strengthen.</strong> You gain a bonus to the next ability check or attack roll you make within the next minute; the bonus is equal to the Piercing damage dealt.",
      "You can empower yourself with this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
    ];
  }

  return description.slice(startIndex);
}

function getDhampirDescriptionText(heading: string, fallback: string): string {
  const section = getDhampirDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function getDhampirFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterDhampirFeatureState {
  return character.speciesFeatureState?.dhampir ?? {};
}

function setDhampirFeatureState(
  character: Character,
  state: CharacterDhampirFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      dhampir: {
        ...getDhampirFeatureState(character),
        ...state
      }
    }
  };
}

function createDhampirStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description" | "descriptionAdditions">> & {
      sourceId: string;
      source?: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source ?? "Dhampir",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description,
    descriptionAdditions: options.descriptionAdditions
  };
}

function getSpiderClimbDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getDhampirDescriptionSection("Spider Climb");

  return createSourcedDescriptionEntries(
    "Spider Climb",
    description.length > 0
      ? description
      : [
          "You have a Climb Speed equal to your Speed. When you reach character level 3, you can move up, down, and across vertical surfaces and along ceilings while leaving your hands free."
        ]
  );
}

function getVampiricBiteDescriptionAddition(): SpellDescriptionEntry[] {
  return createSourcedDescriptionEntries(
    dhampirVampiricBiteName,
    getDhampirVampiricBiteDescription()
  );
}

function replaceLeadingDamageFormula(baseFormula: string, nextBaseDamage: string): string {
  return baseFormula.replace(/^\s*[^+-]+/, nextBaseDamage);
}

function appendRollModifier(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function getNumericDamageBonusTotal(action: Pick<WeaponAction, "damageBonusEntries">): number {
  return action.damageBonusEntries.reduce((total, entry) => total + (entry.value ?? 0), 0);
}

export function isDhampirSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === dhampirSpeciesId;
}

export function normalizeDhampirFeatureState(value: unknown): CharacterDhampirFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    vampiricBiteUsesExpended: clampExpendedUses(record.vampiricBiteUsesExpended)
  };
}

export function getDhampirVampiricBiteUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isDhampirSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getDhampirVampiricBiteUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getDhampirVampiricBiteUsesTotal(character);
  const expended = clampExpendedUses(getDhampirFeatureState(character).vampiricBiteUsesExpended);

  return Math.max(0, total - expended);
}

export function restoreDhampirVampiricBiteOnLongRest(character: Character): Character {
  if (getDhampirVampiricBiteUsesTotal(character) <= 0) {
    return character;
  }

  const dhampirState = getDhampirFeatureState(character);

  if (clampExpendedUses(dhampirState.vampiricBiteUsesExpended) <= 0) {
    return character;
  }

  return setDhampirFeatureState(character, {
    vampiricBiteUsesExpended: 0
  });
}

export function consumeDhampirVampiricBiteUseForCharacter(character: Character): Character {
  if (getDhampirVampiricBiteUsesRemaining(character) <= 0) {
    return character;
  }

  const dhampirState = getDhampirFeatureState(character);

  return setDhampirFeatureState(character, {
    vampiricBiteUsesExpended: clampExpendedUses(dhampirState.vampiricBiteUsesExpended) + 1
  });
}

export function getDhampirVampiricBiteWeaponOptionState(
  character: DhampirActionCharacter,
  action: Pick<WeaponAction, "attackKind"> | null
): DhampirVampiricBiteOptionState | null {
  if (!isDhampirSpecies(character.species) || action?.attackKind !== "unarmed") {
    return null;
  }

  const usesTotal = getDhampirVampiricBiteUsesTotal(character);
  const usesRemaining = getDhampirVampiricBiteUsesRemaining(character);
  const disabled = usesRemaining <= 0;

  return {
    usesRemaining,
    usesTotal,
    disabled,
    disabledReason: disabled ? "Vampiric Bite recharges when you finish a Long Rest." : undefined
  };
}

export function applyDhampirVampiricBiteWeaponAction(
  character: Character,
  action: WeaponAction
): WeaponAction {
  if (action.attackKind !== "unarmed") {
    return action;
  }

  const constitutionModifier = getAbilityModifierBreakdownForCharacter(character, "CON");
  const damageFormula = replaceLeadingDamageFormula(action.damageFormula, "1d4");
  const totalDamageModifier =
    constitutionModifier.total + getNumericDamageBonusTotal(action);

  return {
    ...action,
    damageLabel: "1d4 Slashing",
    damageFormula,
    damageBreakdownLabel: dhampirVampiricBiteName,
    rollDisplay: appendRollModifier(damageFormula, totalDamageModifier),
    rollFormulaDisplay: appendRollModifier(damageFormula, totalDamageModifier),
    rollFormula: appendRollModifier(damageFormula, totalDamageModifier),
    damageAbility: "CON",
    damageAbilityFormulaLabel: "CON",
    damageAbilityModifierBaseValue: constitutionModifier.baseValue,
    damageAbilityModifier: constitutionModifier.total,
    damageAbilityModifierBonusEntries: constitutionModifier.bonusEntries
  };
}

export function getDhampirWeaponActionForCharacter(
  character: Pick<Character, "species">,
  action: WeaponAction
): WeaponAction {
  if (
    !isDhampirSpecies(character.species) ||
    action.attackKind !== "unarmed"
  ) {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      getVampiricBiteDescriptionAddition()
    ]
  };
}

export function getDhampirDescriptionContributionsForCharacter(
  character: Pick<Character, "species">
): FeatureDescriptionContribution[] {
  if (!isDhampirSpecies(character.species)) {
    return [];
  }

  return [
    {
      id: "species-dhampir-spider-climb-speed",
      target: "stat",
      targetKey: "speed",
      getDescriptionAdditions: () => [getSpiderClimbDescriptionAddition()]
    }
  ];
}

export function getDhampirSpeedBonusesForCharacter(
  character: Pick<Character, "species">
): FeatureSpeedBonus[] {
  if (!isDhampirSpecies(character.species)) {
    return [];
  }

  return [
    {
      label: "Spider Climb",
      value: 0,
      movementType: "climb",
      setBaseFromWalkMultiplier: 1
    }
  ];
}

export function getDhampirDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isDhampirSpecies(character.species)) {
    return [];
  }

  const darkvisionDescription = getDhampirDescriptionText(
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );
  const traceOfUndeathDescription = getDhampirDescriptionText(
    "Trace of Undeath",
    "You have Resistance to Necrotic damage."
  );

  return [
    createDhampirStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-dhampir-darkvision",
      rangeFeet: 60,
      description: darkvisionDescription
    }),
    createDhampirStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.NECROTIC,
      sourceId: "species-dhampir-trace-of-undeath-necrotic",
      description: traceOfUndeathDescription
    })
  ];
}
