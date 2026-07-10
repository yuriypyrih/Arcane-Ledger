import { DAMAGE_TYPE, type SpellDescriptionEntry } from "../../../../codex/entries";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";
import type { FeatureSpeedBonus } from "../../classFeatures/types";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type { SpellImplementationContributionSpec } from "./types";

export const investitureOfFlameSpellId = "spell-investiture-of-flame";
export const investitureOfIceSpellId = "spell-investiture-of-ice";
export const investitureOfStoneSpellId = "spell-investiture-of-stone";
export const investitureOfWindSpellId = "spell-investiture-of-wind";

const investitureOfFlameStatusValue = "Investiture of Flame";
const investitureOfIceStatusValue = "Investiture of Ice";
const investitureOfStoneStatusValue = "Investiture of Stone";
const investitureOfWindStatusValue = "Investiture of Wind";
const investitureOfWindFlySpeed = 60;

type InvestitureStatusConfig = {
  spellId: string;
  label: string;
};

type InvestitureDamageDefense = {
  config: InvestitureStatusConfig;
  group: STATUS_ENTRY_GROUP.IMMUNITIES | STATUS_ENTRY_GROUP.RESISTANCES;
  damageType: DAMAGE_TYPE;
  description: string;
};

type InvestitureMovementDescription = {
  config: InvestitureStatusConfig;
  entries: SpellDescriptionEntry[];
};

const investitureStatusConfigs = [
  {
    spellId: investitureOfFlameSpellId,
    label: investitureOfFlameStatusValue
  },
  {
    spellId: investitureOfIceSpellId,
    label: investitureOfIceStatusValue
  },
  {
    spellId: investitureOfStoneSpellId,
    label: investitureOfStoneStatusValue
  },
  {
    spellId: investitureOfWindSpellId,
    label: investitureOfWindStatusValue
  }
] as const satisfies readonly InvestitureStatusConfig[];

const investitureDamageDefenses: readonly InvestitureDamageDefense[] = [
  {
    config: investitureStatusConfigs[0],
    group: STATUS_ENTRY_GROUP.IMMUNITIES,
    damageType: DAMAGE_TYPE.FIRE,
    description: "While Investiture of Flame is active, you are immune to Fire damage."
  },
  {
    config: investitureStatusConfigs[0],
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    damageType: DAMAGE_TYPE.COLD,
    description: "While Investiture of Flame is active, you have Resistance to Cold damage."
  },
  {
    config: investitureStatusConfigs[1],
    group: STATUS_ENTRY_GROUP.IMMUNITIES,
    damageType: DAMAGE_TYPE.COLD,
    description: "While Investiture of Ice is active, you are immune to Cold damage."
  },
  {
    config: investitureStatusConfigs[1],
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    damageType: DAMAGE_TYPE.FIRE,
    description: "While Investiture of Ice is active, you have Resistance to Fire damage."
  },
  {
    config: investitureStatusConfigs[2],
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    damageType: DAMAGE_TYPE.BLUDGEONING,
    description:
      "While Investiture of Stone is active, you have Resistance to Bludgeoning damage from nonmagical weapons."
  },
  {
    config: investitureStatusConfigs[2],
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    damageType: DAMAGE_TYPE.PIERCING,
    description:
      "While Investiture of Stone is active, you have Resistance to Piercing damage from nonmagical weapons."
  },
  {
    config: investitureStatusConfigs[2],
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    damageType: DAMAGE_TYPE.SLASHING,
    description:
      "While Investiture of Stone is active, you have Resistance to Slashing damage from nonmagical weapons."
  }
];

const investitureMovementDescriptions: readonly InvestitureMovementDescription[] = [
  {
    config: investitureStatusConfigs[1],
    entries: [
      "You can move across difficult terrain created by ice or snow without spending extra movement."
    ]
  },
  {
    config: investitureStatusConfigs[2],
    entries: [
      "You can move across difficult terrain made of earth or stone without spending extra movement. You can move through solid earth or stone as if it was air and without destabilizing it, but you can't end your movement there."
    ]
  },
  {
    config: investitureStatusConfigs[3],
    entries: [
      "You gain a flying Speed of 60 feet. If you are still flying when the spell ends, you fall, unless you can somehow prevent it."
    ]
  }
];

function isActiveInvestitureStatusEntry(
  entry: CharacterStatusEntry | null | undefined,
  spellId: string
): entry is CharacterStatusEntry {
  return (
    entry?.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === spellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    entry.disabled !== true
  );
}

function hasActiveInvestitureStatus(
  character: Partial<Pick<Character, "statusEntries">>,
  spellId: string
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some((entry) =>
    isActiveInvestitureStatusEntry(entry, spellId)
  );
}

function createInvestitureDamageDefenseStatusEntry(
  defense: InvestitureDamageDefense
): CharacterStatusEntry {
  const groupLabel =
    defense.group === STATUS_ENTRY_GROUP.IMMUNITIES ? "immunity" : "resistance";
  const sourceId = `${defense.config.spellId}-${groupLabel}-${defense.damageType.toLowerCase()}`;

  return {
    id: sourceId,
    group: defense.group,
    value: defense.damageType,
    source: defense.config.label,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
    duration: {
      kind: STATUS_DURATION_KIND.LINKED,
      linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
      linkedValue: EFFECT_NAME.CONCENTRATION
    },
    sourceId,
    sourceSpellId: defense.config.spellId,
    description: defense.description
  };
}

export function getInvestitureSpellDerivedStatusEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): CharacterStatusEntry[] {
  return investitureDamageDefenses
    .filter((defense) => hasActiveInvestitureStatus(character, defense.config.spellId))
    .map(createInvestitureDamageDefenseStatusEntry);
}

export function getInvestitureSpeedBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (!hasActiveInvestitureStatus(character, investitureOfWindSpellId)) {
    return [];
  }

  return [
    {
      label: investitureOfWindStatusValue,
      value: 0,
      movementType: "fly",
      setTotal: investitureOfWindFlySpeed
    }
  ];
}

export function getInvestitureSpeedDescriptionAdditionsForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): SpellDescriptionEntry[][] {
  return investitureMovementDescriptions
    .filter((description) => hasActiveInvestitureStatus(character, description.config.spellId))
    .map((description) =>
      createSourcedDescriptionEntries(description.config.label, description.entries)
    );
}

export const investitureSpellImplementationSpecs: SpellImplementationContributionSpec[] =
  investitureStatusConfigs.map((config) => ({
    source: {
      type: "spell" as const,
      id: config.spellId,
      label: config.label
    },
    spellId: config.spellId
  }));
